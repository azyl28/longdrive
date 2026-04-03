import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMap } from '@/hooks/useMap';
import { MapPin, Navigation, Maximize2, Minimize2, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';

const MapView = ({
  trip = null,
  vehicle = null,
  driver = null,
  showLiveTracking = false,
  showRoute = true,
  showMarkers = true,
  provider = 'osm',
  mapStyle = 'road',
  defaultZoom = 12,
  autoCenter = true,
  routeColor = '#3b82f6',
  className = '',
  onLocationClick = null,
}) => {
  const mapContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapControls, setMapControls] = useState({ zoom: defaultZoom });

  const {
    map,
    isMapReady,
    currentPosition,
    tracking,
    startTracking,
    stopTracking,
    addMarker,
    clearMarkers,
    drawRoute,
    clearRoute,
    getCurrentLocation,
    setZoom,
    centerOnPosition,
  } = useMap(mapContainerRef, {
    initialCenter: [52.2297, 21.0122],
    initialZoom: defaultZoom,
    provider,
    mapStyle,
    autoCenter,
    onLocationFound: (pos) => {
      if (onLocationClick) onLocationClick(pos);
    },
  });

  // Rysowanie trasy gdy zmieni się trip
  useEffect(() => {
    if (!isMapReady || !showRoute || !trip) return;

    const waypoints = [];
    
    if (trip.startLocation && trip.startCoordinates) {
      waypoints.push(trip.startCoordinates);
    }
    
    if (trip.endLocation && trip.endCoordinates) {
      waypoints.push(trip.endCoordinates);
    }
    
    if (trip.stops && trip.stops.length > 0) {
      waypoints.push(...trip.stops.map(stop => stop.coordinates));
    }

    if (waypoints.length >= 2) {
      drawRoute(waypoints, { color: routeColor, weight: 4 });
    } else if (waypoints.length === 1) {
      // Jeśli tylko jeden punkt, tylko marker
    }

    return () => {
      clearRoute();
    };
  }, [isMapReady, showRoute, trip, drawRoute, clearRoute, routeColor]);

  // Dodawanie markerów
  useEffect(() => {
    if (!isMapReady || !showMarkers) return;

    clearMarkers();

    // Marker startu trasy
    if (trip?.startLocation && trip?.startCoordinates) {
      addMarker(trip.startCoordinates, {
        title: `Start: ${trip.startLocation}`,
        popup: `<b>Start trasy</b><br/>${trip.startLocation}<br/>${trip.startDate ? new Date(trip.startDate).toLocaleString() : ''}`,
      });
    }

    // Marker końca trasy
    if (trip?.endLocation && trip?.endCoordinates) {
      addMarker(trip.endCoordinates, {
        title: `Meta: ${trip.endLocation}`,
        popup: `<b>Koniec trasy</b><br/>${trip.endLocation}<br/>${trip.endDate ? new Date(trip.endDate).toLocaleString() : ''}`,
      });
    }

    // Markery postojów
    if (trip?.stops && trip.stops.length > 0) {
      trip.stops.forEach((stop, idx) => {
        if (stop.coordinates) {
          addMarker(stop.coordinates, {
            title: `Postój ${idx + 1}: ${stop.name || ''}`,
            popup: `<b>Postój ${idx + 1}</b><br/>${stop.name || ''}<br/>${stop.duration ? `Czas: ${stop.duration} min` : ''}`,
          });
        }
      });
    }

    return () => {
      clearMarkers();
    };
  }, [isMapReady, showMarkers, trip, addMarker, clearMarkers]);

  // Śledzenie na żywo
  useEffect(() => {
    if (!isMapReady) return;

    if (showLiveTracking && !tracking) {
      startTracking();
    } else if (!showLiveTracking && tracking) {
      stopTracking();
    }

    return () => {
      if (tracking) stopTracking();
    };
  }, [isMapReady, showLiveTracking, tracking, startTracking, stopTracking]);

  // Dodanie markera bieżącej pozycji
  useEffect(() => {
    if (!isMapReady || !currentPosition || !showLiveTracking) return;

    // Usuń poprzedni marker pozycji
    const existingMarker = document.querySelector('.current-position-marker');
    if (existingMarker) {
      // marker usuwany przez clearMarkers, ale to uproszczenie
    }

    addMarker([currentPosition.lat, currentPosition.lng], {
      title: 'Twoja pozycja',
      popup: `<b>Aktualna pozycja</b><br/>Szerokość: ${currentPosition.lat.toFixed(6)}<br/>Długość: ${currentPosition.lng.toFixed(6)}<br/>Dokładność: ${currentPosition.accuracy}m`,
    });
  }, [isMapReady, currentPosition, showLiveTracking, addMarker]);

  // Obsługa pełnego ekranu
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;

    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Obsługa zoomu
  const handleZoomIn = () => {
    if (map) {
      const newZoom = map.getZoom() + 1;
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const newZoom = map.getZoom() - 1;
      setZoom(newZoom);
    }
  };

  // Centruj na bieżącej pozycji
  const handleCenterOnLocation = async () => {
    try {
      const location = await getCurrentLocation();
      centerOnPosition(location);
    } catch (error) {
      console.error('Nie można pobrać lokalizacji:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Kontener mapy */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-slate-800"
        style={{ height: isFullscreen ? '100vh' : '500px' }}
      />

      {/* Kontrolki mapy */}
      {isMapReady && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-1 flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={handleZoomIn}
                title="Przybliż"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={handleZoomOut}
                title="Oddal"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="h-px bg-slate-700 my-1" />
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={handleCenterOnLocation}
                title="Centruj na mojej pozycji"
              >
                <Crosshair className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Przycisk śledzenia GPS */}
      {showLiveTracking && (
        <div className="absolute bottom-4 left-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant={tracking ? "default" : "outline"}
              className={`gap-2 ${tracking ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={tracking ? stopTracking : startTracking}
            >
              <Navigation className={`w-4 h-4 ${tracking ? 'animate-pulse' : ''}`} />
              {tracking ? 'Śledzenie aktywne' : 'Rozpocznij śledzenie'}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Legenda */}
      {showRoute && trip && (
        <div className="absolute bottom-4 right-4">
          <GlassCard className="p-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: routeColor }} />
              <span className="text-theme-white-secondary">Trasa</span>
            </div>
            {currentPosition && (
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="text-theme-white-secondary">Twoja pozycja</span>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default MapView;