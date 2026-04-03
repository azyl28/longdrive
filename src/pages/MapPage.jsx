import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Map, Navigation, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  Crosshair, Layers, Sun, Moon, Satellite, MapPin, Truck, 
  UserCheck, Calendar, Clock, X, Plus, Eye, EyeOff,
  Mountain, Route, Activity, Compass
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MapView from "@/components/maps/MapView";
import GPSLiveTracker from "@/components/maps/GPSLiveTracker";
import TripHistoryMap from "@/components/maps/TripHistoryMap";
import LocationSearch from "@/components/maps/LocationSearch";
import api from "@/api/apiClient";
import { useAppSettings } from '@/lib/ThemeContext';

export default function MapPage() {
  const { settings } = useAppSettings();
  const [activeTab, setActiveTab] = useState("live");
  const [fullscreen, setFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapView, setMapView] = useState("road");
  const [mapProvider, setMapProvider] = useState("osm");
  const [showLiveTracking, setShowLiveTracking] = useState(true);
  const [showRouteMarkers, setShowRouteMarkers] = useState(true);
  const [autoCenter, setAutoCenter] = useState(true);

  // Pobieranie danych
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: api.getVehicles,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: api.getDrivers,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: api.getTrips,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
  });

  // Pobierz ustawienia mapy z localStorage
  const [mapSettings, setMapSettings] = useState({
    provider: 'osm',
    mapStyle: 'road',
    defaultZoom: 12,
    autoCenter: true,
    showMarkers: true,
    showStops: true,
    showTraffic: false,
    saveHistory: true,
    historyRetention: '90',
    routeColors: {
      car: '#3b82f6',
      truck: '#ef4444',
      van: '#10b981',
      bus: '#8b5cf6',
      motorcycle: '#f59e0b'
    }
  });

  useEffect(() => {
    const savedMapSettings = localStorage.getItem('map_settings');
    if (savedMapSettings) {
      try {
        setMapSettings(JSON.parse(savedMapSettings));
      } catch (e) {}
    }
  }, []);

  // Aktywne trasy
  const activeTrips = trips.filter(t => t.status === 'in_progress');

  // Pobierz nazwę pojazdu
  const getVehicleName = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : 'Nieznany';
  };

  // Pobierz kolor trasy
  const getRouteColor = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return mapSettings.routeColors?.car || '#3b82f6';
    
    const type = vehicle.type?.toLowerCase();
    switch (type) {
      case 'ciężarowe':
      case 'truck':
        return mapSettings.routeColors?.truck || '#ef4444';
      case 'dostawcze':
      case 'van':
        return mapSettings.routeColors?.van || '#10b981';
      case 'bus':
      case 'autobus':
        return mapSettings.routeColors?.bus || '#8b5cf6';
      case 'motocykl':
      case 'motorcycle':
        return mapSettings.routeColors?.motorcycle || '#f59e0b';
      default:
        return mapSettings.routeColors?.car || '#3b82f6';
    }
  };

  // Przełącznik pełnego ekranu
  const toggleFullscreen = () => {
    const mapContainer = document.querySelector('.map-container');
    if (!fullscreen) {
      if (mapContainer?.requestFullscreen) {
        mapContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  // Obsługa zdarzenia pełnego ekranu
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa tras"
        subtitle="Wizualizacja tras, śledzenie GPS i historia przejazdów"
        icon={Map}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel boczny */}
        <div className={`${showSidebar ? 'lg:w-80' : 'lg:w-12'} transition-all duration-300`}>
          <GlassCard className="p-0 overflow-hidden">
            {/* Nagłówek panelu */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              {showSidebar ? (
                <>
                  <h3 className="text-theme-white font-semibold flex items-center gap-2">
                    <Map className="w-4 h-4 text-primary" />
                    Panel mapy
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => setShowSidebar(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-10"
                  onClick={() => setShowSidebar(true)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>

            {showSidebar && (
              <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Zakładki */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full bg-slate-800/50 border border-slate-700 p-1">
                    <TabsTrigger value="live" className="flex-1 data-[state=active]:bg-gradient-primary text-xs">
                      Na żywo
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-gradient-primary text-xs">
                      Historia
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-gradient-primary text-xs">
                      Ustawienia
                    </TabsTrigger>
                  </TabsList>

                  {/* Zakładka: Śledzenie na żywo */}
                  <TabsContent value="live" className="mt-3 space-y-4">
                    <GPSLiveTracker
                      vehicle={activeTrips[0]?.vehicleId ? vehicles.find(v => v.id === activeTrips[0].vehicleId) : null}
                      autoTrack={showLiveTracking}
                      highAccuracy={true}
                      onLocationUpdate={(pos) => console.log('Pozycja:', pos)}
                    />

                    {activeTrips.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm text-theme-white font-medium">Aktywne trasy</h4>
                        {activeTrips.map(trip => (
                          <div
                            key={trip.id}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedTrip?.id === trip.id 
                                ? 'bg-primary/20 border border-primary' 
                                : 'bg-slate-800/50 hover:bg-slate-700/50'
                            }`}
                            onClick={() => setSelectedTrip(trip)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-theme-white">
                                {trip.startLocation || 'Brak lokalizacji'}
                              </span>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                W trakcie
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-theme-white-muted">
                              <Truck className="w-3 h-3" />
                              {getVehicleName(trip.vehicleId)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <LocationSearch
                      provider={mapProvider}
                      onLocationSelect={(location) => {
                        console.log('Wybrano lokalizację:', location);
                      }}
                      placeholder="Szukaj miejsca..."
                    />
                  </TabsContent>

                  {/* Zakładka: Historia tras */}
                  <TabsContent value="history" className="mt-3">
                    <TripHistoryMap
                      trips={trips}
                      vehicles={vehicles}
                      drivers={drivers}
                      mapSettings={mapSettings}
                      onTripSelect={(trip) => setSelectedTrip(trip)}
                    />
                  </TabsContent>

                  {/* Zakładka: Ustawienia mapy */}
                  <TabsContent value="settings" className="mt-3 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-theme-white">Dostawca map</Label>
                        <select
                          value={mapProvider}
                          onChange={(e) => setMapProvider(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-theme-white"
                        >
                          <option value="osm">OpenStreetMap</option>
                          <option value="carto">CartoDB</option>
                          <option value="stadia">Stadia Maps</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-theme-white">Styl mapy</Label>
                        <div className="flex gap-1">
                          <Button
                            variant={mapView === 'road' ? 'default' : 'outline'}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setMapView('road')}
                            title="Drogi"
                          >
                            <Map className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={mapView === 'satellite' ? 'default' : 'outline'}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setMapView('satellite')}
                            title="Satelita"
                          >
                            <Satellite className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={mapView === 'terrain' ? 'default' : 'outline'}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setMapView('terrain')}
                            title="Teren"
                          >
                            <Mountain className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={mapView === 'dark' ? 'default' : 'outline'}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setMapView('dark')}
                            title="Ciemny"
                          >
                            <Moon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-theme-white">Śledzenie GPS</Label>
                        <Switch
                          checked={showLiveTracking}
                          onCheckedChange={setShowLiveTracking}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-theme-white">Pokaż markery tras</Label>
                        <Switch
                          checked={showRouteMarkers}
                          onCheckedChange={setShowRouteMarkers}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-theme-white">Auto centrowanie</Label>
                        <Switch
                          checked={autoCenter}
                          onCheckedChange={setAutoCenter}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Główny widok mapy */}
        <div className="flex-1 map-container">
          <GlassCard className="p-0 overflow-hidden">
            <div className="relative">
              {/* Kontrolki mapy */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-1 flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => {
                      const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
                      if (zoomInBtn) zoomInBtn.click();
                    }}
                    title="Przybliż"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => {
                      const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out');
                      if (zoomOutBtn) zoomOutBtn.click();
                    }}
                    title="Oddal"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <div className="h-px bg-slate-700 my-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={toggleFullscreen}
                    title={fullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
                  >
                    {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Komponent mapy */}
              <MapView
                trip={selectedTrip}
                showLiveTracking={showLiveTracking}
                showRoute={!!selectedTrip}
                showMarkers={showRouteMarkers}
                routeColor={selectedTrip ? getRouteColor(selectedTrip.vehicleId) : '#3b82f6'}
                provider={mapProvider}
                mapStyle={mapView}
                defaultZoom={mapSettings.defaultZoom}
                autoCenter={autoCenter}
                className="w-full"
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}