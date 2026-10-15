import requests
from fastapi import APIRouter
from app.models.schemas import WeatherResponse, WeatherForecastDay
from app.api.upload import active_state

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/forecast", response_model=WeatherResponse)
async def get_weather_forecast():
    """
    Fetches real or agronomic simulated meteorological and rainfall data for the current field location.
    Attempts Open-Meteo free public API first; falls back gracefully to agronomic scenario simulator.
    """
    samples = active_state.get("samples", [])
    if samples:
        center_lat = sum(s.latitude for s in samples) / len(samples)
        center_lng = sum(s.longitude for s in samples) / len(samples)
    else:
        center_lat, center_lng = 41.8781, -93.0977
        
    days: list[WeatherForecastDay] = []
    total_rain = 0.0
    
    # Try fetching from Open-Meteo (free, no API key required)
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={center_lat:.4f}&longitude={center_lng:.4f}&daily=precipitation_sum,temperature_2m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=14"
        resp = requests.get(url, timeout=3.0)
        if resp.status_code == 200:
            data = resp.json().get("daily", {})
            precip = data.get("precipitation_sum", [])
            temp = data.get("temperature_2m_max", [])
            humid = data.get("relative_humidity_2m_mean", [])
            
            for d in range(min(len(precip), 14)):
                r = float(precip[d]) if d < len(precip) and precip[d] is not None else 0.0
                t = float(temp[d]) if d < len(temp) and temp[d] is not None else 22.0
                h = float(humid[d]) if d < len(humid) and humid[d] is not None else 65.0
                cond = "Heavy Rain" if r > 15 else ("Rain Shower" if r > 4 else ("Cloudy" if h > 70 else "Sunny"))
                total_rain += r
                
                days.append(WeatherForecastDay(
                    day=d + 1,
                    week=(d // 7) + 1,
                    rainfall_mm=round(r, 1),
                    temperature_c=round(t, 1),
                    humidity_pct=round(h, 1),
                    condition=cond
                ))
    except Exception:
        # Fallback simulation
        pass
        
    # If no days populated from API, use realistic seasonal forecast
    if not days:
        simulated_rains = [0.0, 12.4, 25.0, 3.2, 0.0, 18.6, 22.1, 8.4, 0.0, 4.2, 14.8, 31.0, 6.5, 0.0]
        simulated_temps = [24.0, 22.5, 19.8, 23.0, 26.1, 21.0, 20.4, 23.5, 25.8, 27.0, 22.4, 18.9, 21.5, 25.0]
        for d in range(14):
            r = simulated_rains[d]
            t = simulated_temps[d]
            total_rain += r
            cond = "Heavy Rain" if r > 20 else ("Moderate Rain" if r > 8 else ("Light Rain" if r > 0 else "Partly Cloudy"))
            days.append(WeatherForecastDay(
                day=d + 1,
                week=(d // 7) + 1,
                rainfall_mm=round(r, 1),
                temperature_c=round(t, 1),
                humidity_pct=round(55.0 + (r * 1.5), 1),
                condition=cond
            ))
            
    risk_level = "High Leaching Risk" if total_rain > 60 else ("Moderate Moisture" if total_rain > 25 else "Dry / Low Leaching")
    
    return WeatherResponse(
        location=active_state.get("field_name", "Field 1"),
        latitude=round(center_lat, 4),
        longitude=round(center_lng, 4),
        current_moisture_index=round(min(100.0, 24.0 + (total_rain * 0.3)), 1),
        precipitation_risk=risk_level,
        forecast_days=days,
        total_expected_rainfall_mm=round(total_rain, 1)
    )
