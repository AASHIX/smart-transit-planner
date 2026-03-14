import { useState, useCallback } from 'react';
import { Bus, Menu } from 'lucide-react';
import TransitMap from '@/components/transit/TransitMap';
import SearchPanel from '@/components/transit/SearchPanel';
import RouteResults from '@/components/transit/RouteResults';
import LiveTripCard from '@/components/transit/LiveTripCard';
import ProfileModal from '@/components/transit/ProfileModal';
import { mockStops, mockBuses, mockRouteResults, type RouteResult } from '@/data/mockTransitData';
import { toast } from 'sonner';

interface UserProfile {
  birthYear: number;
  birthMonth: number;
  hasDisability: boolean;
}

const Index = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfile, setShowProfile] = useState(true);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [scheduledTrip, setScheduledTrip] = useState<RouteResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const handleProfileComplete = useCallback((p: UserProfile) => {
    setProfile(p);
    setShowProfile(false);
    const age = new Date().getFullYear() - p.birthYear;
    toast.success(`Welcome! ${age >= 65 || p.hasDisability ? 'Accessibility features enabled.' : 'Your profile is set up.'}`);
  }, []);

  const handleSearch = useCallback((_from: string, _to: string) => {
    setIsSearching(true);
    setTimeout(() => {
      setRoutes(mockRouteResults);
      setIsSearching(false);
    }, 600);
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
          buses={mockBuses}
          selectedRoute={selectedRoute}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3">
        <div className="flex items-center gap-3 max-w-lg">
          <div className="transit-panel px-3 py-2 flex items-center gap-2">
            <Bus className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-sm">DRT Smart Transit</span>
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
