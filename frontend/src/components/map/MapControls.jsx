import React from 'react';
import { Eye, Compass, Mountain, Map as MapIcon, Globe, Grid, Sliders, Maximize2 } from 'lucide-react';
import { NUTRIENTS } from '../../utils/constants';

export default function MapControls({
  activeNutrient,
  onSelectNutrient,
  baseTile,
  onSelectBaseTile,
  showMarkers,
  onToggleMarkers,
  showVectors,
  onToggleVectors,
  showGrid,
  onToggleGrid,
  layerOpacity = 0.65,
  onChangeOpacity,
  onResetView,
}) {
  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      {/* Nutrient Selection Pills */}
      <div className="glass-panel rounded-xl p-1.5 shadow-glass flex items-center gap-1 border border-slate-700/60 overflow-x-auto max-w-full">
        {Object.values(NUTRIENTS).map((n) => {
          const isActive = activeNutrient === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onSelectNutrient(n.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white shadow-md border border-slate-600 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-transform"
                style={{
                  backgroundColor: n.color,
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                }}
              />
              <span>{n.name}</span>
            </button>
          );
        })}
      </div>

      {/* Layer Toggles & Map Style Floating Row */}
      <div className="glass-panel rounded-xl p-2 shadow-glass flex flex-wrap items-center justify-between gap-2 border border-slate-700/60 text-xs">
        {/* Base Map Selector */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Base:</span>
          <button
            onClick={() => onSelectBaseTile('satellite')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              baseTile === 'satellite'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="High-resolution satellite imagery"
          >
            <Globe className="w-3 h-3" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => onSelectBaseTile('topo')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              baseTile === 'topo'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Topographical terrain and contour lines"
          >
            <Mountain className="w-3 h-3" />
            <span>Terrain</span>
          </button>

          <button
            onClick={() => onSelectBaseTile('dark')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
              baseTile === 'dark'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Dark CartoDB canvas"
          >
            <MapIcon className="w-3 h-3" />
            <span>Dark</span>
          </button>
        </div>

        {/* Feature Overlays & Opacity Slider */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/80">
          <button
            onClick={onToggleMarkers}
            className={`px-2 py-1 rounded-md text-[11px] transition-colors flex items-center gap-1 ${
              showMarkers
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle soil borehole sample markers"
          >
            <Eye className="w-3 h-3" />
            <span>Samples</span>
          </button>

          <button
            onClick={onToggleVectors}
            className={`px-2 py-1 rounded-md text-[11px] transition-colors flex items-center gap-1 ${
              showVectors
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle downhill runoff migration flow arrows"
          >
            <Compass className="w-3 h-3" />
            <span>Runoff</span>
          </button>

          {/* Opacity slider */}
          {onChangeOpacity && (
            <div className="hidden lg:flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-700/60">
              <span className="text-[10px] text-slate-400">Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                className="w-14 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                title={`Heatmap opacity: ${Math.round(layerOpacity * 100)}%`}
              />
            </div>
          )}

          {/* Reset View Button */}
          {onResetView && (
            <button
              onClick={onResetView}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset View to Field Bounds"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
