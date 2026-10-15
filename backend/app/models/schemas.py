from typing import Optional, Literal
from pydantic import BaseModel, Field

class SoilSample(BaseModel):
    sample_id: str
    latitude: float
    longitude: float
    nitrogen: float = Field(..., description="Available Nitrogen in mg/kg (ppm)")
    phosphorus: float = Field(..., description="Available Phosphorus in mg/kg (ppm)")
    potassium: float = Field(..., description="Available Potassium in mg/kg (ppm)")
    ph: float = Field(default=6.5, description="Soil pH level (4.0 - 9.0)")
    moisture: float = Field(default=22.0, description="Volumetric Soil Moisture %")
    elevation: float = Field(default=300.0, description="Elevation in meters above sea level")

class SoilDatasetStats(BaseModel):
    sample_count: int
    lat_min: float
    lat_max: float
    lng_min: float
    lng_max: float
    center_lat: float
    center_lng: float
    nitrogen_mean: float
    nitrogen_min: float
    nitrogen_max: float
    phosphorus_mean: float
    phosphorus_min: float
    phosphorus_max: float
    potassium_mean: float
    potassium_min: float
    potassium_max: float
    ph_mean: float
    moisture_mean: float

class SimulationParams(BaseModel):
    soil_type: Literal["sandy", "loam", "clay", "silt_loam"] = "loam"
    rainfall_scenario: Literal["dry", "normal", "heavy", "monsoon", "custom"] = "normal"
    custom_rainfall_mm: Optional[list[float]] = None
    crop_uptake_rate: Literal["low", "medium", "high", "none"] = "medium"
    slope_effect_multiplier: float = Field(default=1.0, ge=0.0, le=3.0)

class GridCell(BaseModel):
    lat: float
    lng: float
    value: float
    elevation: float
    status: Literal["deficient", "moderate", "optimal", "excess"]
    normalized: float = Field(..., description="Normalized 0.0 - 1.0 for heatmap rendering")

class HeatmapLayerResponse(BaseModel):
    field_name: str
    nutrient: str
    week: int
    unit: str
    min_value: float
    max_value: float
    mean_value: float
    resolution_x: int
    resolution_y: int
    bounds: dict[str, float]
    cells: list[GridCell]
    depletion_loss_pct: float
    migration_direction_deg: float
    critical_deficiency_area_pct: float

class WeeklyMetric(BaseModel):
    week: int
    rainfall_mm: float
    cumulative_rainfall_mm: float
    mean_nitrogen: float
    mean_phosphorus: float
    mean_potassium: float
    mean_moisture: float
    nitrogen_retention_pct: float
    phosphorus_retention_pct: float
    potassium_retention_pct: float
    high_leaching_risk_pct: float

class TemporalAnalyticsResponse(BaseModel):
    field_name: str
    soil_type: str
    weekly_metrics: list[WeeklyMetric]
    overall_summary: str
    recommendations: list[str]

class WeatherForecastDay(BaseModel):
    day: int
    week: int
    rainfall_mm: float
    temperature_c: float
    humidity_pct: float
    condition: str

class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current_moisture_index: float
    precipitation_risk: str
    forecast_days: list[WeatherForecastDay]
    total_expected_rainfall_mm: float

class UploadResponse(BaseModel):
    success: bool
    message: str
    samples: list[SoilSample]
    stats: SoilDatasetStats
