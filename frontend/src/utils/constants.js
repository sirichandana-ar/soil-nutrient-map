export const NUTRIENTS = {
  nitrogen: {
    id: 'nitrogen',
    name: 'Nitrogen (N)',
    symbol: 'N',
    unit: 'mg/kg',
    color: '#38bdf8', // Cyan/sky
    bgSoft: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.4)',
    optimalRange: '40 - 65 mg/kg',
    deficientBelow: 25,
    optimalAbove: 40,
    excessAbove: 75,
    role: 'Essential for vegetative canopy growth, chlorophyll synthesis, and rapid foliage development.',
    mobility: 'High mobility in soil solution; subject to heavy leaching under rainfall.'
  },
  phosphorus: {
    id: 'phosphorus',
    name: 'Phosphorus (P)',
    symbol: 'P',
    unit: 'mg/kg',
    color: '#a855f7', // Purple/violet
    bgSoft: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.4)',
    optimalRange: '25 - 45 mg/kg',
    deficientBelow: 15,
    optimalAbove: 25,
    excessAbove: 55,
    role: 'Drives root architecture, seedling establishment, and flowering/seed formation.',
    mobility: 'Low solubility; binds tightly to minerals; primary loss occurs via soil surface runoff erosion.'
  },
  potassium: {
    id: 'potassium',
    name: 'Potassium (K)',
    symbol: 'K',
    unit: 'mg/kg',
    color: '#ec4899', // Pink
    bgSoft: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.4)',
    optimalRange: '180 - 260 mg/kg',
    deficientBelow: 120,
    optimalAbove: 180,
    excessAbove: 320,
    role: 'Regulates plant stomatal conductance, water balance, and stress disease resistance.',
    mobility: 'Moderate mobility; cationic exchange retention in clay; leaches easily in sandy profiles.'
  },
  ph: {
    id: 'ph',
    name: 'Soil pH',
    symbol: 'pH',
    unit: 'pH',
    color: '#10b981', // Emerald
    bgSoft: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    optimalRange: '6.2 - 7.2',
    deficientBelow: 5.8,
    optimalAbove: 6.2,
    excessAbove: 7.8,
    role: 'Governs biological microbial activity and soil mineral nutrient bioavailability.',
    mobility: 'Stable buffer capacity; acidified by continuous synthetic nitrogen fertilization.'
  },
  moisture: {
    id: 'moisture',
    name: 'Soil Moisture',
    symbol: 'VWC',
    unit: '%',
    color: '#06b6d4', // Cyan
    bgSoft: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.4)',
    optimalRange: '22% - 32%',
    deficientBelow: 15,
    optimalAbove: 22,
    excessAbove: 38,
    role: 'Water medium required for root mass nutrient uptake and soil microbial life.',
    mobility: 'Driven by precipitation events, solar evapotranspiration, and topographical drainage.'
  }
};

export const SOIL_TYPES = [
  { id: 'sandy', name: 'Sandy Soil', desc: 'High drainage & permeability. Severe leaching risk for Nitrogen.' },
  { id: 'loam', name: 'Loam Soil', desc: 'Optimal balanced retention, aeration, and drainage profile.' },
  { id: 'silt_loam', name: 'Silt Loam', desc: 'High moisture retention, moderate erosion susceptibility on slopes.' },
  { id: 'clay', name: 'Clay Soil', desc: 'Dense structure, high mineral retention, high surface runoff hazard.' }
];

export const RAINFALL_SCENARIOS = [
  { id: 'dry', name: 'Drought / Dry', icon: 'Sun', desc: 'Low precipitation (0-8mm/wk). Minimal leaching.' },
  { id: 'normal', name: 'Seasonal Normal', icon: 'CloudRain', desc: 'Moderate rainfall (15-35mm/wk). Typical agronomic baseline.' },
  { id: 'heavy', name: 'Storm Spikes', icon: 'CloudLightning', desc: 'Intense rain storms (30-80mm/wk). Active topographical runoff.' },
  { id: 'monsoon', name: 'Monsoon Flood', icon: 'Waves', desc: 'Saturated profile (60-140mm/wk). Critical nitrate wash-out.' }
];
