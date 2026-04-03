import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Settings,
  Building2,
  Palette,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Check,
  Download,
  Upload,
  Trash2,
  Type,
  Image,
  Key,
  Lock,
  Unlock,
  Activity,
  Timer,
  Zap,
  Wind,
  Sparkles,
  MoveRight,
  MoveLeft,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Shield,
  Map,
  Navigation,
  Globe,
  Database,
  BugPlay,
  Plug,
  CloudRain,
  Fuel,
  Cog,
  Satellite,
  Compass,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSettings } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from "sonner";
import api from "@/api/apiClient";

// Konfiguracja motywów (kolory przycisków)
const themes = [
  { id: 'dark', name: 'Fioletowy (ciemny)', colors: ['#6366f1', '#8B1538'] },
  { id: 'blue', name: 'Niebieski', colors: ['#2563eb', '#0891b2'] },
  { id: 'purple', name: 'Fioletowy (jasny)', colors: ['#7c3aed', '#c026d3'] },
  { id: 'green', name: 'Zielony', colors: ['#059669', '#b45309'] },
  { id: 'rose', name: 'Różowy (intensywny)', colors: ['#e11d48', '#f43f5e'] },
  { id: 'amber', name: 'Złoty', colors: ['#f59e0b', '#fbbf24'] },
  { id: 'cyan', name: 'Cyjan', colors: ['#06b6d4', '#22d3ee'] },
  { id: 'orange', name: 'Pomarańczowy', colors: ['#f97316', '#fb923c'] },
  { id: 'pink', name: 'Różowy (pastelowy)', colors: ['#ec4899', '#f472b6'] },
  { id: 'lime', name: 'Jasnozielony', colors: ['#84cc16', '#a3e635'] },
  { id: 'sky', name: 'Jasnoniebieski', colors: ['#38bdf8', '#7dd3fc'] },
];

// Konfiguracja teł
const backgrounds = [
  { id: 'gradient1', name: 'Ciemny gradient', class: 'bg-app-gradient1' },
  { id: 'gradient2', name: 'Granatowy gradient', class: 'bg-app-gradient2' },
  { id: 'gradient3', name: 'Fioletowy gradient', class: 'bg-app-gradient3' },
  { id: 'gradient4', name: 'Zielony gradient', class: 'bg-app-gradient4' },
  { id: 'gradient5', name: 'Bordowy gradient', class: 'bg-app-gradient5' },
  { id: 'gradient6', name: 'Fioletowo-niebieski', class: 'bg-app-gradient6' },
  { id: 'gradient7', name: 'Szary gradient', class: 'bg-app-gradient7' },
  { id: 'gradient8', name: 'Ciemnoniebieski', class: 'bg-app-gradient8' },
  { id: 'gradient9', name: 'Grafitowy gradient', class: 'bg-app-gradient9' },
  { id: 'gradient10', name: 'Nocny gradient', class: 'bg-app-gradient10' },
  { id: 'gradient11', name: 'Fioletowo-grafitowy', class: 'bg-app-gradient11' },
  { id: 'gradient12', name: 'Morski gradient (ciemny)', class: 'bg-app-gradient12' },
  { id: 'gradient13', name: 'Purpurowy gradient', class: 'bg-app-gradient13' },
  { id: 'gradient14', name: 'Morski gradient (jasny)', class: 'bg-app-gradient14' },
  { id: 'gradient15', name: 'Oliwkowy gradient', class: 'bg-app-gradient15' },
  { id: 'solid1', name: 'Ciemny (jednolity)', class: 'bg-app-solid1' },
  { id: 'solid2', name: 'Ciemnoszary', class: 'bg-app-solid2' },
  { id: 'solid3', name: 'Czarny', class: 'bg-app-solid3' },
  { id: 'solid4', name: 'Ciemnoniebieski', class: 'bg-app-solid4' },
  { id: 'solid5', name: 'Grafitowy', class: 'bg-app-solid5' },
  { id: 'solid6', name: 'Antracytowy', class: 'bg-app-solid6' },
  { id: 'solid7', name: 'Fioletowo-szary', class: 'bg-app-solid7' },
  { id: 'solid8', name: 'Ciemnofioletowy', class: 'bg-app-solid8' },
  { id: 'solid9', name: 'Niebiesko-szary', class: 'bg-app-solid9' },
  { id: 'solid10', name: 'Ciemnomorski (głęboki)', class: 'bg-app-solid10' },
  { id: 'solid11', name: 'Ciemnopurpurowy', class: 'bg-app-solid11' },
  { id: 'solid12', name: 'Ciemnomorski (jasny)', class: 'bg-app-solid12' },
  { id: 'solid13', name: 'Ciemnooliwkowy', class: 'bg-app-solid13' },
  { id: 'solid14', name: 'Ciemnobrązowy', class: 'bg-app-solid14' },
  { id: 'solid15', name: 'Ciemnozielony', class: 'bg-app-solid15' },
];

