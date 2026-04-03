import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Truck, Users, Map, Calendar, Cloud, 
  Fuel, Wrench, TrendingUp, Activity, Plus, ArrowRight,
  Car, UserCheck, AlertTriangle, CheckCircle, Clock,
  Battery, Thermometer, Gauge, Route, Navigation, Eye
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WeatherWidget from "@/components/weather/WeatherWidget";
import CalendarWidget from "@/components/calendar/CalendarWidget";
import api from "@/api/apiClient";
import { useAppSettings } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { format, formatDistanceToNow, isToday, isThisWeek, isValid } from 'date-fns';
import { pl } from 'date-fns/locale';

// Typy serwisów
const serviceTypeLabels = {
  oil_change: 'Wymiana oleju',
  tires: 'Wymiana opon',
  brakes: 'Hamulce',
  repair: 'Naprawa',
  inspection: 'Przegląd',
  other: 'Inne',
};

// Statusy pojazdów
const statusColors = {
  available: 'text-green-400 bg-green-400/10',
  in_use: 'text-blue-400 bg-blue-400/10',
  maintenance: 'text-yellow-400 bg-yellow-400/10',
  unavailable: 'text-red-400 bg-red-400/10',
};

const statusLabels = {
  available: 'Dostępny',
  in_use: 'W użyciu',
  maintenance: 'Serwis',
  unavailable: 'Niedostępny',
};

