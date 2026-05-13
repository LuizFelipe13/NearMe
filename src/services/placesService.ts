import { Place, CategoryKey, Coordinates, TransportMode, RouteInfo } from '../types';
import { GOOGLE_MAPS_TYPES } from '../constants/categories';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

export class PlacesService {
  static buildPhotoUrl(photoReference: string, maxWidth = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
  }

  static buildStaticMapUrl(coords: Coordinates, zoom = 15, size = '400x200'): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${coords.latitude},${coords.longitude}&zoom=${zoom}&size=${size}&maptype=roadmap&markers=color:red%7C${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}`;
  }

  static buildMapsUrl(coords: Coordinates, name?: string): string {
    const query = name ? encodeURIComponent(name) : `${coords.latitude},${coords.longitude}`;
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=`;
  }

  static buildDirectionsUrl(
    from: Coordinates,
    to: Coordinates,
    mode: TransportMode = 'driving'
  ): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&travelmode=${mode}`;
  }

  static buildWhatsAppUrl(phone: string, message?: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const msg = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${cleaned}${msg ? `?text=${msg}` : ''}`;
  }

  static async fetchNearbyPlaces(
    coords: Coordinates,
    category: CategoryKey,
    radius = 5000
  ): Promise<Place[]> {
    try {
      const types = GOOGLE_MAPS_TYPES[category] || ['point_of_interest'];
      const type = types[0];
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}&language=pt-BR`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.warn('Places API error:', data.status);
        return [];
      }
      return (data.results || []).map((r: GooglePlaceResult) =>
        this.mapGooglePlace(r, category, coords)
      );
    } catch (e) {
      console.error('fetchNearbyPlaces error:', e);
      return [];
    }
  }

  static async fetchEmergencyPlaces(coords: Coordinates): Promise<Place[]> {
    const emergencyTypes: Array<{ type: string; category: CategoryKey }> = [
      { type: 'hospital', category: 'hospital' },
      { type: 'police', category: 'police' },
      { type: 'pharmacy', category: 'pharmacy' },
      { type: 'fire_station', category: 'emergency' },
    ];
    const results = await Promise.all(
      emergencyTypes.map(async ({ type, category }) => {
        try {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&rankby=distance&type=${type}&key=${GOOGLE_API_KEY}&language=pt-BR`;
          const res = await fetch(url);
          const data = await res.json();
          return (data.results || []).slice(0, 5).map((r: GooglePlaceResult) =>
            this.mapGooglePlace(r, category, coords)
          );
        } catch {
          return [];
        }
      })
    );
    return results.flat().sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  static async fetchPlaceDetails(placeId: string): Promise<Partial<Place> | null> {
    try {
      const fields = 'formatted_phone_number,opening_hours,photos,website,price_level,rating,user_ratings_total,formatted_address';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}&language=pt-BR`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status !== 'OK') return null;
      const r = data.result;
      return {
        phone: r.formatted_phone_number,
        address: r.formatted_address,
        openingHours: r.opening_hours ? {
          isOpen: r.opening_hours.open_now ?? false,
          weekdayText: r.opening_hours.weekday_text,
        } : undefined,
        photos: (r.photos || []).slice(0, 6).map((p: { photo_reference: string }) => ({
          url: this.buildPhotoUrl(p.photo_reference, 800),
        })),
        priceLevel: r.price_level,
        rating: r.rating,
        ratingCount: r.user_ratings_total,
        website: r.website,
      };
    } catch {
      return null;
    }
  }

  static async getRoutes(from: Coordinates, to: Coordinates): Promise<RouteInfo[]> {
    const modes: TransportMode[] = ['driving', 'walking', 'transit', 'bicycling'];
    const results = await Promise.all(
      modes.map(async (mode) => {
        try {
          const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.latitude},${from.longitude}&destination=${to.latitude},${to.longitude}&mode=${mode}&key=${GOOGLE_API_KEY}&language=pt-BR`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status !== 'OK' || !data.routes?.length) return null;
          const leg = data.routes[0].legs[0];
          return { mode, duration: leg.duration.text, distance: leg.distance.text } as RouteInfo;
        } catch {
          return null;
        }
      })
    );
    return results.filter(Boolean) as RouteInfo[];
  }

  static async searchPlaces(query: string, coords: Coordinates, radius = 10000): Promise<Place[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${coords.latitude},${coords.longitude}&radius=${radius}&key=${GOOGLE_API_KEY}&language=pt-BR`;
      const res = await fetch(url);
      const data = await res.json();
      return (data.results || []).map((r: GooglePlaceResult) =>
        this.mapGooglePlace(r, 'other', coords)
      );
    } catch {
      return [];
    }
  }

  private static mapGooglePlace(r: GooglePlaceResult, category: CategoryKey, userCoords: Coordinates): Place {
    const placeCoords = { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng };
    return {
      id: r.place_id,
      placeId: r.place_id,
      name: r.name,
      category,
      address: r.vicinity || r.formatted_address || '',
      phone: undefined,
      coordinates: placeCoords,
      distance: Math.round(this.haversineDistance(userCoords, placeCoords)),
      rating: r.rating,
      ratingCount: r.user_ratings_total,
      photos: (r.photos || []).slice(0, 3).map((p) => ({ url: this.buildPhotoUrl(p.photo_reference, 400) })),
      openingHours: r.opening_hours ? { isOpen: r.opening_hours.open_now ?? false } : undefined,
      priceLevel: r.price_level,
      isEmergency: ['hospital', 'police', 'emergency'].includes(category),
    };
  }

  private static haversineDistance(a: Coordinates, b: Coordinates): number {
    const R = 6371000;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
    const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
  }
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string }[];
  opening_hours?: { open_now?: boolean };
  price_level?: 0 | 1 | 2 | 3 | 4;
  types?: string[];
}
