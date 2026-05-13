import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteInfo, TransportMode, Coordinates } from '../types';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';
import { PlacesService } from '../services/placesService';

interface Props {
  routes: RouteInfo[];
  from: Coordinates;
  to: Coordinates;
}

const MODE_CONFIG: Record<TransportMode, { icon: string; label: string; color: string }> = {
  driving: { icon: 'car', label: 'Carro', color: '#3B82F6' },
  walking: { icon: 'walk', label: 'A pé', color: '#10B981' },
  transit: { icon: 'bus', label: 'Transporte', color: '#F59E0B' },
  bicycling: { icon: 'bicycle', label: 'Bicicleta', color: '#8B5CF6' },
};

export default function RouteCard({ routes, from, to }: Props) {
  const openRoute = (mode: TransportMode) => Linking.openURL(PlacesService.buildDirectionsUrl(from, to, mode));
  if (!routes.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como chegar</Text>
      <View style={styles.grid}>
        {routes.map((route) => {
          const config = MODE_CONFIG[route.mode];
          return (
            <TouchableOpacity key={route.mode} style={styles.card} onPress={() => openRoute(route.mode)} activeOpacity={0.8}>
              <View style={[styles.iconBg, { backgroundColor: `${config.color}15` }]}>
                <Ionicons name={config.icon as any} size={22} color={config.color} />
              </View>
              <Text style={styles.label}>{config.label}</Text>
              <Text style={[styles.duration, { color: config.color }]}>{route.duration}</Text>
              <Text style={styles.distance}>{route.distance}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.md },
  title: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: { flex: 1, minWidth: 70, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', ...Shadow.sm },
  iconBg: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: 2 },
  duration: { ...Typography.h4, fontWeight: '700' },
  distance: { ...Typography.caption, color: Colors.textLight },
});