// Statusy tras
const tripStatusColors = {
  in_progress: 'text-blue-400 bg-blue-400/10',
  completed: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

const tripStatusLabels = {
  in_progress: 'W trakcie',
  completed: 'Zakończona',
  cancelled: 'Anulowana',
};

// ✅ Funkcja pomocnicza do bezpiecznego formatowania daty
const safeFormatDistanceToNow = (date) => {
  if (!date) return 'data nieznana';
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) return 'nieprawidłowa data';
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: pl });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ POPRAWIENE zapytania - dodane .catch() dla bezpieczeństwa
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles().catch(() => []),
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.getDrivers().catch(() => []),
  });

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.getTrips().catch(() => []),
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices().catch(() => []),
  });

  // ✅ POPRAWIENE - dodane queryFn dla refuelings
  const { data: refuelings = [], isLoading: refuelingsLoading } = useQuery({
    queryKey: ['refuelings'],
    queryFn: () => api.getRefuels().catch(() => []),
  });

  const { data: companySettings = {} } = useQuery({
    queryKey: ['companySettings'],
    queryFn: () => api.getCompanySettings().catch(() => ({})),
  });

  // Pobierz ustawienia API dla pogody
  const [apiSettings, setApiSettings] = useState({
    openWeatherApiKey: '',
    collectApiKey: '',
  });

  // Wczytaj ustawienia z localStorage
  useEffect(() => {
    const savedApiSettings = localStorage.getItem('api_settings');
    if (savedApiSettings) {
      try {
        setApiSettings(JSON.parse(savedApiSettings));
      } catch (e) {}
    }
  }, []);

  // Statystyki
  const stats = useMemo(() => {
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const inUseVehicles = vehicles.filter(v => v.status === 'in_use').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const activeTrips = trips.filter(t => t.status === 'in_progress').length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const totalMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
    const totalServiceCost = services.reduce((sum, s) => sum + (s.cost || 0), 0);
    const totalFuelCost = refuelings.reduce((sum, r) => sum + (r.cost || 0), 0);
    const totalTrips = trips.length;

    return {
      availableVehicles,
      inUseVehicles,
      maintenanceVehicles,
      activeTrips,
      completedTrips,
      totalMileage,
      totalServiceCost,
      totalFuelCost,
      totalTrips,
    };
  }, [vehicles, trips, services, refuelings]);

  // Ostatnie trasy
  const recentTrips = useMemo(() => {
    return [...trips]
      .filter(trip => trip.startDate && isValid(new Date(trip.startDate))) // ✅ Filtruj nieprawidłowe daty
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5);
  }, [trips]);

  // Nadchodzące serwisy
  const upcomingServices = useMemo(() => {
    const now = new Date();
    return [...services]
      .filter(s => s.date && isValid(new Date(s.date)) && new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [services]);

  // Ostatnie tankowania
  const recentRefuelings = useMemo(() => {
    return [...refuelings]
      .filter(r => r.date && isValid(new Date(r.date)))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [refuelings]);

  // Pojazdy wymagające uwagi (niski stan paliwa)
  const lowFuelVehicles = useMemo(() => {
    return vehicles.filter(v => (v.fuelLevel || 0) < 20);
  }, [vehicles]);

  // Aktywne trasy
  const activeTripsList = useMemo(() => {
    return trips.filter(t => t.status === 'in_progress');
  }, [trips]);

  // Funkcje nawigacji
  const goToTrips = () => navigate('/trips');
  const goToVehicles = () => navigate('/vehicles');
  const goToServices = () => navigate('/services');
  const goToRefueling = () => navigate('/refueling');
  const goToMap = () => navigate('/map');
  const goToTripDetail = (tripId) => navigate(`/trips/${tripId}`);

  // Pobierz nazwę pojazdu
  const getVehicleName = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `${vehicle.name || vehicle.make || 'Pojazd'} ${vehicle.licensePlate || vehicle.registrationNumber || ''}`.trim() || 'Nieznany' : 'Nieznany';
  };

  // Pobierz nazwę kierowcy
  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) return 'Nieznany';
    return driver.name || `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Nieznany';
  };

  // Formatowanie daty
  const formatDate = (date) => {
    if (!date) return '---';
    const parsedDate = new Date(date);
    if (!isValid(parsedDate)) return '---';
    return format(parsedDate, 'dd MMM yyyy, HH:mm', { locale: pl });
  };

  // Formatowanie odległości
  const formatDistance = (km) => {
    if (!km && km !== 0) return '0 km';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  // Stan ładowania
  const isLoading = vehiclesLoading || driversLoading || tripsLoading || servicesLoading || refuelingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel główny"
        subtitle={`Witaj${user?.name ? `, ${user.name}` : ''}! Oto podsumowanie Twojej floty.`}
        icon={LayoutDashboard}
      />

      {/* Karty statystyk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pojazdy"
          value={vehicles.length}
          icon={Truck}
          trend={stats.availableVehicles}
          trendLabel="dostępnych"
          color="blue"
          onClick={goToVehicles}
        />
        <StatCard
          title="Kierowcy"
          value={drivers.length}
          icon={Users}
          trend={drivers.filter(d => d.status === 'active').length}
          trendLabel="aktywnych"
          color="green"
          onClick={() => navigate('/drivers')}
        />
        <StatCard
          title="Aktywne trasy"
          value={stats.activeTrips}
          icon={Route}
          trend={stats.completedTrips}
          trendLabel="zakończonych"
          color="purple"
          onClick={goToTrips}
        />
        <StatCard
          title="Przejechane km"
          value={formatDistance(stats.totalMileage)}
          icon={Activity}
          trend={stats.totalTrips}
          trendLabel="tras"
          color="orange"
        />
      </div>

      {/* Drugi rząd statystyk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Koszty serwisów"
          value={`${stats.totalServiceCost.toFixed(2)} zł`}
          icon={Wrench}
          trend={services.length}
          trendLabel="serwisów"
          color="yellow"
          onClick={goToServices}
        />
        <StatCard
          title="Koszty paliwa"
          value={`${stats.totalFuelCost.toFixed(2)} zł`}
          icon={Fuel}
          trend={refuelings.length}
          trendLabel="tankowań"
          color="cyan"
          onClick={goToRefueling}
        />
        <StatCard
          title="Pojazdy w serwisie"
          value={stats.maintenanceVehicles}
          icon={AlertTriangle}
          trend={stats.maintenanceVehicles}
          trendLabel="wymagają uwagi"
          color="red"
        />
      </div>

      {/* Widgety - Pogoda i Kalendarz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget pogody */}
        <WeatherWidget
          apiKey={apiSettings.openWeatherApiKey}
          showForecast={true}
          autoRefresh={true}
          className="lg:col-span-1"
        />

        {/* Widget kalendarza */}
        <CalendarWidget
          trips={trips}
          services={services}
          refuelings={refuelings}
          vehicles={vehicles}
          onEventClick={(event) => {
            if (event.type === 'trip') {
              goToTripDetail(event.details.id);
            } else if (event.type === 'service') {
              navigate('/services');
            } else if (event.type === 'refueling') {
              navigate('/refueling');
            }
          }}
          className="lg:col-span-1"
        />
      </div>

      {/* Tabs z dodatkowymi informacjami */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-primary">
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="active-trips" className="data-[state=active]:bg-gradient-primary">
            Aktywne trasy
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-gradient-primary">
            Nadchodzące serwisy
          </TabsTrigger>
          <TabsTrigger value="low-fuel" className="data-[state=active]:bg-gradient-primary">
            Niskie paliwo
          </TabsTrigger>
        </TabsList>

        {/* Zakładka: Przegląd */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ostatnie trasy */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-theme-white font-semibold flex items-center gap-2">
                  <Route className="w-5 h-5 text-primary" />
                  Ostatnie trasy
                </h3>
                <Button variant="ghost" size="sm" onClick={goToTrips}>
                  Wszystkie <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentTrips.length === 0 ? (
                  <div className="text-center py-8 text-theme-white-muted">
                    Brak tras do wyświetlenia
                  </div>
                ) : (
                  recentTrips.map((trip) => (
                    <motion.div
                      key={trip.id}
                      whileHover={{ x: 4 }}
                      onClick={() => goToTripDetail(trip.id)}
                      className="p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={tripStatusColors[trip.status] || 'bg-slate-500'}>
                            {tripStatusLabels[trip.status] || trip.status}
                          </Badge>
                          <span className="text-xs text-theme-white-muted">
                            {formatDate(trip.startDate)}
                          </span>
                        </div>
                        <span className="text-xs text-theme-white-muted">
                          {trip.distance ? formatDistance(trip.distance) : '---'}
                        </span>
                      </div>
                      <p className="text-theme-white text-sm">
                        {trip.startLocation || 'Brak startu'} → {trip.endLocation || 'w trakcie'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-theme-white-muted">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {getVehicleName(trip.vehicleId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {getDriverName(trip.driverId)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>

            {/* Ostatnie tankowania */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-theme-white font-semibold flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-primary" />
                  Ostatnie tankowania
                </h3>
                <Button variant="ghost" size="sm" onClick={goToRefueling}>
                  Wszystkie <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentRefuelings.length === 0 ? (
                  <div className="text-center py-8 text-theme-white-muted">
                    Brak tankowań do wyświetlenia
                  </div>
                ) : (
                  recentRefuelings.map((refueling) => (
                    <div
                      key={refueling.id}
                      className="p-3 rounded-lg bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-theme-white font-medium">
                            {getVehicleName(refueling.vehicleId)}
                          </p>
                          <p className="text-xs text-theme-white-muted mt-1">
                            {formatDate(refueling.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-theme-white font-bold">
                            {refueling.liters} L
                          </p>
                          <p className="text-xs text-theme-white-muted">
                            {refueling.cost?.toFixed(2)} zł
                          </p>
                        </div>
                      </div>
                      {refueling.price && (
                        <div className="mt-2 text-xs text-theme-white-muted">
                          Cena: {refueling.price.toFixed(2)} zł/L
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* Zakładka: Aktywne trasy */}
        <TabsContent value="active-trips" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-theme-white font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                Aktywne trasy ({activeTripsList.length})
              </h3>
              <div className="flex gap-2">
                <Button onClick={goToMap} variant="outline">
                  <Map className="w-4 h-4 mr-2" />
                  Mapa tras
                </Button>
                <Button onClick={goToTrips} className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Nowa trasa
                </Button>
              </div>
            </div>

            {activeTripsList.length === 0 ? (
              <div className="text-center py-12">
                <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-theme-white-muted">Brak aktywnych tras</p>
                <Button onClick={goToTrips} className="mt-4">
                  Rozpocznij nową trasę
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTripsList.map((trip) => {
                  const startTime = trip.startDate ? new Date(trip.startDate) : null;
                  // ✅ Użyj bezpiecznej funkcji zamiast bezpośredniego formatDistanceToNow
                  const duration = startTime && isValid(startTime) 
                    ? formatDistanceToNow(startTime, { addSuffix: true, locale: pl })
                    : 'przed chwilą';
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  
                  return (
                    <motion.div
                      key={trip.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              W trakcie
                            </Badge>
                            <span className="text-xs text-theme-white-muted">
                              Rozpoczęto {duration}
                            </span>
                          </div>
                          <p className="text-theme-white font-medium">
                            {trip.startLocation || 'Brak lokalizacji startowej'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-theme-white-muted">
                              <Truck className="w-4 h-4" />
                              {vehicle ? `${vehicle.name || vehicle.make || 'Pojazd'} ${vehicle.licensePlate || vehicle.registrationNumber || ''}`.trim() || 'Nieznany' : 'Nieznany'}
                            </span>
                            <span className="flex items-center gap-1 text-theme-white-muted">
                              <UserCheck className="w-4 h-4" />
                              {getDriverName(trip.driverId)}
                            </span>
                            <span className="flex items-center gap-1 text-theme-white-muted">
                              <Gauge className="w-4 h-4" />
                              {trip.startOdometer || 0} km
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => goToTripDetail(trip.id)}
                          className="bg-gradient-primary"
                        >
                          Zakończ trasę
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Zakładka: Nadchodzące serwisy */}
        <TabsContent value="services" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-theme-white font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Nadchodzące serwisy
              </h3>
              <Button variant="ghost" size="sm" onClick={goToServices}>
                Wszystkie <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {upcomingServices.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-theme-white-muted">Brak planowanych serwisów</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingServices.map((service) => {
                  const serviceDate = service.date ? new Date(service.date) : null;
                  const isTodayDate = serviceDate && isValid(serviceDate) ? isToday(serviceDate) : false;
                  const isThisWeekDate = serviceDate && isValid(serviceDate) ? isThisWeek(serviceDate) : false;
                  const daysLeft = serviceDate && isValid(serviceDate) ? Math.ceil((serviceDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  return (
                    <div
                      key={service.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={isTodayDate ? 'bg-red-500/20 text-red-400' : isThisWeekDate ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}>
                          {isTodayDate ? 'Dzisiaj' : isThisWeekDate ? `Za ${daysLeft} dni` : serviceDate && isValid(serviceDate) ? format(serviceDate, 'dd MMM', { locale: pl }) : 'Brak daty'}
                        </Badge>
                        <span className="text-sm font-bold text-theme-white">
                          {service.cost?.toFixed(2)} zł
                        </span>
                      </div>
                      <p className="text-theme-white font-medium">
                        {getVehicleName(service.vehicleId)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-theme-white-muted">
                          {serviceTypeLabels[service.type] || service.type}
                        </span>
                        {service.mileage && (
                          <span className="text-xs text-theme-white-muted">
                            Przebieg: {formatDistance(service.mileage)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Zakładka: Pojazdy z niskim paliwem */}
        <TabsContent value="low-fuel" className="mt-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-theme-white font-semibold flex items-center gap-2">
                <Battery className="w-5 h-5 text-yellow-400" />
                Pojazdy z niskim poziomem paliwa
              </h3>
              <Button variant="ghost" size="sm" onClick={goToVehicles}>
                Wszystkie <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {lowFuelVehicles.length === 0 ? (
              <div className="text-center py-12">
                <Fuel className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-theme-white-muted">Wszystkie pojazdy mają wystarczającą ilość paliwa</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowFuelVehicles.map((vehicle) => {
                  const fuelPercent = ((vehicle.fuelLevel || 0) / (vehicle.tankCapacity || 60)) * 100;
                  const getFuelColor = () => {
                    if (fuelPercent < 10) return 'bg-red-500';
                    if (fuelPercent < 20) return 'bg-yellow-500';
                    return 'bg-green-500';
                  };

                  return (
                    <div
                      key={vehicle.id}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-theme-white font-medium">
                            {vehicle.name || vehicle.make || 'Pojazd'}
                          </p>
                          <p className="text-xs text-theme-white-muted">
                            {vehicle.licensePlate || vehicle.registrationNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-theme-white font-bold">
                            {vehicle.fuelLevel || 0} L
                          </p>
                          <p className="text-xs text-theme-white-muted">
                            / {vehicle.tankCapacity || 60} L
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-theme-white-muted mb-1">
                          <span>Poziom paliwa</span>
                          <span>{Math.round(Math.min(100, fuelPercent))}%</span>
                        </div>
                        <Progress
                          value={Math.min(100, fuelPercent)}
                          className={`h-2 ${getFuelColor()}`}
                        />
                      </div>
                      {vehicle.fuelConsumption && (
                        <div className="mt-2 text-xs text-theme-white-muted">
                          Średnie spalanie: {vehicle.fuelConsumption} L/100km
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}