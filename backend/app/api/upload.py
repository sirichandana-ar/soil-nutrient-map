import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import PlainTextResponse
from app.models.schemas import SoilSample, SoilDatasetStats, UploadResponse
from app.services.interpolation import generate_spatial_baseline_grids

router = APIRouter(prefix="/upload", tags=["Upload"])

# In-memory storage of active field data (defaulted to Cedar Creek Farm)
DEFAULT_PRESET_SAMPLES: list[SoilSample] = [
    SoilSample(sample_id="S01", latitude=41.8781, longitude=-93.0977, nitrogen=42.5, phosphorus=28.4, potassium=185.0, ph=6.5, moisture=24.2, elevation=312.5),
    SoilSample(sample_id="S02", latitude=41.8795, longitude=-93.0955, nitrogen=38.2, phosphorus=22.1, potassium=162.0, ph=6.2, moisture=22.8, elevation=314.1),
    SoilSample(sample_id="S03", latitude=41.8810, longitude=-93.0930, nitrogen=29.4, phosphorus=19.5, potassium=145.0, ph=5.9, moisture=20.5, elevation=316.8),
    SoilSample(sample_id="S04", latitude=41.8825, longitude=-93.0905, nitrogen=22.1, phosphorus=15.2, potassium=130.0, ph=5.8, moisture=18.9, elevation=319.2),
    SoilSample(sample_id="S05", latitude=41.8760, longitude=-93.0985, nitrogen=55.0, phosphorus=34.0, potassium=210.0, ph=6.8, moisture=27.1, elevation=308.4),
    SoilSample(sample_id="S06", latitude=41.8775, longitude=-93.0950, nitrogen=48.7, phosphorus=31.2, potassium=198.0, ph=6.6, moisture=25.4, elevation=310.2),
    SoilSample(sample_id="S07", latitude=41.8790, longitude=-93.0920, nitrogen=35.6, phosphorus=24.8, potassium=170.0, ph=6.3, moisture=23.1, elevation=313.7),
    SoilSample(sample_id="S08", latitude=41.8805, longitude=-93.0890, nitrogen=26.3, phosphorus=18.4, potassium=142.0, ph=6.0, moisture=19.8, elevation=317.5),
    SoilSample(sample_id="S09", latitude=41.8740, longitude=-93.0990, nitrogen=62.3, phosphorus=38.5, potassium=235.0, ph=7.1, moisture=29.3, elevation=305.1),
    SoilSample(sample_id="S10", latitude=41.8755, longitude=-93.0960, nitrogen=53.8, phosphorus=33.1, potassium=208.0, ph=6.7, moisture=26.7, elevation=307.8),
    SoilSample(sample_id="S11", latitude=41.8770, longitude=-93.0930, nitrogen=41.2, phosphorus=27.9, potassium=182.0, ph=6.4, moisture=24.0, elevation=311.6),
    SoilSample(sample_id="S12", latitude=41.8785, longitude=-93.0900, nitrogen=31.5, phosphorus=21.6, potassium=155.0, ph=6.1, moisture=21.2, elevation=315.4),
    SoilSample(sample_id="S13", latitude=41.8720, longitude=-93.0995, nitrogen=68.0, phosphorus=42.0, potassium=250.0, ph=7.2, moisture=31.0, elevation=302.5),
    SoilSample(sample_id="S14", latitude=41.8735, longitude=-93.0965, nitrogen=58.4, phosphorus=36.2, potassium=220.0, ph=6.9, moisture=28.2, elevation=306.0),
    SoilSample(sample_id="S15", latitude=41.8750, longitude=-93.0935, nitrogen=46.9, phosphorus=29.5, potassium=190.0, ph=6.5, moisture=25.1, elevation=309.8),
    SoilSample(sample_id="S16", latitude=41.8765, longitude=-93.0905, nitrogen=36.8, phosphorus=23.4, potassium=166.0, ph=6.2, moisture=22.4, elevation=313.9),
]

active_state: dict[str, any] = {
    "field_name": "Cedar Creek Farm (Plot 4)",
    "samples": DEFAULT_PRESET_SAMPLES,
    "baseline_grids": generate_spatial_baseline_grids(DEFAULT_PRESET_SAMPLES)
}

