import React from 'react';
import { TrendingDown, AlertTriangle, ShieldCheck, Mountain, Compass, Droplet } from 'lucide-react';
import { NUTRIENTS } from '../../utils/constants';

export default function SummaryCards({
  heatmapData,
  activeNutrient = 'nitrogen',
  currentWeek = 0,
}) {
  const meta = NUTRIENTS[activeNutrient] || NUTRIENTS.nitrogen;

  const meanVal = heatmapData?.mean_value ?? 0;
  const unit = heatmapData?.unit ?? 'mg/kg';
  const lossPct = heatmapData?.depletion_loss_pct ?? 0;
  const criticalDeficiencyPct = heatmapData?.critical_deficiency_area_pct ?? 0;
  const bearing = heatmapData?.migration_direction_deg ?? 135;
  const retentionPct = Math.max(0, 100 - lossPct);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Mean Concentration Card */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 shadow-glass border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Mean Concentration</span>
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{meanVal}</span>
          <span className="text-xs font-mono text-slate-400">{unit}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Baseline Δ (W0):</span>
          <span className={`font-mono font-semibold flex items-center gap-0.5 ${lossPct > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {lossPct > 0 ? `-${lossPct}%` : 'Baseline (0%)'}
          </span>
        </div>
      </div>

      {/* 2. Critical Deficiency Area */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 shadow-glass border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Deficiency Zone</span>
          <AlertTriangle className={`h-4 w-4 ${criticalDeficiencyPct > 25 ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono ${criticalDeficiencyPct > 25 ? 'text-red-400' : 'text-amber-300'}`}>
            {criticalDeficiencyPct}%
          </span>
          <span className="text-xs text-slate-400">of total field</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Threshold:</span>
          <span className="font-mono text-slate-300">&lt; {meta.deficientBelow} {unit}</span>
        </div>
      </div>

      {/* 3. Soil Retention Index */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 shadow-glass border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Nutrient Retention</span>
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {retentionPct.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">retained</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${retentionPct}%` }}
          />
        </div>
      </div>

      {/* 4. Topographical Runoff Dynamics */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-4 shadow-glass border border-slate-800/80">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Topographical Runoff</span>
          <Mountain className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <Compass className="h-5 w-5 text-cyan-400" />
          <span className="text-xl font-bold font-mono text-cyan-300">
            {bearing}° SSE
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Flow Mechanics:</span>
          <span className="text-slate-300 font-medium">Ridge → Depression</span>
        </div>
      </div>
    </div>
  );
}
