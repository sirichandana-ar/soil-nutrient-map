import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Automated Soil Nutrient Migration Map API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]
    
    # Spatial interpolation defaults
    DEFAULT_GRID_RESOLUTION: int = 35  # Grid cells along max dimension
    IDW_POWER: float = 2.0
    
    # Rainfall default simulation (mm per week)
    DEFAULT_WEEKLY_RAINFALL: list[float] = [
        0.0,   # Week 0 (Baseline)
        18.5,  # Week 1
        34.0,  # Week 2 (Heavy storm event)
        22.0,  # Week 3
        12.5,  # Week 4
        28.0,  # Week 5 (Moderate rain)
        45.0,  # Week 6 (Heavy runoff)
        15.0,  # Week 7
        8.0    # Week 8
    ]

settings = Settings()
