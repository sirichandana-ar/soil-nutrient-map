import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CloudRain } from 'lucide-react';

const WEEKS = [
  { week: 0, label: 'W0 (Baseline)', event: 'Soil Sampling' },
  { week: 1, label: 'W1', event: 'Light Sowing Rain (18mm)' },
  { week: 2, label: 'W2', event: 'Heavy Storm (34mm)' },
  { week: 3, label: 'W3', event: 'Vegetative Growth (22mm)' },
  { week: 4, label: 'W4', event: 'Moderate Rain (12mm)' },
  { week: 5, label: 'W5', event: 'Mid-Season Topdress (28mm)' },
  { week: 6, label: 'W6', event: 'Heavy Runoff Downpour (45mm)' },
  { week: 7, label: 'W7', event: 'Grain Filling (15mm)' },
  { week: 8, label: 'W8', event: 'Pre-Harvest Final (8mm)' },
];

export default function TimeSlider({
  currentWeek = 0,
  onChangeWeek,
  depletionLossPct = 0,
  cumulativeRainMm = 0,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeWeek((prev) => {
          if (prev >= 8) {
            setIsPlaying(false);
            return 8;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onChangeWeek]);

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-glass border border-slate-800/80">
      <div className="flex flex-col gap-3">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-emerald hover:brightness-110 active:scale-95 transition-all"
              title={isPlaying ? 'Pause simulation playback' : 'Play temporal migration playback'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            {/* Step Back & Forward */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => onChangeWeek(Math.max(0, currentWeek - 1))}
                disabled={currentWeek === 0}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => onChangeWeek(Math.min(8, currentWeek + 1))}
                disabled={currentWeek === 8}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  onChangeWeek(0);
                }}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset to Baseline (Week 0)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Current Active Week Indicator */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-100 font-sans">
                  Week {currentWeek}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                  {WEEKS[currentWeek].event}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Temporal soil nutrient migration step
              </p>
            </div>
          </div>

          {/* Metrics summary on slider */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
              <CloudRain className="h-3.5 w-3.5" />
              <span>Rain: {cumulativeRainMm} mm</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg">
              <span>Leaching Loss: -{depletionLossPct}%</span>
            </div>
          </div>
        </div>

        {/* The Timeline Slider */}
        <div className="relative pt-2 pb-1">
          {/* Custom range input */}
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={currentWeek}
            onChange={(e) => {
              setIsPlaying(false);
              onChangeWeek(Number(e.target.value));
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />

          {/* Week Tick Marks & Labels */}
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 mt-2 px-1">
            {WEEKS.map((w) => {
              const isActive = w.week === currentWeek;
              const isPast = w.week <= currentWeek;
              return (
                <button
                  key={w.week}
                  onClick={() => {
                    setIsPlaying(false);
                    onChangeWeek(w.week);
                  }}
                  className={`flex flex-col items-center transition-all ${
                    isActive
                      ? 'text-emerald-400 font-bold scale-110'
                      : isPast
                      ? 'text-slate-300 hover:text-slate-100'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mb-1 transition-colors ${
                    isActive
                      ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
                      : isPast
                      ? 'bg-slate-600'
                      : 'bg-slate-800'
                  }`} />
                  <span>W{w.week}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