def compute_stats(samples: list[SoilSample]) -> SoilDatasetStats:
    lats = [s.latitude for s in samples]
    lngs = [s.longitude for s in samples]
    n_vals = [s.nitrogen for s in samples]
    p_vals = [s.phosphorus for s in samples]
    k_vals = [s.potassium for s in samples]
    ph_vals = [s.ph for s in samples]
    moist_vals = [s.moisture for s in samples]
    
    return SoilDatasetStats(
        sample_count=len(samples),
        lat_min=min(lats),
        lat_max=max(lats),
        lng_min=min(lngs),
        lng_max=max(lngs),
        center_lat=sum(lats) / len(lats),
        center_lng=sum(lngs) / len(lngs),
        nitrogen_mean=round(sum(n_vals) / len(n_vals), 2),
        nitrogen_min=round(min(n_vals), 2),
        nitrogen_max=round(max(n_vals), 2),
        phosphorus_mean=round(sum(p_vals) / len(p_vals), 2),
        phosphorus_min=round(min(p_vals), 2),
        phosphorus_max=round(max(p_vals), 2),
        potassium_mean=round(sum(k_vals) / len(k_vals), 2),
        potassium_min=round(min(k_vals), 2),
        potassium_max=round(max(k_vals), 2),
        ph_mean=round(sum(ph_vals) / len(ph_vals), 2),
        moisture_mean=round(sum(moist_vals) / len(moist_vals), 2),
    )

@router.get("/current", response_model=UploadResponse)
async def get_current_dataset():
    """Returns the currently active soil dataset and its statistical summary."""
    samples = active_state["samples"]
    stats = compute_stats(samples)
    return UploadResponse(
        success=True,
        message=f"Current active field: {active_state['field_name']}",
        samples=samples,
        stats=stats
    )

