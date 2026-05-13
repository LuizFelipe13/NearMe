import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Place, Coordinates } from '../../types';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../theme';
import { CATEGORIES } from '../../constants/categories';
import { StorageService } from '../../services/storageService';

interface Props {
  navigation: any;
  route: { params: { places: Place[]; userLocation?: Coordinates } };
}

export default function MapViewScreen({ navigation, route }: Props) {
  const { places, userLocation } = route.params;
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const mapRef = useRef<MapView>(null);

  const centerCoords = userLocation || (places.length > 0 ? places[0].coordinates : { latitude: -23.5505, longitude: -46.6333 });

  const handleMarkerPress = (place: Place) => {
    setSelectedPlace(place);
    mapRef.current?.animateToRegion({ ...place.coordinates, latitudeDelta: 0.005, longitudeDelta: 0.005 });
  };

  const handlePlaceDetail = (place: Place) => {
    StorageService.addRecentPlace(place);
    navigation.navigate('PlaceDetail', { place, userLocation });
  };

  const getCategoryConfig = (place: Place) => CATEGORIES.find((c) => c.key === place.category) || CATEGORIES[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa ({places.length} locais)</Text>
      </View>

      <MapView
        ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE}
        initialRegion={{ ...centerCoords, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        showsUserLocation showsMyLocationButton
      >
        {places.map((place) => {
          const config = getCategoryConfig(place);
          return (
            <Marker key={place.id} coordinate={place.coordinates} onPress={() => handleMarkerPress(place)}>
              <View style={[styles.markerContainer, { borderColor: config.color }]}>
                <Text style={styles.markerEmoji}>{config.emoji}</Text>
              </View>
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutName} numberOfLines={1}>{place.name}</Text>
                  <Text style={styles.calloutAddress} numberOfLines={1}>{place.address}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {selectedPlace && (
        <TouchableOpacity style={styles.drawer} onPress={() => handlePlaceDetail(selectedPlace)} activeOpacity={0.9}>
          <View style={styles.drawerHandle} />
          <View style={styles.drawerContent}>
            <View>
              <Text style={styles.drawerName}>{selectedPlace.name}</Text>
              <Text style={styles.drawerAddress} numberOfLines={1}>{selectedPlace.address}</Text>
              {selectedPlace.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{selectedPlace.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.drawerBtn} onPress={() => handlePlaceDetail(selectedPlace)}>
              <Text style={styles.drawerBtnText}>Ver detalhes</Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.h3, color: 'white' },
  map: { flex: 1 },
  markerContainer: { backgroundColor: 'white', borderRadius: Radius.full, padding: 4, borderWidth: 2, ...Shadow.md },
  markerEmoji: { fontSize: 18 },
  callout: { backgroundColor: 'white', padding: Spacing.sm, borderRadius: Radius.md, maxWidth: 200, ...Shadow.md },
  calloutName: { ...Typography.h4, color: Colors.text },
  calloutAddress: { ...Typography.caption, color: Colors.textSecondary },
  drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.md, ...Shadow.lg },
  drawerHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.md },
  drawerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerName: { ...Typography.h3, color: Colors.text },
  drawerAddress: { ...Typography.body, color: Colors.textSecondary, maxWidth: 220 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { ...Typography.label, color: Colors.textSecondary },
  drawerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, gap: 4 },
  drawerBtnText: { ...Typography.label, color: 'white' },
});
