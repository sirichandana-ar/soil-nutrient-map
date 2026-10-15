// High-precision Client-Side Spatial Interpolation & Migration Physics Engine
// Provides full standalone functionality when FastAPI backend is starting up or in demo mode.

export const PRESET_DATASETS = {
  cedar_creek: {
    field_name: 'Cedar Creek Farm (Plot 4)',
    crop: 'Corn (Maize)',
    area_acres: 52.4,
    samples: [
      { sample_id: 'S01', latitude: 41.8781, longitude: -93.0977, nitrogen: 42.5, phosphorus: 28.4, potassium: 185.0, ph: 6.5, moisture: 24.2, elevation: 312.5 },
      { sample_id: 'S02', latitude: 41.8795, longitude: -93.0955, nitrogen: 38.2, phosphorus: 22.1, potassium: 162.0, ph: 6.2, moisture: 22.8, elevation: 314.1 },
      { sample_id: 'S03', latitude: 41.8810, longitude: -93.0930, nitrogen: 29.4, phosphorus: 19.5, potassium: 145.0, ph: 5.9, moisture: 20.5, elevation: 316.8 },
      { sample_id: 'S04', latitude: 41.8825, longitude: -93.0905, nitrogen: 22.1, phosphorus: 15.2, potassium: 130.0, ph: 5.8, moisture: 18.9, elevation: 319.2 },
      { sample_id: 'S05', latitude: 41.8760, longitude: -93.0985, nitrogen: 55.0, phosphorus: 34.0, potassium: 210.0, ph: 6.8, moisture: 27.1, elevation: 308.4 },
      { sample_id: 'S06', latitude: 41.8775, longitude: -93.0950, nitrogen: 48.7, phosphorus: 31.2, potassium: 198.0, ph: 6.6, moisture: 25.4, elevation: 310.2 },
      { sample_id: 'S07', latitude: 41.8790, longitude: -93.0920, nitrogen: 35.6, phosphorus: 24.8, potassium: 170.0, ph: 6.3, moisture: 23.1, elevation: 313.7 },
      { sample_id: 'S08', latitude: 41.8805, longitude: -93.0890, nitrogen: 26.3, phosphorus: 18.4, potassium: 142.0, ph: 6.0, moisture: 19.8, elevation: 317.5 },
      { sample_id: 'S09', latitude: 41.8740, longitude: -93.0990, nitrogen: 62.3, phosphorus: 38.5, potassium: 235.0, ph: 7.1, moisture: 29.3, elevation: 305.1 },
      { sample_id: 'S10', latitude: 41.8755, longitude: -93.0960, nitrogen: 53.8, phosphorus: 33.1, potassium: 208.0, ph: 6.7, moisture: 26.7, elevation: 307.8 },
      { sample_id: 'S11', latitude: 41.8770, longitude: -93.0930, nitrogen: 41.2, phosphorus: 27.9, potassium: 182.0, ph: 6.4, moisture: 24.0, elevation: 311.6 },
      { sample_id: 'S12', latitude: 41.8785, longitude: -93.0900, nitrogen: 31.5, phosphorus: 21.6, potassium: 155.0, ph: 6.1, moisture: 21.2, elevation: 315.4 },
      { sample_id: 'S13', latitude: 41.8720, longitude: -93.0995, nitrogen: 68.0, phosphorus: 42.0, potassium: 250.0, ph: 7.2, moisture: 31.0, elevation: 302.5 },
      { sample_id: 'S14', latitude: 41.8735, longitude: -93.0965, nitrogen: 58.4, phosphorus: 36.2, potassium: 220.0, ph: 6.9, moisture: 28.2, elevation: 306.0 },
      { sample_id: 'S15', latitude: 41.8750, longitude: -93.0935, nitrogen: 46.9, phosphorus: 29.5, potassium: 190.0, ph: 6.5, moisture: 25.1, elevation: 309.8 },
      { sample_id: 'S16', latitude: 41.8765, longitude: -93.0905, nitrogen: 36.8, phosphorus: 23.4, potassium: 166.0, ph: 6.2, moisture: 22.4, elevation: 313.9 },
    ],
  },
  napa_valley: {
    field_name: 'Napa Terraced Vineyards (Hillside)',
    crop: 'Cabernet Sauvignon',
    area_acres: 38.0,
    samples: [
      { sample_id: 'NV1', latitude: 38.498, longitude: -122.450, nitrogen: 28.0, phosphorus: 18.0, potassium: 140.0, ph: 6.2, moisture: 16.0, elevation: 420.0 },
      { sample_id: 'NV2', latitude: 38.496, longitude: -122.448, nitrogen: 35.0, phosphorus: 22.0, potassium: 165.0, ph: 6.4, moisture: 18.5, elevation: 395.0 },
      { sample_id: 'NV3', latitude: 38.494, longitude: -122.446, nitrogen: 48.0, phosphorus: 29.0, potassium: 195.0, ph: 6.7, moisture: 22.0, elevation: 365.0 },
      { sample_id: 'NV4', latitude: 38.492, longitude: -122.444, nitrogen: 64.0, phosphorus: 38.0, potassium: 240.0, ph: 7.0, moisture: 26.5, elevation: 330.0 },
      { sample_id: 'NV5', latitude: 38.497, longitude: -122.444, nitrogen: 32.0, phosphorus: 20.0, potassium: 150.0, ph: 6.3, moisture: 17.0, elevation: 405.0 },
      { sample_id: 'NV6', latitude: 38.495, longitude: -122.442, nitrogen: 42.0, phosphorus: 26.0, potassium: 180.0, ph: 6.5, moisture: 20.0, elevation: 375.0 },
      { sample_id: 'NV7', latitude: 38.493, longitude: -122.440, nitrogen: 58.0, phosphorus: 35.0, potassium: 225.0, ph: 6.8, moisture: 25.0, elevation: 340.0 },
    ],
  },
  punjab_alluvial: {
    field_name: 'Punjab Alluvial Wheat Basin',
    crop: 'Wheat (Sharbati)',
    area_acres: 65.2,
    samples: [
      { sample_id: 'PB1', latitude: 30.900, longitude: 75.850, nitrogen: 70.0, phosphorus: 40.0, potassium: 280.0, ph: 7.4, moisture: 32.0, elevation: 245.0 },
      { sample_id: 'PB2', latitude: 30.903, longitude: 75.854, nitrogen: 65.0, phosphorus: 36.0, potassium: 260.0, ph: 7.3, moisture: 29.0, elevation: 246.0 },
      { sample_id: 'PB3', latitude: 30.906, longitude: 75.858, nitrogen: 58.0, phosphorus: 32.0, potassium: 240.0, ph: 7.2, moisture: 27.0, elevation: 247.5 },
      { sample_id: 'PB4', latitude: 30.898, longitude: 75.853, nitrogen: 75.0, phosphorus: 44.0, potassium: 300.0, ph: 7.6, moisture: 34.0, elevation: 244.0 },
      { sample_id: 'PB5', latitude: 30.901, longitude: 75.857, nitrogen: 62.0, phosphorus: 35.0, potassium: 255.0, ph: 7.3, moisture: 28.5, elevation: 246.0 },
      { sample_id: 'PB6', latitude: 30.904, longitude: 75.861, nitrogen: 54.0, phosphorus: 29.0, potassium: 225.0, ph: 7.1, moisture: 26.0, elevation: 248.0 },
    ],
  },
};

