import { useState, useEffect, useCallback } from 'react';
import { LocationService } from '../services/locationService';
import { UserLocation } from '../types';

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const loc = await LocationService.getCurrentLocation();
    if (loc) {
      setLocation(loc);
    } else {
      setError('Não foi possível obter sua localização. Verifique as permissões.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, loading, error, refresh };
}
