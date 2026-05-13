export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PlacePhoto {
  url: string;
  attribution?: string;
}

export interface OpeningHours {
  isOpen: boolean;
  periods?: {
    open: { day: number; time: string };
    close: { day: number; time: string };
  }[];
  weekdayText?: string[];
}

export interface Place {
  id: string;
  name: string;
  category: CategoryKey;
  subcategory?: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  coordinates: Coordinates;
  distance?: number;
  rating?: number;
  ratingCount?: number;
  photos: PlacePhoto[];
  openingHours?: OpeningHours;
  priceLevel?: 0 | 1 | 2 | 3 | 4;
  placeId?: string;
  isEmergency?: boolean;
  emergencyType?: EmergencyType;
  tags?: string[];
}

export type EmergencyType = 'hospital' | 'police' | 'fire' | 'pharmacy' | 'ambulance' | 'civil_defense';

export type CategoryKey =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'hotel'
  | 'shopping'
  | 'supermarket'
  | 'pharmacy'
  | 'hospital'
  | 'police'
  | 'bank'
  | 'gas_station'
  | 'parking'
  | 'gym'
  | 'beauty'
  | 'school'
  | 'church'
  | 'park'
  | 'entertainment'
  | 'transport'
  | 'service'
  | 'emergency'
  | 'other';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  emoji: string;
}

export type TransportMode = 'driving' | 'walking' | 'transit' | 'bicycling';

export interface RouteInfo {
  mode: TransportMode;
  duration: string;
  distance: string;
  steps?: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: TransportMode;
}

export interface UserLocation {
  coords: Coordinates;
  accuracy?: number;
  timestamp?: number;
}

export interface SearchFilters {
  maxDistance?: number;
  minRating?: number;
  isOpen?: boolean;
  priceLevel?: number[];
}

export interface FavoritePlace {
  placeId: string;
  savedAt: number;
  note?: string;
}
