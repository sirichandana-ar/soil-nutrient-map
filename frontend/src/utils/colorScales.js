/**
 * Color scale utilities for precision agriculture heatmaps
 */

// Premium agronomic gradient:
// Red/Amber (Deficient) -> Yellow (Moderate) -> Emerald Green (Optimal) -> Deep Teal/Blue (Rich/High)
const AGRO_STOPS = [
  { t: 0.00, r: 239, g: 68, b: 68 },   // #ef4444 Deficient Red
  { t: 0.25, r: 249, g: 115, b: 22 },  // #f97316 Amber/Orange
  { t: 0.50, r: 234, g: 179, b: 8 },   // #eab308 Yellow
  { t: 0.75, r: 34, g: 197, b: 94 },   // #22c55e Green Optimal
  { t: 1.00, r: 6, g: 182, b: 212 }    // #06b6d4 Rich Teal / Blue
];

export function getHeatmapColor(normalized) {
  const t = Math.max(0, Math.min(1, normalized));
  
  // Find adjacent stops
  let i = 0;
  while (i < AGRO_STOPS.length - 1 && AGRO_STOPS[i + 1].t < t) {
    i++;
  }
  
  const c1 = AGRO_STOPS[i];
  const c2 = AGRO_STOPS[Math.min(i + 1, AGRO_STOPS.length - 1)];
  
  const span = c2.t - c1.t || 1;
  const localT = (t - c1.t) / span;
  
  const r = Math.round(c1.r + (c2.r - c1.r) * localT);
  const g = Math.round(c1.g + (c2.g - c1.g) * localT);
  const b = Math.round(c1.b + (c2.b - c1.b) * localT);
  
  return `rgb(${r}, ${g}, ${b})`;
}

export function getStatusBadge(status) {
  switch (status) {
    case 'deficient':
      return {
        label: 'Deficient',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/15',
        borderColor: 'border-red-500/30'
      };
    case 'moderate':
      return {
        label: 'Moderate',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/15',
        borderColor: 'border-amber-500/30'
      };
    case 'optimal':
      return {
        label: 'Optimal',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
        borderColor: 'border-emerald-500/30'
      };
    case 'excess':
      return {
        label: 'High / Surplus',
        textColor: 'text-cyan-400',
        bgColor: 'bg-cyan-500/15',
        borderColor: 'border-cyan-500/30'
      };
    default:
      return {
        label: 'Normal',
        textColor: 'text-slate-400',
        bgColor: 'bg-slate-500/15',
        borderColor: 'border-slate-500/30'
      };
  }
}
