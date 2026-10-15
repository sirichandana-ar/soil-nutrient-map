import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeatmapColor, getStatusBadge } from '../../utils/colorScales';
import { NUTRIENTS } from '../../utils/constants';

const TILE_PROVIDERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; USDA, USGS, AeroGRID',
    maxZoom: 19,
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap & OpenStreetMap contributors',
    maxZoom: 17,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20,
  },
};

export default function MapContainer({
  heatmapData,
  samples = [],
  activeNutrient = 'nitrogen',
  baseTile = 'satellite',
  showMarkers = true,
  showVectors = true,
  showGrid = true,
  layerOpacity = 0.65,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const gridLayerGroupRef = useRef(null);
  const markerLayerGroupRef = useRef(null);
  const vectorLayerGroupRef = useRef(null);

  // Live mouse hover cursor telemetry
  const [hoverCoord, setHoverCoord] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = samples.length > 0
      ? [samples[0].latitude, samples[0].longitude]
      : [41.8781, -93.0977];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial base tile
    const provider = TILE_PROVIDERS[baseTile] || TILE_PROVIDERS.satellite;
    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    }).addTo(map);

    gridLayerGroupRef.current = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = L.layerGroup().addTo(map);
    vectorLayerGroupRef.current = L.layerGroup().addTo(map);

    // Track mouse coordinate over map
    map.on('mousemove', (e) => {
      setHoverCoord({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    });

    map.on('mouseout', () => {
      setHoverCoord(null);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = TILE_PROVIDERS[baseTile] || TILE_PROVIDERS.satellite;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current.bringToBack();
  }, [baseTile]);

  // Adjust Viewport Bounds when dataset bounds change
  useEffect(() => {
    if (!mapInstanceRef.current || !heatmapData?.bounds) return;
    const { lat_min, lat_max, lng_min, lng_max } = heatmapData.bounds;
    if (lat_min != null && lat_max != null && lng_min != null && lng_max != null) {
      mapInstanceRef.current.fitBounds(
        [
          [lat_min, lng_min],
          [lat_max, lng_max],
        ],
        { padding: [50, 50], maxZoom: 17, animate: true }
      );
    }
  }, [heatmapData?.bounds]);

  // Render Interpolated Grid Cells with Dynamic Opacity
  useEffect(() => {
    if (!mapInstanceRef.current || !gridLayerGroupRef.current) return;
    gridLayerGroupRef.current.clearLayers();

    if (!showGrid || !heatmapData?.cells?.length) return;

    const { resolution_x, resolution_y, bounds, cells, unit } = heatmapData;
    const dLat = (bounds.lat_max - bounds.lat_min) / Math.max(resolution_y, 1);
    const dLng = (bounds.lng_max - bounds.lng_min) / Math.max(resolution_x, 1);

    const nutrientMeta = NUTRIENTS[activeNutrient] || NUTRIENTS.nitrogen;

    cells.forEach((cell) => {
      const color = getHeatmapColor(cell.normalized);
      const southWest = [cell.lat - dLat * 0.52, cell.lng - dLng * 0.52];
      const northEast = [cell.lat + dLat * 0.52, cell.lng + dLng * 0.52];

      const rect = L.rectangle([southWest, northEast], {
        fillColor: color,
        fillOpacity: layerOpacity,
        weight: 0.35,
        color: 'rgba(255, 255, 255, 0.08)',
      });

      const badge = getStatusBadge(cell.status);
      const tooltipContent = `
        <div style="font-family: 'Outfit', sans-serif; padding: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #f1f5f9; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span>${nutrientMeta.name}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); color: ${color}">
              ${badge.label}
            </span>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-top: 4px;">
            ${cell.value} <span style="font-size: 10px; font-weight: 500; color: #94a3b8;">${unit}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
            Elev: <strong style="color: #e2e8f0;">${cell.elevation} m</strong> | Lat: ${cell.lat.toFixed(4)}, Lng: ${cell.lng.toFixed(4)}
          </div>
        </div>
      `;

      rect.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'glass-panel rounded-lg shadow-glass border-slate-700 text-white',
      });

      rect.addTo(gridLayerGroupRef.current);
    });
  }, [heatmapData, showGrid, activeNutrient, layerOpacity]);

  // Render Sample Boring Points Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerGroupRef.current) return;
    markerLayerGroupRef.current.clearLayers();

    if (!showMarkers || !samples?.length) return;

    samples.forEach((s) => {
      const marker = L.circleMarker([s.latitude, s.longitude], {
        radius: 6.5,
        fillColor: '#ffffff',
        fillOpacity: 0.95,
        color: '#10b981',
        weight: 2.5,
      });

      const popupHtml = `
        <div style="font-family: 'Outfit', sans-serif; width: 190px;">
          <div style="border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #34d399; font-size: 13px;">${s.sample_id}</strong>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${s.elevation} m</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div><span style="color: #94a3b8;">Nitrogen:</span> <strong style="color: #38bdf8;">${s.nitrogen}</strong></div>
            <div><span style="color: #94a3b8;">Phosphorus:</span> <strong style="color: #c084fc;">${s.phosphorus}</strong></div>
            <div><span style="color: #94a3b8;">Potassium:</span> <strong style="color: #f472b6;">${s.potassium}</strong></div>
            <div><span style="color: #94a3b8;">pH:</span> <strong style="color: #34d399;">${s.ph}</strong></div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #64748b; font-family: monospace;">
            Coord: ${Number(s.latitude).toFixed(4)}, ${Number(s.longitude).toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(markerLayerGroupRef.current);
    });
  }, [samples, showMarkers]);

  // Render Downhill Runoff Directional Flow Arrows
  useEffect(() => {
    if (!mapInstanceRef.current || !vectorLayerGroupRef.current) return;
    vectorLayerGroupRef.current.clearLayers();

    if (!showVectors || !heatmapData?.cells?.length) return;

    const step = 4;
    const { cells, bounds } = heatmapData;
    const dLat = (bounds.lat_max - bounds.lat_min) * 0.022;
    const dLng = (bounds.lng_max - bounds.lng_min) * 0.022;

    const angleRad = ((heatmapData.migration_direction_deg || 135) * Math.PI) / 180;
    const arrowDx = Math.sin(angleRad) * dLng;
    const arrowDy = -Math.cos(angleRad) * dLat;

    for (let i = 0; i < cells.length; i += step * 2) {
      const cell = cells[i];
      const start = [cell.lat, cell.lng];
      const end = [cell.lat + arrowDy, cell.lng + arrowDx];

      const line = L.polyline([start, end], {
        color: '#38bdf8',
        weight: 1.5,
        opacity: 0.7,
        dashArray: '3, 4',
      });

      line.addTo(vectorLayerGroupRef.current);
    }
  }, [heatmapData, showVectors]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Floating GPS & Elevation HUD in Bottom Right */}
      {hoverCoord && (
        <div className="absolute bottom-3 right-14 z-10 hidden sm:flex items-center gap-2 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1 font-mono text-[10px] text-slate-300 shadow-lg pointer-events-none">
          <span className="text-emerald-400 font-semibold">GPS:</span>
          <span>{hoverCoord.lat.toFixed(4)}°N, {hoverCoord.lng.toFixed(4)}°W</span>
        </div>
      )}
    </div>
  );
}
