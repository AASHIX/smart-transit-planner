import { supabase } from '@/integrations/supabase/client';

export interface TransitBus {
  id: string;
  tripId: string;
  routeId: string;
  lat: number;
  lng: number;
  bearing: number;
  speed: number;
  label: string;
  timestamp: string;
}

export interface TransitTripUpdate {
  id: string;
  tripId: string;
  routeId: string;
  stopUpdates: {
    stopId: string;
    arrivalDelay: number;
    departureDelay: number;
  }[];
}

// Fetch realtime vehicle positions from GTFS feed
export async function fetchRealtimeVehicles(): Promise<TransitBus[]> {
  const { data, error } = await supabase.functions.invoke('gtfs-realtime', {
    body: null,
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching realtime vehicles:', error);
    return [];
  }

  return data?.vehicles || [];
}

// Fetch trip updates (delays) from GTFS feed  
export async function fetchTripUpdates(): Promise<TransitTripUpdate[]> {
  const { data, error } = await supabase.functions.invoke('gtfs-realtime', {
    body: null,
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching trip updates:', error);
    return [];
  }

  return data?.updates || [];
}

// Search routes via Transit API proxy
export async function searchTransitRoutes(lat: number, lng: number) {
  const { data, error } = await supabase.functions.invoke('transit-proxy', {
    body: null,
    method: 'GET',
  });

  if (error) {
    console.error('Error searching routes:', error);
    return null;
  }

  return data;
}

// Get nearby stops via Transit API proxy
export async function getNearbyStops(lat: number, lng: number) {
  const { data, error } = await supabase.functions.invoke('transit-proxy', {
    body: null,
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching nearby stops:', error);
    return null;
  }

  return data;
}

// Get stop departures via Transit API proxy
export async function getStopDepartures(stopId: string) {
  const { data, error } = await supabase.functions.invoke('transit-proxy', {
    body: null,
    method: 'GET',
  });

  if (error) {
    console.error('Error fetching stop departures:', error);
    return null;
  }

  return data;
}
