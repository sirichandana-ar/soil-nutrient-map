import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export default function DepletionChart({
  analyticsData,
  currentWeek = 0,
}) {
  const metrics = analyticsData?.weekly_metrics || [];

  const chartData = metrics.map((m) => ({
    week: `W${m.week}`,
    weekNum: m.week,
    Nitrogen: m.nitrogen_retention_pct,
    Phosphorus: m.phosphorus_retention_pct,
    Potassium: m.potassium_retention_pct,
    Rainfall: m.rainfall_mm,
  }));

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-slate-700 shadow-glass text-xs font-mono">
          <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex justify-between">
            <span>{label}</span>
            <span className="text-cyan-400">Rain: {payload.find(p => p.dataKey === 'Rainfall')?.value} mm</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4 text-cyan-300">
              <span>Nitrogen Retention:</span>
              <span className="font-bold">{payload.find(p => p.dataKey === 'Nitrogen')?.value}%</span>
            </div>
            <div className="flex justify-between gap-4 text-purple-300">
              <span>Phosphorus Retention:</span>
              <span className="font-bold">{payload.find(p => p.dataKey === 'Phosphorus')?.value}%</span>
            </div>
            <div className="flex justify-between gap-4 text-pink-300">
              <span>Potassium Retention:</span>
              <span className="font-bold">{payload.find(p => p.dataKey === 'Potassium')?.value}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-glass border border-slate-800/80">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Nutrient Leaching & Retention Trajectory
          </h3>
          <p className="text-xs text-slate-400">
            8-Week simulation under precipitation events and slope runoff
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2.5 py-1 rounded-lg">
          Active: Week {currentWeek}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="week" stroke="#64748b" tick={{ fontSize: 11 }} />
            
            {/* Left Axis: Nutrient Retention % */}
            <YAxis
              yAxisId="left"
              domain={[30, 105]}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
            />

            {/* Right Axis: Rainfall mm */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 60]}
              stroke="#38bdf8"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}mm`}
            />

            <Tooltip content={customTooltip} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />

            {/* Rainfall Precipitation Bar */}
            <Bar
              yAxisId="right"
              dataKey="Rainfall"
              fill="#0284c7"
              opacity={0.35}
              radius={[4, 4, 0, 0]}
              name="Rainfall (mm)"
            />

            {/* Retention Curves */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Nitrogen"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#38bdf8' }}
              activeDot={{ r: 6 }}
              name="Nitrogen Retention %"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Phosphorus"
              stroke="#c084fc"
              strokeWidth={2}
              dot={{ r: 3, fill: '#c084fc' }}
              name="Phosphorus Retention %"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Potassium"
              stroke="#f472b6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f472b6' }}
              name="Potassium Retention %"
            />

            {/* Vertical Marker for Current Week */}
            <ReferenceLine
              x={`W${currentWeek}`}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              yAxisId="left"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
