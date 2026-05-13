import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../services/storageService';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../theme';
import { Place } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

interface Props { navigation: any; }

export default function FavoritesScreen({ navigation }: Props) {
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const recent = await StorageService.getRecentPlaces();
    const favs = await StorageService.getFavorites();
    setRecentPlaces(recent);
    setFavoriteIds(favs.map((f) => f.placeId));
  };

  const favoritePlaces = recentPlaces.filter((p) => favoriteIds.includes(p.id));

  const handleRemoveFavorite = (place: Place) => {
    Alert.alert('Remover favorito', `Remover "${place.name}" dos favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await StorageService.removeFavorite(place.id); await loadData(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❤️ Favoritos</Text>
      </View>
      <FlatList
        data={favoritePlaces} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💙</Text>
            <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyText}>Explore locais próximos e salve seus preferidos tocando no ícone de coração.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PlaceDetail', { place: item })} activeOpacity={0.8}>
            <View style={styles.cardEmoji}><Text style={{ fontSize: 28 }}>📍</Text></View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
              {item.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => handleRemoveFavorite(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="heart" size={22} color={Colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.h2, color: 'white' },
  list: { padding: Spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  cardEmoji: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  cardContent: { flex: 1 },
  cardName: { ...Typography.h4, color: Colors.text },
  cardAddress: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: { ...Typography.caption, color: Colors.textSecondary },
  empty: { alignItems: 'center', padding: Spacing.xxl, marginTop: Spacing.xxl },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h2, color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280 },
});