const RAINFALL_SCENARIOS = {
  dry: [0.0, 5.0, 8.0, 4.0, 2.0, 6.0, 3.0, 1.0, 0.0],
  normal: [0.0, 18.5, 34.0, 22.0, 12.5, 28.0, 45.0, 15.0, 8.0],
  heavy: [0.0, 32.0, 65.0, 48.0, 35.0, 58.0, 82.0, 40.0, 25.0],
  monsoon: [0.0, 55.0, 95.0, 110.0, 75.0, 125.0, 140.0, 80.0, 45.0],
};

const SOIL_TEXTURE_FACTORS = {
  sandy: { leach_n: 0.0065, leach_k: 0.0030, leach_p: 0.0008, runoff_coeff: 0.15 },
  loam: { leach_n: 0.0040, leach_k: 0.0018, leach_p: 0.0005, runoff_coeff: 0.35 },
  silt_loam: { leach_n: 0.0035, leach_k: 0.0015, leach_p: 0.0004, runoff_coeff: 0.40 },
  clay: { leach_n: 0.0022, leach_k: 0.0010, leach_p: 0.0003, runoff_coeff: 0.60 },
};

const NUTRIENT_THRESHOLDS = {
  nitrogen: { deficient: 25.0, moderate: 40.0, optimal: 65.0, unit: 'mg/kg (ppm)' },
  phosphorus: { deficient: 15.0, moderate: 25.0, optimal: 45.0, unit: 'mg/kg (ppm)' },
  potassium: { deficient: 120.0, moderate: 180.0, optimal: 260.0, unit: 'mg/kg (ppm)' },
  ph: { deficient: 5.8, moderate: 6.3, optimal: 7.3, unit: 'pH' },
  moisture: { deficient: 15.0, moderate: 22.0, optimal: 32.0, unit: '% VWC' },
};

