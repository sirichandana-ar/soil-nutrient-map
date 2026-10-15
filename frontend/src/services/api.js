import {
  PRESET_DATASETS,
  computeDatasetStats,
  generateClientHeatmap,
  generateClientTemporalAnalytics,
  getClientWeatherForecast,
} from './clientSimulation';

const API_BASE_URL = 'http://localhost:8001/api/v1';

// In-memory fallback state if backend is offline or starting up
let clientState = {
  activePresetId: 'cedar_creek',
  fieldName: PRESET_DATASETS.cedar_creek.field_name,
  samples: PRESET_DATASETS.cedar_creek.samples,
};

async function request(endpoint, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
      },
    });

    clearTimeout(id);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const api = {
  // Current active dataset
  async getCurrentDataset() {
    try {
      const data = await request('/upload/current');
      clientState.samples = data.samples;
      clientState.fieldName = data.message?.replace('Current active field: ', '') || clientState.fieldName;
      return { ...data, isBackend: true };
    } catch (err) {
      // Standalone client fallback
      const stats = computeDatasetStats(clientState.samples);
      return {
        success: true,
        message: `Active field: ${clientState.fieldName} (Client Engine)`,
        field_name: clientState.fieldName,
        samples: clientState.samples,
        stats,
        isBackend: false,
      };
    }
  },

  // Upload custom CSV file
  async uploadCsv(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await request('/upload/csv', {
        method: 'POST',
        body: formData,
      }, 8000);
      clientState.samples = res.samples;
      clientState.fieldName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      return { ...res, isBackend: true };
    } catch (err) {
      // Client-side CSV parsing fallback
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      // Need header + at least 3 data rows for IDW spatial interpolation
      if (lines.length < 4) {
        throw new Error('CSV must contain a header and at least 3 rows of soil samples.');
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsedSamples = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length < 5) continue;

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = parts[idx];
        });

        const lat = parseFloat(row.latitude || row.lat || parts[1]);
        const lng = parseFloat(row.longitude || row.lng || row.lon || parts[2]);
        const n = parseFloat(row.nitrogen || row.n || parts[3]);
        const p = parseFloat(row.phosphorus || row.p || parts[4]);
        const k = parseFloat(row.potassium || row.k || parts[5]);
        const ph = parseFloat(row.ph || row.soil_ph || 6.5);
        const moist = parseFloat(row.moisture || 22.0);
        const elev = parseFloat(row.elevation || row.elev || 310.0 + i);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(n)) {
          parsedSamples.push({
            sample_id: row.sample_id || row.id || `SMP-${String(i).padStart(3, '0')}`,
            latitude: lat,
            longitude: lng,
            nitrogen: n,
            phosphorus: p,
            potassium: k,
            ph,
            moisture: moist,
            elevation: elev,
          });
        }
      }

      if (parsedSamples.length < 3) {
        throw new Error('Minimum 3 spatial soil sample points are required for spatial interpolation.');
      }

      const fieldName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      clientState.activePresetId = null; // custom CSV — clear preset identity
      clientState.samples = parsedSamples;
      clientState.fieldName = fieldName;

      const stats = computeDatasetStats(parsedSamples);
      return {
        success: true,
        message: `Successfully loaded ${parsedSamples.length} samples for '${fieldName}'.`,
        field_name: fieldName,
        samples: parsedSamples,
        stats,
        isBackend: false,
      };
    }
  },

  // Load a built-in farm preset
  async loadPreset(presetId) {
    try {
      const res = await request(`/upload/load-preset/${presetId}`, {
        method: 'POST',
      });
      clientState.activePresetId = presetId;
      clientState.samples = res.samples;
      clientState.fieldName = res.message?.replace('Preset loaded: ', '') || presetId;
      return { ...res, isBackend: true };
    } catch (err) {
      const preset = PRESET_DATASETS[presetId] || PRESET_DATASETS.cedar_creek;
      clientState.activePresetId = presetId;
      clientState.fieldName = preset.field_name;
      clientState.samples = preset.samples;

      const stats = computeDatasetStats(preset.samples);
      return {
        success: true,
        message: `Preset loaded: ${preset.field_name}`,
        field_name: preset.field_name,
        samples: preset.samples,
        stats,
        isBackend: false,
      };
    }
  },

  // Fetch interpolated heatmap layer for specific week
  async getHeatmapLayer({
    nutrient = 'nitrogen',
    week = 0,
    soilType = 'loam',
    rainfallScenario = 'normal',
    slopeFactor = 1.0,
    cropUptake = 'medium',
  }) {
    try {
      const query = new URLSearchParams({
        nutrient,
        week: week.toString(),
        soil_type: soilType,
        rainfall_scenario: rainfallScenario,
        slope_factor: slopeFactor.toString(),
        crop_uptake: cropUptake,
      });
      const data = await request(`/migration/heatmap?${query.toString()}`);
      return { ...data, isBackend: true };
    } catch (err) {
      // Client spatial IDW interpolation fallback
      const data = generateClientHeatmap({
        samples: clientState.samples,
        fieldName: clientState.fieldName,
        nutrient,
        week,
        soilType,
        rainfallScenario,
        slopeFactor,
        cropUptake,
      });
      return { ...data, isBackend: false };
    }
  },

  // Fetch 8-week temporal analytics series
  async getTemporalAnalytics({
    soilType = 'loam',
    rainfallScenario = 'normal',
    slopeFactor = 1.0,
  }) {
    try {
      const query = new URLSearchParams({
        soil_type: soilType,
        rainfall_scenario: rainfallScenario,
        slope_factor: slopeFactor.toString(),
      });
      const data = await request(`/migration/analytics?${query.toString()}`);
      return { ...data, isBackend: true };
    } catch (err) {
      const data = generateClientTemporalAnalytics({
        samples: clientState.samples,
        fieldName: clientState.fieldName,
        soilType,
        rainfallScenario,
        slopeFactor,
      });
      return { ...data, isBackend: false };
    }
  },

  // Weather forecast
  async getWeatherForecast() {
    try {
      const data = await request('/weather/forecast');
      return { ...data, isBackend: true };
    } catch (err) {
      return { ...getClientWeatherForecast(), isBackend: false };
    }
  },
};
