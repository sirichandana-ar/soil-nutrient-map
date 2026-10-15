import React from 'react';
import { Sprout, UploadCloud, Sliders, RefreshCw, Calculator, Database, MapPin, ChevronDown } from 'lucide-react';

const PRESET_OPTIONS = [
  { id: 'cedar_creek', name: 'Cedar Creek Farm (Plot 4)', label: 'Iowa Corn (52.4 ac)' },
  { id: 'napa_valley', name: 'Napa Terraced Vineyards (Hillside)', label: 'Hillside Vineyard (38 ac)' },
  { id: 'punjab_alluvial', name: 'Punjab Alluvial Wheat Basin', label: 'Wheat Basin (65.2 ac)' },
];

export default function Navbar({
  fieldName,
  backendConnected,
  onOpenUpload,
  onOpenSimulation,
  onOpenPrescription,
  onOpenSamples,
  onSelectPreset,
  onRefresh,
  activeNutrient,
  currentWeek,
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-3 sm:px-6 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-glow-emerald">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">TerraPulse</span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                PRECISION AG
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block leading-none mt-0.5">
              Automated Soil Nutrient Migration & Topographical Leaching
            </p>
          </div>
        </div>

        {/* Quick Field Selector Dropdown */}
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 shadow-inner">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">Active Field</span>
            <select
              value={
                PRESET_OPTIONS.find((p) => fieldName.startsWith(p.name.split(' (')[0]))?.id ||
                'cedar_creek'
              }
              onChange={(e) => onSelectPreset && onSelectPreset(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 border-none p-0 cursor-pointer focus:outline-none hover:text-emerald-300 transition-colors"
            >
              {PRESET_OPTIONS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <div className="text-[11px] font-mono text-cyan-400 whitespace-nowrap">
            W{currentWeek} &bull; {activeNutrient.toUpperCase()}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Connection status badge */}
          <button
            onClick={onRefresh}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] border transition-all ${
              backendConnected
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-500/30 text-amber-300 hover:bg-amber-900/60'
            }`}
            title={backendConnected ? 'FastAPI Python Engine Active (Click to sync)' : 'Client Fallback Mode (Click to test backend connection)'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${backendConnected ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-amber-400 animate-pulse'}`} />
            <span className="hidden sm:inline">{backendConnected ? 'Python API' : 'Standalone'}</span>
            <RefreshCw className="h-3 w-3 ml-0.5 text-slate-400 hover:text-white transition-transform active:rotate-180" />
          </button>

          {/* VRA Fertilizer Prescription Button */}
          <button
            onClick={onOpenPrescription}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-emerald-500/50 shadow-sm"
            title="Generate Variable Rate Fertilizer Prescription"
          >
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">VRA Prescription</span>
          </button>

          {/* Borehole Samples Log Button */}
          <button
            onClick={onOpenSamples}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 shadow-sm"
            title="View Soil Core Sample Boring Log"
          >
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">Samples Log</span>
          </button>

          {/* Simulation Drawer Toggle */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Simulation</span>
          </button>

          {/* Upload Soil CSV Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-glow-emerald"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
