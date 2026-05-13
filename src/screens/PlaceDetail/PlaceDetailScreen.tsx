import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Linking, FlatList, ActivityIndicator, Dimensions, Platform, Share,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Place, RouteInfo, Coordinates } from '../../types';
import { PlacesService } from '../../services/placesService';
import { StorageService } from '../../services/storageService';
import { LocationService } from '../../services/locationService';
import RouteCard from '../../components/RouteCard';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../theme';
import { CATEGORIES } from '../../constants/categories';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: { params: { place: Place; userLocation?: Coordinates } };
}

export default function PlaceDetailScreen({ navigation, route }: Props) {
  const { place: initialPlace, userLocation } = route.params;
  const [place, setPlace] = useState<Place>(initialPlace);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const mapRef = useRef<MapView>(null);

  useEffect(() => { loadDetails(); checkFavorite(); if (userLocation) loadRoutes(); }, []);

  const loadDetails = async () => {
    if (!place.placeId) { setLoadingDetails(false); return; }
    const details = await PlacesService.fetchPlaceDetails(place.placeId);
    if (details) setPlace((prev) => ({ ...prev, ...details }));
    setLoadingDetails(false);
  };
  const checkFavorite = async () => setIsFavorite(await StorageService.isFavorite(place.id));
  const loadRoutes = async () => {
    if (!userLocation) return;
    setLoadingRoutes(true);
    setRoutes(await PlacesService.getRoutes(userLocation, place.coordinates));
    setLoadingRoutes(false);
  };
  const toggleFavorite = async () => {
    if (isFavorite) await StorageService.removeFavorite(place.id);
    else await StorageService.addFavorite(place.id);
    setIsFavorite(!isFavorite);
  };
  const handleCall = () => { if (place.phone) Linking.openURL(`tel:${place.phone}`); };
  const handleWhatsApp = () => {
    const num = place.whatsapp || place.phone;
    if (num) Linking.openURL(PlacesService.buildWhatsAppUrl(num));
  };
  const handleOpenMaps = () => Linking.openURL(PlacesService.buildMapsUrl(place.coordinates, place.name));
  const handleShare = async () => {
    await Share.share({ title: place.name, message: `${place.name}\n${place.address}\n\nVer no Google Maps: ${PlacesService.buildMapsUrl(place.coordinates, place.name)}` });
  };

  const categoryConfig = CATEGORIES.find((c) => c.key === place.category);
  const priceLevelText = ['', 'R$', 'R$ R$', 'R$ R$ R$', 'R$ R$ R$ R$'];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.topBtn} onPress={handleShare}><Ionicons name="share-social" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={toggleFavorite}><Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="white" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {place.photos.length > 0 ? (
          <View>
            <FlatList
              data={place.photos} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={(e) => setActivePhotoIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
              renderItem={({ item }) => <Image source={{ uri: item.url }} style={styles.photo} resizeMode="cover" />}
            />
            {place.photos.length > 1 && (
              <View style={styles.photoDots}>
                {place.photos.map((_, i) => <View key={i} style={[styles.dot, i === activePhotoIndex && styles.dotActive]} />)}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.photoPlaceholder}><Text style={styles.photoEmoji}>{categoryConfig?.emoji || '📍'}</Text></View>
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              {categoryConfig && (
                <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.backgroundColor }]}>
                  <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>{categoryConfig.emoji} {categoryConfig.label}</Text>
                </View>
              )}
              <Text style={styles.name}>{place.name}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            {place.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={Colors.accent} />
                <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                {place.ratingCount && <Text style={styles.ratingCount}>({place.ratingCount})</Text>}
              </View>
            )}
            {place.priceLevel !== undefined && place.priceLevel > 0 && <Text style={styles.priceLevel}>{priceLevelText[place.priceLevel]}</Text>}
            {place.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={12} color={Colors.primary} />
                <Text style={styles.distanceText}>{LocationService.formatDistance(place.distance)}</Text>
              </View>
            )}
          </View>

          {place.openingHours && (
            <View style={styles.openRow}>
              <View style={[styles.statusDot, { backgroundColor: place.openingHours.isOpen ? Colors.success : Colors.error }]} />
              <Text style={[styles.statusText, { color: place.openingHours.isOpen ? Colors.success : Colors.error }]}>
                {place.openingHours.isOpen ? 'Aberto agora' : 'Fechado agora'}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.infoRow} onPress={handleOpenMaps}>
            <View style={[styles.infoIcon, { backgroundColor: '#DBEAFE' }]}><Ionicons name="location" size={18} color="#2563EB" /></View>
            <View style={styles.infoContent}><Text style={styles.infoLabel}>Endereço</Text><Text style={styles.infoValue}>{place.address}</Text></View>
            <Ionicons name="open-outline" size={16} color={Colors.textLight} />
          </TouchableOpacity>

          {place.phone && (
            <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
              <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}><Ionicons name="call" size={18} color="#059669" /></View>
              <View style={styles.infoContent}><Text style={styles.infoLabel}>Telefone</Text><Text style={styles.infoValue}>{place.phone}</Text></View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}

          {(place.whatsapp || place.phone) && (
            <TouchableOpacity style={styles.infoRow} onPress={handleWhatsApp}>
              <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}><Ionicons name="logo-whatsapp" size={18} color="#25D366" /></View>
              <View style={styles.infoContent}><Text style={styles.infoLabel}>WhatsApp</Text><Text style={styles.infoValue}>{place.whatsapp || place.phone}</Text></View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}

          {place.website && (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(place.website!)}>
              <View style={[styles.infoIcon, { backgroundColor: '#EDE9FE' }]}><Ionicons name="globe" size={18} color="#7C3AED" /></View>
              <View style={styles.infoContent}><Text style={styles.infoLabel}>Site</Text><Text style={styles.infoValue} numberOfLines={1}>{place.website}</Text></View>
              <Ionicons name="open-outline" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}

          {place.openingHours?.weekdayText && (
            <View style={styles.hoursSection}>
              <Text style={styles.sectionTitle}>Horários de funcionamento</Text>
              {place.openingHours.weekdayText.map((day, i) => <Text key={i} style={styles.hourText}>{day}</Text>)}
            </View>
          )}

          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Localização</Text>
            <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.95}>
              <MapView
                ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE}
                initialRegion={{ ...place.coordinates, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
              >
                <Marker coordinate={place.coordinates} title={place.name} description={place.address} />
              </MapView>
              <View style={styles.mapOverlay}>
                <Ionicons name="map" size={16} color={Colors.primary} />
                <Text style={styles.mapOverlayText}>Abrir no Google Maps</Text>
              </View>
            </TouchableOpacity>
          </View>

          {loadingRoutes ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.md }} />
          ) : routes.length > 0 && userLocation ? (
            <RouteCard routes={routes} from={userLocation} to={place.coordinates} />
          ) : null}

          <View style={styles.actionButtons}>
            {place.phone && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={handleCall}>
                <Ionicons name="call" size={20} color="white" /><Text style={styles.actionBtnText}>Ligar</Text>
              </TouchableOpacity>
            )}
            {(place.whatsapp || place.phone) && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#25D366' }]} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={20} color="white" /><Text style={styles.actionBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={handleOpenMaps}>
              <Ionicons name="navigate" size={20} color="white" /><Text style={styles.actionBtnText}>Ir até lá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {loadingDetails && (
        <View style={styles.loadingOverlay}><ActivityIndicator color={Colors.primary} /></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.md },
  topBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  topActions: { flexDirection: 'row', gap: Spacing.sm },
  photo: { width, height: 280 },
  photoDots: { position: 'absolute', bottom: Spacing.sm, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: 'white', width: 18 },
  photoPlaceholder: { height: 200, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 64 },
  content: { padding: Spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  titleLeft: { flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, marginBottom: Spacing.sm },
  categoryBadgeText: { ...Typography.label },
  name: { ...Typography.h1, color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md, flexWrap: 'wrap' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...Typography.h4, color: Colors.text },
  ratingCount: { ...Typography.body, color: Colors.textSecondary },
  priceLevel: { ...Typography.body, color: Colors.textSecondary },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  distanceText: { ...Typography.label, color: Colors.primary },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...Typography.h4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  infoIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 2 },
  infoValue: { ...Typography.body, color: Colors.text },
  hoursSection: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginVertical: Spacing.sm, ...Shadow.sm },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  hourText: { ...Typography.body, color: Colors.textSecondary, marginBottom: 2 },
  mapSection: { marginVertical: Spacing.md },
  map: { width: '100%', height: 180, borderRadius: Radius.md, overflow: 'hidden' },
  mapOverlay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm, backgroundColor: `${Colors.primary}10`, borderRadius: Radius.md, marginTop: 4 },
  mapOverlayText: { ...Typography.label, color: Colors.primary },
  actionButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.md },
  actionBtnText: { ...Typography.h4, color: 'white' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
});
