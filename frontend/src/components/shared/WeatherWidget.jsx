import React from 'react';
import { CloudRain, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react';

export default function WeatherWidget({ weatherData }) {
  if (!weatherData) return null;

  const totalRain = weatherData.total_expected_rainfall_mm ?? 45.0;
  const risk = weatherData.precipitation_risk ?? 'Moderate Moisture';
  const moistureIdx = weatherData.current_moisture_index ?? 30.0;
  const forecast = weatherData.forecast_days?.slice(0, 5) || [];

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-glass border border-slate-800/80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CloudRain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-sans">
              Local Weather & Leaching Potential
            </h3>
            <p className="text-xs text-slate-400">
              {weatherData.location || 'Cedar Creek Basin'}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
            totalRain > 50
              ? 'bg-red-950/40 border-red-500/30 text-red-300'
              : totalRain > 20
              ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {risk}
        </span>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs font-mono">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2">
          <span className="text-slate-400 text-[10px] block">14-Day Rain</span>
          <span className="text-sm font-bold text-cyan-400">{totalRain} mm</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2">
          <span className="text-slate-400 text-[10px] block">Moisture Index</span>
          <span className="text-sm font-bold text-emerald-400">{moistureIdx}%</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2">
          <span className="text-slate-400 text-[10px] block">Soil Infiltration</span>
          <span className="text-sm font-bold text-amber-400">Normal</span>
        </div>
      </div>

      {/* 5-Day Forecast Strips */}
      <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800/80">
        {forecast.map((f, i) => (
          <div
            key={i}
            className="flex-1 text-center bg-slate-900/30 rounded-lg py-1.5 px-1 border border-slate-800/50"
          >
            <div className="text-[10px] text-slate-400">Day {f.day}</div>
            <div className="text-xs font-bold text-slate-200">{f.temperature_c}°C</div>
            <div className="text-[10px] font-mono text-cyan-400">{f.rainfall_mm}mm</div>
          </div>
        ))}
      </div>
    </div>
  );
}
