import { useState, useCallback } from 'react';
import { Bus, Menu, Wifi, WifiOff } from 'lucide-react';
import TransitMap from '@/components/transit/TransitMap';
import SearchPanel from '@/components/transit/SearchPanel';
import RouteResults from '@/components/transit/RouteResults';
import LiveTripCard from '@/components/transit/LiveTripCard';
import ProfileModal from '@/components/transit/ProfileModal';
import { mockStops, mockRouteResults, type RouteResult } from '@/data/mockTransitData';
import { useRealtimeBuses } from '@/hooks/useRealtimeBuses';
import { toast } from 'sonner';
import { fetchNearbyRoutes } from '@/services/transitApi';

interface UserProfile {
  birthYear: number;
  birthMonth: number;
  hasDisability: boolean;
}

async function geocode(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Durham Region Ontario')}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function getRoadPolyline(from: {lat: number, lng: number}, to: {lat: number, lng: number}): Promise<[number, number][]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes?.length) return [[from.lat, from.lng], [to.lat, to.lng]];
  return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
}

const Index = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfile, setShowProfile] = useState(true);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [scheduledTrip, setScheduledTrip] = useState<RouteResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Real-time bus data polling every 10 seconds
  const { buses: realtimeBuses, loading: busesLoading, error: busesError } = useRealtimeBuses(10000);

  const handleProfileComplete = useCallback((p: UserProfile) => {
    setProfile(p);
    setShowProfile(false);
    const age = new Date().getFullYear() - p.birthYear;
    toast.success(`Welcome! ${age >= 65 || p.hasDisability ? 'Accessibility features enabled.' : 'Your profile is set up.'}`);
  }, []);

  const handleSearch = useCallback(async (from: string, to: string) => {
    setIsSearching(true);
    setRoutes([]);
  
    const [fromCoord, toCoord] = await Promise.all([geocode(from), geocode(to)]);
  
    if (!fromCoord) { toast.error(`Location not found: "${from}"`); setIsSearching(false); return; }
    if (!toCoord) { toast.error(`Location not found: "${to}"`); setIsSearching(false); return; }
  
    try {
      const [fromData, polyline] = await Promise.all([
        fetchNearbyRoutes(fromCoord.lat, fromCoord.lng),
        getRoadPolyline(fromCoord, toCoord),
      ]);
  
      const realRoutes = (fromData.routes || []).map((r: any) => {
        const itinerary = r.itineraries?.[0];
        const schedule = itinerary?.schedule_items?.[0];
        const depTime = schedule ? new Date(schedule.departure_time * 1000) : new Date();
        const arrTime = new Date(depTime.getTime() + 30 * 60000); // estimate 30 min
  
        return {
          id: r.global_route_id,
          routeName: r.route_long_name || r.route_short_name,
          routeNumber: r.route_short_name,
          departureTime: depTime.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
          arrivalTime: arrTime.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
          duration: '~30 min',
          transfers: 0,
          status: 'on-time' as const,
          stops: [
            { name: itinerary?.closest_stop?.stop_name || from, time: depTime.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) },
            { name: to, time: arrTime.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }) },
          ],
          polyline,
        };
      });
  
      if (realRoutes.length === 0) {
        toast.info('No routes found near that location');
        setIsSearching(false);
        return;
      }
  
      setRoutes(realRoutes);
      toast.info(`${realRoutes.length} route(s) found`);
    } catch (err) {
      toast.error('Failed to fetch routes — check your API key');
      console.error(err);
    }
  
    setIsSearching(false);
  }, []);

  const handleScheduleTrip = useCallback((route: RouteResult) => {
    setScheduledTrip(route);
    toast.success(`Trip scheduled on Route ${route.routeNumber}`, {
      description: 'You will receive notifications before departure.',
    });
  }, []);

  const handleCheckIn = useCallback(() => {
    toast.success('Checked in successfully!', {
      description: 'The driver has been notified.',
    });
  }, []);

  const handleHalt = useCallback(() => {
    toast.success('Halt request sent!', {
      description: 'The bus will wait at your stop.',
    });
  }, []);

  const isEligibleForHalt = profile ? (new Date().getFullYear() - profile.birthYear >= 65 || profile.hasDisability) : false;

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Map background */}
      <div className="absolute inset-0">
        <TransitMap
          stops={mockStops}
          buses={realtimeBuses}
          selectedRoute={selectedRoute}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3">
        <div className="flex items-center gap-2 max-w-lg">
          <div className="transit-panel px-3 py-2 flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-sm">DRT Smart Transit</span>
          </div>
          <div className="transit-panel px-2 py-2 flex items-center gap-1">
            {busesError ? (
              <WifiOff className="w-4 h-4 text-destructive" />
            ) : (
              <Wifi className="w-4 h-4 text-success" />
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {realtimeBuses.length} buses
            </span>
          </div>
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="transit-panel p-2 lg:hidden"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Side panel */}
      <div className={`absolute top-0 left-0 bottom-0 z-20 w-full max-w-[400px] transition-transform duration-300 ${
        panelOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto p-3 pt-16 pb-32 space-y-3">
          <SearchPanel onSearch={handleSearch} isSearching={isSearching} />
          <RouteResults
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onScheduleTrip={handleScheduleTrip}
          />
        </div>
      </div>

      {/* Live trip card */}
      {scheduledTrip && (
        <LiveTripCard
          route={scheduledTrip}
          canCheckIn={true}
          canHalt={isEligibleForHalt}
          onCheckIn={handleCheckIn}
          onHalt={handleHalt}
          onCancel={() => setScheduledTrip(null)}
        />
      )}

      {/* Profile modal */}
      <ProfileModal open={showProfile} onComplete={handleProfileComplete} />
    </div>
  );
};

export default Index;
