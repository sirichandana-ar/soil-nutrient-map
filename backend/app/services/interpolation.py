import numpy as np
from app.models.schemas import SoilSample

def calculate_bounding_box(samples: list[SoilSample], margin_pct: float = 0.08) -> dict[str, float]:
    """Calculates geospatial bounding box with a margin around sample points."""
    lats = [s.latitude for s in samples]
    lngs = [s.longitude for s in samples]
    
    lat_min, lat_max = min(lats), max(lats)
    lng_min, lng_max = min(lngs), max(lngs)
    
    lat_span = max(lat_max - lat_min, 0.001)
    lng_span = max(lng_max - lng_min, 0.001)
    
    return {
        "lat_min": lat_min - lat_span * margin_pct,
        "lat_max": lat_max + lat_span * margin_pct,
        "lng_min": lng_min - lng_span * margin_pct,
        "lng_max": lng_max + lng_span * margin_pct,
    }

def interpolate_idw_2d(
    sample_coords: np.ndarray,
    sample_values: np.ndarray,
    grid_lats: np.ndarray,
    grid_lngs: np.ndarray,
    power: float = 2.0
) -> np.ndarray:
    """
    Performs Inverse Distance Weighting (IDW) spatial interpolation on a 2D meshgrid.
    sample_coords: (N, 2) array of [lat, lng]
    sample_values: (N,) array of values
    grid_lats, grid_lngs: 2D arrays from np.meshgrid
    Returns: interpolated 2D grid of values (shape matching grid_lats)
    """
    n_samples = len(sample_values)
    grid_shape = grid_lats.shape
    
    flat_lats = grid_lats.ravel()
    flat_lngs = grid_lngs.ravel()
    n_grid_points = len(flat_lats)
    
    interpolated_flat = np.zeros(n_grid_points, dtype=np.float64)
    
    # Cosine factor for longitude distance distortion at field latitude
    mean_lat = np.mean(sample_coords[:, 0])
    cos_lat = np.cos(np.radians(mean_lat))
    
    # Vectorized distance calculation
    # (N_grid, 1, 2) vs (1, N_samples, 2)
    grid_pts = np.column_stack((flat_lats, flat_lngs * cos_lat))
    samp_pts = np.column_stack((sample_coords[:, 0], sample_coords[:, 1] * cos_lat))
    
    for i in range(n_grid_points):
        dists = np.hypot(samp_pts[:, 0] - grid_pts[i, 0], samp_pts[:, 1] - grid_pts[i, 1])
        
        # Exact match or very close
        exact_match = dists < 1e-9
        if np.any(exact_match):
            interpolated_flat[i] = sample_values[np.argmax(exact_match)]
        else:
            weights = 1.0 / (dists ** power)
            interpolated_flat[i] = np.sum(weights * sample_values) / np.sum(weights)
            
    return interpolated_flat.reshape(grid_shape)

def generate_spatial_baseline_grids(
    samples: list[SoilSample],
    resolution: int = 35
) -> dict[str, any]:
    """
    Interpolates all soil attributes and computes topographical slopes across the field.
    """
    bbox = calculate_bounding_box(samples)
    
    lat_steps = resolution
    # Aspect ratio adjustment
    lat_span = bbox["lat_max"] - bbox["lat_min"]
    lng_span = bbox["lng_max"] - bbox["lng_min"]
    aspect = max(lng_span / max(lat_span, 1e-6), 0.5)
    lng_steps = int(max(round(resolution * aspect), 15))
    
    lats_1d = np.linspace(bbox["lat_min"], bbox["lat_max"], lat_steps)
    lngs_1d = np.linspace(bbox["lng_min"], bbox["lng_max"], lng_steps)
    
    grid_lngs, grid_lats = np.meshgrid(lngs_1d, lats_1d)
    
    coords = np.array([[s.latitude, s.longitude] for s in samples])
    
    # Extract values
    n_vals = np.array([s.nitrogen for s in samples])
    p_vals = np.array([s.phosphorus for s in samples])
    k_vals = np.array([s.potassium for s in samples])
    ph_vals = np.array([s.ph for s in samples])
    moist_vals = np.array([s.moisture for s in samples])
    elev_vals = np.array([s.elevation for s in samples])
    
    # Interpolate
    grid_n = interpolate_idw_2d(coords, n_vals, grid_lats, grid_lngs)
    grid_p = interpolate_idw_2d(coords, p_vals, grid_lats, grid_lngs)
    grid_k = interpolate_idw_2d(coords, k_vals, grid_lats, grid_lngs)
    grid_ph = interpolate_idw_2d(coords, ph_vals, grid_lats, grid_lngs)
    grid_moist = interpolate_idw_2d(coords, moist_vals, grid_lats, grid_lngs)
    grid_elev = interpolate_idw_2d(coords, elev_vals, grid_lats, grid_lngs)
    
    # Topographical slope & downhill gradients
    # d_elev_y corresponds to d_lat (North-South), d_elev_x corresponds to d_lng (East-West)
    grad_y, grad_x = np.gradient(grid_elev)
    slope_magnitude = np.hypot(grad_x, grad_y)
    
    return {
        "bbox": bbox,
        "grid_lats": grid_lats,
        "grid_lngs": grid_lngs,
        "grid_n": grid_n,
        "grid_p": grid_p,
        "grid_k": grid_k,
        "grid_ph": grid_ph,
        "grid_moist": grid_moist,
        "grid_elev": grid_elev,
        "grad_x": grad_x,
        "grad_y": grad_y,
        "slope_magnitude": slope_magnitude,
        "resolution_x": lng_steps,
        "resolution_y": lat_steps,
    }
