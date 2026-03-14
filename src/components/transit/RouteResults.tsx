import { useState } from 'react';
import { ArrowRight, AlertTriangle, Calendar } from 'lucide-react';
import type { RouteResult } from '@/data/mockTransitData';

interface RouteResultsProps {
  routes: RouteResult[];
  selectedRoute: RouteResult | null;
  onSelectRoute: (route: RouteResult) => void;
  onScheduleTrip: (route: RouteResult) => void;
}

export default function RouteResults({ routes, selectedRoute, onSelectRoute, onScheduleTrip }: RouteResultsProps) {
  if (routes.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Available Routes
      </h3>

      {routes.map((route, i) => (
        <div
          key={route.id}
          onClick={() => onSelectRoute(route)}
          style={{ animationDelay: `${i * 50}ms` }}
          className={`transit-panel p-4 cursor-pointer transition-all duration-200 animate-fade-in ${
            selectedRoute?.id === route.id
              ? 'ring-2 ring-primary shadow-lg'
              : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-mono font-bold text-sm">
                  {route.routeNumber}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{route.routeName}</p>
                <p className={route.status === 'on-time' ? 'transit-status-ontime text-xs' : 'transit-status-delayed text-xs'}>
                  {route.status === 'on-time' ? '● On Time' : (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {route.delayMinutes} min delay
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-foreground">{route.duration}</p>
              {route.transfers > 0 && (
                <p className="text-xs text-muted-foreground">{route.transfers} transfer</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{route.departureTime}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="font-mono">{route.arrivalTime}</span>
          </div>

          {/* Expanded stop list */}
          {selectedRoute?.id === route.id && (
            <div className="mt-3 pt-3 border-t border-border animate-fade-in">
              <div className="space-y-2">
                {route.stops.map((stop, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        j === 0 ? 'bg-success border-success' :
                        j === route.stops.length - 1 ? 'bg-destructive border-destructive' :
                        'bg-card border-primary'
                      }`} />
                      {j < route.stops.length - 1 && (
                        <div className="w-0.5 h-4 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-foreground">{stop.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{stop.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onScheduleTrip(route); }}
                className="transit-btn-action w-full mt-4"
              >
                <Calendar className="w-4 h-4" />
                Schedule Trip
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
