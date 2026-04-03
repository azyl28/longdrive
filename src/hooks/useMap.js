import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix dla ikon Leaflet (naprawia problem z brakującymi ikonami markerów)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Hook do zarządzania mapą
 * @param {Object} mapContainerRef - referencja do kontenera mapy
 * @param {Object} options - opcje konfiguracji
 */
export function useMap(mapContainerRef, options = {}) {
  const {
    initialCenter = [52.2297, 21.0122], // Warszawa
    initialZoom = 12,
    provider = 'osm',
    mapStyle = 'road',
    onMapReady = null,
    onLocationFound = null,
    onLocationError = null,
    autoCenter = true,
    highAccuracy = true,
  } = options;

  const [map, setMap] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [routeLayer, setRouteLayer] = useState(null);
  const [markers, setMarkers] = useState([]);
  const watchIdRef = useRef(null);

  // Inicjalizacja mapy
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    let tileLayerUrl = '';
    let tileLayerOptions = {};

    // Wybór warstwy mapy w zależności od dostawcy
    switch (provider) {
      case 'osm':
        tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        tileLayerOptions = {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        };
        break;
      case 'carto':
        tileLayerUrl = mapStyle === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
        tileLayerOptions = {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
          maxZoom: 19,
        };
        break;
      case 'stadia':
        tileLayerUrl = mapStyle === 'terrain'
          ? 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}.png'
          : 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png';
        tileLayerOptions = {
          attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
          maxZoom: 20,
        };
        break;
      default:
        tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        tileLayerOptions = {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        };
    }

    // Tworzenie instancji mapy
    const mapInstance = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);
    
    // Dodanie warstwy mapy
    L.tileLayer(tileLayerUrl, tileLayerOptions).addTo(mapInstance);

    setMap(mapInstance);
    setIsMapReady(true);

    if (onMapReady) {
      onMapReady(mapInstance);
    }

    // Czyszczenie przy odmontowaniu
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapContainerRef, provider, mapStyle]);

  // Rozpoczęcie śledzenia GPS
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolokalizacja nie jest wspierana');
      if (onLocationError) {
        onLocationError(new Error('Geolokalizacja nie jest wspierana'));
      }
      return;
    }

    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newPosition = { lat: latitude, lng: longitude, accuracy };
        setCurrentPosition(newPosition);

        if (onLocationFound) {
          onLocationFound(newPosition);
        }

        // Automatyczne centrowanie na pozycji
        if (map && autoCenter) {
          map.setView([latitude, longitude], map.getZoom());
        }
      },
      (error) => {
        console.error('Błąd GPS:', error);
        if (onLocationError) {
          onLocationError(error);
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  }, [map, autoCenter, highAccuracy, onLocationFound, onLocationError]);

  // Zatrzymanie śledzenia GPS
  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  // Dodanie markera
  const addMarker = useCallback((latlng, markerOptions = {}) => {
    if (!map) return null;

    const marker = L.marker(latlng, {
      icon: markerOptions.icon || undefined,
    });

    if (markerOptions.title) {
      marker.bindTooltip(markerOptions.title);
    }

    if (markerOptions.popup) {
      marker.bindPopup(markerOptions.popup);
    }

    marker.addTo(map);
    setMarkers(prev => [...prev, marker]);
    return marker;
  }, [map]);

  // Usuwanie wszystkich markerów
  const clearMarkers = useCallback(() => {
    markers.forEach(marker => {
      if (map && marker) {
        map.removeLayer(marker);
      }
    });
    setMarkers([]);
  }, [map, markers]);

  // Rysowanie trasy (linia między punktami)
  const drawRoute = useCallback((waypoints, routeOptions = {}) => {
    if (!map) return null;

    // Usuń poprzednią trasę
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    const { color = '#3b82f6', weight = 4, opacity = 0.8 } = routeOptions;

    // Sprawdź czy waypoints zawierają współrzędne
    if (waypoints.length > 0 && waypoints[0].lat !== undefined) {
      const latlngs = waypoints.map(w => [w.lat, w.lng]);
      const polyline = L.polyline(latlngs, { color, weight, opacity }).addTo(map);
      setRouteLayer(polyline);
      
      // Dopasuj widok mapy do trasy
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      return polyline;
    }
    
    return null;
  }, [map, routeLayer]);

  // Wyczyść trasę
  const clearRoute = useCallback(() => {
    if (routeLayer) {
      map?.removeLayer(routeLayer);
      setRouteLayer(null);
    }
  }, [map, routeLayer]);

  // Pobierz aktualną lokalizację jednorazowo
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokalizacja nie jest wspierana'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const location = { lat: latitude, lng: longitude, accuracy };
          setCurrentPosition(location);
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
        }
      );
    });
  }, [highAccuracy]);

  // Zoom do poziomu
  const setZoom = useCallback((zoomLevel) => {
    map?.setZoom(zoomLevel);
  }, [map]);

  // Centruj na pozycji
  const centerOnPosition = useCallback((position) => {
    if (map && position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [map]);

  // Przybliż
  const zoomIn = useCallback(() => {
    if (map) {
      map.zoomIn();
    }
  }, [map]);

  // Oddal
  const zoomOut = useCallback(() => {
    if (map) {
      map.zoomOut();
    }
  }, [map]);

  return {
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
    zoomIn,
    zoomOut,
    centerOnPosition,
  };
}

export default useMap;