// Konfiguracja kolorów tekstu
const textColors = [
  { id: 'white', name: 'Biały', class: 'text-theme-white', secondary: 'text-theme-white-secondary', muted: 'text-theme-white-muted' },
  { id: 'blue', name: 'Niebieski', class: 'text-theme-blue', secondary: 'text-theme-blue-secondary', muted: 'text-theme-blue-muted' },
  { id: 'purple', name: 'Fioletowy', class: 'text-theme-purple', secondary: 'text-theme-purple-secondary', muted: 'text-theme-purple-muted' },
  { id: 'green', name: 'Zielony', class: 'text-theme-green', secondary: 'text-theme-green-secondary', muted: 'text-theme-green-muted' },
  { id: 'amber', name: 'Złoty', class: 'text-theme-amber', secondary: 'text-theme-amber-secondary', muted: 'text-theme-amber-muted' },
  { id: 'rose', name: 'Różowy (ciepły)', class: 'text-theme-rose', secondary: 'text-theme-rose-secondary', muted: 'text-theme-rose-muted' },
  { id: 'cyan', name: 'Cyjan', class: 'text-theme-cyan', secondary: 'text-theme-cyan-secondary', muted: 'text-theme-cyan-muted' },
  { id: 'orange', name: 'Pomarańczowy', class: 'text-theme-orange', secondary: 'text-theme-orange-secondary', muted: 'text-theme-orange-muted' },
  { id: 'pink', name: 'Różowy (chłodny)', class: 'text-theme-pink', secondary: 'text-theme-pink-secondary', muted: 'text-theme-pink-muted' },
  { id: 'lime', name: 'Limonkowy', class: 'text-theme-lime', secondary: 'text-theme-lime-secondary', muted: 'text-theme-lime-muted' },
  { id: 'sky', name: 'Jasnoniebieski', class: 'text-theme-sky', secondary: 'text-theme-sky-secondary', muted: 'text-theme-sky-muted' },
];

// Konfiguracja typów animacji
const animationTypes = [
  { id: 'fade', name: 'Przenikanie', icon: Sparkles, description: 'Delikatne pojawianie się i znikanie' },
  { id: 'slide', name: 'Przesuwanie', icon: MoveRight, description: 'Elementy wsuwają się z boku' },
  { id: 'scale', name: 'Skalowanie', icon: Zap, description: 'Elementy powiększają się przy wejściu' },
  { id: 'rotate', name: 'Obrót', icon: Wind, description: 'Elementy obracają się przy wejściu' },
  { id: 'bounce', name: 'Odbicie', icon: Activity, description: 'Lekkie odbicie przy wejściu' },
  { id: 'zoomRotate', name: 'Obrót + Zoom', icon: RefreshCw, description: 'Obracanie i powiększanie' },
  { id: 'flip', name: 'Przewracanie 3D', icon: Eye, description: 'Efekt przewracania strony' },
  { id: 'swing', name: 'Wahadło', icon: MoveLeft, description: 'Ruch wahadłowy' },
  { id: 'elastic', name: 'Sprężyste', icon: Sparkles, description: 'Sprężyste wejście' },
  { id: 'blur', name: 'Rozmycie', icon: EyeOff, description: 'Pojawianie się z rozmycia' },
  { id: 'none', name: 'Brak', icon: MoveLeft, description: 'Wyłącz wszystkie animacje' },
];

