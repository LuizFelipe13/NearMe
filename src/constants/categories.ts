import { Category } from '../types';

export const CATEGORIES: Category[] = [
  { key: 'restaurant', label: 'Restaurantes', icon: 'restaurant', color: '#EF4444', backgroundColor: '#FEE2E2', emoji: '🍽️' },
  { key: 'cafe', label: 'Cafés', icon: 'coffee', color: '#92400E', backgroundColor: '#FEF3C7', emoji: '☕' },
  { key: 'bar', label: 'Bares', icon: 'beer', color: '#7C3AED', backgroundColor: '#EDE9FE', emoji: '🍺' },
  { key: 'hotel', label: 'Hotéis', icon: 'bed', color: '#1D4ED8', backgroundColor: '#DBEAFE', emoji: '🏨' },
  { key: 'shopping', label: 'Compras', icon: 'shopping-bag', color: '#EC4899', backgroundColor: '#FCE7F3', emoji: '🛍️' },
  { key: 'supermarket', label: 'Mercados', icon: 'cart', color: '#059669', backgroundColor: '#D1FAE5', emoji: '🛒' },
  { key: 'pharmacy', label: 'Farmácias', icon: 'medkit', color: '#10B981', backgroundColor: '#D1FAE5', emoji: '💊' },
  { key: 'hospital', label: 'Saúde', icon: 'hospital', color: '#DC2626', backgroundColor: '#FEE2E2', emoji: '🏥' },
  { key: 'police', label: 'Segurança', icon: 'shield', color: '#1E40AF', backgroundColor: '#DBEAFE', emoji: '🚔' },
  { key: 'bank', label: 'Bancos', icon: 'card', color: '#047857', backgroundColor: '#D1FAE5', emoji: '🏦' },
  { key: 'gas_station', label: 'Postos', icon: 'flash', color: '#D97706', backgroundColor: '#FEF3C7', emoji: '⛽' },
  { key: 'parking', label: 'Estacionamento', icon: 'car', color: '#6B7280', backgroundColor: '#F3F4F6', emoji: '🅿️' },
  { key: 'gym', label: 'Academia', icon: 'fitness', color: '#DC2626', backgroundColor: '#FEE2E2', emoji: '💪' },
  { key: 'beauty', label: 'Beleza', icon: 'cut', color: '#DB2777', backgroundColor: '#FCE7F3', emoji: '💅' },
  { key: 'school', label: 'Educação', icon: 'school', color: '#2563EB', backgroundColor: '#DBEAFE', emoji: '🎓' },
  { key: 'church', label: 'Religião', icon: 'heart', color: '#7C3AED', backgroundColor: '#EDE9FE', emoji: '⛪' },
  { key: 'park', label: 'Parques', icon: 'leaf', color: '#16A34A', backgroundColor: '#DCFCE7', emoji: '🌳' },
  { key: 'entertainment', label: 'Lazer', icon: 'game-controller', color: '#7C3AED', backgroundColor: '#EDE9FE', emoji: '🎭' },
  { key: 'transport', label: 'Transporte', icon: 'bus', color: '#0369A1', backgroundColor: '#E0F2FE', emoji: '🚌' },
  { key: 'service', label: 'Serviços', icon: 'construct', color: '#9CA3AF', backgroundColor: '#F3F4F6', emoji: '🔧' },
];

export const EMERGENCY_CATEGORIES: Category[] = [
  { key: 'hospital', label: 'Hospitais', icon: 'hospital', color: '#DC2626', backgroundColor: '#FEE2E2', emoji: '🏥' },
  { key: 'police', label: 'Delegacias', icon: 'shield', color: '#1E40AF', backgroundColor: '#DBEAFE', emoji: '👮' },
  { key: 'pharmacy', label: 'Farmácias 24h', icon: 'medkit', color: '#059669', backgroundColor: '#D1FAE5', emoji: '💊' },
  { key: 'emergency', label: 'UPA/Emergência', icon: 'alert-circle', color: '#DC2626', backgroundColor: '#FEE2E2', emoji: '🚨' },
];

export const EMERGENCY_NUMBERS = [
  { label: 'SAMU', number: '192', icon: '🚑', color: '#DC2626' },
  { label: 'Bombeiros', number: '193', icon: '🚒', color: '#F97316' },
  { label: 'Polícia', number: '190', icon: '🚔', color: '#1E40AF' },
  { label: 'Defesa Civil', number: '199', icon: '⚠️', color: '#D97706' },
  { label: 'CVV', number: '188', icon: '💙', color: '#7C3AED' },
  { label: 'Disque Denúncia', number: '181', icon: '📞', color: '#6B7280' },
];

export const GOOGLE_MAPS_TYPES: Record<string, string[]> = {
  restaurant: ['restaurant', 'food'],
  cafe: ['cafe', 'bakery'],
  bar: ['bar', 'night_club'],
  hotel: ['lodging'],
  shopping: ['shopping_mall', 'clothing_store', 'store'],
  supermarket: ['supermarket', 'grocery_or_supermarket'],
  pharmacy: ['pharmacy', 'drugstore'],
  hospital: ['hospital', 'doctor', 'health'],
  police: ['police'],
  bank: ['bank', 'atm'],
  gas_station: ['gas_station'],
  parking: ['parking'],
  gym: ['gym'],
  beauty: ['beauty_salon', 'hair_care'],
  school: ['school', 'university'],
  church: ['church', 'mosque', 'synagogue', 'hindu_temple'],
  park: ['park', 'natural_feature'],
  entertainment: ['movie_theater', 'amusement_park', 'bowling_alley', 'museum', 'tourist_attraction'],
  transport: ['transit_station', 'subway_station', 'bus_station', 'train_station', 'airport'],
  service: ['post_office', 'laundry', 'car_repair', 'plumber', 'electrician'],
};
