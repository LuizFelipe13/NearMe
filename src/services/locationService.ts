import * as Location from 'expo-location';
import { Coordinates, UserLocation } from '../types';

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        accuracy: location.coords.accuracy ?? undefined,
        timestamp: location.timestamp,
      };
    } catch {
      return null;
    }
  }

  static async watchLocation(
    callback: (location: UserLocation) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      return await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 20 },
        (loc) => {
          callback({
            coords: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
            accuracy: loc.coords.accuracy ?? undefined,
            timestamp: loc.timestamp,
          });
        }
      );
    } catch {
      return null;
    }
  }

  static calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371000;
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }

  static async reverseGeocode(coords: Coordinates): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.street, r.streetNumber, r.district, r.city, r.region].filter(Boolean);
        return parts.join(', ');
      }
    } catch {}
    return 'Localização atual';
  }
}
