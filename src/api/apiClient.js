// src/api/apiClient.js
import { logApi } from '@/lib/errorHandler';

const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  const startTime = Date.now();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    const duration = Date.now() - startTime;
    
    if (response.status === 401) {
      setToken(null);
      logApi(endpoint, method, 401, { duration });
      throw new Error('Sesja wygasła. Zaloguj się ponownie.');
    }
    
    if (!response.ok) {
      const error = await response.json();
      logApi(endpoint, method, response.status, { duration, error });
      throw new Error(error.error || 'Błąd zapytania');
    }
    
    const data = await response.json();
    logApi(endpoint, method, response.status, { duration, success: true });
    return data;
  } catch (error) {
    logApi(endpoint, method, 'NETWORK_ERROR', { message: error.message });
    throw error;
  }
}

const api = {
  // Auth
  login: async (email, password) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.token) {
      setToken(result.token);
    }
    return result;
  },
  
  register: async (data) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      setToken(result.token);
    }
    return result;
  },
  
  logout: () => {
    setToken(null);
  },
  
  getMe: () => apiRequest('/auth/me'),
  
  // Vehicles
  getVehicles: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return apiRequest(`/vehicles${query ? `?${query}` : ''}`);
  },
  
  getVehicle: (id) => apiRequest(`/vehicles/${id}`),
  
  createVehicle: (data) => apiRequest('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateVehicle: (id, data) => apiRequest(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteVehicle: (id) => apiRequest(`/vehicles/${id}`, {
    method: 'DELETE',
  }),
  
  // Drivers
  getDrivers: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return apiRequest(`/drivers${query ? `?${query}` : ''}`);
  },
  
  getDriver: (id) => apiRequest(`/drivers/${id}`),
  
  createDriver: (data) => apiRequest('/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateDriver: (id, data) => apiRequest(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteDriver: (id) => apiRequest(`/drivers/${id}`, {
    method: 'DELETE',
  }),
  
  // Trips
  getTrips: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return apiRequest(`/trips${query ? `?${query}` : ''}`);
  },
  
  getTrip: (id) => apiRequest(`/trips/${id}`),
  
  createTrip: (data) => apiRequest('/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateTrip: (id, data) => apiRequest(`/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteTrip: (id) => apiRequest(`/trips/${id}`, {
    method: 'DELETE',
  }),
  
  // Services
  getServices: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return apiRequest(`/services${query ? `?${query}` : ''}`);
  },
  
  createService: (data) => apiRequest('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateService: (id, data) => apiRequest(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteService: (id) => apiRequest(`/services/${id}`, {
    method: 'DELETE',
  }),
  
  // Refuelings
  getRefuels: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return apiRequest(`/refuelings${query ? `?${query}` : ''}`);
  },
  
  createRefuel: (data) => apiRequest('/refuelings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateRefuel: (id, data) => apiRequest(`/refuelings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteRefuel: (id) => apiRequest(`/refuelings/${id}`, {
    method: 'DELETE',
  }),
  
  // Key logs
  getKeyLogs: (params = {}) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return apiRequest(`/key-logs${query ? `?${query}` : ''}`);
  },
  
  createKeyLog: (data) => apiRequest('/key-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateKeyLog: (id, data) => apiRequest(`/key-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteKeyLog: (id) => apiRequest(`/key-logs/${id}`, {
    method: 'DELETE',
  }),
  
  // Settings - ✅ POPRAWIENE: przekierowuje do company-settings
  getSettings: () => apiRequest('/company-settings').catch(() => ({})),
  
  updateSettings: (data) => apiRequest('/company-settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }).catch(() => ({})),
  
  getCompanySettings: () => apiRequest('/company-settings').catch(() => ({})),
  
  updateCompanySettings: (data) => apiRequest('/company-settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }).catch(() => ({})),
};

export default api;