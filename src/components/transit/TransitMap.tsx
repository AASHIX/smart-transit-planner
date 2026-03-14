import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DURHAM_CENTER, type BusStop, type BusPosition, type RouteResult } from '@/data/mockTransitData';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const busIcon = (label: string, delay: number) => {
  const color = delay > 60 ? '#EF4444' : '#006747';
  return L.divIcon({
    className: 'bus-marker',
    html: `<div style="background:${color};color:white;font-family:'Roboto Mono',monospace;font-size:11px;font-weight:700;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">${label}</div>`,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });
};

const stopIcon = L.divIcon({
  className: 'stop-marker',
  html: `<div style="width:12px;height:12px;background:#006747;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface FitBoundsProps {
  polyline: [number, number][];
}

function FitBounds({ polyline }: FitBoundsProps) {
  const map = useMap();
  useEffect(() => {
    if (polyline.length > 0) {
      const bounds = L.latLngBounds(polyline.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [polyline, map]);
  return null;
}

interface TransitMapProps {
  stops: BusStop[];
  buses: BusPosition[];
  selectedRoute: RouteResult | null;
}

export default function TransitMap({ stops, buses, selectedRoute }: TransitMapProps) {
  return (
    <MapContainer
      center={DURHAM_CENTER}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Bus stops */}
      {stops.map(stop => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>{stop.name}</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Routes: {stop.routes.join(', ')}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Buses */}
      {buses.map(bus => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={busIcon(bus.label, bus.delay)}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>Route {bus.label}</strong>
              <br />
              <span style={{ fontSize: '12px', color: bus.delay > 60 ? '#EF4444' : '#22C55E' }}>
                {bus.delay > 60 ? `Delayed ${Math.round(bus.delay / 60)} min` : 'On Time'}
              </span>
              <br />
              <span style={{ fontFamily: 'Roboto Mono', fontSize: '12px' }}>
                {bus.speed} km/h
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Selected route polyline */}
      {selectedRoute && (
        <>
          <Polyline
            positions={selectedRoute.polyline}
            pathOptions={{
              color: '#006747',
              weight: 5,
              opacity: 0.8,
            }}
          />
          <FitBounds polyline={selectedRoute.polyline} />
        </>
      )}
    </MapContainer>
  );
}
