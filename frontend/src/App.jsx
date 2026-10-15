import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import MapContainer from './components/map/MapContainer';
import MapControls from './components/map/MapControls';
import NutrientLegend from './components/map/NutrientLegend';
import TimeSlider from './components/dashboard/TimeSlider';
import SummaryCards from './components/dashboard/SummaryCards';
import DepletionChart from './components/dashboard/DepletionChart';
import RecommendationsCard from './components/dashboard/RecommendationsCard';
import FileUploadModal from './components/shared/FileUploadModal';
import SimulationDrawer from './components/shared/SimulationDrawer';
import WeatherWidget from './components/shared/WeatherWidget';
import VraPrescriptionModal from './components/dashboard/VraPrescriptionModal';
import SampleDataTableModal from './components/dashboard/SampleDataTableModal';
import { api } from './services/api';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Field & Simulation parameters
  const [activeNutrient, setActiveNutrient] = useState('nitrogen');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [baseTile, setBaseTile] = useState('satellite');
  const [showMarkers, setShowMarkers] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(0.65);

  const [simulationParams, setSimulationParams] = useState({
    soilType: 'loam',
    rainfallScenario: 'normal',
    cropUptake: 'medium',
    slopeFactor: 1.0,
  });

  // Data states
  const [dataset, setDataset] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // Fetch baseline dataset
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getCurrentDataset();
      setDataset(data);
      setBackendConnected(Boolean(data.isBackend));
    } catch (err) {
      console.warn('Initial data load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch heatmap layer when week, nutrient, or simulation params change
  useEffect(() => {
    let isMounted = true;
    async function loadHeatmap() {
      try {
        const res = await api.getHeatmapLayer({
          nutrient: activeNutrient,
          week: currentWeek,
          soilType: simulationParams.soilType,
          rainfallScenario: simulationParams.rainfallScenario,
          slopeFactor: simulationParams.slopeFactor,
          cropUptake: simulationParams.cropUptake,
        });
        if (isMounted) {
          setHeatmapData(res);
          if (res.isBackend !== undefined) setBackendConnected(res.isBackend);
        }
      } catch (err) {
        console.error('Heatmap load error:', err);
      }
    }
    loadHeatmap();
    return () => {
      isMounted = false;
    };
  }, [activeNutrient, currentWeek, simulationParams, dataset]);

  // Fetch 8-week temporal analytics series
  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        const [analyticsRes, weatherRes] = await Promise.all([
          api.getTemporalAnalytics({
            soilType: simulationParams.soilType,
            rainfallScenario: simulationParams.rainfallScenario,
            slopeFactor: simulationParams.slopeFactor,
          }),
          api.getWeatherForecast(),
        ]);
        if (isMounted) {
          setAnalyticsData(analyticsRes);
          setWeatherData(weatherRes);
          if (analyticsRes.isBackend !== undefined) setBackendConnected(analyticsRes.isBackend);
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [simulationParams, dataset]);

  // Handle successful CSV or preset upload
  const handleDatasetUpdate = (uploadResponse) => {
    setDataset(uploadResponse);
    setCurrentWeek(0);
    if (uploadResponse.isBackend !== undefined) setBackendConnected(uploadResponse.isBackend);
  };

  // Quick preset switch from navbar dropdown
  const handleSelectPreset = async (presetId) => {
    try {
      const res = await api.loadPreset(presetId);
      handleDatasetUpdate(res);
    } catch (err) {
      console.error('Failed to switch preset:', err);
    }
  };

  const cumulativeRain = analyticsData?.weekly_metrics?.[currentWeek]?.cumulative_rainfall_mm ?? 0;
  const criticalDeficiencyPct = heatmapData?.critical_deficiency_area_pct ?? 0;

  return (
    <div className="min-h-screen bg-agro-dark text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        fieldName={heatmapData?.field_name || dataset?.message || 'Cedar Creek Farm (Plot 4)'}
        backendConnected={backendConnected}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onSelectPreset={handleSelectPreset}
        onRefresh={fetchInitialData}
        activeNutrient={activeNutrient}
        currentWeek={currentWeek}
      />

      {/* Main Application Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Critical Agronomic Alert Banner if deficiency spikes in simulation */}
        {criticalDeficiencyPct > 20 && currentWeek > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-950/40 border border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 shadow-glass animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Warning:</strong> {criticalDeficiencyPct}% of field zone has crossed critical {activeNutrient} deficiency threshold at Week {currentWeek}. Leaching runoff down steep slope requires intervention.
              </span>
            </div>
            <button
              onClick={() => setIsPrescriptionOpen(true)}
              className="shrink-0 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 text-[11px] font-bold transition-colors"
            >
              Generate VRA Rx
            </button>
          </div>
        )}

        {/* 2. Top Summary KPI Cards */}
        <SummaryCards
          heatmapData={heatmapData}
          activeNutrient={activeNutrient}
          currentWeek={currentWeek}
        />

        {/* 3. Central Map Interactive Stage */}
        <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-800 shadow-glass">
          {/* Base Leaflet Map */}
          <MapContainer
            heatmapData={heatmapData}
            samples={dataset?.samples || []}
            activeNutrient={activeNutrient}
            baseTile={baseTile}
            showMarkers={showMarkers}
            showVectors={showVectors}
            showGrid={showGrid}
            layerOpacity={layerOpacity}
          />

          {/* Floating Top Left Controls */}
          <div className="absolute top-4 left-4 z-10 max-w-[calc(100%-2rem)]">
            <MapControls
              activeNutrient={activeNutrient}
              onSelectNutrient={setActiveNutrient}
              baseTile={baseTile}
              onSelectBaseTile={setBaseTile}
              showMarkers={showMarkers}
              onToggleMarkers={() => setShowMarkers(!showMarkers)}
              showVectors={showVectors}
              onToggleVectors={() => setShowVectors(!showVectors)}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              layerOpacity={layerOpacity}
              onChangeOpacity={setLayerOpacity}
              onResetView={() => {
                if (dataset?.samples?.length) {
                  const s = dataset.samples;
                  setDataset({ ...dataset, samples: [...s] });
                }
              }}
            />
          </div>

          {/* Floating Bottom Left Nutrient Legend */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
            <NutrientLegend
              nutrient={activeNutrient}
              minValue={heatmapData?.min_value ?? 0}
              maxValue={heatmapData?.max_value ?? 100}
              meanValue={heatmapData?.mean_value ?? 50}
              unit={heatmapData?.unit ?? 'mg/kg'}
              migrationBearing={heatmapData?.migration_direction_deg ?? 135}
              criticalDeficiencyPct={heatmapData?.critical_deficiency_area_pct ?? 0}
            />
          </div>
        </div>

        {/* 4. Temporal Migration Time Slider */}
        <TimeSlider
          currentWeek={currentWeek}
          onChangeWeek={setCurrentWeek}
          depletionLossPct={heatmapData?.depletion_loss_pct ?? 0}
          cumulativeRainMm={cumulativeRain}
        />

        {/* 5. Deep Analytics & Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <DepletionChart
              analyticsData={analyticsData}
              currentWeek={currentWeek}
            />
          </div>

          <div className="space-y-4">
            <WeatherWidget weatherData={weatherData} />
            <RecommendationsCard
              recommendations={analyticsData?.recommendations || []}
              summary={analyticsData?.overall_summary || ''}
            />
          </div>
        </div>
      </main>

      {/* Upload CSV Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleDatasetUpdate}
      />

      {/* Simulation Drivers Drawer */}
      <SimulationDrawer
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        simulationParams={simulationParams}
        onChangeParams={setSimulationParams}
      />

      {/* Variable Rate Application (VRA) Prescription Modal */}
      <VraPrescriptionModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        heatmapData={heatmapData}
        currentWeek={currentWeek}
        activeNutrient={activeNutrient}
        fieldName={heatmapData?.field_name || 'Cedar Creek Farm'}
      />

      {/* Soil Core Sample Boring Log Modal */}
      <SampleDataTableModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        samples={dataset?.samples || []}
        fieldName={heatmapData?.field_name || 'Cedar Creek Farm'}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
        <span>TerraPulse Precision Ag Intelligence &bull; Spatial IDW Interpolation & Topographical Runoff Dynamics</span>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <button onClick={() => setIsPrescriptionOpen(true)} className="hover:text-emerald-400">VRA Prescription</button>
          <span>&bull;</span>
          <button onClick={() => setIsSamplesOpen(true)} className="hover:text-cyan-400">Sample Boreholes</button>
          <span>&bull;</span>
          <button onClick={() => setIsSimulationOpen(true)} className="hover:text-amber-400">Simulation Settings</button>
        </div>
      </footer>
    </div>
  );
}