function classifyStatus(value, nutrient) {
  const th = NUTRIENT_THRESHOLDS[nutrient] || NUTRIENT_THRESHOLDS.nitrogen;
  if (value < th.deficient) return 'deficient';
  if (value < th.moderate) return 'moderate';
  if (value <= th.optimal) return 'optimal';
  return 'excess';
}

export function computeDatasetStats(samples) {
  const lats = samples.map((s) => s.latitude);
  const lngs = samples.map((s) => s.longitude);
  const nVals = samples.map((s) => s.nitrogen);
  const pVals = samples.map((s) => s.phosphorus);
  const kVals = samples.map((s) => s.potassium);
  const phVals = samples.map((s) => s.ph);
  const moistVals = samples.map((s) => s.moisture);

  const avg = (arr) => Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  const min = (arr) => Number(Math.min(...arr).toFixed(2));
  const max = (arr) => Number(Math.max(...arr).toFixed(2));

  return {
    sample_count: samples.length,
    lat_min: Math.min(...lats),
    lat_max: Math.max(...lats),
    lng_min: Math.min(...lngs),
    lng_max: Math.max(...lngs),
    center_lat: avg(lats),
    center_lng: avg(lngs),
    nitrogen_mean: avg(nVals),
    nitrogen_min: min(nVals),
    nitrogen_max: max(nVals),
    phosphorus_mean: avg(pVals),
    phosphorus_min: min(pVals),
    phosphorus_max: max(pVals),
    potassium_mean: avg(kVals),
    potassium_min: min(kVals),
    potassium_max: max(kVals),
    ph_mean: avg(phVals),
    moisture_mean: avg(moistVals),
  };
}

