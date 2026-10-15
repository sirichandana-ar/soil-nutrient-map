import React from 'react';
import { Info, Compass } from 'lucide-react';
import { NUTRIENTS } from '../../utils/constants';

export default function NutrientLegend({
  nutrient = 'nitrogen',
  minValue = 0,
  maxValue = 100,
  meanValue = 50,
  unit = 'mg/kg',
  migrationBearing = 135,
  criticalDeficiencyPct = 0
}) {
  const nutrientInfo = NUTRIENTS[nutrient] || NUTRIENTS.nitrogen;

  return (
    <div className="glass-panel rounded-xl p-3.5 shadow-glass w-72 text-xs border border-slate-700/60 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: nutrientInfo.color }}
          />
          <span className="font-semibold text-slate-100">{nutrientInfo.name}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">{unit}</span>
      </div>

      {/* Continuous Gradient Bar */}
      <div className="space-y-1 mb-2.5">
        <div className="h-3 w-full rounded-md shadow-inner bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
          <span>{minValue} (Low)</span>
          <span className="text-emerald-400 font-semibold">{meanValue} avg</span>
          <span>{maxValue} (High)</span>
        </div>
      </div>

      {/* Threshold categories */}
      <div className="grid grid-cols-3 gap-1 text-[10px] mb-2.5">
        <div className="bg-red-500/10 border border-red-500/20 rounded px-1.5 py-1 text-center">
          <div className="text-red-400 font-medium">Deficient</div>
          <div className="text-slate-400 font-mono">&lt; {nutrientInfo.deficientBelow}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-1 text-center">
          <div className="text-emerald-400 font-medium">Optimal</div>
          <div className="text-slate-400 font-mono">{nutrientInfo.optimalRange}</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded px-1.5 py-1 text-center">
          <div className="text-cyan-400 font-medium">Surplus</div>
          <div className="text-slate-400 font-mono">&gt; {nutrientInfo.excessAbove}</div>
        </div>
      </div>

      {/* Migration Vector & Deficiency Alert */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" /> Runoff Bearing:
          </span>
          <span className="font-mono font-semibold text-cyan-300">
            {migrationBearing}° SSE (Downhill)
          </span>
        </div>
        {criticalDeficiencyPct > 0 && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Deficient Area:</span>
            <span className={`font-mono font-bold ${criticalDeficiencyPct > 20 ? 'text-red-400' : 'text-amber-400'}`}>
              {criticalDeficiencyPct}% of field
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
