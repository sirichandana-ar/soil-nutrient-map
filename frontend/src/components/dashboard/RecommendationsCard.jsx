import React from 'react';
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RecommendationsCard({ recommendations = [], summary = '' }) {
  return (
    <div className="glass-panel rounded-2xl p-4 shadow-glass border border-slate-800/80">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Agronomic Recommendations & Interventions
          </h3>
          <p className="text-xs text-slate-400">
            Precision fertilizer & conservation advice derived from migration physics
          </p>
        </div>
      </div>

      {summary && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 mb-3 text-xs text-slate-300 leading-relaxed">
          {summary}
        </div>
      )}

      <div className="space-y-2">
        {recommendations.length > 0 ? (
          recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 p-2.5 text-xs text-slate-300"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            Loading tailored agronomic prescriptions...
          </div>
        )}
      </div>
    </div>
  );
}
