import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { LocationService } from '../services/locationService';
import { PlacesService } from '../services/placesService';

interface Props {
  place: Place;
  onPress: (place: Place) => void;
  userCoords?: { latitude: number; longitude: number };
}

export default function EmergencyCard({ place, onPress, userCoords }: Props) {
  const handleCall = () => { if (place.phone) Linking.openURL(`tel:${place.phone}`); };
  const handleDirections = () => {
    if (userCoords) Linking.openURL(PlacesService.buildDirectionsUrl(userCoords, place.coordinates));
  };

  const categoryConfig: Record<string, { color: string; emoji: string }> = {
    hospital: { color: '#DC2626', emoji: '🏥' },
    police: { color: '#1E40AF', emoji: '🚔' },
    pharmacy: { color: '#059669', emoji: '💊' },
    emergency: { color: '#DC2626', emoji: '🚨' },
  };
  const config = categoryConfig[place.category] || { color: Colors.error, emoji: '⚠️' };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(place)} activeOpacity={0.9}>
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
        <View style={styles.meta}>
          {place.distance !== undefined && (
            <View style={styles.tag}>
              <Ionicons name="navigate" size={10} color={Colors.primary} />
              <Text style={styles.tagText}>{LocationService.formatDistance(place.distance)}</Text>
            </View>
          )}
          {place.openingHours && (
            <View style={[styles.tag, { backgroundColor: place.openingHours.isOpen ? '#D1FAE5' : '#FEE2E2' }]}>
              <Text style={[styles.tagText, { color: place.openingHours.isOpen ? Colors.success : Colors.error }]}>
                {place.openingHours.isOpen ? 'Aberto' : 'Fechado'}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        {place.phone && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={handleCall}>
            <Ionicons name="call" size={14} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={handleDirections}>
          <Ionicons name="navigate" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.sm, marginBottom: Spacing.sm, ...Shadow.sm,
    borderLeftWidth: 3, borderLeftColor: Colors.emergency,
  },
  iconContainer: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  emoji: { fontSize: 24 },
  content: { flex: 1 },
  name: { ...Typography.h4, color: Colors.text },
  address: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', gap: Spacing.xs, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.borderLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  tagText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
  actions: { flexDirection: 'column', gap: Spacing.xs, marginLeft: Spacing.sm },
  actionBtn: { width: 30, height: 30, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
});