export default function SettingsPage() {
  const { settings, saveSettings, loading } = useAppSettings();
  const { user: authUser, token, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const fileInputRef = useRef(null);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    nip: '',
    regon: '',
    phone: '',
    email: '',
    cardPrefix: 'KD',
    cardCounter: 1,
  });
  
  const [localSettings, setLocalSettings] = useState({
    theme: 'dark',
    backgroundColor: 'bg-app-gradient1',
    textColor: 'white',
    requireKeyForTrip: false,
    animationType: 'fade',
    animationSpeed: 0.3,
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  // Stany dla nowych funkcji
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [modulesSettings, setModulesSettings] = useState({
    maps: true,
    fuelPrices: true,
    weather: false,
    gpsTracking: false,
    debugLogs: false,
    requireKeyForTrip: localSettings.requireKeyForTrip
  });

  const [locationSettings, setLocationSettings] = useState({
    gpsEnabled: false,
    googleMapsApiKey: '',
    trackingInterval: 10,
    highAccuracy: true,
    snapToRoad: false,
    autoStartTracking: false
  });

  const [apiSettings, setApiSettings] = useState({
    collectApiKey: 'apikey 3DVClldFLIRO4LSaryQwFw:6bNkoLjBB56fEpMEx66nzr',
    openWeatherApiKey: '',
    googleMapsApiKey: '',
    apiStatus: {
      collectApi: 'unknown',
      weatherApi: 'unknown',
      mapsApi: 'unknown'
    }
  });

  const [debugEnabled, setDebugEnabled] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all');

  const queryClient = useQueryClient();
  const initialized = useRef(false);

  // Pobranie danych firmy z backendu (przez api)
  const { data: companySettings = [] } = useQuery({
    queryKey: ['companySettings'],
    queryFn: api.getCompanySettings,
    refetchOnMount: true
  });

  // Wczytaj zapisane ustawienia z localStorage
  useEffect(() => {
    const savedModules = localStorage.getItem('modules_settings');
    if (savedModules) {
      try {
        const parsed = JSON.parse(savedModules);
        setModulesSettings(parsed);
        if (parsed.requireKeyForTrip !== undefined) {
          setLocalSettings(prev => ({ ...prev, requireKeyForTrip: parsed.requireKeyForTrip }));
        }
      } catch (e) {}
    }
    const savedLocation = localStorage.getItem('location_settings');
    if (savedLocation) {
      try {
        setLocationSettings(JSON.parse(savedLocation));
      } catch (e) {}
    }
    const savedApi = localStorage.getItem('api_settings');
    if (savedApi) {
      try {
        setApiSettings(prev => ({ ...prev, ...JSON.parse(savedApi) }));
      } catch (e) {}
    }
    const savedDebug = localStorage.getItem('debug_enabled');
    if (savedDebug) {
      setDebugEnabled(savedDebug === 'true');
    }
  }, []);

  // Inicjalizacja danych firmy
  useEffect(() => {
    if (companySettings && !Array.isArray(companySettings) && !initialized.current) {
      const cs = companySettings;
      setCompanyData({
        name: cs.name || '',
        address: cs.address || '',
        zipCode: cs.zipCode || '',
        city: cs.city || '',
        nip: cs.nip || '',
        regon: cs.regon || '',
        phone: cs.phone || '',
        email: cs.email || '',
        cardPrefix: cs.cardPrefix || 'KD',
        cardCounter: cs.cardCounter || 1,
      });
      initialized.current = true;
    } else if (Array.isArray(companySettings) && companySettings.length > 0 && !initialized.current) {
      const cs = companySettings[0];
      setCompanyData({
        name: cs.name || '',
        address: cs.address || '',
        zipCode: cs.zipCode || '',
        city: cs.city || '',
        nip: cs.nip || '',
        regon: cs.regon || '',
        phone: cs.phone || '',
        email: cs.email || '',
        cardPrefix: cs.cardPrefix || 'KD',
        cardCounter: cs.cardCounter || 1,
      });
      initialized.current = true;
    }
  }, [companySettings]);

  // Inicjalizacja ustawień aplikacji z kontekstu
  useEffect(() => {
    setLocalSettings({
      theme: settings.theme,
      backgroundColor: settings.backgroundColor,
      textColor: settings.textColor,
      requireKeyForTrip: settings.requireKeyForTrip,
      animationType: settings.animationType,
      animationSpeed: settings.animationSpeed,
    });
  }, [settings]);

  // Ustawienie danych profilu z kontekstu
  useEffect(() => {
    if (authUser) {
      setProfileData({
        full_name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || ''
      });
    }
  }, [authUser]);

  // Mutacja zapisu danych firmy
  const saveCompanyMutation = useMutation({
    mutationFn: async (data) => {
      return api.updateCompanySettings(data);
    },
    onSuccess: (savedData) => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      if (savedData) {
        setCompanyData(prev => ({ ...prev, ...savedData }));
      }
      toast.success('Dane firmy zostały zapisane');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    },
    onError: (error) => {
      toast.error('Błąd podczas zapisu danych firmy: ' + error.message);
    }
  });

  // Mutacja zapisu profilu
  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.full_name,
          email: data.email,
          phone: data.phone,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd aktualizacji profilu');
      }
      return response.json();
    },
    onSuccess: (updatedUser) => {
      updateUser({ name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone });
      toast.success('Profil zaktualizowany pomyślnie');
      setIsEditingProfile(false);
    },
    onError: (error) => {
      toast.error('Błąd: ' + error.message);
    }
  });

  // Funkcje pomocnicze
  const saveModulesSettings = () => {
    localStorage.setItem('modules_settings', JSON.stringify(modulesSettings));
    setLocalSettings(prev => ({ ...prev, requireKeyForTrip: modulesSettings.requireKeyForTrip }));
    toast.success('Ustawienia modułów zapisane');
    setTimeout(() => window.location.reload(), 1000);
  };

  const saveLocationSettings = () => {
    localStorage.setItem('location_settings', JSON.stringify(locationSettings));
    toast.success('Ustawienia lokalizacji zapisane');
  };

  const saveApiSettings = () => {
    localStorage.setItem('api_settings', JSON.stringify(apiSettings));
    toast.success('Ustawienia API zapisane');
    testApiConnections();
  };

  const testApiConnections = async () => {
    setApiSettings(prev => ({
      ...prev,
      apiStatus: { ...prev.apiStatus, collectApi: 'testing', weatherApi: 'testing', mapsApi: 'testing' }
    }));
    
    try {
      const response = await fetch("https://api.collectapi.com/gasPrice/europeanCountries", {
        headers: { "authorization": apiSettings.collectApiKey }
      });
      setApiSettings(prev => ({
        ...prev,
        apiStatus: { ...prev.apiStatus, collectApi: response.ok ? 'online' : 'error' }
      }));
    } catch (e) {
      setApiSettings(prev => ({ ...prev, apiStatus: { ...prev.apiStatus, collectApi: 'error' } }));
    }
    
    toast.info('Test połączeń API zakończony');
  };

  const toggleDebug = (enabled) => {
    setDebugEnabled(enabled);
    localStorage.setItem('debug_enabled', enabled);
    import('@/lib/logger').then(({ logger }) => {
      if (enabled) {
        logger.enable();
        toast.success('Tryb debugowania WŁĄCZONY');
        refreshLogs();
      } else {
        logger.disable();
        toast.info('Tryb debugowania WYŁĄCZONY');
      }
    });
  };

  const refreshLogs = async () => {
    const { logger } = await import('@/lib/logger');
    setLogs(logger.getLogs());
  };

  const downloadLogs = async () => {
    const { logger } = await import('@/lib/logger');
    const exportData = logger.export();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logi pobrane');
  };

  const clearLogs = async () => {
    if (confirm('Czy na pewno wyczyścić wszystkie logi?')) {
      const { logger } = await import('@/lib/logger');
      logger.clear();
      refreshLogs();
      toast.success('Logi wyczyszczone');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Nowe hasła nie są identyczne');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    
    setChangingPassword(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Błąd zmiany hasła');
      }
      
      toast.success('Hasło zostało zmienione');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetPasswordRequest = async () => {
    if (!authUser?.email) {
      toast.error('Brak adresu email');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authUser.email }),
      });
      
      if (response.ok) {
        toast.success('Link do resetowania hasła został wysłany na email');
      } else {
        throw new Error('Błąd wysyłki');
      }
    } catch (error) {
      toast.error('Nie udało się wysłać linku resetującego');
    }
  };

  const filteredLogs = logFilter === 'all' ? logs : logs.filter(log => log.type === logFilter);

  // Funkcja eksportu backupu
  const handleExportBackup = async () => {
    try {
      toast.loading('Tworzenie backupu...');
      
      const [vehicles, drivers, trips, services, companySettingsData] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
        api.getTrips(),
        api.getServices(),
        api.getCompanySettings(),
        api.getKeyLogs ? api.getKeyLogs() : []
      ]);
      
      const allData = {
        vehicles,
        drivers,
        trips,
        services,
        companySettings: Array.isArray(companySettingsData) ? companySettingsData : [companySettingsData],
        keyLogs: [],
        modulesSettings,
        locationSettings,
        apiSettings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `longdrive-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss', { locale: pl })}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Backup utworzony pomyślnie');
    } catch (error) {
      toast.dismiss();
      toast.error('Błąd podczas tworzenia backupu: ' + error.message);
    }
  };

  // Funkcja importu backupu
  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        if (!backupData.vehicles || !backupData.drivers || !backupData.trips || !backupData.services) {
          toast.error('Nieprawidłowy plik backupu');
          return;
        }

        if (!window.confirm('Czy na pewno chcesz przywrócić dane z backupu? Istniejące dane zostaną nadpisane!')) {
          return;
        }

        setIsRestoring(true);
        toast.loading('Przywracanie danych...');

        const existingVehicles = await api.getVehicles();
        const existingDrivers = await api.getDrivers();
        const existingTrips = await api.getTrips();
        const existingServices = await api.getServices();

        for (const v of existingVehicles) await api.deleteVehicle(v.id);
        for (const d of existingDrivers) await api.deleteDriver(d.id);
        for (const t of existingTrips) await api.deleteTrip(t.id);
        for (const s of existingServices) await api.deleteService(s.id);

        for (const v of backupData.vehicles) await api.createVehicle(v);
        for (const d of backupData.drivers) await api.createDriver(d);
        for (const t of backupData.trips) await api.createTrip(t);
        for (const s of backupData.services) await api.createService(s);

        if (backupData.companySettings && backupData.companySettings.length > 0) {
          const existingSettings = await api.getCompanySettings();
          if (existingSettings && (Array.isArray(existingSettings) ? existingSettings.length > 0 : existingSettings)) {
            const id = Array.isArray(existingSettings) ? existingSettings[0].id : existingSettings.id;
            await api.updateCompanySettings({ id, ...backupData.companySettings[0] });
          } else {
            await api.updateCompanySettings(backupData.companySettings[0]);
          }
        }
        
        if (backupData.modulesSettings) {
          localStorage.setItem('modules_settings', JSON.stringify(backupData.modulesSettings));
          setModulesSettings(backupData.modulesSettings);
        }
        if (backupData.locationSettings) {
          localStorage.setItem('location_settings', JSON.stringify(backupData.locationSettings));
          setLocationSettings(backupData.locationSettings);
        }
        if (backupData.apiSettings) {
          localStorage.setItem('api_settings', JSON.stringify(backupData.apiSettings));
          setApiSettings(backupData.apiSettings);
        }

        toast.dismiss();
        toast.success('Dane przywrócone pomyślnie');
        queryClient.invalidateQueries();
        setIsRestoring(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        toast.dismiss();
        toast.error('Błąd podczas przywracania danych: ' + error.message);
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Funkcja resetu
  const handleReset = async () => {
    if (!window.confirm('CZY NA PEWNO chcesz usunąć WSZYSTKIE dane? Ta operacja jest nieodwracalna!')) return;
    if (!window.confirm('Ostatnie ostrzeżenie! Wszystkie pojazdy, kierowcy, trasy i serwisy zostaną usunięte. Kontynuować?')) return;

    try {
      toast.loading('Usuwanie danych...');
      
      const [vehicles, drivers, trips, services] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
        api.getTrips(),
        api.getServices()
      ]);
      
      for (const v of vehicles) await api.deleteVehicle(v.id);
      for (const d of drivers) await api.deleteDriver(d.id);
      for (const t of trips) await api.deleteTrip(t.id);
      for (const s of services) await api.deleteService(s.id);
      
      queryClient.invalidateQueries();
      toast.dismiss();
      toast.success('Wszystkie dane zostały usunięte');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.dismiss();
      toast.error('Błąd podczas usuwania danych: ' + error.message);
    }
  };

  // Główna funkcja zapisu
  const handleSave = async () => {
    try {
      if (activeTab === 'company') {
        saveCompanyMutation.mutate(companyData);
      } else if (activeTab === 'profile') {
        if (isEditingProfile) {
          saveProfileMutation.mutate(profileData);
        }
      } else if (activeTab === 'modules') {
        saveModulesSettings();
      } else if (activeTab === 'location') {
        saveLocationSettings();
      } else if (activeTab === 'api') {
        saveApiSettings();
      } else if (activeTab === 'appearance') {
        await saveSettings({ ...localSettings });
        toast.success('Ustawienia wyglądu zostały zapisane');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else if (activeTab === 'animations') {
        await saveSettings({ ...localSettings });
        toast.success('Ustawienia animacji zostały zapisane');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Błąd podczas zapisu:', error);
      toast.error('Błąd podczas zapisu: ' + error.message);
    }
  };

  const tabs = [
    { id: 'company', label: 'Firma', icon: Building2 },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'modules', label: 'Moduły', icon: Cog },
    { id: 'location', label: 'Lokalizacja', icon: Navigation },
    { id: 'api', label: 'API & Integracje', icon: Plug },
    { id: 'debug', label: 'Debug & Logi', icon: BugPlay },
    { id: 'appearance', label: 'Wygląd', icon: Palette },
    { id: 'animations', label: 'Animacje', icon: Activity },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ustawienia"
        subtitle="Konfiguracja aplikacji, modułów i integracji"
        icon={Settings}
      />

      {/* Zakładki */}
      <div className="bg-slate-800/50 border border-slate-700 p-1 rounded-lg flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all z-10 overflow-hidden"
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-gradient-primary rounded-md -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className={`flex items-center justify-center gap-2 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {/* FIRMA */}
        {activeTab === 'company' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Dane firmy</h2>
                <p className="text-sm text-theme-white-secondary">Informacje widoczne na dokumentach</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">Nazwa firmy *</Label>
                <Input
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-theme-white"
                  placeholder="Twoja Firma Sp. z o.o."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">NIP</Label>
                <Input
                  value={companyData.nip}
                  onChange={(e) => setCompanyData({...companyData, nip: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-theme-white"
                  placeholder="123-456-78-90"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">Adres (ulica + nr)</Label>
                <Input
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-theme-white"
                  placeholder="ul. Główna 123"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">REGON</Label>
                <Input
                  value={companyData.regon}
                  onChange={(e) => setCompanyData({...companyData, regon: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-theme-white"
                  placeholder="123456789"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Kod pocztowy</Label>
                  <Input
                    value={companyData.zipCode}
                    onChange={(e) => setCompanyData({...companyData, zipCode: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-theme-white"
                    placeholder="00-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Miasto</Label>
                  <Input
                    value={companyData.city}
                    onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-theme-white"
                    placeholder="Warszawa"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">Telefon</Label>
                <Input
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-theme-white"
                  placeholder="+48 22 123 45 67"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-theme-white-secondary">Email</Label>
                <Input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-theme-white"
                  placeholder="biuro@firma.pl"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mt-6">
              <h3 className="text-theme-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Numeracja kart drogowych
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Prefiks numeru karty</Label>
                  <Input
                    value={companyData.cardPrefix}
                    onChange={(e) => setCompanyData({...companyData, cardPrefix: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-theme-white font-mono"
                    placeholder="np. KD"
                    maxLength="5"
                  />
                  <p className="text-xs text-theme-white-muted">Skrót przed numerem (np. KD, SM, KW)</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Numer początkowy</Label>
                  <Input
                    type="number"
                    min="1"
                    value={companyData.cardCounter}
                    onChange={(e) => setCompanyData({...companyData, cardCounter: parseInt(e.target.value) || 1})}
                    className="bg-slate-800 border-slate-700 text-theme-white"
                  />
                  <p className="text-xs text-theme-white-muted">Od jakiego numeru zacząć liczyć</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm text-primary">
                  <span className="font-bold">Przykład:</span> {companyData.cardPrefix}-{companyData.cardCounter} → następny będzie {companyData.cardPrefix}-{companyData.cardCounter + 1}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={loading || saveCompanyMutation.isPending} className="bg-gradient-primary">
                {saveSuccess ? <><Check className="w-4 h-4 mr-2" />Zapisano!</> : <><Save className="w-4 h-4 mr-2" />Zapisz zmiany</>}
              </Button>
            </div>
          </GlassCard>
        )}

        {/* PROFIL */}
        {activeTab === 'profile' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-theme-white">Profil użytkownika</h2>
                  <p className="text-sm text-theme-white-secondary">Zarządzaj swoimi danymi</p>
                </div>
              </div>
              {!isEditingProfile ? (
                <Button onClick={() => setIsEditingProfile(true)} className="bg-gradient-primary">Edytuj profil</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => { setIsEditingProfile(false); setProfileData({ full_name: authUser?.name || '', email: authUser?.email || '', phone: authUser?.phone || '' }); }} variant="outline">Anuluj</Button>
                  <Button onClick={() => saveProfileMutation.mutate(profileData)} disabled={saveProfileMutation.isPending}>{saveProfileMutation.isPending ? 'Zapisywanie...' : 'Zapisz'}</Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-20 h-20 border-4 border-primary/50">
                <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                  {authUser?.name?.charAt(0) || authUser?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-theme-white">{authUser?.name || 'Użytkownik'}</h2>
                <p className="text-theme-white-secondary">{authUser?.email || 'brak e-maila'}</p>
                <p className="text-sm text-primary mt-1">{authUser?.role === 'admin' ? 'Administrator' : 'Użytkownik'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">Imię i nazwisko</Label>
                <Input value={isEditingProfile ? profileData.full_name : authUser?.name || ''} onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} disabled={!isEditingProfile} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label className="text-theme-white-secondary">Email</Label>
                <Input value={isEditingProfile ? profileData.email : authUser?.email || ''} onChange={(e) => setProfileData({...profileData, email: e.target.value})} disabled={!isEditingProfile} type="email" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-theme-white-secondary">Telefon</Label>
                <Input value={isEditingProfile ? profileData.phone : authUser?.phone || ''} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} disabled={!isEditingProfile} className="bg-slate-800 border-slate-700" placeholder="+48 123 456 789" />
              </div>
            </div>

            {/* Sekcja zmiany hasła */}
            <div className="border-t border-slate-700 pt-6 mt-6">
              <h3 className="text-theme-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Zmiana hasła
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Aktualne hasło</Label>
                  <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Nowe hasło</Label>
                  <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Potwierdź nowe hasło</Label>
                  <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="bg-slate-800 border-slate-700" />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-indigo-600 hover:bg-indigo-700">
                    {changingPassword ? 'Zmienianie...' : 'Zmień hasło'}
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleResetPasswordRequest} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Mail className="w-4 h-4 mr-2" />
                  Wyślij link do resetowania hasła
                </Button>
                <p className="text-xs text-theme-white-muted mt-2">Link do resetowania hasła zostanie wysłany na adres email</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* MODUŁY */}
        {activeTab === 'modules' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Cog className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Moduły aplikacji</h2>
                <p className="text-sm text-theme-white-secondary">Włącz/wyłącz poszczególne funkcje aplikacji</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Moduł kluczyków */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${modulesSettings.requireKeyForTrip ? 'bg-primary/20 text-primary' : 'bg-slate-700/50 text-slate-500'}`}>
                      {modulesSettings.requireKeyForTrip ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-theme-white font-semibold">Moduł kluczyków</h3>
                      <p className="text-theme-white-secondary text-sm">Wymagaj pobrania kluczyków przed rozpoczęciem trasy</p>
                      <div className="mt-1 text-xs">
                        {modulesSettings.requireKeyForTrip ? (
                          <span className="text-primary">✓ Blokada aktywna - wymagane pobranie kluczyków</span>
                        ) : (
                          <span className="text-amber-400">⚠ Blokada wyłączona - można rozpocząć trasę bez kluczyków</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch checked={modulesSettings.requireKeyForTrip} onCheckedChange={(val) => setModulesSettings({...modulesSettings, requireKeyForTrip: val})} />
                </div>
              </div>

              {/* Moduł Mapy */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Map className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-theme-white font-semibold">Mapy i śledzenie GPS</h3>
                      <p className="text-theme-white-secondary text-sm">Wyświetlanie tras, lokalizacji na żywo, historia przejazdów</p>
                    </div>
                  </div>
                  <Switch checked={modulesSettings.maps} onCheckedChange={(val) => setModulesSettings({...modulesSettings, maps: val})} />
                </div>
              </div>

              {/* Moduł Cen paliw */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-theme-white font-semibold">Aktualne ceny paliw</h3>
                      <p className="text-theme-white-secondary text-sm">Pobieranie cen z CollectAPI, wyświetlanie w kalkulatorach i tankowaniach</p>
                    </div>
                  </div>
                  <Switch checked={modulesSettings.fuelPrices} onCheckedChange={(val) => setModulesSettings({...modulesSettings, fuelPrices: val})} />
                </div>
              </div>

              {/* Moduł Pogody */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <CloudRain className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-theme-white font-semibold">Prognoza pogody</h3>
                      <p className="text-theme-white-secondary text-sm">Wyświetlanie warunków pogodowych dla tras (OpenWeatherMap)</p>
                    </div>
                  </div>
                  <Switch checked={modulesSettings.weather} onCheckedChange={(val) => setModulesSettings({...modulesSettings, weather: val})} />
                </div>
              </div>

              {/* Moduł Śledzenia GPS */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Satellite className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-theme-white font-semibold">Śledzenie GPS</h3>
                      <p className="text-theme-white-secondary text-sm">Nagrywanie trasy w czasie rzeczywistym, zapis ścieżki przejazdu</p>
                    </div>
                  </div>
                  <Switch checked={modulesSettings.gpsTracking} onCheckedChange={(val) => setModulesSettings({...modulesSettings, gpsTracking: val})} />
                </div>
              </div>

              {/* Moduł Debug i logów */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <BugPlay className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-theme-white font-semibold">Debug i logi systemowe</h3>
                      <p className="text-theme-white-secondary text-sm">Zbieranie błędów, akcji użytkownika, eksport logów</p>
                    </div>
                  </div>
                  <Switch checked={modulesSettings.debugLogs} onCheckedChange={(val) => setModulesSettings({...modulesSettings, debugLogs: val})} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <p className="text-sm text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Zmiana stanu modułów wymaga odświeżenia strony aby zaczęły obowiązywać.
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={saveModulesSettings} className="bg-gradient-primary">
                <Save className="w-4 h-4 mr-2" />
                Zapisz ustawienia modułów
              </Button>
            </div>
          </GlassCard>
        )}

        {/* LOKALIZACJA & MAPY */}
        {activeTab === 'location' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Lokalizacja i mapy</h2>
                <p className="text-sm text-theme-white-secondary">Konfiguracja śledzenia GPS i integracji z Google Maps</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-theme-white font-semibold">Śledzenie GPS</h3>
                    <p className="text-theme-white-secondary text-sm">Włącz śledzenie lokalizacji w czasie rzeczywistym</p>
                  </div>
                  <Switch checked={locationSettings.gpsEnabled} onCheckedChange={(val) => setLocationSettings({...locationSettings, gpsEnabled: val})} />
                </div>
                {locationSettings.gpsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                    <div className="space-y-2">
                      <Label className="text-theme-white-secondary">Interwał zapisu (sekundy)</Label>
                      <Select value={String(locationSettings.trackingInterval)} onValueChange={(val) => setLocationSettings({...locationSettings, trackingInterval: parseInt(val)})}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Co 5 sekund</SelectItem>
                          <SelectItem value="10">Co 10 sekund</SelectItem>
                          <SelectItem value="30">Co 30 sekund</SelectItem>
                          <SelectItem value="60">Co 60 sekund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-theme-white-secondary">Wysoka dokładność</Label>
                      <Switch checked={locationSettings.highAccuracy} onCheckedChange={(val) => setLocationSettings({...locationSettings, highAccuracy: val})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-theme-white-secondary">Przyciąganie do dróg (Snap to road)</Label>
                      <Switch checked={locationSettings.snapToRoad} onCheckedChange={(val) => setLocationSettings({...locationSettings, snapToRoad: val})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-theme-white-secondary">Automatyczne śledzenie przy starcie trasy</Label>
                      <Switch checked={locationSettings.autoStartTracking} onCheckedChange={(val) => setLocationSettings({...locationSettings, autoStartTracking: val})} />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h3 className="text-theme-white font-semibold mb-4">Google Maps API</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-theme-white-secondary">Klucz API Google Maps</Label>
                    <Input
                      type="password"
                      value={locationSettings.googleMapsApiKey}
                      onChange={(e) => setLocationSettings({...locationSettings, googleMapsApiKey: e.target.value})}
                      className="bg-slate-800 border-slate-700 font-mono text-sm"
                      placeholder="AIzaSy..."
                    />
                    <p className="text-xs text-theme-white-muted">Uzyskaj klucz w Google Cloud Console (wymaga włączenia billing, ale ma darmowy limit)</p>
                  </div>
                  <Button onClick={() => window.open('https://console.cloud.google.com/google/maps-apis/credentials', '_blank')} variant="outline" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Uzyskaj klucz API
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={saveLocationSettings} className="bg-gradient-primary">
                <Save className="w-4 h-4 mr-2" />
                Zapisz ustawienia lokalizacji
              </Button>
            </div>
          </GlassCard>
        )}

        {/* API & INTEGRACJE */}
        {activeTab === 'api' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Plug className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">API & Integracje</h2>
                <p className="text-sm text-theme-white-secondary">Konfiguracja kluczy API dla zewnętrznych usług</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-theme-white font-semibold">CollectAPI - Ceny paliw</h3>
                    <p className="text-theme-white-secondary text-sm">Dostawca danych o cenach paliw w Polsce i Europie</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${apiSettings.apiStatus.collectApi === 'online' ? 'bg-green-500/20 text-green-400' : apiSettings.apiStatus.collectApi === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {apiSettings.apiStatus.collectApi === 'online' ? 'Online' : apiSettings.apiStatus.collectApi === 'error' ? 'Błąd' : 'Nie testowano'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Klucz API</Label>
                  <Input
                    value={apiSettings.collectApiKey}
                    onChange={(e) => setApiSettings({...apiSettings, collectApiKey: e.target.value})}
                    className="bg-slate-800 border-slate-700 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-theme-white font-semibold">OpenWeatherMap - Pogoda</h3>
                    <p className="text-theme-white-secondary text-sm">Prognozy pogody dla tras i podróży</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${apiSettings.apiStatus.weatherApi === 'online' ? 'bg-green-500/20 text-green-400' : apiSettings.apiStatus.weatherApi === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {apiSettings.apiStatus.weatherApi === 'online' ? 'Online' : apiSettings.apiStatus.weatherApi === 'error' ? 'Błąd' : 'Nie testowano'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Klucz API</Label>
                  <Input
                    value={apiSettings.openWeatherApiKey}
                    onChange={(e) => setApiSettings({...apiSettings, openWeatherApiKey: e.target.value})}
                    className="bg-slate-800 border-slate-700 font-mono text-sm"
                    placeholder="Wprowadź klucz OpenWeatherMap"
                  />
                  <p className="text-xs text-theme-white-muted">Zarejestruj się na openweathermap.org aby uzyskać darmowy klucz API</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-theme-white font-semibold">Google Maps API</h3>
                    <p className="text-theme-white-secondary text-sm">Mapy, geokodowanie, wyznaczanie tras</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${apiSettings.apiStatus.mapsApi === 'online' ? 'bg-green-500/20 text-green-400' : apiSettings.apiStatus.mapsApi === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {apiSettings.apiStatus.mapsApi === 'online' ? 'Online' : apiSettings.apiStatus.mapsApi === 'error' ? 'Błąd' : 'Nie testowano'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-theme-white-secondary">Klucz API</Label>
                  <Input
                    type="password"
                    value={apiSettings.googleMapsApiKey}
                    onChange={(e) => setApiSettings({...apiSettings, googleMapsApiKey: e.target.value})}
                    className="bg-slate-800 border-slate-700 font-mono text-sm"
                    placeholder="AIzaSy..."
                  />
                </div>
              </div>

              <Button onClick={testApiConnections} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Testuj połączenia API
              </Button>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={saveApiSettings} className="bg-gradient-primary">
                <Save className="w-4 h-4 mr-2" />
                Zapisz ustawienia API
              </Button>
            </div>
          </GlassCard>
        )}

        {/* DEBUG & LOGI */}
        {activeTab === 'debug' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <BugPlay className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Debug & Logi systemowe</h2>
                <p className="text-sm text-theme-white-secondary">Narzędzia diagnostyczne i zbieranie logów</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-theme-white font-semibold">Tryb debugowania</h3>
                  <p className="text-theme-white-secondary text-sm">Zapisuje wszystkie błędy, akcje API i zdarzenia</p>
                </div>
                <Switch checked={debugEnabled} onCheckedChange={toggleDebug} />
              </div>

              {debugEnabled && (
                <div className="mt-4">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Button onClick={refreshLogs} size="sm" variant="outline" className="border-slate-600">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Odśwież
                    </Button>
                    <Button onClick={downloadLogs} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Download className="w-3 h-3 mr-1" />
                      Pobierz logi
                    </Button>
                    <Button onClick={clearLogs} size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Wyczyść logi
                    </Button>
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['all', 'error', 'warn', 'api', 'navigation', 'info', 'system'].map(type => (
                      <Button key={type} size="sm" variant={logFilter === type ? 'default' : 'outline'} onClick={() => setLogFilter(type)} className="text-xs px-2 py-1 h-auto">
                        {type.toUpperCase()} ({logs.filter(l => l.type === type).length})
                      </Button>
                    ))}
                  </div>

                  <div className="bg-slate-900 rounded-lg p-3 max-h-96 overflow-y-auto font-mono text-xs">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center text-slate-500 py-4">Brak logów do wyświetlenia</div>
                    ) : (
                      filteredLogs.slice().reverse().map((log) => (
                        <div key={log.id} className="border-b border-slate-700 py-2 last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : log.type === 'api' ? 'text-blue-400' : 'text-slate-400'}`}>
                              [{log.type.toUpperCase()}]
                            </span>
                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-slate-300 ml-2">{log.message}</div>
                          {log.data && (
                            <details className="ml-2 mt-1">
                              <summary className="text-slate-500 cursor-pointer text-xs">Szczegóły</summary>
                              <pre className="text-slate-400 text-xs mt-1 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* WYGLĄD */}
        {activeTab === 'appearance' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Wygląd aplikacji</h2>
                <p className="text-sm text-theme-white-secondary">Dostosuj kolorystykę i tło</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-theme-white font-medium mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full"></div>
                Kolory przycisków i akcentów
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocalSettings({...localSettings, theme: theme.id})}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      localSettings.theme === theme.id ? 'border-primary bg-primary/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    {localSettings.theme === theme.id && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                    <div className="flex gap-1 mb-3 justify-center">{theme.colors.map((color, i) => <div key={i} className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} />)}</div>
                    <p className="text-sm font-medium text-theme-white text-center">{theme.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-theme-white font-medium mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                Kolor tekstu
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {textColors.map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocalSettings({...localSettings, textColor: color.id})}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      localSettings.textColor === color.id ? 'border-primary bg-primary/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    {localSettings.textColor === color.id && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                    <div className="space-y-2">
                      <div className={`h-8 rounded-lg ${color.class} bg-slate-700 flex items-center justify-center text-sm font-bold`}>Aa</div>
                      <div className={`h-2 rounded ${color.secondary} bg-slate-700`} />
                      <div className={`h-2 rounded ${color.muted} bg-slate-700`} />
                      <p className="text-sm font-medium text-theme-white text-center">{color.name}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-theme-white font-medium mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Tło aplikacji
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                {backgrounds.map((bg) => (
                  <motion.button
                    key={bg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocalSettings({...localSettings, backgroundColor: bg.class})}
                    className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
                      localSettings.backgroundColor === bg.class ? 'border-primary bg-primary/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    {localSettings.backgroundColor === bg.class && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10"><Check className="w-4 h-4 text-white" /></div>}
                    <div className={`h-16 rounded-lg mb-2 ${bg.class}`} />
                    <p className="text-sm font-medium text-theme-white text-center">{bg.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} className="bg-gradient-primary">
                {saveSuccess ? <><Check className="w-4 h-4 mr-2" />Zapisano!</> : <><Save className="w-4 h-4 mr-2" />Zapisz zmiany</>}
              </Button>
            </div>
          </GlassCard>
        )}

        {/* ANIMACJE */}
        {activeTab === 'animations' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Animacje</h2>
                <p className="text-sm text-theme-white-secondary">Dostosuj sposób wyświetlania animacji</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-theme-white font-medium mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Typ animacji
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animationTypes.map((anim) => {
                  const Icon = anim.icon;
                  return (
                    <motion.button
                      key={anim.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLocalSettings({...localSettings, animationType: anim.id})}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        localSettings.animationType === anim.id ? 'border-primary bg-primary/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      {localSettings.animationType === anim.id && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${localSettings.animationType === anim.id ? 'bg-primary/30' : 'bg-slate-700'}`}>
                          <Icon className={`w-5 h-5 ${localSettings.animationType === anim.id ? 'text-primary' : 'text-slate-400'}`} />
                        </div>
                        <span className="font-medium text-theme-white">{anim.name}</span>
                      </div>
                      <p className="text-xs text-theme-white-muted">{anim.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-theme-white font-medium mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                Szybkość animacji
              </h3>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-theme-white-muted">Wolniej</span>
                  <span className="text-sm text-theme-white font-medium">{localSettings.animationSpeed.toFixed(1)}s</span>
                  <span className="text-sm text-theme-white-muted">Szybciej</span>
                </div>
                <Slider value={[localSettings.animationSpeed]} onValueChange={(value) => setLocalSettings({...localSettings, animationSpeed: value[0]})} min={0.1} max={2.0} step={0.1} className="w-full" />
                <div className="flex justify-between mt-2 text-xs text-theme-white-muted">
                  <span>0.1s (błyskawiczne)</span>
                  <span>1.0s (średnie)</span>
                  <span>2.0s (wolne)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} className="bg-gradient-primary">
                {saveSuccess ? <><Check className="w-4 h-4 mr-2" />Zapisano!</> : <><Save className="w-4 h-4 mr-2" />Zapisz zmiany</>}
              </Button>
            </div>
          </GlassCard>
        )}

        {/* BACKUP I RESET */}
        {activeTab === 'backup' && (
          <GlassCard className="p-6" delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-theme-white">Backup i Reset</h2>
                <p className="text-sm text-theme-white-secondary">Zarządzaj danymi aplikacji</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-theme-white font-semibold mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  Eksport danych (Backup)
                </h3>
                <p className="text-theme-white-secondary text-sm mb-4">Pobierz kopię zapasową wszystkich danych aplikacji (pojazdy, kierowcy, trasy, serwisy, ustawienia)</p>
                <Button onClick={handleExportBackup} className="bg-gradient-primary"><Download className="w-4 h-4 mr-2" />Pobierz Backup</Button>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-theme-white font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Import danych (Przywracanie)
                </h3>
                <p className="text-theme-white-secondary text-sm mb-4">Przywróć dane z wcześniej utworzonego pliku backupu. Istniejące dane zostaną nadpisane!</p>
                <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isRestoring} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />{isRestoring ? 'Przywracanie...' : 'Wybierz plik backupu'}
                </Button>
              </div>

              <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-theme-white font-semibold mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Reset aplikacji
                </h3>
                <p className="text-theme-white-secondary text-sm mb-4">Usuń wszystkie dane z aplikacji. Ta operacja jest <span className="text-red-400 font-semibold">nieodwracalna</span>!</p>
                <Button onClick={handleReset} variant="destructive" className="bg-red-600 hover:bg-red-700"><Trash2 className="w-4 h-4 mr-2" />Usuń wszystkie dane</Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}