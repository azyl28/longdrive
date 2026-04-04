import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Navigation, Maximize2, Minimize2, ZoomIn, ZoomOut,
  Crosshair, Layers, Sun, Moon, Satellite, MapPin, Truck,
  UserCheck, Calendar, Clock, X, Plus, Eye, EyeOff,
  Mountain, Route, Activity, Compass, Search, Save,
  Trash2, ExternalLink, ChevronRight, Star, StarOff,
  AlertTriangle, CheckCircle, Loader2
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import MapView from "@/components/maps/MapView";
import GPSLiveTracker from "@/components/maps/GPSLiveTracker";
import api from "@/api/apiClient";
import { useAppSettings } from "@/lib/ThemeContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

// Klucz przechowywania zapisanych tras
const SAVED_ROUTES_KEY = "saved_map_routes";

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

  // Lokalizacja użytkownika
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Planowanie trasy
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [routeName, setRouteName] = useState("");
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [selectedSavedRoute, setSelectedSavedRoute] = useState(null);
  const [showRouteForm, setShowRouteForm] = useState(false);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.getVehicles,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: api.getDrivers,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: api.getTrips,
  });

  const [mapSettings, setMapSettings] = useState({
    provider: "osm",
    mapStyle: "road",
    defaultZoom: 12,
    autoCenter: true,
    showMarkers: true,
    showStops: true,
    showTraffic: false,
    saveHistory: true,
    historyRetention: "90",
    routeColors: {
      car: "#3b82f6",
      truck: "#ef4444",
      van: "#10b981",
      bus: "#8b5cf6",
      motorcycle: "#f59e0b",
    },
  });

  useEffect(() => {
    const savedMapSettings = localStorage.getItem("map_settings");
    if (savedMapSettings) {
      try {
        setMapSettings(JSON.parse(savedMapSettings));
      } catch (e) {}
    }
    // Wczytaj zapisane trasy
    const saved = localStorage.getItem(SAVED_ROUTES_KEY);
    if (saved) {
      try {
        setSavedRoutes(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const activeTrips = trips.filter((t) => t.status === "in_progress");

  const getVehicleName = (id) => {
    const vehicle = vehicles.find((v) => v.id === id);
    return vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : "Nieznany";
  };

  const getRouteColor = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return mapSettings.routeColors?.car || "#3b82f6";
    const type = vehicle.type?.toLowerCase();
    switch (type) {
      case "ciężarowe":
      case "truck":
        return mapSettings.routeColors?.truck || "#ef4444";
      case "dostawcze":
      case "van":
        return mapSettings.routeColors?.van || "#10b981";
      case "bus":
      case "autobus":
        return mapSettings.routeColors?.bus || "#8b5cf6";
      case "motocykl":
      case "motorcycle":
        return mapSettings.routeColors?.motorcycle || "#f59e0b";
      default:
        return mapSettings.routeColors?.car || "#3b82f6";
    }
  };

  const toggleFullscreen = () => {
    const mapContainer = document.querySelector(".map-container");
    if (!fullscreen) {
      if (mapContainer?.requestFullscreen) mapContainer.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Pobierz lokalizację użytkownika
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Twoja przeglądarka nie obsługuje geolokalizacji");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(loc);
        setLocationLoading(false);
        toast.success(
          `Lokalizacja pobrana! Dokładność: ${Math.round(loc.accuracy)} m`
        );
      },
      (err) => {
        setLocationLoading(false);
        const messages = {
          1: "Odmówiono dostępu do lokalizacji. Zezwól w ustawieniach przeglądarki.",
          2: "Nie można ustalić lokalizacji. Sprawdź GPS.",
          3: "Przekroczono czas oczekiwania na lokalizację.",
        };
        setLocationError(messages[err.code] || "Błąd lokalizacji");
        toast.error(messages[err.code] || "Błąd lokalizacji");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Otwórz trasę w Google Maps
  const openInGoogleMaps = (from, to) => {
    if (!from || !to) {
      toast.error("Podaj adres startowy i docelowy");
      return;
    }
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
    window.open(url, "_blank");
  };

  // Zapisz trasę
  const saveRoute = () => {
    if (!routeFrom || !routeTo) {
      toast.error("Podaj adres startowy i docelowy");
      return;
    }
    const newRoute = {
      id: Date.now().toString(),
      name: routeName || `${routeFrom} → ${routeTo}`,
      from: routeFrom,
      to: routeTo,
      savedAt: new Date().toISOString(),
    };
    const updated = [newRoute, ...savedRoutes];
    setSavedRoutes(updated);
    localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(updated));
    setRouteName("");
    setRouteFrom("");
    setRouteTo("");
    setShowRouteForm(false);
    toast.success("Trasa zapisana!");
  };

  // Usuń trasę
  const deleteRoute = (id) => {
    const updated = savedRoutes.filter((r) => r.id !== id);
    setSavedRoutes(updated);
    localStorage.setItem(SAVED_ROUTES_KEY, JSON.stringify(updated));
    if (selectedSavedRoute?.id === id) setSelectedSavedRoute(null);
    toast.success("Trasa usunięta");
  };

  // Wyświetl szczegóły trasy na mapie Google
  const viewRouteOnGoogle = (route) => {
    openInGoogleMaps(route.from, route.to);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapa tras"
        subtitle="Wizualizacja tras, śledzenie GPS i planowanie podróży"
        icon={Map}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel boczny */}
        <div
          className={`${showSidebar ? "lg:w-80" : "lg:w-12"} transition-all duration-300 flex-shrink-0`}
        >
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full bg-slate-800/50 border border-slate-700 p-1">
                    <TabsTrigger
                      value="live"
                      className="flex-1 data-[state=active]:bg-gradient-primary text-xs"
                    >
                      Na żywo
                    </TabsTrigger>
                    <TabsTrigger
                      value="route"
                      className="flex-1 data-[state=active]:bg-gradient-primary text-xs"
                    >
                      Trasy
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="flex-1 data-[state=active]:bg-gradient-primary text-xs"
                    >
                      Historia
                    </TabsTrigger>
                  </TabsList>

                  {/* Zakładka: Śledzenie na żywo */}
                  <TabsContent value="live" className="mt-3 space-y-4">
                    {/* Lokalizacja użytkownika */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <h4 className="text-theme-white text-sm font-semibold mb-2 flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-primary" />
                        Moja lokalizacja
                      </h4>
                      {locationError && (
                        <div className="flex items-start gap-2 mb-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-red-400 text-xs">{locationError}</p>
                        </div>
                      )}
                      {userLocation && !locationError && (
                        <div className="mb-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-xs font-medium">
                              Lokalizacja pobrana
                            </span>
                          </div>
                          <p className="text-xs text-theme-white-secondary mt-1">
                            {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                          </p>
                          <p className="text-xs text-theme-white-muted">
                            Dokładność: ~{Math.round(userLocation.accuracy)} m
                          </p>
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full bg-gradient-primary text-xs"
                        onClick={getUserLocation}
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Crosshair className="w-4 h-4 mr-1" />
                        )}
                        {locationLoading
                          ? "Pobieranie..."
                          : userLocation
                          ? "Odśwież lokalizację"
                          : "Pobierz moją lokalizację"}
                      </Button>
                    </div>

                    {/* GPS Live Tracker */}
                    <GPSLiveTracker
                      vehicle={
                        activeTrips[0]?.vehicleId
                          ? vehicles.find((v) => v.id === activeTrips[0].vehicleId)
                          : null
                      }
                      autoTrack={showLiveTracking}
                      highAccuracy={true}
                      onLocationUpdate={(pos) => {
                        if (pos) setUserLocation({ lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy || 0 });
                      }}
                    />

                    {/* Ustawienia śledzenia */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 space-y-3">
                      <h4 className="text-theme-white text-sm font-semibold">Ustawienia</h4>
                      {[
                        { label: "Śledzenie na żywo", state: showLiveTracking, set: setShowLiveTracking },
                        { label: "Znaczniki trasy", state: showRouteMarkers, set: setShowRouteMarkers },
                        { label: "Auto-centrowanie", state: autoCenter, set: setAutoCenter },
                      ].map(({ label, state, set }) => (
                        <div key={label} className="flex items-center justify-between">
                          <Label className="text-theme-white-secondary text-xs">{label}</Label>
                          <Switch checked={state} onCheckedChange={set} />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Zakładka: Trasy */}
                  <TabsContent value="route" className="mt-3 space-y-3">
                    {/* Planowanie nowej trasy */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-theme-white text-sm font-semibold flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-primary" />
                          Zaplanuj trasę
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs px-2 py-1 h-auto"
                          onClick={() => setShowRouteForm(!showRouteForm)}
                        >
                          {showRouteForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showRouteForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 mb-3">
                              <div>
                                <Label className="text-theme-white-secondary text-xs mb-1 block">
                                  Adres startowy
                                </Label>
                                <div className="relative">
                                  <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-green-400" />
                                  <Input
                                    value={routeFrom}
                                    onChange={(e) => setRouteFrom(e.target.value)}
                                    placeholder="np. Warszawa, ul. Marszałkowska 1"
                                    className="pl-7 bg-slate-900/50 border-slate-600 text-theme-white text-xs h-8"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-theme-white-secondary text-xs mb-1 block">
                                  Adres docelowy
                                </Label>
                                <div className="relative">
                                  <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-red-400" />
                                  <Input
                                    value={routeTo}
                                    onChange={(e) => setRouteTo(e.target.value)}
                                    placeholder="np. Kraków, ul. Floriańska 5"
                                    className="pl-7 bg-slate-900/50 border-slate-600 text-theme-white text-xs h-8"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-theme-white-secondary text-xs mb-1 block">
                                  Nazwa trasy (opcjonalne)
                                </Label>
                                <Input
                                  value={routeName}
                                  onChange={(e) => setRouteName(e.target.value)}
                                  placeholder="np. Trasa do klienta"
                                  className="bg-slate-900/50 border-slate-600 text-theme-white text-xs h-8"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-primary text-xs h-8"
                                onClick={() => openInGoogleMaps(routeFrom, routeTo)}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Google Maps
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-8"
                                onClick={saveRoute}
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Zapisz
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!showRouteForm && (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-primary text-xs"
                          onClick={() => setShowRouteForm(true)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Nowa trasa
                        </Button>
                      )}
                    </div>

                    {/* Zapisane trasy */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <h4 className="text-theme-white text-sm font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Zapisane trasy ({savedRoutes.length})
                      </h4>
                      {savedRoutes.length === 0 ? (
                        <div className="text-center py-4">
                          <Route className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-theme-white-muted text-xs">
                            Brak zapisanych tras
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {savedRoutes.map((route) => (
                            <div
                              key={route.id}
                              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                selectedSavedRoute?.id === route.id
                                  ? "border-primary bg-primary/10"
                                  : "border-slate-700 hover:border-slate-500 bg-slate-900/30"
                              }`}
                              onClick={() =>
                                setSelectedSavedRoute(
                                  selectedSavedRoute?.id === route.id ? null : route
                                )
                              }
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-theme-white text-xs font-medium truncate">
                                    {route.name}
                                  </p>
                                  <p className="text-theme-white-muted text-xs truncate">
                                    {route.from}
                                  </p>
                                  <p className="text-theme-white-muted text-xs truncate flex items-center gap-1">
                                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                    {route.to}
                                  </p>
                                  {route.savedAt && (
                                    <p className="text-theme-white-muted text-xs mt-1">
                                      {format(new Date(route.savedAt), "dd MMM yyyy", { locale: pl })}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-6 h-6 text-blue-400 hover:text-blue-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewRouteOnGoogle(route);
                                    }}
                                    title="Pokaż w Google Maps"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-6 h-6 text-red-400 hover:text-red-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRoute(route.id);
                                    }}
                                    title="Usuń trasę"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {/* Szczegóły wybranej trasy */}
                              <AnimatePresence>
                                {selectedSavedRoute?.id === route.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                      <Button
                                        size="sm"
                                        className="w-full bg-gradient-primary text-xs h-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          viewRouteOnGoogle(route);
                                        }}
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Otwórz trasę w Google Maps
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Zakładka: Historia */}
                  <TabsContent value="history" className="mt-3 space-y-3">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <h4 className="text-theme-white text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Historia tras
                      </h4>
                      {trips.length === 0 ? (
                        <p className="text-theme-white-muted text-xs text-center py-4">
                          Brak zarejestrowanych tras
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {[...trips]
                            .sort(
                              (a, b) =>
                                new Date(b.startDate || 0) - new Date(a.startDate || 0)
                            )
                            .slice(0, 20)
                            .map((trip) => (
                              <div
                                key={trip.id}
                                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                  selectedTrip?.id === trip.id
                                    ? "border-primary bg-primary/10"
                                    : "border-slate-700 hover:border-slate-500 bg-slate-900/30"
                                }`}
                                onClick={() =>
                                  setSelectedTrip(
                                    selectedTrip?.id === trip.id ? null : trip
                                  )
                                }
                              >
                                <p className="text-theme-white text-xs font-medium">
                                  {trip.startLocation || "Start"} →{" "}
                                  {trip.endLocation || "Cel"}
                                </p>
                                <p className="text-theme-white-muted text-xs">
                                  {getVehicleName(trip.vehicleId)}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <Badge
                                    className={`text-xs ${
                                      trip.status === "in_progress"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : trip.status === "completed"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-slate-500/20 text-slate-400"
                                    }`}
                                  >
                                    {trip.status === "in_progress"
                                      ? "W trakcie"
                                      : trip.status === "completed"
                                      ? "Zakończona"
                                      : "Anulowana"}
                                  </Badge>
                                  {trip.distance && (
                                    <span className="text-xs text-theme-white-muted">
                                      {trip.distance.toFixed(1)} km
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Mapa */}
        <div className="flex-1 min-w-0">
          <GlassCard className="p-0 overflow-hidden map-container">
            {/* Pasek narzędzi mapy */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                {!showSidebar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setShowSidebar(true)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <h3 className="text-theme-white font-semibold text-sm flex items-center gap-2">
                  <Map className="w-4 h-4 text-primary" />
                  {selectedTrip
                    ? `Trasa: ${selectedTrip.startLocation || "Start"} → ${selectedTrip.endLocation || "Cel"}`
                    : selectedSavedRoute
                    ? `Trasa: ${selectedSavedRoute.name}`
                    : "Mapa tras"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Styl mapy */}
                <div className="flex gap-1">
                  {[
                    { id: "road", icon: Map, title: "Mapa drogowa" },
                    { id: "satellite", icon: Satellite, title: "Satelita" },
                    { id: "terrain", icon: Mountain, title: "Teren" },
                  ].map(({ id, icon: Icon, title }) => (
                    <Button
                      key={id}
                      variant={mapView === id ? "default" : "ghost"}
                      size="icon"
                      className={`w-8 h-8 ${mapView === id ? "bg-gradient-primary" : ""}`}
                      onClick={() => setMapView(id)}
                      title={title}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>

                <div className="h-5 w-px bg-slate-700" />

                {/* Zoom i fullscreen */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => {
                      const btn = document.querySelector(".leaflet-control-zoom-in");
                      if (btn) btn.click();
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
                      const btn = document.querySelector(".leaflet-control-zoom-out");
                      if (btn) btn.click();
                    }}
                    title="Oddal"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={toggleFullscreen}
                    title={fullscreen ? "Zamknij pełny ekran" : "Pełny ekran"}
                  >
                    {fullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Informacja o zaznaczonej trasie */}
            {selectedSavedRoute && (
              <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="text-sm text-theme-white">
                    <span className="font-semibold">{selectedSavedRoute.from}</span>
                    <span className="text-theme-white-muted mx-2">→</span>
                    <span className="font-semibold">{selectedSavedRoute.to}</span>
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                  onClick={() => viewRouteOnGoogle(selectedSavedRoute)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Google Maps
                </Button>
              </div>
            )}

            {/* Komponent mapy */}
            <MapView
              trip={selectedTrip}
              showLiveTracking={showLiveTracking}
              showRoute={!!selectedTrip}
              showMarkers={showRouteMarkers}
              routeColor={
                selectedTrip
                  ? getRouteColor(selectedTrip.vehicleId)
                  : "#3b82f6"
              }
              provider={mapProvider}
              mapStyle={mapView}
              defaultZoom={mapSettings.defaultZoom}
              autoCenter={autoCenter}
              userLocation={userLocation}
              className="w-full"
            />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
