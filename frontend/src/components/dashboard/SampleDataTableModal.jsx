import React, { useState, useMemo } from 'react';
import { X, Search, ArrowUpDown, Download, MapPin, Database, Filter } from 'lucide-react';
import { NUTRIENTS } from '../../utils/constants';

export default function SampleDataTableModal({
  isOpen,
  onClose,
  samples = [],
  fieldName = 'Cedar Creek Farm',
  onSelectSample,
}) {
  // ⚠️ Hooks MUST be declared before any early return (Rules of Hooks)
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('sample_id');
  const [sortDir, setSortDir] = useState('asc');
  const [filterNutrient, setFilterNutrient] = useState('all');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredSamples = useMemo(() => {
    let result = [...samples];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.sample_id || '').toLowerCase().includes(q) ||
          String(s.latitude ?? '').includes(q) ||
          String(s.longitude ?? '').includes(q)
      );
    }

    if (filterNutrient === 'low_n') {
      result = result.filter((s) => s.nitrogen < 35);
    } else if (filterNutrient === 'acidic_ph') {
      result = result.filter((s) => s.ph < 6.2);
    }

    result.sort((a, b) => {
      let vA = a[sortKey];
      let vB = b[sortKey];
      // Guard: treat undefined/null as '' or 0 to avoid crashes
      if (vA == null) vA = typeof vB === 'string' ? '' : 0;
      if (vB == null) vB = typeof vA === 'string' ? '' : 0;
      if (typeof vA === 'string') {
        return sortDir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return sortDir === 'asc' ? vA - vB : vB - vA;
    });

    return result;
  }, [samples, searchTerm, sortKey, sortDir, filterNutrient]);

  // Early return AFTER all hooks have been declared
  if (!isOpen) return null;

  const handleExportCsv = () => {
    let csv = 'sample_id,latitude,longitude,nitrogen_ppm,phosphorus_ppm,potassium_ppm,ph,moisture_pct,elevation_m\n';
    samples.forEach((s) => {
      csv += `${s.sample_id},${s.latitude},${s.longitude},${s.nitrogen},${s.phosphorus},${s.potassium},${s.ph},${s.moisture},${s.elevation}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Soil_Samples_${fieldName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-glow-cyan">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-sans">
                Soil Core Boring Log & Sample Points
              </h2>
              <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-400 font-semibold">
                {samples.length} SAMPLES
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Laboratory soil test readings for {fieldName}
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or coord..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={filterNutrient}
              onChange={(e) => setFilterNutrient(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Samples</option>
              <option value="low_n">Low Nitrogen (&lt; 35 ppm)</option>
              <option value="acidic_ph">Acidic Soil (pH &lt; 6.2)</option>
            </select>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 z-10">
              <tr>
                <th
                  onClick={() => handleSort('sample_id')}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Sample ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('elevation')}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Elevation</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nitrogen')}
                  className="p-3 cursor-pointer hover:text-cyan-400"
                >
                  <div className="flex items-center gap-1 text-cyan-300">
                    <span>Nitrogen (N)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('phosphorus')}
                  className="p-3 cursor-pointer hover:text-purple-400"
                >
                  <div className="flex items-center gap-1 text-purple-300">
                    <span>Phosphorus (P)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('potassium')}
                  className="p-3 cursor-pointer hover:text-pink-400"
                >
                  <div className="flex items-center gap-1 text-pink-300">
                    <span>Potassium (K)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ph')}
                  className="p-3 cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center gap-1 text-emerald-300">
                    <span>pH</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('moisture')}
                  className="p-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Moisture</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-3 text-right">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    {samples.length === 0
                      ? 'No soil samples loaded. Upload a CSV or select a preset field.'
                      : 'No samples match the current filter.'}
                  </td>
                </tr>
              ) : (
                filteredSamples.map((s) => (
                  <tr
                    key={s.sample_id}
                    className="hover:bg-slate-900/50 transition-colors group"
                  >
                    <td className="p-3 font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>{s.sample_id}</span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {s.elevation != null ? `${s.elevation} m` : '310 m'}
                    </td>
                    <td className="p-3 font-semibold text-cyan-300">
                      {s.nitrogen ?? '—'} <span className="text-[10px] text-slate-500 font-normal">ppm</span>
                    </td>
                    <td className="p-3 font-semibold text-purple-300">
                      {s.phosphorus ?? '—'} <span className="text-[10px] text-slate-500 font-normal">ppm</span>
                    </td>
                    <td className="p-3 font-semibold text-pink-300">
                      {s.potassium ?? '—'} <span className="text-[10px] text-slate-500 font-normal">ppm</span>
                    </td>
                    <td className="p-3 text-emerald-300 font-semibold">{s.ph ?? '—'}</td>
                    <td className="p-3 text-cyan-400">{s.moisture != null ? `${s.moisture}%` : '—'}</td>
                    <td className="p-3 text-right text-[11px] text-slate-400">
                      {Number(s.latitude).toFixed(4)}, {Number(s.longitude).toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-xs text-slate-400 shrink-0">
          <span>Showing {filteredSamples.length} of {samples.length} sampling stations</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
