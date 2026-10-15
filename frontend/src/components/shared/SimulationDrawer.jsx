import React from 'react';
import { X, Sliders, Layers, CloudRain, Mountain, Sprout, Check } from 'lucide-react';
import { SOIL_TYPES, RAINFALL_SCENARIOS } from '../../utils/constants';

export default function SimulationDrawer({
  isOpen,
  onClose,
  simulationParams,
  onChangeParams,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm glass-panel border-l border-slate-800 bg-slate-950/95 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-sans">Simulation Controls</h2>
              <p className="text-[11px] text-slate-400">Soil physics & meteorological drivers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
          {/* 1. Soil Texture Profile */}
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>Soil Texture & Permeability</span>
            </label>
            <div className="space-y-1.5">
              {SOIL_TYPES.map((soil) => {
                const isSelected = simulationParams.soilType === soil.id;
                return (
                  <button
                    key={soil.id}
                    onClick={() => onChangeParams({ ...simulationParams, soilType: soil.id })}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{soil.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{soil.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Rainfall Scenario */}
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
              <span>Rainfall Precipitation Regime</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RAINFALL_SCENARIOS.map((rain) => {
                const isSelected = simulationParams.rainfallScenario === rain.id;
                return (
                  <button
                    key={rain.id}
                    onClick={() => onChangeParams({ ...simulationParams, rainfallScenario: rain.id })}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold">{rain.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{rain.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Topographical Slope Multiplier */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Mountain className="h-3.5 w-3.5 text-amber-400" />
                <span>Slope Runoff Multiplier</span>
              </label>
              <span className="font-mono text-xs text-amber-300 font-bold">
                {simulationParams.slopeFactor}x
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.5"
              step="0.25"
              value={simulationParams.slopeFactor}
              onChange={(e) =>
                onChangeParams({
                  ...simulationParams,
                  slopeFactor: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.0x (Flat Plain)</span>
              <span>1.0x (Normal)</span>
              <span>2.5x (Steep Hillside)</span>
            </div>
          </div>

          {/* 4. Crop Uptake Rate */}
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <Sprout className="h-3.5 w-3.5 text-emerald-400" />
              <span>Crop Uptake Demand</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {['none', 'low', 'medium', 'high'].map((c) => {
                const isSelected = simulationParams.cropUptake === c;
                return (
                  <button
                    key={c}
                    onClick={() => onChangeParams({ ...simulationParams, cropUptake: c })}
                    className={`py-1.5 rounded-lg border text-center capitalize font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-glow-emerald"
        >
          Apply Simulation Drivers
        </button>
      </div>
    </div>
  );
}
