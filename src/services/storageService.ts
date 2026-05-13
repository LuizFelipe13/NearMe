import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoritePlace, Place } from '../types';

const KEYS = {
  FAVORITES: '@nearme_favorites',
  RECENT_PLACES: '@nearme_recent',
  SETTINGS: '@nearme_settings',
};

export class StorageService {
  static async getFavorites(): Promise<FavoritePlace[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.FAVORITES);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  static async addFavorite(placeId: string, note?: string): Promise<void> {
    const favorites = await this.getFavorites();
    const exists = favorites.find((f) => f.placeId === placeId);
    if (!exists) {
      favorites.unshift({ placeId, savedAt: Date.now(), note });
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    }
  }

  static async removeFavorite(placeId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const updated = favorites.filter((f) => f.placeId !== placeId);
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
  }

  static async isFavorite(placeId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some((f) => f.placeId === placeId);
  }

  static async getRecentPlaces(): Promise<Place[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.RECENT_PLACES);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  static async addRecentPlace(place: Place): Promise<void> {
    const recent = await this.getRecentPlaces();
    const filtered = recent.filter((p) => p.id !== place.id);
    filtered.unshift(place);
    await AsyncStorage.setItem(KEYS.RECENT_PLACES, JSON.stringify(filtered.slice(0, 20)));
  }

  static async getSettings(): Promise<Record<string, unknown>> {
    try {
      const json = await AsyncStorage.getItem(KEYS.SETTINGS);
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }

  static async saveSettings(settings: Record<string, unknown>): Promise<void> {
    const existing = await this.getSettings();
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...existing, ...settings }));
  }
}
