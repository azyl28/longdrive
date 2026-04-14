import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, 
  Thermometer, RefreshCw, MapPin, CloudSnow, CloudFog,
  CloudLightning, CloudDrizzle, Eye, Gauge
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { useWeather } from '@/hooks/useWeather';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const WeatherWidget = ({
  location = null,
  apiKey = null,
  showForecast = true,
  autoRefresh = true,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  const { currentWeather, forecast, loading, error, refresh } = useWeather(
    location,
    apiKey,
    autoRefresh
  );

  // Ikona pogody
  const getWeatherIcon = (iconCode, size = 48) => {
    const iconMap = {
      '01d': <Sun className={`w-${size} h-${size} text-yellow-400`} />,
      '01n': <Sun className={`w-${size} h-${size} text-yellow-400`} />,
      '02d': <Cloud className={`w-${size} h-${size} text-slate-300`} />,
      '02n': <Cloud className={`w-${size} h-${size} text-slate-300`} />,
      '03d': <Cloud className={`w-${size} h-${size} text-slate-300`} />,
      '03n': <Cloud className={`w-${size} h-${size} text-slate-300`} />,
      '04d': <Cloud className={`w-${size} h-${size} text-slate-400`} />,
      '04n': <Cloud className={`w-${size} h-${size} text-slate-400`} />,
      '09d': <CloudDrizzle className={`w-${size} h-${size} text-blue-400`} />,
      '09n': <CloudDrizzle className={`w-${size} h-${size} text-blue-400`} />,
      '10d': <CloudRain className={`w-${size} h-${size} text-blue-400`} />,
      '10n': <CloudRain className={`w-${size} h-${size} text-blue-400`} />,
      '11d': <CloudLightning className={`w-${size} h-${size} text-yellow-500`} />,
      '11n': <CloudLightning className={`w-${size} h-${size} text-yellow-500`} />,
      '13d': <Snowflake className={`w-${size} h-${size} text-cyan-300`} />,
      '13n': <Snowflake className={`w-${size} h-${size} text-cyan-300`} />,
      '50d': <CloudFog className={`w-${size} h-${size} text-slate-400`} />,
      '50n': <CloudFog className={`w-${size} h-${size} text-slate-400`} />,
    };
    return iconMap[iconCode] || <Cloud className={`w-${size} h-${size} text-slate-300`} />;
  };

  // Opis pogody po polsku
  const getWeatherDescription = (description) => {
    const descMap = {
      'clear sky': 'Bezchmurnie',
      'few clouds': 'Małe zachmurzenie',
      'scattered clouds': 'Umiarkowane zachmurzenie',
      'broken clouds': 'Duże zachmurzenie',
      'overcast clouds': 'Pochmurno',
      'shower rain': 'Przelotne opady',
      'rain': 'Deszcz',
      'thunderstorm': 'Burza',
      'snow': 'Śnieg',
      'mist': 'Mgła',
      'fog': 'Mgła',
    };
    return descMap[description] || description;
  };

  // Formatowanie temperatury
  const formatTemp = (temp) => `${Math.round(temp)}°C`;

  if (loading && !currentWeather) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="text-center py-4">
          <Cloud className="w-12 h-12 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={refresh} className="mt-3">
            <RefreshCw className="w-3 h-3 mr-1" />
            Spróbuj ponownie
          </Button>
        </div>
      </GlassCard>
    );
  }

  if (!currentWeather) {
    return null;
  }

  return (
    <GlassCard className={`p-4 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="text-theme-white font-semibold">Pogoda</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Główna pogoda */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(currentWeather.icon, 48)}
          <div>
            <div className="text-3xl font-bold text-theme-white">
              {formatTemp(currentWeather.temp)}
            </div>
            <div className="text-sm text-theme-white-muted">
              {getWeatherDescription(currentWeather.description)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-theme-white-muted flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            Odczuwalna: {formatTemp(currentWeather.feels_like)}
          </div>
          <div className="text-sm text-theme-white-muted flex items-center gap-1 mt-1">
            <Wind className="w-3 h-3" />
            Wiatr: {Math.round(currentWeather.wind_speed)} km/h
          </div>
        </div>
      </div>

      {/* Dodatkowe informacje */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-theme-white-muted text-xs">
            <Droplets className="w-3 h-3" />
            Wilgotność
          </div>
          <p className="text-theme-white text-sm">{currentWeather.humidity}%</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-theme-white-muted text-xs">
            <Gauge className="w-3 h-3" />
            Ciśnienie
          </div>
          <p className="text-theme-white text-sm">{currentWeather.pressure} hPa</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-theme-white-muted text-xs">
            <Eye className="w-3 h-3" />
            Widoczność
          </div>
          <p className="text-theme-white text-sm">
            {currentWeather.visibility ? `${(currentWeather.visibility / 1000).toFixed(1)} km` : '---'}
          </p>
        </div>
      </div>

      {/* Prognoza */}
      {showForecast && forecast.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 text-xs"
          >
            {expanded ? 'Zwiń prognozę' : 'Pokaż prognozę na 5 dni'}
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-1 mt-3 pt-3 border-t border-slate-700">
                  {forecast.slice(0, 5).map((day, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-xs text-theme-white-muted">
                        {format(new Date(day.date), 'EEE', { locale: pl })}
                      </p>
                      <div className="my-1">
                        {getWeatherIcon(day.icon, 24)}
                      </div>
                      <p className="text-xs text-theme-white">
                        {formatTemp(day.temp_max)}/{formatTemp(day.temp_min)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {lastUpdate && (
        <p className="text-xs text-theme-white-muted text-center mt-3">
          Aktualizacja: {format(lastUpdate, 'HH:mm')}
        </p>
      )}
    </GlassCard>
  );
};

export default WeatherWidget;