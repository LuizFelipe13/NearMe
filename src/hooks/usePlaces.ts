import { useState, useCallback } from 'react';
import { Place, CategoryKey, Coordinates } from '../types';
import { PlacesService } from '../services/placesService';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCategory = useCallback(
    async (category: CategoryKey, coords: Coordinates, radius?: number) => {
      setLoading(true);
      setError(null);
      try {
        const results = await PlacesService.fetchNearbyPlaces(coords, category, radius);
        setPlaces(results);
      } catch {
        setError('Erro ao buscar locais. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const search = useCallback(async (query: string, coords: Coordinates) => {
    setLoading(true);
    setError(null);
    try {
      const results = await PlacesService.searchPlaces(query, coords);
      setPlaces(results);
    } catch {
      setError('Erro na busca.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  return { places, loading, error, fetchByCategory, search, reset };
}
