import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../../hooks/usePlaces';
import { StorageService } from '../../services/storageService';
import PlaceCard from '../../components/PlaceCard';
import CategoryButton from '../../components/CategoryButton';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { Place, Category, Coordinates } from '../../types';
import { CATEGORIES } from '../../constants/categories';

interface Props {
  navigation: any;
  route: { params: { category: Category; userLocation?: Coordinates } };
}

const RADIUS_OPTIONS = [500, 1000, 2000, 5000, 10000];

export default function PlaceListScreen({ navigation, route }: Props) {
  const { category, userLocation } = route.params;
  const { places, loading, error, fetchByCategory } = usePlaces();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [radius, setRadius] = useState(5000);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [selectedCategory, setSelectedCategory] = useState<Category>(category);

  useEffect(() => { loadPlaces(); loadFavorites(); }, [selectedCategory, radius]);

  const loadPlaces = useCallback(() => {
    if (userLocation) fetchByCategory(selectedCategory.key, userLocation, radius);
  }, [selectedCategory, radius, userLocation]);

  const loadFavorites = async () => { const f = await StorageService.getFavorites(); setFavorites(f.map((x) => x.placeId)); };

  const handlePlacePress = (place: Place) => {
    StorageService.addRecentPlace(place);
    navigation.navigate('PlaceDetail', { place, userLocation });
  };

  const handleFavorite = async (place: Place) => {
    const isFav = favorites.includes(place.id);
    if (isFav) { await StorageService.removeFavorite(place.id); setFavorites((p) => p.filter((id) => id !== place.id)); }
    else { await StorageService.addFavorite(place.id); setFavorites((p) => [...p, place.id]); }
  };

  const sortedPlaces = [...places].sort((a, b) =>
    sortBy === 'distance' ? (a.distance || 0) - (b.distance || 0) : (b.rating || 0) - (a.rating || 0)
  );

  const renderHeader = () => (
    <View>
      <FlatList
        data={CATEGORIES} keyExtractor={(item) => item.key} horizontal showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <CategoryButton category={item} compact selected={item.key === selectedCategory.key} onPress={(cat) => setSelectedCategory(cat)} />}
        contentContainerStyle={styles.categoriesRow}
      />
      <View style={styles.filtersRow}>
        <View style={styles.sortButtons}>
          {(['distance', 'rating'] as const).map((s) => (
            <TouchableOpacity key={s} style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]} onPress={() => setSortBy(s)}>
              <Ionicons name={s === 'distance' ? 'navigate' : 'star'} size={12} color={sortBy === s ? 'white' : Colors.textSecondary} />
              <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>{s === 'distance' ? 'Distância' : 'Avaliação'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.radiusBtn} onPress={() => { const next = RADIUS_OPTIONS[(RADIUS_OPTIONS.indexOf(radius) + 1) % RADIUS_OPTIONS.length]; setRadius(next); }}>
          <Ionicons name="radio" size={12} color={Colors.primary} />
          <Text style={styles.radiusBtnText}>{radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}</Text>
        </TouchableOpacity>
      </View>
      {places.length > 0 && <Text style={styles.resultCount}>{places.length} locais encontrados</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{selectedCategory.emoji}</Text>
          <Text style={styles.headerTitle}>{selectedCategory.label}</Text>
        </View>
        <TouchableOpacity style={styles.mapBtn} onPress={() => navigation.navigate('MapView', { places: sortedPlaces, userLocation })}>
          <Ionicons name="map" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando {selectedCategory.label.toLowerCase()}...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPlaces}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity>
        </View>
      )}
      {!loading && !error && (
        <FlatList
          data={sortedPlaces} keyExtractor={(item) => item.id} numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <PlaceCard place={item} onPress={handlePlacePress} onFavorite={handleFavorite} isFavorite={favorites.includes(item.id)} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>{selectedCategory.emoji}</Text>
              <Text style={styles.emptyTitle}>Nenhum local encontrado</Text>
              <Text style={styles.emptyText}>Tente aumentar o raio de busca ou escolha outra categoria.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.sm },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerEmoji: { fontSize: 22 },
  headerTitle: { ...Typography.h3, color: 'white' },
  mapBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  categoriesRow: { padding: Spacing.md, paddingBottom: Spacing.sm },
  filtersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sortButtons: { flexDirection: 'row', gap: Spacing.sm },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  sortBtnActive: { backgroundColor: Colors.primary },
  sortBtnText: { ...Typography.label, color: Colors.textSecondary },
  sortBtnTextActive: { color: 'white' },
  radiusBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: `${Colors.primary}15`, borderWidth: 1, borderColor: Colors.primary },
  radiusBtnText: { ...Typography.label, color: Colors.primary },
  resultCount: { ...Typography.bodySmall, color: Colors.textSecondary, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  listContent: { paddingHorizontal: Spacing.md },
  columnWrapper: { justifyContent: 'space-between' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { ...Typography.body, color: Colors.textSecondary },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  errorText: { ...Typography.body, color: Colors.error, textAlign: 'center', marginBottom: Spacing.md },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  retryText: { ...Typography.h4, color: 'white' },
  emptyContainer: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
});
