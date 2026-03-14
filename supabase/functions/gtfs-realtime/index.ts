import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GTFS_VEHICLE_POSITIONS_URL = 'https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions';
const GTFS_TRIP_UPDATES_URL = 'https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates';

interface VehiclePosition {
  id: string;
  vehicle: {
    trip?: { tripId?: string; routeId?: string };
    position?: { latitude: number; longitude: number; bearing?: number; speed?: number };
    vehicle?: { id?: string; label?: string };
    timestamp?: string;
  };
}

interface TripUpdate {
  id: string;
  tripUpdate: {
    trip?: { tripId?: string; routeId?: string };
    stopTimeUpdate?: Array<{
      stopSequence?: number;
      stopId?: string;
      arrival?: { delay?: number; time?: string };
      departure?: { delay?: number; time?: string };
    }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const feed = url.searchParams.get('feed') || 'vehicles';

    if (feed === 'vehicles') {
      const response = await fetch(GTFS_VEHICLE_POSITIONS_URL, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        // Try protobuf-to-JSON fallback — DRT may return protobuf
        const buffer = await response.arrayBuffer();
        console.log('GTFS Vehicle response status:', response.status, 'content-type:', response.headers.get('content-type'));
        
        return new Response(JSON.stringify({ 
          error: 'GTFS feed returned non-OK status',
          status: response.status,
          contentType: response.headers.get('content-type'),
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json') || contentType.includes('text/json')) {
        const data = await response.json();
        
        // Normalize GTFS-RT JSON response
        const vehicles = (data.entity || []).map((entity: VehiclePosition) => ({
          id: entity.id,
          tripId: entity.vehicle?.trip?.tripId || '',
          routeId: entity.vehicle?.trip?.routeId || '',
          lat: entity.vehicle?.position?.latitude || 0,
          lng: entity.vehicle?.position?.longitude || 0,
          bearing: entity.vehicle?.position?.bearing || 0,
          speed: entity.vehicle?.position?.speed || 0,
          label: entity.vehicle?.vehicle?.label || entity.id,
          timestamp: entity.vehicle?.timestamp || '',
        }));

        return new Response(JSON.stringify({ vehicles, count: vehicles.length, timestamp: Date.now() }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Protobuf response — return raw info for now
        return new Response(JSON.stringify({ 
          message: 'GTFS feed returned protobuf format. JSON parsing requires a protobuf decoder.',
          contentType,
          hint: 'DRT may require protocol buffer decoding for realtime feeds',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (feed === 'trips') {
      const response = await fetch(GTFS_TRIP_UPDATES_URL, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'GTFS trip updates unavailable', status: response.status }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json') || contentType.includes('text/json')) {
        const data = await response.json();
        
        const updates = (data.entity || []).map((entity: TripUpdate) => ({
          id: entity.id,
          tripId: entity.tripUpdate?.trip?.tripId || '',
          routeId: entity.tripUpdate?.trip?.routeId || '',
          stopUpdates: (entity.tripUpdate?.stopTimeUpdate || []).map(su => ({
            stopId: su.stopId || '',
            arrivalDelay: su.arrival?.delay || 0,
            departureDelay: su.departure?.delay || 0,
          })),
        }));

        return new Response(JSON.stringify({ updates, count: updates.length, timestamp: Date.now() }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          message: 'GTFS feed returned protobuf format.',
          contentType,
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid feed parameter. Use "vehicles" or "trips".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: unknown) {
    console.error('GTFS realtime error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