export function generateClientHeatmap({
  samples,
  fieldName = 'Cedar Creek Farm (Plot 4)',
  nutrient = 'nitrogen',
  week = 0,
  soilType = 'loam',
  rainfallScenario = 'normal',
  slopeFactor = 1.0,
  cropUptake = 'medium',
  resolution = 32,
}) {
  const lats = samples.map((s) => s.latitude);
  const lngs = samples.map((s) => s.longitude);
  const elevs = samples.map((s) => s.elevation || 300);

  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);

  const latSpan = Math.max(latMax - latMin, 0.001);
  const lngSpan = Math.max(lngMax - lngMin, 0.001);
  const margin = 0.08;

  const bounds = {
    lat_min: latMin - latSpan * margin,
    lat_max: latMax + latSpan * margin,
    lng_min: lngMin - lngSpan * margin,
    lng_max: lngMax + lngSpan * margin,
  };

  const rows = resolution;
  const cols = Math.max(16, Math.round(resolution * (lngSpan / latSpan)));

  const dLat = (bounds.lat_max - bounds.lat_min) / rows;
  const dLng = (bounds.lng_max - bounds.lng_min) / cols;

  const rainSequence = RAINFALL_SCENARIOS[rainfallScenario] || RAINFALL_SCENARIOS.normal;
  const soilProps = SOIL_TEXTURE_FACTORS[soilType] || SOIL_TEXTURE_FACTORS.loam;

  let cumulativeRain = 0;
  for (let w = 0; w <= week; w++) cumulativeRain += rainSequence[w] || 0;

  let leachRate = soilProps.leach_n;
  let mobility = 1.0;
  if (nutrient === 'phosphorus') {
    leachRate = soilProps.leach_p;
    mobility = 0.25;
  } else if (nutrient === 'potassium') {
    leachRate = soilProps.leach_k;
    mobility = 0.55;
  } else if (nutrient === 'moisture') {
    leachRate = 0.005;
    mobility = 0.8;
  } else if (nutrient === 'ph') {
    leachRate = 0.0005;
    mobility = 0.1;
  }

  const uptakeCoeff = cropUptake === 'high' ? 0.05 : cropUptake === 'medium' ? 0.03 : cropUptake === 'low' ? 0.015 : 0;
  const uptakeLoss = Math.min(0.35, week * uptakeCoeff);

  const totalLeach = Math.min(0.55, cumulativeRain * leachRate);
  const retentionFactor = Math.max(0.2, 1.0 - totalLeach - uptakeLoss);

  const meanLat = (bounds.lat_min + bounds.lat_max) / 2;
  const cosLat = Math.cos((meanLat * Math.PI) / 180);

  const cells = [];
  let sumVal = 0;
  let minVal = Infinity;
  let maxVal = -Infinity;
  let deficientCount = 0;

  for (let r = 0; r < rows; r++) {
    const cellLat = bounds.lat_min + (r + 0.5) * dLat;
    for (let c = 0; c < cols; c++) {
      const cellLng = bounds.lng_min + (c + 0.5) * dLng;

      let weightSum = 0;
      let weightedNutrient = 0;
      let weightedElev = 0;

      for (let s of samples) {
        const dY = (s.latitude - cellLat);
        const dX = (s.longitude - cellLng) * cosLat;
        const dist = Math.hypot(dX, dY);

        if (dist < 1e-7) {
          weightedNutrient = s[nutrient] ?? s.nitrogen;
          weightedElev = s.elevation || 310;
          weightSum = 1;
          break;
        }

        const w = 1 / (dist * dist);
        weightSum += w;
        weightedNutrient += (s[nutrient] ?? s.nitrogen) * w;
        weightedElev += (s.elevation || 310) * w;
      }

      let baseVal = weightSum > 0 ? weightedNutrient / weightSum : 40;
      const elev = weightSum > 0 ? weightedElev / weightSum : 310;

      const elevNormalized = (elev - Math.min(...elevs)) / (Math.max(...elevs) - Math.min(...elevs) || 1);
      const slopeRunoffShift = week > 0 ? (0.5 - elevNormalized) * 0.18 * slopeFactor * mobility * (cumulativeRain / 100) : 0;

      let finalVal = Math.max(0.1, baseVal * retentionFactor * (1.0 + slopeRunoffShift));
      if (nutrient === 'ph') {
        finalVal = Math.max(4.5, Math.min(8.5, baseVal - (cumulativeRain * 0.003)));
      } else if (nutrient === 'moisture') {
        finalVal = Math.max(10, Math.min(48, baseVal + (rainSequence[week] || 0) * 0.4 - week * 1.1));
      }

      finalVal = Number(finalVal.toFixed(2));
      sumVal += finalVal;
      if (finalVal < minVal) minVal = finalVal;
      if (finalVal > maxVal) maxVal = finalVal;

      const status = classifyStatus(finalVal, nutrient);
      if (status === 'deficient') deficientCount++;

      cells.push({
        lat: Number(cellLat.toFixed(6)),
        lng: Number(cellLng.toFixed(6)),
        value: finalVal,
        elevation: Number(elev.toFixed(1)),
        status,
        normalized: 0,
      });
    }
  }

  const valRange = Math.max(maxVal - minVal, 1e-6);
  cells.forEach((cell) => {
    cell.normalized = Number(Math.max(0, Math.min(1, (cell.value - minVal) / valRange)).toFixed(4));
  });

  const meanVal = Number((sumVal / cells.length).toFixed(2));
  const depletionLossPct = Number(Math.max(0, (1.0 - retentionFactor) * 100).toFixed(1));
  const critPct = Number(((deficientCount / cells.length) * 100).toFixed(1));

  return {
    field_name: fieldName,
    nutrient,
    week,
    unit: NUTRIENT_THRESHOLDS[nutrient]?.unit || 'mg/kg',
    min_value: minVal,
    max_value: maxVal,
    mean_value: meanVal,
    resolution_x: cols,
    resolution_y: rows,
    bounds,
    cells,
    depletion_loss_pct: depletionLossPct,
    migration_direction_deg: 138.5,
    critical_deficiency_area_pct: critPct,
  };
}

