export interface RealtimeBus {
  id: string;
  tripId: string;
  routeId: string;
  lat: number;
  lng: number;
  bearing: number;
  speed: number;
  label: string;
  timestamp: number;
}

export interface NearbyStop {
  global_stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  stop_code: string;
  distance: number;
  wheelchair_boarding: number;
}

const BASE_URL = 'http://localhost:3001/api';

export async function fetchNearbyRoutes(lat: number, lon: number, departureTime?: number) {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    max_distance: '1500',
    max_num_departures: '5',
    should_update_realtime: 'true',
    ...(departureTime ? { time: departureTime.toString() } : {}),
  });

  const res = await fetch(`${BASE_URL}/nearby_routes?${params}`);
  if (!res.ok) throw new Error(`Transit API error: ${res.status}`);
  return res.json();
}

export async function fetchNearbyStops(lat: number, lon: number): Promise<NearbyStop[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    max_distance: '500',
  });

  const res = await fetch(`${BASE_URL}/nearby_stops?${params}`);
  if (!res.ok) throw new Error(`Transit API error: ${res.status}`);
  const data = await res.json();
  return data?.stops || [];
}

import { transit_realtime } from 'gtfs-realtime-bindings';

export async function fetchRealtimeVehicles(): Promise<RealtimeBus[]> {
  try {
    const res = await fetch('http://localhost:3001/api/vehicles');
    const buffer = await res.arrayBuffer();
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    return feed.entity
      .filter(e => e.vehicle?.position)
      .map(e => ({
        id: e.id,
        tripId: e.vehicle?.trip?.tripId || '',
        routeId: e.vehicle?.trip?.routeId || '',
        lat: e.vehicle!.position!.latitude,
        lng: e.vehicle!.position!.longitude,
        bearing: e.vehicle?.position?.bearing || 0,
        speed: e.vehicle?.position?.speed || 0,
        label: e.vehicle?.vehicle?.label || e.id,
        timestamp: Number(e.vehicle?.timestamp) || Date.now(),
      }));
  } catch (e) {
    console.error('Vehicle fetch error:', e);
    return [];
  }
}