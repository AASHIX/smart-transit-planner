import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Navigation } from 'lucide-react';

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface SearchPanelProps {
  onSearch: (from: string, to: string) => void;
  isSearching: boolean;
}

function LocationInput({ value, onChange, placeholder, iconColor }: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  iconColor: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value.length < 3) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value + ' Durham Region Ontario')}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(true);
    }, 350);
  }, [value]);

  return (
    <div className="relative">
      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        className="transit-search-input pl-10 w-full"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => { onChange(s.display_name.split(',').slice(0, 2).join(',')); setShowDropdown(false); }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer truncate"
            >
              {s.display_name.split(',').slice(0, 3).join(',')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
        <LocationInput value={from} onChange={setFrom} placeholder="Starting location" iconColor="text-success" />
        <LocationInput value={to} onChange={setTo} placeholder="Destination" iconColor="text-destructive" />
        <div className="flex gap-2">
        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="datetime-local"
            className="transit-search-input pl-10 text-sm w-full"
            defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
          />
        </div>
          <button type="submit" disabled={!from || !to || isSearching} className="transit-btn-primary">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}