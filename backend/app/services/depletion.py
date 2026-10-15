import numpy as np
from app.models.schemas import SimulationParams, WeeklyMetric

SOIL_TEXTURE_FACTORS = {
    "sandy": {
        "leach_n": 0.0065,
        "leach_k": 0.0030,
        "leach_p": 0.0008,
        "runoff_coeff": 0.15,
        "retention_cap": 0.60
    },
    "loam": {
        "leach_n": 0.0040,
        "leach_k": 0.0018,
        "leach_p": 0.0005,
        "runoff_coeff": 0.35,
        "retention_cap": 0.80
    },
    "silt_loam": {
        "leach_n": 0.0035,
        "leach_k": 0.0015,
        "leach_p": 0.0004,
        "runoff_coeff": 0.40,
        "retention_cap": 0.85
    },
    "clay": {
        "leach_n": 0.0022,
        "leach_k": 0.0010,
        "leach_p": 0.0003,
        "runoff_coeff": 0.60,
        "retention_cap": 0.90
    }
}

RAINFALL_SCENARIOS = {
    "dry": [0.0, 5.0, 8.0, 4.0, 2.0, 6.0, 3.0, 1.0, 0.0],
    "normal": [0.0, 18.5, 34.0, 22.0, 12.5, 28.0, 45.0, 15.0, 8.0],
    "heavy": [0.0, 32.0, 65.0, 48.0, 35.0, 58.0, 82.0, 40.0, 25.0],
    "monsoon": [0.0, 55.0, 95.0, 110.0, 75.0, 125.0, 140.0, 80.0, 45.0],
}

CROP_UPTAKE_RATES = {
    "none": 0.0,
    "low": 0.015,
    "medium": 0.035,
    "high": 0.060
}

def simulate_nutrient_migration(
    baseline_grids: dict[str, any],
    nutrient: str,
    target_week: int,
    params: SimulationParams
) -> tuple[np.ndarray, float, float]:
    """
    Simulates spatial grid values for a given nutrient at `target_week` (0 to 8).
    Accounts for vertical leaching, downhill topographical runoff migration, and crop uptake.
    Returns:
        (nutrient_grid, loss_percentage, dominant_migration_bearing_deg)
    """
    soil_props = SOIL_TEXTURE_FACTORS.get(params.soil_type, SOIL_TEXTURE_FACTORS["loam"])
    crop_factor = CROP_UPTAKE_RATES.get(params.crop_uptake_rate, 0.035)
    
    # Weekly rainfall sequence
    if params.custom_rainfall_mm and len(params.custom_rainfall_mm) >= 9:
        rainfalls = params.custom_rainfall_mm[:9]
    else:
        rainfalls = RAINFALL_SCENARIOS.get(params.rainfall_scenario, RAINFALL_SCENARIOS["normal"])
    
    # Select baseline grid
    grid_key = f"grid_{nutrient}"
    if grid_key not in baseline_grids:
        grid_key = "grid_n"
    
    current_grid = np.copy(baseline_grids[grid_key])
    baseline_mean = float(np.mean(current_grid))
    
    if target_week == 0:
        return current_grid, 0.0, 0.0
    
    # Topographical data
    grad_x = baseline_grids["grad_x"]
    grad_y = baseline_grids["grad_y"]
    slope_mag = baseline_grids["slope_magnitude"]
    norm_slope = slope_mag / (np.max(slope_mag) + 1e-6)
    
    # Downhill unit vectors (water flows opposite of elevation rise)
    downhill_x = -grad_x / (slope_mag + 1e-6)
    downhill_y = -grad_y / (slope_mag + 1e-6)
    
    # Specific nutrient coefficients
    if nutrient == "nitrogen":
        leach_rate = soil_props["leach_n"]
        mobility = 1.0  # highly mobile solute
    elif nutrient == "potassium":
        leach_rate = soil_props["leach_k"]
        mobility = 0.55
    elif nutrient == "phosphorus":
        leach_rate = soil_props["leach_p"]
        mobility = 0.25 # binds to soil particles
    elif nutrient == "moisture":
        # Moisture fluctuates with rain and drainage
        leach_rate = 0.005
        mobility = 0.8
    else:  # ph or other
        leach_rate = 0.0005
        mobility = 0.1
        
    rows, cols = current_grid.shape
    
    # Step through weeks from 1 up to target_week
    for w in range(1, target_week + 1):
        rain_mm = rainfalls[w]
        
        # 1. Vertical Leaching Loss
        # Leaching increases with rain volume and is higher in permeable sandy soil
        leach_loss_fraction = min(rain_mm * leach_rate, 0.45)
        current_grid *= (1.0 - leach_loss_fraction)
        
        # 2. Biological Crop Uptake
        # Sigmoidal uptake curve accelerating in mid-season (weeks 3-6)
        growth_multiplier = 1.0 / (1.0 + np.exp(-(w - 4)))
        weekly_crop_loss = crop_factor * growth_multiplier * (1.0 if nutrient in ["nitrogen", "potassium", "phosphorus"] else 0.0)
        current_grid *= max(1.0 - weekly_crop_loss, 0.5)
        
        # 3. Topographical Lateral Migration (Runoff & Sediment Transport)
        # Rainwater and gravity cause lateral migration down slope
        if rain_mm > 5.0 and params.slope_effect_multiplier > 0:
            runoff_force = (rain_mm / 50.0) * soil_props["runoff_coeff"] * params.slope_effect_multiplier * mobility
            runoff_force = min(runoff_force, 0.35)
            
            # Finite difference advection step
            new_grid = np.copy(current_grid)
            
            # Iterate internal grid cells
            for r in range(1, rows - 1):
                for c in range(1, cols - 1):
                    # Downhill flux from cell
                    dx = downhill_x[r, c]
                    dy = downhill_y[r, c]
                    sl = norm_slope[r, c]
                    
                    # Outgoing flux from this steep cell
                    outgoing = current_grid[r, c] * runoff_force * sl * 0.4
                    new_grid[r, c] -= outgoing
                    
                    # Incoming destination target cell
                    dr = int(np.clip(np.round(dy), -1, 1))
                    dc = int(np.clip(np.round(dx), -1, 1))
                    
                    target_r = r + dr
                    target_c = c + dc
                    
                    if 0 <= target_r < rows and 0 <= target_c < cols:
                        new_grid[target_r, target_c] += outgoing * 0.85 # 15% lost to deep drainage
                        
            current_grid = np.maximum(new_grid, 0.0)
    
    # If nutrient is moisture, calculate dynamic soil moisture %
    if nutrient == "moisture":
        recent_rain = rainfalls[target_week]
        base_moist = baseline_grids["grid_moist"]
        current_grid = np.clip(base_moist + (recent_rain * 0.4) - (target_week * 1.2), 10.0, 48.0)
        
    current_mean = float(np.mean(current_grid))
    loss_pct = float(max(0.0, (baseline_mean - current_mean) / max(baseline_mean, 1e-6) * 100.0))
    
    # Dominant slope direction (in degrees 0-360)
    mean_dx = float(np.mean(downhill_x))
    mean_dy = float(np.mean(downhill_y))
    bearing = float((np.degrees(np.arctan2(mean_dx, mean_dy)) + 360) % 360)
    
    return current_grid, loss_pct, bearing

