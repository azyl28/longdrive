import { useQuery } from '@tanstack/react-query';
import api from '@/api/apiClient';

export const useKeyBlocker = (vehicleId) => {
  // ✅ POPRAWIENE - używamy getCompanySettings zamiast getSettings
  const { data: settingsArr = [] } = useQuery({
    queryKey: ['companySettings'],
    queryFn: () => api.getCompanySettings().catch(() => ({ requireKeyForTrip: false })),
  });
  
  const { data: keyLogs = [] } = useQuery({
    queryKey: ['key-logs'],
    queryFn: () => api.getKeyLogs().catch(() => []),
  });

  // Obsługa różnych formatów odpowiedzi
  const settings = settingsArr && !Array.isArray(settingsArr) 
    ? settingsArr 
    : (Array.isArray(settingsArr) && settingsArr[0]) || { requireKeyForTrip: false };
  
  const requireKeyForTrip = settings.requireKeyForTrip ?? false;

  const isBlockedForVehicle = () => {
    if (!vehicleId) return false;
    const activeLogs = keyLogs.filter(log => 
      log.vehicleId === vehicleId && 
      log.returnDate === null && 
      !log.returnTime
    );
    return activeLogs.length > 0;
  };

  const getActiveIssues = () => {
    const vehicleMap = new Map();
    keyLogs.forEach(log => {
      if (log.returnDate === null && !log.returnTime) {
        if (!vehicleMap.has(log.vehicleId)) {
          vehicleMap.set(log.vehicleId, []);
        }
        vehicleMap.get(log.vehicleId).push(log);
      }
    });
    
    const active = [];
    vehicleMap.forEach((logs, vehicleId) => {
      active.push({
        vehicleId,
        count: logs.length,
        logs: logs
      });
    });
    return active;
  };

  const isBlocked = requireKeyForTrip
    ? (vehicleId ? isBlockedForVehicle() : getActiveIssues().length > 0)
    : false;

  const blockedReason = isBlocked
    ? vehicleId
      ? 'Kluczyki do tego pojazdu są wydane.'
      : 'Wydane kluczyki uniemożliwiają rozpoczęcie trasy.'
    : null;

  return {
    requireKeyForTrip,
    isBlocked,
    blockedReason,
    activeIssues: getActiveIssues(),
    isBlockedForVehicle: vehicleId ? isBlockedForVehicle() : false
  };
};

export default useKeyBlocker;