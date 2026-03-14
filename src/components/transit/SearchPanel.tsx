import { useState } from 'react';
import { Search, MapPin, Clock, Navigation } from 'lucide-react';

interface SearchPanelProps {
  onSearch: (from: string, to: string) => void;
  isSearching: boolean;
}

export default function SearchPanel({ onSearch, isSearching }: SearchPanelProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) onSearch(from, to);
  };

  return (
    <div className="transit-panel p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Navigation className="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Plan Your Trip</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
          <input
            type="text"
            placeholder="Starting location"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="transit-search-input pl-10"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
          <input
            type="text"
            placeholder="Destination"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="transit-search-input pl-10"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Depart now"
              className="transit-search-input pl-10 text-sm"
              readOnly
            />
          </div>
          <button
            type="submit"
            disabled={!from || !to || isSearching}
            className="transit-btn-primary"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}
