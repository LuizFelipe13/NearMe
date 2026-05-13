import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { LocationService } from '../services/locationService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

interface Props {
  place: Place;
  onPress: (place: Place) => void;
  onFavorite?: (place: Place) => void;
  isFavorite?: boolean;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={rating >= s ? 'star' : rating >= s - 0.5 ? 'star-half' : 'star-outline'}
          size={10}
          color={Colors.accent}
        />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function PlaceCard({ place, onPress, onFavorite, isFavorite }: Props) {
  const hasPhoto = place.photos.length > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(place)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {hasPhoto ? (
          <Image
            source={{ uri: place.photos[0].url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>📍</Text>
          </View>
        )}

        {onFavorite && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => onFavorite(place)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? Colors.error : Colors.surface}
            />
          </TouchableOpacity>
        )}

        {place.openingHours && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: place.openingHours.isOpen ? Colors.success : Colors.error },
            ]}
          >
            <Text style={styles.statusText}>
              {place.openingHours.isOpen ? 'Aberto' : 'Fechado'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {place.name}
        </Text>

        {place.rating && <RatingStars rating={place.rating} />}

        <View style={styles.footer}>
          {place.distance !== undefined && (
            <View style={styles.distanceRow}>
              <Ionicons name="navigate" size={10} color={Colors.primary} />
              <Text style={styles.distanceText}>
                {LocationService.formatDistance(place.distance)}
              </Text>
            </View>
          )}

          {place.priceLevel !== undefined && (
            <Text style={styles.priceText}>
              {'R$'.repeat(place.priceLevel || 1)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  imageContainer: { position: 'relative', height: 120 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 32 },
  favoriteBtn: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: Radius.full, padding: 6,
  },
  statusBadge: {
    position: 'absolute', bottom: Spacing.sm, left: Spacing.sm,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full,
  },
  statusText: { color: Colors.surface, fontSize: 10, fontWeight: '600' },
  info: { padding: Spacing.sm },
  name: { ...Typography.h4, color: Colors.text, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 4 },
  ratingText: { fontSize: 10, color: Colors.textSecondary, marginLeft: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  distanceText: { fontSize: 11, color: Colors.primary, fontWeight: '500' },
  priceText: { fontSize: 11, color: Colors.textSecondary },
});