@router.post("/csv", response_model=UploadResponse)
async def upload_soil_csv(file: UploadFile = File(...)):
    """
    Parses and loads a user-provided CSV file with soil sample coordinates and nutrient measurements.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are accepted.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        
        # Flexible column resolution
        col_map = {}
        for c in df.columns:
            if c in ["latitude", "lat", "y"]:
                col_map["lat"] = c
            elif c in ["longitude", "lng", "lon", "long", "x"]:
                col_map["lng"] = c
            elif c in ["nitrogen", "n", "nitro"]:
                col_map["n"] = c
            elif c in ["phosphorus", "p", "phos"]:
                col_map["p"] = c
            elif c in ["potassium", "k", "pot"]:
                col_map["k"] = c
            elif c in ["ph", "soil_ph"]:
                col_map["ph"] = c
            elif c in ["moisture", "moist", "water_content"]:
                col_map["moisture"] = c
            elif c in ["elevation", "elev", "alt", "altitude"]:
                col_map["elevation"] = c
            elif c in ["sample_id", "id", "sample"]:
                col_map["id"] = c
                
        required = ["lat", "lng", "n", "p", "k"]
        missing = [r for r in required if r not in col_map]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing essential columns in CSV: {missing}. Required columns: latitude, longitude, nitrogen, phosphorus, potassium"
            )
            
        parsed_samples: list[SoilSample] = []
        for idx, row in df.iterrows():
            s_id = str(row[col_map["id"]]) if "id" in col_map else f"SMP-{idx+1:03d}"
            lat = float(row[col_map["lat"]])
            lng = float(row[col_map["lng"]])
            n = float(row[col_map["n"]])
            p = float(row[col_map["p"]])
            k = float(row[col_map["k"]])
            ph = float(row[col_map["ph"]]) if "ph" in col_map else 6.5
            moist = float(row[col_map["moisture"]]) if "moisture" in col_map else 22.0
            elev = float(row[col_map["elevation"]]) if "elevation" in col_map else 300.0 + idx
            
            parsed_samples.append(SoilSample(
                sample_id=s_id,
                latitude=lat,
                longitude=lng,
                nitrogen=n,
                phosphorus=p,
                potassium=k,
                ph=ph,
                moisture=moist,
                elevation=elev
            ))
            
        if len(parsed_samples) < 3:
            raise HTTPException(status_code=400, detail="Minimum 3 spatial soil sample points are required for spatial interpolation.")
            
        field_name = file.filename.rsplit(".", 1)[0].replace("_", " ").title()
        
        # Update active state & recalculate spatial baseline grids
        active_state["field_name"] = field_name
        active_state["samples"] = parsed_samples
        active_state["baseline_grids"] = generate_spatial_baseline_grids(parsed_samples)
        
        stats = compute_stats(parsed_samples)
        return UploadResponse(
            success=True,
            message=f"Successfully loaded {len(parsed_samples)} soil samples for '{field_name}'.",
            samples=parsed_samples,
            stats=stats
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

@router.get("/template-csv", response_class=PlainTextResponse)
async def get_csv_template():
    """Returns a pre-formatted CSV template that users can fill out with their soil test data."""
    template = (
        "sample_id,latitude,longitude,nitrogen,phosphorus,potassium,ph,moisture,elevation\n"
        "S01,41.8781,-93.0977,45.2,28.4,185.0,6.5,24.2,312.5\n"
        "S02,41.8795,-93.0955,38.2,22.1,162.0,6.2,22.8,314.1\n"
        "S03,41.8810,-93.0930,29.4,19.5,145.0,5.9,20.5,316.8\n"
        "S04,41.8760,-93.0985,55.0,34.0,210.0,6.8,27.1,308.4\n"
        "S05,41.8775,-93.0950,48.7,31.2,198.0,6.6,25.4,310.2\n"
    )
    return PlainTextResponse(content=template, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=soil_samples_template.csv"})

@router.post("/load-preset/{preset_id}", response_model=UploadResponse)
async def load_preset(preset_id: str):
    """Loads a built-in pre-configured agricultural dataset."""
    if preset_id == "cedar_creek":
        active_state["field_name"] = "Cedar Creek Farm (Plot 4)"
        active_state["samples"] = DEFAULT_PRESET_SAMPLES
    elif preset_id == "napa_valley":
        # Hillside vineyard with steep gradient
        vineyard_samples = [
            SoilSample(sample_id="NV1", latitude=38.498, longitude=-122.450, nitrogen=28.0, phosphorus=18.0, potassium=140.0, ph=6.2, moisture=16.0, elevation=420.0),
            SoilSample(sample_id="NV2", latitude=38.496, longitude=-122.448, nitrogen=35.0, phosphorus=22.0, potassium=165.0, ph=6.4, moisture=18.5, elevation=395.0),
            SoilSample(sample_id="NV3", latitude=38.494, longitude=-122.446, nitrogen=48.0, phosphorus=29.0, potassium=195.0, ph=6.7, moisture=22.0, elevation=365.0),
            SoilSample(sample_id="NV4", latitude=38.492, longitude=-122.444, nitrogen=64.0, phosphorus=38.0, potassium=240.0, ph=7.0, moisture=26.5, elevation=330.0),
            SoilSample(sample_id="NV5", latitude=38.497, longitude=-122.444, nitrogen=32.0, phosphorus=20.0, potassium=150.0, ph=6.3, moisture=17.0, elevation=405.0),
            SoilSample(sample_id="NV6", latitude=38.495, longitude=-122.442, nitrogen=42.0, phosphorus=26.0, potassium=180.0, ph=6.5, moisture=20.0, elevation=375.0),
            SoilSample(sample_id="NV7", latitude=38.493, longitude=-122.440, nitrogen=58.0, phosphorus=35.0, potassium=225.0, ph=6.8, moisture=25.0, elevation=340.0),
        ]
        active_state["field_name"] = "Napa Terraced Vineyards"
        active_state["samples"] = vineyard_samples
    elif preset_id == "punjab_alluvial":
        punjab_samples = [
            SoilSample(sample_id="PB1", latitude=30.900, longitude=75.850, nitrogen=70.0, phosphorus=40.0, potassium=280.0, ph=7.4, moisture=32.0, elevation=245.0),
            SoilSample(sample_id="PB2", latitude=30.903, longitude=75.854, nitrogen=65.0, phosphorus=36.0, potassium=260.0, ph=7.3, moisture=29.0, elevation=246.0),
            SoilSample(sample_id="PB3", latitude=30.906, longitude=75.858, nitrogen=58.0, phosphorus=32.0, potassium=240.0, ph=7.2, moisture=27.0, elevation=247.5),
            SoilSample(sample_id="PB4", latitude=30.898, longitude=75.853, nitrogen=75.0, phosphorus=44.0, potassium=300.0, ph=7.6, moisture=34.0, elevation=244.0),
            SoilSample(sample_id="PB5", latitude=30.901, longitude=75.857, nitrogen=62.0, phosphorus=35.0, potassium=255.0, ph=7.3, moisture=28.5, elevation=246.0),
            SoilSample(sample_id="PB6", latitude=30.904, longitude=75.861, nitrogen=54.0, phosphorus=29.0, potassium=225.0, ph=7.1, moisture=26.0, elevation=248.0),
        ]
        active_state["field_name"] = "Punjab Alluvial Wheat Basin"
        active_state["samples"] = punjab_samples
    else:
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' not found.")
        
    active_state["baseline_grids"] = generate_spatial_baseline_grids(active_state["samples"])
    stats = compute_stats(active_state["samples"])
    return UploadResponse(
        success=True,
        message=f"Preset loaded: {active_state['field_name']}",
        samples=active_state["samples"],
        stats=stats
    )
