import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function FileUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}) {
  // ⚠️ Hooks MUST be declared before any early return (Rules of Hooks)
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid CSV file (.csv).');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
  };

  const handleClose = () => {
    // Reset local state so the modal is fresh on next open
    setSelectedFile(null);
    setErrorMsg('');
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await api.uploadCsv(selectedFile);
      onUploadSuccess(res);
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload CSV.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadPreset = async (presetId) => {
    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await api.loadPreset(presetId);
      onUploadSuccess(res);
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load preset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'sample_id,latitude,longitude,nitrogen,phosphorus,potassium,ph,moisture,elevation\n' +
      'S01,41.8781,-93.0977,45.2,28.4,185.0,6.5,24.2,312.5\n' +
      'S02,41.8795,-93.0955,38.2,22.1,162.0,6.2,22.8,314.1\n' +
      'S03,41.8810,-93.0930,29.4,19.5,145.0,5.9,20.5,316.8\n' +
      'S04,41.8760,-93.0985,55.0,34.0,210.0,6.8,27.1,308.4\n' +
      'S05,41.8775,-93.0950,48.7,31.2,198.0,6.6,25.4,310.2\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'soil_samples_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-sans">Upload Soil Test Data</h2>
            <p className="text-xs text-slate-400">
              Import georeferenced laboratory soil samples (CSV format)
            </p>
          </div>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01]'
              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-300 mb-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-slate-200">
            {selectedFile ? selectedFile.name : 'Click to browse or drag and drop your soil CSV'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Columns: <span className="font-mono text-emerald-300">latitude, longitude, nitrogen, phosphorus, potassium, elevation</span>
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-800/40 p-2.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions for Selected File */}
        {selectedFile && (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setSelectedFile(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-glow-emerald disabled:opacity-50"
            >
              {isUploading ? 'Processing...' : 'Process & Generate Map'}
            </button>
          </div>
        )}

        {/* Built-in Farm Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Or load a demo agricultural field:
            </span>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleLoadPreset('cedar_creek')}
              disabled={isUploading}
              className="rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-slate-200">Cedar Creek</div>
              <div className="text-[10px] text-slate-400">Iowa Corn (50 ac)</div>
            </button>

            <button
              onClick={() => handleLoadPreset('napa_valley')}
              disabled={isUploading}
              className="rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-slate-200">Napa Vineyard</div>
              <div className="text-[10px] text-slate-400">Hillside Slope</div>
            </button>

            <button
              onClick={() => handleLoadPreset('punjab_alluvial')}
              disabled={isUploading}
              className="rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-slate-200">Punjab Basin</div>
              <div className="text-[10px] text-slate-400">Alluvial Loam</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