export function generateClientTemporalAnalytics({
  samples,
  fieldName = 'Cedar Creek Farm (Plot 4)',
  soilType = 'loam',
  rainfallScenario = 'normal',
  slopeFactor = 1.0,
}) {
  const rainSeq = RAINFALL_SCENARIOS[rainfallScenario] || RAINFALL_SCENARIOS.normal;
  const soilProps = SOIL_TEXTURE_FACTORS[soilType] || SOIL_TEXTURE_FACTORS.loam;

  const baseStats = computeDatasetStats(samples);
  const baseN = baseStats.nitrogen_mean;
  const baseP = baseStats.phosphorus_mean;
  const baseK = baseStats.potassium_mean;
  const baseM = baseStats.moisture_mean;

  let cumRain = 0;
  const weekly_metrics = [];

  for (let w = 0; w <= 8; w++) {
    const rain = rainSeq[w];
    cumRain += rain;

    const nRet = Math.max(25, 100 - cumRain * soilProps.leach_n * 100 - w * 2.8);
    const pRet = Math.max(60, 100 - cumRain * soilProps.leach_p * 100 - w * 1.1);
    const kRet = Math.max(45, 100 - cumRain * soilProps.leach_k * 100 - w * 2.0);

    const currN = Number(((baseN * nRet) / 100).toFixed(2));
    const currP = Number(((baseP * pRet) / 100).toFixed(2));
    const currK = Number(((baseK * kRet) / 100).toFixed(2));
    const currM = Number(Math.max(12, Math.min(45, baseM + rain * 0.35 - w * 1.2)).toFixed(1));

    const highLeachRisk = rain > 15 ? Math.min(95, (rain / 45) * 35 + w * 4.2) : w * 3;

    weekly_metrics.push({
      week: w,
      rainfall_mm: rain,
      cumulative_rainfall_mm: Number(cumRain.toFixed(1)),
      mean_nitrogen: currN,
      mean_phosphorus: currP,
      mean_potassium: currK,
      mean_moisture: currM,
      nitrogen_retention_pct: Number(nRet.toFixed(1)),
      phosphorus_retention_pct: Number(pRet.toFixed(1)),
      potassium_retention_pct: Number(kRet.toFixed(1)),
      high_leaching_risk_pct: Number(highLeachRisk.toFixed(1)),
    });
  }

  const finalNRet = weekly_metrics[8].nitrogen_retention_pct;
  const recs = [];
  if (finalNRet < 60) {
    recs.push('Severe Nitrogen leaching observed in weeks 4-7. Prescribe split nitrogen application (fertigation) rather than single basal dose.');
  } else {
    recs.push('Nitrogen retention is satisfactory. Maintain standard top-dressing schedule at Week 5.');
  }

  if (soilType === 'sandy') {
    recs.push('Sandy soil texture shows high permeability: incorporate organic biochar or cover crops to improve Cation Exchange Capacity (CEC).');
  } else if (soilType === 'clay') {
    recs.push('Clay soil exhibits elevated surface runoff risk on steep terrain: install contour buffer strips or grass waterways to trap phosphorus.');
  } else {
    recs.push('Loam soil shows balanced capillary retention: implement variable-rate side dressing to target high-slope zones.');
  }

  if (['heavy', 'monsoon'].includes(rainfallScenario)) {
    recs.push('High precipitation events predicted: consider nitrification inhibitors (DCD or nitrapyrin) to retard nitrate downward leaching.');
  }

  recs.push('Recommend soil re-sampling at Week 6 on southern slope depressions where nutrient pooling was observed.');

  const summary = `Over the 8-week monitoring window, overall field Nitrogen retention ended at ${finalNRet}%. Phosphorus retained at ${weekly_metrics[8].phosphorus_retention_pct}%, and Potassium retained at ${weekly_metrics[8].potassium_retention_pct}%. Topographical runoff migrated soluble nitrate along ${weekly_metrics[3].high_leaching_risk_pct}% of steep slope gradients.`;

  return {
    field_name: fieldName,
    soil_type: soilType,
    weekly_metrics,
    overall_summary: summary,
    recommendations: recs,
  };
}

export function getClientWeatherForecast() {
  return {
    location: 'Cedar Creek Basin (Ames, IA)',
    current_temp_c: 21.4,
    current_moisture_index: 34.0,
    precipitation_risk: 'Moderate Rain Expected',
    total_expected_rainfall_mm: 52.5,
    forecast_days: [
      { day: 1, temperature_c: 22.0, rainfall_mm: 4.5, conditions: 'Scattered Showers' },
      { day: 2, temperature_c: 19.5, rainfall_mm: 18.0, conditions: 'Thunderstorm' },
      { day: 3, temperature_c: 18.0, rainfall_mm: 22.5, conditions: 'Heavy Rain' },
      { day: 4, temperature_c: 23.5, rainfall_mm: 5.0, conditions: 'Light Rain' },
      { day: 5, temperature_c: 24.0, rainfall_mm: 2.5, conditions: 'Partly Cloudy' },
    ],
  };
}