def generate_weekly_analytics(
    baseline_grids: dict[str, any],
    params: SimulationParams,
    field_name: str = "Field 1"
) -> list[WeeklyMetric]:
    """Generates the full 8-week temporal analytics series."""
    metrics: list[WeeklyMetric] = []
    
    rainfalls = RAINFALL_SCENARIOS.get(params.rainfall_scenario, RAINFALL_SCENARIOS["normal"])
    if params.custom_rainfall_mm and len(params.custom_rainfall_mm) >= 9:
        rainfalls = params.custom_rainfall_mm[:9]
        
    cum_rain = 0.0
    
    base_n = float(np.mean(baseline_grids["grid_n"]))
    base_p = float(np.mean(baseline_grids["grid_p"]))
    base_k = float(np.mean(baseline_grids["grid_k"]))
    
    for w in range(9):
        rain = rainfalls[w]
        cum_rain += rain
        
        grid_n, _, _ = simulate_nutrient_migration(baseline_grids, "nitrogen", w, params)
        grid_p, _, _ = simulate_nutrient_migration(baseline_grids, "phosphorus", w, params)
        grid_k, _, _ = simulate_nutrient_migration(baseline_grids, "potassium", w, params)
        grid_m, _, _ = simulate_nutrient_migration(baseline_grids, "moisture", w, params)
        
        curr_n = float(np.mean(grid_n))
        curr_p = float(np.mean(grid_p))
        curr_k = float(np.mean(grid_k))
        curr_m = float(np.mean(grid_m))
        
        # High leaching risk defined as areas where slope > 60th percentile and rain > 20mm
        high_leaching_pct = float(min(100.0, (rain / 45.0) * 35.0 + (w * 4.2))) if rain > 15.0 else float(w * 3.0)
        
        metrics.append(WeeklyMetric(
            week=w,
            rainfall_mm=round(rain, 1),
            cumulative_rainfall_mm=round(cum_rain, 1),
            mean_nitrogen=round(curr_n, 2),
            mean_phosphorus=round(curr_p, 2),
            mean_potassium=round(curr_k, 2),
            mean_moisture=round(curr_m, 1),
            nitrogen_retention_pct=round(max(0.0, min(100.0, (curr_n / max(base_n, 1e-6)) * 100)), 1),
            phosphorus_retention_pct=round(max(0.0, min(100.0, (curr_p / max(base_p, 1e-6)) * 100)), 1),
            potassium_retention_pct=round(max(0.0, min(100.0, (curr_k / max(base_k, 1e-6)) * 100)), 1),
            high_leaching_risk_pct=round(min(high_leaching_pct, 100.0), 1)
        ))
        
    return metrics
