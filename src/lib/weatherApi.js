// API dla pogody (OpenWeatherMap)
const API_BASE = 'https://api.openweathermap.org/data/2.5';

// Pobierz aktualną pogodę dla współrzędnych
export const getCurrentWeather = async (lat, lng, apiKey) => {
  if (!apiKey) {
    return { error: 'Brak klucza API OpenWeatherMap' };
  }
  try {
    const response = await fetch(
      `${API_BASE}/weather?lat=${lat}&lon=${lng}&units=metric&lang=pl&appid=${apiKey}`
    );
    if (!response.ok) throw new Error('Błąd pobierania pogody');
    const data = await response.json();
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      clouds: data.clouds.all,
      city: data.name,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return { error: error.message };
  }
};

// Pobierz prognozę 5-dniową (co 3h)
export const getForecast = async (lat, lng, apiKey) => {
  if (!apiKey) {
    return { error: 'Brak klucza API OpenWeatherMap' };
  }
  try {
    const response = await fetch(
      `${API_BASE}/forecast?lat=${lat}&lon=${lng}&units=metric&lang=pl&appid=${apiKey}`
    );
    if (!response.ok) throw new Error('Błąd pobierania prognozy');
    const data = await response.json();
    
    // Grupuj po dniach
    const dailyForecast = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          temps: [],
          icons: [],
          descriptions: [],
          humidity: [],
          windSpeed: [],
        };
      }
      dailyForecast[date].temps.push(item.main.temp);
      dailyForecast[date].icons.push(item.weather[0].icon);
      dailyForecast[date].descriptions.push(item.weather[0].description);
      dailyForecast[date].humidity.push(item.main.humidity);
      dailyForecast[date].windSpeed.push(item.wind.speed);
    });
    
    // Oblicz średnie dla każdego dnia
    const result = Object.entries(dailyForecast).map(([date, dayData]) => ({
      date,
      tempMin: Math.min(...dayData.temps),
      tempMax: Math.max(...dayData.temps),
      tempAvg: Math.round(dayData.temps.reduce((a,b) => a+b, 0) / dayData.temps.length),
      icon: dayData.icons[Math.floor(dayData.icons.length / 2)],
      description: dayData.descriptions[0],
      humidity: Math.round(dayData.humidity.reduce((a,b) => a+b, 0) / dayData.humidity.length),
      windSpeed: Math.round(dayData.windSpeed.reduce((a,b) => a+b, 0) / dayData.windSpeed.length),
    }));
    
    return result.slice(0, 5); // 5 dni
  } catch (error) {
    console.error('Forecast API error:', error);
    return { error: error.message };
  }
};

// Ikony pogody (OpenWeatherMap -> emoji)
export const getWeatherIconEmoji = (iconCode) => {
  const icons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return icons[iconCode] || '🌡️';
};