import { useState, useEffect, useCallback } from 'react';
import { getCurrentWeather, getForecast } from '@/lib/weatherApi';

export function useWeather(location = null, apiKey = null, autoFetch = true) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Pobieranie pogody dla danej lokalizacji
  const fetchWeather = useCallback(async (lat, lng) => {
    if (!apiKey) {
      setError('Brak klucza API OpenWeatherMap');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [current, forecastData] = await Promise.all([
        getCurrentWeather(lat, lng, apiKey),
        getForecast(lat, lng, apiKey),
      ]);

      setCurrentWeather(current);
      setForecast(forecastData || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Błąd pobierania pogody:', err);
      setError(err.message || 'Nie udało się pobrać danych pogodowych');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // Automatyczne pobieranie pogody dla bieżącej lokalizacji
  const fetchWeatherForCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolokalizacja nie jest wspierana');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (err) => {
        console.error('Błąd GPS:', err);
        setError('Nie udało się pobrać lokalizacji');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, [fetchWeather]);

  // Auto-fetch na starcie
  useEffect(() => {
    if (autoFetch) {
      if (location && location.lat && location.lng) {
        fetchWeather(location.lat, location.lng);
      } else {
        fetchWeatherForCurrentLocation();
      }
    }
  }, [autoFetch, location, fetchWeather, fetchWeatherForCurrentLocation]);

  // Odświeżanie co 30 minut
  useEffect(() => {
    if (!autoFetch) return;

    const interval = setInterval(() => {
      if (location && location.lat && location.lng) {
        fetchWeather(location.lat, location.lng);
      } else {
        fetchWeatherForCurrentLocation();
      }
    }, 30 * 60 * 1000); // 30 minut

    return () => clearInterval(interval);
  }, [autoFetch, location, fetchWeather, fetchWeatherForCurrentLocation]);

  return {
    currentWeather,
    forecast,
    loading,
    error,
    lastUpdate,
    refresh: location ? () => fetchWeather(location.lat, location.lng) : fetchWeatherForCurrentLocation,
  };
}