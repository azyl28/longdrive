import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LocationSearch = ({
  map,
  onLocationSelect,
  apiKey = null,
  provider = 'osm',
  placeholder = 'Szukaj miejsca...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Wyszukiwanie lokalizacji
  const searchLocation = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      let url;
      if (provider === 'google' && apiKey) {
        url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&language=pl`;
      } else {
        // OpenStreetMap Nominatim (darmowy)
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=10&countrycodes=pl`;
      }

      const response = await fetch(url);
      const data = await response.json();

      let formattedResults = [];
      if (provider === 'google' && apiKey) {
        formattedResults = data.results?.map(result => ({
          lat: parseFloat(result.geometry.location.lat),
          lng: parseFloat(result.geometry.location.lng),
          display_name: result.formatted_address,
          name: result.address?.road || result.formatted_address,
        })) || [];
      } else {
        formattedResults = data.map(item => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          display_name: item.display_name,
          name: item.display_name.split(',')[0],
        }));
      }

      setResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [provider, apiKey]);

  // Obsługa zmiany tekstu (debounce)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  // Wybór lokalizacji
  const handleSelectLocation = (location) => {
    if (map && location) {
      map.setView([location.lat, location.lng], 15);
    }
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    setShowResults(false);
    setQuery(location.display_name || location.name);
  };

  // Zamknij wyniki
  const closeResults = () => {
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <GlassCard className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={handleSearchChange}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className="pl-9 pr-9 bg-slate-800 border-slate-700 text-theme-white placeholder:text-slate-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </GlassCard>

      <AnimatePresence>
        {showResults && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <GlassCard className="p-2 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                results.map((result, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSelectLocation(result)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-700/50 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-theme-white truncate">{result.name}</p>
                      <p className="text-xs text-theme-white-muted truncate">{result.display_name}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearch;