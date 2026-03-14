import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const TRANSIT_API_KEY = Deno.env.get('TRANSIT_API_KEY');
  if (!TRANSIT_API_KEY) {
    return new Response(JSON.stringify({ error: 'TRANSIT_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');

    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'Missing endpoint parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Allowed endpoints to prevent abuse
    const allowedEndpoints = [
      '/v3/public/search/routes',
      '/v3/public/nearby_stops',
      '/v3/public/stop_departures',
      '/v3/public/route_details',
      '/v3/public/stop_details',
    ];

    const isAllowed = allowedEndpoints.some(e => endpoint.startsWith(e));
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Endpoint not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Forward query params (except endpoint)
    const transitUrl = new URL(`https://external.transitapp.com${endpoint}`);
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'endpoint') {
        transitUrl.searchParams.set(key, value);
      }
    }

    const response = await fetch(transitUrl.toString(), {
      method: 'GET',
      headers: {
        'apiKey': TRANSIT_API_KEY,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Transit API error [${response.status}]:`, JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'Transit API error', details: data }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Transit proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
