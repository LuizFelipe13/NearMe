import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../../hooks/usePlaces';
import { StorageService } from '../../services/storageService';
import PlaceCard from '../../components/PlaceCard';
import SearchBar from '../../components/SearchBar';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { Place, Coordinates } from '../../types';

interface Props {
  navigation: any;
  route: { params: { query?: string; userLocation?: Coordinates } };
}

const QUICK_SUGGESTIONS = ['Restaurante', 'Farmácia', 'Hospital', 'Banco', 'Mercado', 'Posto de gasolina', 'Academia'];

export default function SearchScreen({ navigation, route }: Props) {
  const { query: initialQuery, userLocation } = route.params || {};
  const { places, loading, search, reset } = usePlaces();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => { loadFavorites(); if (initialQuery) handleSearch(initialQuery); }, []);

  const loadFavorites = async () => { const f = await StorageService.getFavorites(); setFavorites(f.map((x) => x.placeId)); };

  const handleSearch = async (q: string) => {
    if (!q.trim()) { reset(); setHasSearched(false); return; }
    if (!userLocation) return;
    setHasSearched(true);
    await search(q, userLocation);
  };

  const handlePlacePress = (place: Place) => {
    StorageService.addRecentPlace(place);
    navigation.navigate('PlaceDetail', { place, userLocation });
  };

  const handleFavorite = async (place: Place) => {
    const isFav = favorites.includes(place.id);
    if (isFav) { await StorageService.removeFavorite(place.id); setFavorites((p) => p.filter((id) => id !== place.id)); }
    else { await StorageService.addFavorite(place.id); setFavorites((p) => [...p, place.id]); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchBar onSearch={handleSearch} placeholder="Buscar locais próximos..." autoFocus />
        </View>
      </View>

      {!hasSearched && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintEmoji}>🔍</Text>
          <Text style={styles.hintTitle}>O que você procura?</Text>
          <Text style={styles.hintText}>Busque por restaurante, farmácia, hospital, banco, ou qualquer estabelecimento próximo a você.</Text>
          <View style={styles.suggestions}>
            {QUICK_SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSearch(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}

      {!loading && hasSearched && (
        <FlatList
          data={places} keyExtractor={(item) => item.id} numColumns={2}
          columnWrapperStyle={styles.columnWrapper} contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <PlaceCard place={item} onPress={handlePlacePress} onFavorite={handleFavorite} isFavorite={favorites.includes(item.id)} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyEmoji}>😕</Text><Text style={styles.emptyTitle}>Nada encontrado</Text><Text style={styles.emptyText}>Tente outros termos de busca.</Text></View>}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  backBtn: { padding: Spacing.xs },
  searchWrapper: { flex: 1 },
  hintContainer: { flex: 1, alignItems: 'center', padding: Spacing.xl, marginTop: Spacing.xxl },
  hintEmoji: { fontSize: 48, marginBottom: Spacing.md },
  hintTitle: { ...Typography.h2, color: Colors.text, marginBottom: Spacing.sm },
  hintText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  suggestionChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: `${Colors.primary}15`, borderWidth: 1, borderColor: Colors.primary },
  suggestionText: { ...Typography.label, color: Colors.primary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { ...Typography.body, color: Colors.textSecondary },
  listContent: { padding: Spacing.md },
  columnWrapper: { justifyContent: 'space-between' },
  empty: { alignItems: 'center', padding: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { ...Typography.body, color: Colors.textSecondary },
});
