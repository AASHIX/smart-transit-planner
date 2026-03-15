import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DURHAM_CENTER, type BusStop, type RouteResult } from '@/data/mockTransitData';
import type { RealtimeBus } from '@/services/transitApi';

interface TransitMapProps {
  stops: BusStop[];
  buses: RealtimeBus[];
  selectedRoute: RouteResult | null;
}

export default function TransitMap({ stops, buses, selectedRoute }: TransitMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const busesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DURHAM_CENTER,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
    stopsLayerRef.current = L.layerGroup().addTo(map);
    busesLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update stops
  useEffect(() => {
    if (!stopsLayerRef.current) return;
    stopsLayerRef.current.clearLayers();

    stops.forEach(stop => {
      const icon = L.divIcon({
        className: 'stop-marker',
        html: `<div style="width:10px;height:10px;background:#006747;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      L.marker([stop.lat, stop.lng], { icon })
        .bindPopup(`<strong>${stop.name}</strong><br/><span style="font-size:12px;color:#64748B">Routes: ${stop.routes.join(', ')}</span>`)
        .addTo(stopsLayerRef.current!);
    });
  }, [stops]);

  // Update buses (separate layer for smooth updates)
  useEffect(() => {
    if (!busesLayerRef.current) return;
    busesLayerRef.current.clearLayers();

    buses.forEach(bus => {
      const icon = L.divIcon({
        className: 'bus-marker',
        html: `<div style="background:#006747;color:white;font-family:'Roboto Mono',monospace;font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.3);border:2px solid white;line-height:1;">${bus.label}</div>`,
        iconSize: [36, 20],
        iconAnchor: [18, 10],
      });

      L.marker([bus.lat, bus.lng], { icon })
        .bindPopup(`<strong>Route ${bus.label}</strong><br/><span style="font-family:'Roboto Mono';font-size:12px">ID: ${bus.id}</span>`)
        .addTo(busesLayerRef.current!);
    });
  }, [buses]);

  // Update selected route
  useEffect(() => {
    if (!mapRef.current) return;
  
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
  
    if (selectedRoute && selectedRoute.polyline.length > 0) {
      routeLayerRef.current = L.polyline(selectedRoute.polyline, {
        color: '#006747',
        weight: 5,
        opacity: 0.8,
      }).addTo(mapRef.current);
  
      const start = selectedRoute.polyline[0];
      const end = selectedRoute.polyline[selectedRoute.polyline.length - 1];
  
      const startIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
  
      const endIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
  
      L.marker([start[0], start[1]], { icon: startIcon })
        .bindPopup(`<strong>Start:</strong> ${selectedRoute.stops[0]?.name ?? 'Origin'}`)
        .addTo(mapRef.current);
  
      L.marker([end[0], end[1]], { icon: endIcon })
        .bindPopup(`<strong>End:</strong> ${selectedRoute.stops[selectedRoute.stops.length - 1]?.name ?? 'Destination'}`)
        .addTo(mapRef.current);
  
      const bounds = L.latLngBounds(selectedRoute.polyline.map(p => L.latLng(p[0], p[1])));
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [selectedRoute]);

  return <div ref={containerRef} className="w-full h-full" />;
}
