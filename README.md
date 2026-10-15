# TerraPulse &bull; Automated Soil Nutrient Migration Map

An intelligent geospatial precision agriculture system that monitors, interpolates, and simulates the temporal migration and depletion of soil nutrients (**Nitrogen, Phosphorus, Potassium, Soil pH, and Moisture**) across agricultural fields based on spatial topography, precipitation regimes, and soil texture dynamics.

---

## 🏗️ Architecture Overview

The system is engineered as a decoupled, resilient precision farming platform:

```
soil-nutrient-map/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                # Navbar with quick field switcher & engine status
│   │   │   ├── map/                   # Leaflet viewer, IDW Heatmap, Telemetry HUD, Vector arrows
│   │   │   ├── dashboard/             # TimeSlider (W0-W8), SummaryCards, DepletionChart
│   │   │   │   ├── VraPrescriptionModal.jsx  # Machine-ready 3-Zone fertilizer prescription generator
│   │   │   │   └── SampleDataTableModal.jsx  # Soil borehole core sample table & inspector
│   │   │   └── shared/                # SimulationDrawer, FileUploadModal, WeatherWidget
│   │   ├── services/
│   │   │   ├── api.js                 # API client with auto-sync and resilience
│   │   │   └── clientSimulation.js    # High-precision client-side IDW fallback engine
│   │   └── utils/                     # Agronomic thresholds, color scales, geospatial constants
│   └── package.json
│
├── backend/                           # Python FastAPI mathematical engine
│   ├── app/
│   │   ├── api/                       # Endpoints (upload, weather, migration)
│   │   ├── core/                      # App configuration & CORS settings
│   │   ├── models/                    # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── interpolation.py       # 2D Spatial Inverse Distance Weighting (IDW)
│   │   │   └── depletion.py           # Rainfall runoff, leaching & decay modeling
│   │   └── main.py                    # FastAPI application entrypoint
│   └── requirements.txt
│
├── sample_data/                       # Demo soil test laboratory CSV files
├── run-app.bat                        # 1-Click Windows launcher (starts backend + frontend)
└── run-app.ps1                        # 1-Click PowerShell launcher
```

---

## 🌟 Real-World Features

1. **2D Geospatial Inverse Distance Weighting (IDW)**:
   - Interpolates sparse laboratory borehole test points into a dense 2D meshgrid across field topography.
   - Dynamic satellite, topographical terrain, and dark canvas layer switching.

2. **Topographical Lateral Migration & Runoff Vectors**:
   - Accounts for gravitational flow vectors ($-\nabla \text{elev}$), rainfall intensity, and soil permeability (sandy, loam, clay).
   - Simulates leaching of highly mobile nitrate down slope crests into valley depressions.

3. **Temporal Playback (Week 0 to Week 8)**:
   - Automated playback simulating early sowing, storm events, mid-season top-dressing, and pre-harvest depletion.
   - Interactive timeline slider with precipitation accumulation and % nutrient loss.

4. **Variable Rate Application (VRA) Prescription Generator**:
   - Generates machine-ready 3-zone fertilizer prescriptions (Zone 1: Ridge replenishing, Zone 2: Maintenance, Zone 3: Depression reduction).
   - Computes economic ROI and fertilizer cost savings ($/acre).
   - Exports tractor-ready prescription CSVs (compatible with John Deere Operations Center, Trimble, etc.).

5. **Borehole Core Sample Log & Inspector**:
   - Sortable, searchable data log of all soil test sampling stations with GPS coordinates, elevation, and NPK metrics.

6. **Dual-Engine Resilience**:
   - Seamlessly uses the high-performance **Python FastAPI engine** when online.
   - Transparently falls back to the built-in **Client Spatial IDW Engine** when offline or in standalone demo mode.

---

## ⚡ Quick Start

### Option A: One-Click Launch (Windows)
Double-click `run-app.bat` or run:
```powershell
.\run-app.bat
```
*(Starts both FastAPI on port 8000 and React Vite on port 5173).*

---

### Option B: Manual Launch

#### 1. Backend (Python + FastAPI)
```bash
cd backend
python -m venv .venv
# Activate on Windows:
.venv\Scripts\activate
# Activate on Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/api/v1/docs`

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`
