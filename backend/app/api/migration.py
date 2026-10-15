import numpy as np
from fastapi import APIRouter, Query, HTTPException
from app.models.schemas import (
    HeatmapLayerResponse,
    GridCell,
    TemporalAnalyticsResponse,
    SimulationParams
)
from app.api.upload import active_state
from app.services.depletion import simulate_nutrient_migration, generate_weekly_analytics

router = APIRouter(prefix="/migration", tags=["Migration & Heatmap"])

# Agronomic optimal concentration ranges (ppm / mg/kg)
NUTRIENT_THRESHOLDS = {
    "nitrogen": {"deficient": 25.0, "moderate": 40.0, "optimal": 65.0, "unit": "mg/kg (ppm)"},
    "phosphorus": {"deficient": 15.0, "moderate": 25.0, "optimal": 45.0, "unit": "mg/kg (ppm)"},
    "potassium": {"deficient": 120.0, "moderate": 180.0, "optimal": 260.0, "unit": "mg/kg (ppm)"},
    "ph": {"deficient": 5.8, "moderate": 6.3, "optimal": 7.3, "unit": "pH"},
    "moisture": {"deficient": 15.0, "moderate": 22.0, "optimal": 32.0, "unit": "% VWC"},
}

def classify_cell_status(value: float, nutrient: str) -> str:
    th = NUTRIENT_THRESHOLDS.get(nutrient, NUTRIENT_THRESHOLDS["nitrogen"])
    if value < th["deficient"]:
        return "deficient"
    elif value < th["moderate"]:
        return "moderate"
    elif value <= th["optimal"]:
        return "optimal"
    else:
        return "excess"

@router.get("/heatmap", response_model=HeatmapLayerResponse)
async def get_heatmap_layer(
    nutrient: str = Query("nitrogen", regex="^(nitrogen|phosphorus|potassium|ph|moisture)$"),
    week: int = Query(0, ge=0, le=8),
    soil_type: str = Query("loam", regex="^(sandy|loam|clay|silt_loam)$"),
    rainfall_scenario: str = Query("normal", regex="^(dry|normal|heavy|monsoon)$"),
    crop_uptake: str = Query("medium", regex="^(none|low|medium|high)$"),
    slope_factor: float = Query(1.0, ge=0.0, le=3.0)
):
    """
    Returns the interpolated 2D spatial grid for the requested nutrient at the given week (0-8).
    Includes physical depletion from rainfall and downhill topographical migration.
    """
    baseline_grids = active_state.get("baseline_grids")
    if not baseline_grids:
        raise HTTPException(status_code=500, detail="No baseline grid data available.")
        
    sim_params = SimulationParams(
        soil_type=soil_type,
        rainfall_scenario=rainfall_scenario,
        crop_uptake_rate=crop_uptake,
        slope_effect_multiplier=slope_factor
    )
    
    # Run physical migration simulation
    grid_vals, loss_pct, bearing = simulate_nutrient_migration(
        baseline_grids=baseline_grids,
        nutrient=nutrient,
        target_week=week,
        params=sim_params
    )
    
    grid_lats = baseline_grids["grid_lats"]
    grid_lngs = baseline_grids["grid_lngs"]
    grid_elev = baseline_grids["grid_elev"]
    bbox = baseline_grids["bbox"]
    
    val_min = float(np.min(grid_vals))
    val_max = float(np.max(grid_vals))
    val_mean = float(np.mean(grid_vals))
    val_range = max(val_max - val_min, 1e-6)
    
    rows, cols = grid_vals.shape
    cells: list[GridCell] = []
    deficient_count = 0
    total_cells = rows * cols
    
    for r in range(rows):
        for c in range(cols):
            v = float(grid_vals[r, c])
            status = classify_cell_status(v, nutrient)
            if status == "deficient":
                deficient_count += 1
                
            norm = float((v - val_min) / val_range)
            cells.append(GridCell(
                lat=round(float(grid_lats[r, c]), 6),
                lng=round(float(grid_lngs[r, c]), 6),
                value=round(v, 2),
                elevation=round(float(grid_elev[r, c]), 1),
                status=status,
                normalized=round(max(0.0, min(1.0, norm)), 4)
            ))
            
    crit_pct = round((deficient_count / max(total_cells, 1)) * 100.0, 1)
    unit_str = NUTRIENT_THRESHOLDS.get(nutrient, {}).get("unit", "mg/kg")
    
    return HeatmapLayerResponse(
        field_name=active_state.get("field_name", "Field 1"),
        nutrient=nutrient,
        week=week,
        unit=unit_str,
        min_value=round(val_min, 2),
        max_value=round(val_max, 2),
        mean_value=round(val_mean, 2),
        resolution_x=cols,
        resolution_y=rows,
        bounds=bbox,
        cells=cells,
        depletion_loss_pct=round(loss_pct, 1),
        migration_direction_deg=round(bearing, 1),
        critical_deficiency_area_pct=crit_pct
    )

