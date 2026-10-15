import React, { useState } from 'react';
import { X, Sparkles, Download, CheckCircle, Calculator, FileSpreadsheet, ArrowRight, DollarSign, Sprout } from 'lucide-react';

const CROP_PROFILES = [
  { id: 'corn', name: 'Grain Corn (Maize)', targetYield: '190 bu/ac', baseNReq: 160 },
  { id: 'wheat', name: 'Winter Wheat', targetYield: '75 bu/ac', baseNReq: 110 },
  { id: 'vineyard', name: 'Wine Grapes (Vineyard)', targetYield: '4.5 tons/ac', baseNReq: 50 },
  { id: 'soybean', name: 'Soybeans (Legume)', targetYield: '60 bu/ac', baseNReq: 35 },
  { id: 'cotton', name: 'Upland Cotton', targetYield: '1,200 lbs/ac', baseNReq: 100 },
];

export default function VraPrescriptionModal({
  isOpen,
  onClose,
  heatmapData,
  currentWeek,
  activeNutrient,
  fieldName = 'Cedar Creek Farm',
}) {
  const [selectedCrop, setSelectedCrop] = useState('corn');
  const [fertilizerSource, setFertilizerSource] = useState('uan_32'); // Urea 46-0-0 or UAN 32%
  const [nitrogenCostPerLb, setNitrogenCostPerLb] = useState(0.68); // $0.68 / lb N

  if (!isOpen) return null;

  const crop = CROP_PROFILES.find((c) => c.id === selectedCrop) || CROP_PROFILES[0];
  const meanVal = heatmapData?.mean_value || 40;
  const criticalDeficiencyPct = heatmapData?.critical_deficiency_area_pct || 15;

  // Management Zone calculation
  const totalCells = heatmapData?.cells?.length || 100;
  const deficientCells = heatmapData?.cells?.filter((c) => c.status === 'deficient')?.length || 20;
  const moderateCells = heatmapData?.cells?.filter((c) => c.status === 'moderate')?.length || 45;
  const optimalCells = Math.max(1, totalCells - deficientCells - moderateCells);

  const zone1Pct = ((deficientCells / totalCells) * 100).toFixed(1);
  const zone2Pct = ((moderateCells / totalCells) * 100).toFixed(1);
  const zone3Pct = ((optimalCells / totalCells) * 100).toFixed(1);

  // Recommended N rates in lbs/ac for each zone
  const zone1Rate = Math.round(crop.baseNReq * 1.25);
  const zone2Rate = Math.round(crop.baseNReq * 0.95);
  const zone3Rate = Math.round(crop.baseNReq * 0.55);

  const flatRate = crop.baseNReq;
  // parseFloat required: zone*Pct is a string from .toFixed(1) — division on a string causes NaN
  const vraAvgRate = Math.round(
    (zone1Rate * (parseFloat(zone1Pct) / 100)) +
    (zone2Rate * (parseFloat(zone2Pct) / 100)) +
    (zone3Rate * (parseFloat(zone3Pct) / 100))
  );
  const savingsLbsPerAc = Math.max(0, flatRate - vraAvgRate);
  const savingsDollarsPerAc = (savingsLbsPerAc * nitrogenCostPerLb).toFixed(2);
  const totalFieldSavings = (savingsDollarsPerAc * 50).toFixed(0);

  const handleDownloadPrescription = () => {
    let csv = `zone_id,zone_name,area_percentage,soil_status,current_mean_ppm,prescribed_n_rate_lbs_ac,prescribed_n_rate_kg_ha,product_source\n`;
    csv += `ZONE_1,Erosion & Leached Ridge,${zone1Pct}%,Deficient,< 25 ppm,${zone1Rate},${Math.round(zone1Rate * 1.12)},${fertilizerSource.toUpperCase()}\n`;
    csv += `ZONE_2,Moderate Mid-Slope,${zone2Pct}%,Moderate,25-45 ppm,${zone2Rate},${Math.round(zone2Rate * 1.12)},${fertilizerSource.toUpperCase()}\n`;
    csv += `ZONE_3,Depression & Pooling,${zone3Pct}%,Optimal / High,> 45 ppm,${zone3Rate},${Math.round(zone3Rate * 1.12)},${fertilizerSource.toUpperCase()}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VRA_Prescription_${fieldName.replace(/\s+/g, '_')}_Week${currentWeek}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-glow-emerald">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-sans">
                Variable Rate Application (VRA) Prescription
              </h2>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                WEEK {currentWeek} MODEL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zone-based fertilizer prescription derived from simulated nutrient depletion and topography
            </p>
          </div>
        </div>

        {/* Crop Selection & Config Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Crop:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {CROP_PROFILES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Fertilizer Source:</label>
            <select
              value={fertilizerSource}
              onChange={(e) => setFertilizerSource(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="uan_32">UAN 32% Liquid N (Side-dress)</option>
              <option value="urea_46">Dry Granular Urea (46-0-0)</option>
              <option value="nh3_anhydrous">Anhydrous Ammonia (82-0-0)</option>
              <option value="dap_18_46">DAP (18-46-0 Phosphate)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">N Unit Cost ($/lb):</label>
            <input
              type="number"
              step="0.05"
              value={nitrogenCostPerLb}
              onChange={(e) => setNitrogenCostPerLb(parseFloat(e.target.value) || 0.65)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 3 Management Zones Table */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Prescription Management Zones (3-Zone VRA)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Field Average: <strong className="text-emerald-400">{vraAvgRate} lbs N/ac</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Zone 1: High Rate for Deficient Leached Ridges */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  ZONE 1 (High Rate)
                </span>
                <span className="text-xs font-mono text-slate-400">{zone1Pct}% area</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">Ridge & Leached Slope</div>
              <div className="mt-2 text-2xl font-extrabold font-mono text-red-300">
                {zone1Rate} <span className="text-xs font-normal text-slate-400">lbs N/ac</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-tight">
                Top dressing to replenish washed-out nitrate on runoff crests.
              </p>
            </div>

            {/* Zone 2: Moderate Rate */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ZONE 2 (Standard)
                </span>
                <span className="text-xs font-mono text-slate-400">{zone2Pct}% area</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">Moderate Terrain</div>
              <div className="mt-2 text-2xl font-extrabold font-mono text-amber-300">
                {zone2Rate} <span className="text-xs font-normal text-slate-400">lbs N/ac</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-tight">
                Balanced maintenance dose supporting vegetative uptake.
              </p>
            </div>

            {/* Zone 3: Low Rate for Depressions */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ZONE 3 (Reduced)
                </span>
                <span className="text-xs font-mono text-slate-400">{zone3Pct}% area</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">Depression / Pooling Basin</div>
              <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-300">
                {zone3Rate} <span className="text-xs font-normal text-slate-400">lbs N/ac</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-tight">
                Cut rate to prevent toxic nitrate pooling and ground runoff.
              </p>
            </div>
          </div>
        </div>

        {/* Economic ROI & Savings Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Projected Precision Ag Cost Efficiency</div>
              <div className="text-[11px] text-slate-400">
                Eliminates over-fertilization on deposition valleys while curing deficiencies on ridges
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold font-mono text-emerald-400">
              ~${savingsDollarsPerAc} / acre saved
            </div>
            <div className="text-[10px] text-slate-400">
              Estimated ${totalFieldSavings} total farm savings this season
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPrescription}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-glow-emerald"
          >
            <Download className="w-4 h-4" />
            <span>Export Machine-Ready Prescription (.CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
