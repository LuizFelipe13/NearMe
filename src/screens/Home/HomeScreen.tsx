import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, StatusBar, Platform, Linking, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../hooks/useLocation';
import { PlacesService } from '../../services/placesService';
import { LocationService } from '../../services/locationService';
import { StorageService } from '../../services/storageService';
import { CATEGORIES, EMERGENCY_NUMBERS } from '../../constants/categories';
import CategoryButton from '../../components/CategoryButton';
import PlaceCard from '../../components/PlaceCard';
import SearchBar from '../../components/SearchBar';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../theme';
import { Category, Place } from '../../types';

const { width } = Dimensions.get('window');

interface Props { navigation: any; }

export default function HomeScreen({ navigation }: Props) {
  const { location, loading: locLoading, error: locError, refresh: refreshLocation } = useLocation();
  const [address, setAddress] = useState('');
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (location) {
      LocationService.reverseGeocode(location.coords).then(setAddress);
      loadFeatured();
    }
  }, [location]);

  useEffect(() => { loadRecent(); loadFavorites(); }, []);

  const loadFeatured = useCallback(async () => {
    if (!location) return;
    const places = await PlacesService.fetchNearbyPlaces(location.coords, 'restaurant', 2000);
    setFeaturedPlaces(places.slice(0, 6));
  }, [location]);

  const loadRecent = async () => { const r = await StorageService.getRecentPlaces(); setRecentPlaces(r.slice(0, 6)); };
  const loadFavorites = async () => { const f = await StorageService.getFavorites(); setFavorites(f.map((x) => x.placeId)); };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLocation(); await loadFeatured(); await loadRecent();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: Category) =>
    navigation.navigate('PlaceList', { category, userLocation: location?.coords });

  const handlePlacePress = (place: Place) => {
    StorageService.addRecentPlace(place);
    navigation.navigate('PlaceDetail', { place, userLocation: location?.coords });
  };

  const handleFavorite = async (place: Place) => {
    const isFav = favorites.includes(place.id);
    if (isFav) { await StorageService.removeFavorite(place.id); setFavorites((p) => p.filter((id) => id !== place.id)); }
    else { await StorageService.addFavorite(place.id); setFavorites((p) => [...p, place.id]); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Olá! 👋</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locLoading ? 'Obtendo localização...' : address || 'Localização não disponível'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Emergency', { userLocation: location?.coords })}>
              <Ionicons name="alert-circle" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Favorites')}>
              <Ionicons name="heart" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar
            onSearch={(q) => navigation.navigate('Search', { query: q, userLocation: location?.coords })}
            placeholder="Buscar restaurante, farmácia, banco..."
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={styles.emergencyBanner} onPress={() => navigation.navigate('Emergency', { userLocation: location?.coords })} activeOpacity={0.9}>
          <View style={styles.emergencyLeft}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <View>
              <Text style={styles.emergencyTitle}>Serviços de Emergência</Text>
              <Text style={styles.emergencySubtitle}>Delegacias, hospitais e UPAs próximas</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.emergency} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Números de emergência</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EMERGENCY_NUMBERS.map((en) => (
              <TouchableOpacity key={en.number} style={styles.emergencyNumBtn} onPress={() => Linking.openURL(`tel:${en.number}`)}>
                <Text style={styles.emergencyNumIcon}>{en.icon}</Text>
                <Text style={styles.emergencyNumLabel}>{en.label}</Text>
                <Text style={[styles.emergencyNum, { color: en.color }]}>{en.number}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explorar por categoria</Text>
          <FlatList
            data={CATEGORIES} keyExtractor={(item) => item.key} horizontal showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <CategoryButton category={item} onPress={handleCategoryPress} />}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {featuredPlaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Restaurantes próximos</Text>
              <TouchableOpacity onPress={() => handleCategoryPress(CATEGORIES.find((c) => c.key === 'restaurant')!)}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardsGrid}>
              {featuredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onPress={handlePlacePress} onFavorite={handleFavorite} isFavorite={favorites.includes(place.id)} />
              ))}
            </View>
          </View>
        )}

        {recentPlaces.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visitados recentemente</Text>
            <View style={styles.cardsGrid}>
              {recentPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onPress={handlePlacePress} isFavorite={favorites.includes(place.id)} />
              ))}
            </View>
          </View>
        )}

        {locError && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color={Colors.warning} />
            <Text style={styles.errorText}>{locError}</Text>
          </View>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { ...Typography.h2, color: 'white', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: width * 0.6 },
  locationText: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.85)', flex: 1 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { marginTop: Spacing.sm },
  scrollContent: { paddingTop: Spacing.md },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  seeAll: { ...Typography.label, color: Colors.primary },
  categoriesList: { paddingRight: Spacing.md },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emergencyBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.emergencyLight, marginHorizontal: Spacing.md, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: '#FCA5A5' },
  emergencyLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emergencyIcon: { fontSize: 28 },
  emergencyTitle: { ...Typography.h4, color: Colors.emergency },
  emergencySubtitle: { ...Typography.bodySmall, color: Colors.textSecondary },
  emergencyNumBtn: { alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginRight: Spacing.sm, minWidth: 72, ...Shadow.sm },
  emergencyNumIcon: { fontSize: 22, marginBottom: 2 },
  emergencyNumLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 2 },
  emergencyNum: { ...Typography.h4 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FEF3C7', margin: Spacing.md, padding: Spacing.md, borderRadius: Radius.md },
  errorText: { ...Typography.body, color: Colors.text, flex: 1 },
});
