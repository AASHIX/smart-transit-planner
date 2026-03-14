import { motion } from 'framer-motion';
import { Bus, MapPin, Hand, CheckCircle2 } from 'lucide-react';
import type { RouteResult } from '@/data/mockTransitData';

interface LiveTripCardProps {
  route: RouteResult;
  canCheckIn: boolean;
  canHalt: boolean;
  onCheckIn: () => void;
  onHalt: () => void;
  onCancel: () => void;
}

export default function LiveTripCard({ route, canCheckIn, canHalt, onCheckIn, onHalt, onCancel }: LiveTripCardProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
    >
      <div className="transit-panel p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground">Route {route.routeNumber}</p>
              <p className="text-xs text-muted-foreground">{route.routeName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-lg text-foreground">
              {route.departureTime}
            </p>
            <p className={route.status === 'on-time' ? 'transit-status-ontime text-xs' : 'transit-status-delayed text-xs'}>
              {route.status === 'on-time' ? 'On Time' : `${route.delayMinutes}m late`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCheckIn}
            disabled={!canCheckIn}
            className="transit-btn-action flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5" />
            Check In
          </button>

          <button
            onClick={onHalt}
            disabled={!canHalt}
            className="transit-btn-action flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Hand className="w-5 h-5" />
            Halt Request
          </button>

          <button
            onClick={onCancel}
            className="transit-btn-primary flex-none px-4 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        {(!canCheckIn || !canHalt) && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <MapPin className="w-3 h-3 inline mr-1" />
            Move closer to the bus stop to enable actions
          </p>
        )}
      </div>
    </motion.div>
  );
}