@router.get("/analytics", response_model=TemporalAnalyticsResponse)
async def get_temporal_analytics(
    soil_type: str = Query("loam", regex="^(sandy|loam|clay|silt_loam)$"),
    rainfall_scenario: str = Query("normal", regex="^(dry|normal|heavy|monsoon)$"),
    crop_uptake: str = Query("medium", regex="^(none|low|medium|high)$"),
    slope_factor: float = Query(1.0, ge=0.0, le=3.0)
):
    """
    Computes complete 8-week temporal degradation and leaching risk analytics.
    """
    baseline_grids = active_state.get("baseline_grids")
    if not baseline_grids:
        raise HTTPException(status_code=500, detail="No baseline grid data available.")
        
    sim_params = SimulationParams(
        soil_type=soil_type,
        rainfall_scenario=rainfall_scenario,
        crop_uptake_rate=crop_uptake,
        slope_effect_multiplier=slope_factor
    )
    
    field_name = active_state.get("field_name", "Field 1")
    weekly_metrics = generate_weekly_analytics(baseline_grids, sim_params, field_name)
    
    # Agronomic recommendations based on trajectory
    final_n_retention = weekly_metrics[-1].nitrogen_retention_pct
    recs: list[str] = []
    
    if final_n_retention < 60.0:
        recs.append("Severe Nitrogen leaching observed in weeks 4-7. Prescribe split nitrogen application (fertigation) rather than single basal dose.")
    else:
        recs.append("Nitrogen retention is satisfactory. Maintain standard top-dressing schedule at Week 5.")
        
    if soil_type == "sandy":
        recs.append("Sandy soil texture shows high permeability: incorporate organic biochar or cover crops to improve Cation Exchange Capacity (CEC).")
    elif soil_type == "clay":
        recs.append("Clay soil exhibits elevated surface runoff risk on steep terrain: install contour buffer strips or grass waterways to trap phosphorus.")
        
    if rainfall_scenario in ["heavy", "monsoon"]:
        recs.append("High precipitation events predicted: consider nitrification inhibitors (DCD or nitrapyrin) to retard nitrate downward leaching.")
        
    recs.append("Recommend soil re-sampling at Week 6 on southern slope depressions where nutrient pooling was observed.")
    
    summary = (
        f"Over the 8-week monitoring window, overall field Nitrogen retention ended at {final_n_retention}%. "
        f"Phosphorus retained at {weekly_metrics[-1].phosphorus_retention_pct}%, and Potassium retained at {weekly_metrics[-1].potassium_retention_pct}%. "
        f"Topographical runoff migrated soluble nitrate along {weekly_metrics[3].high_leaching_risk_pct}% of steep slope gradients."
    )
    
    return TemporalAnalyticsResponse(
        field_name=field_name,
        soil_type=soil_type,
        weekly_metrics=weekly_metrics,
        overall_summary=summary,
        recommendations=recs
    )
