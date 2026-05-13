import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlacesService } from '../../services/placesService';
import { StorageService } from '../../services/storageService';
import EmergencyCard from '../../components/EmergencyCard';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../theme';
import { Place, Coordinates } from '../../types';
import { EMERGENCY_NUMBERS } from '../../constants/categories';

interface Props {
  navigation: any;
  route: { params: { userLocation?: Coordinates } };
}

const SAFETY_TIPS = [
  { emoji: '📱', title: 'Mantenha o celular carregado', text: 'Em situações de emergência, seu celular pode ser sua principal ferramenta de comunicação.' },
  { emoji: '📍', title: 'Compartilhe sua localização', text: 'Avise familiares ou amigos onde você está, especialmente à noite.' },
  { emoji: '🔑', title: 'Tenha documentos importantes', text: 'Guarde cópias digitais de documentos importantes no celular.' },
  { emoji: '💊', title: 'Remédios essenciais', text: 'Conheça as farmácias 24h mais próximas da sua casa e do trabalho.' },
];

export default function EmergencyScreen({ navigation, route }: Props) {
  const { userLocation } = route.params || {};
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { loadEmergencyPlaces(); }, [userLocation]);

  const loadEmergencyPlaces = async () => {
    if (!userLocation) { setLoading(false); return; }
    setLoading(true);
    setPlaces(await PlacesService.fetchEmergencyPlaces(userLocation));
    setLoading(false);
  };

  const handlePlacePress = (place: Place) => {
    StorageService.addRecentPlace(place);
    navigation.navigate('PlaceDetail', { place, userLocation });
  };

  const filteredPlaces = filter === 'all' ? places : places.filter((p) => p.category === filter);
  const filters = [
    { key: 'all', label: 'Todos', emoji: '🚨' },
    { key: 'hospital', label: 'Hospitais', emoji: '🏥' },
    { key: 'police', label: 'Delegacias', emoji: '👮' },
    { key: 'pharmacy', label: 'Farmácias', emoji: '💊' },
    { key: 'emergency', label: 'UPA', emoji: '🚑' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>🚨</Text>
          <Text style={styles.headerTitle}>Emergências</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ligue agora</Text>
          <View style={styles.dialGrid}>
            {EMERGENCY_NUMBERS.map((en) => (
              <TouchableOpacity key={en.number} style={[styles.dialCard, { borderColor: en.color }]} onPress={() => Linking.openURL(`tel:${en.number}`)} activeOpacity={0.8}>
                <Text style={styles.dialEmoji}>{en.icon}</Text>
                <Text style={styles.dialLabel}>{en.label}</Text>
                <View style={[styles.dialNumBadge, { backgroundColor: en.color }]}><Text style={styles.dialNum}>{en.number}</Text></View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((f) => (
            <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
              <Text style={styles.filterEmoji}>{f.emoji}</Text>
              <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mais próximos{!userLocation ? ' (localização indisponível)' : ''}</Text>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.emergency} style={{ marginVertical: Spacing.xl }} />
          ) : filteredPlaces.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>{userLocation ? 'Nenhum serviço de emergência encontrado na sua área.' : 'Ative a localização para ver serviços próximos.'}</Text></View>
          ) : (
            filteredPlaces.map((place) => <EmergencyCard key={place.id} place={place} onPress={handlePlacePress} userCoords={userLocation} />)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dicas de segurança</Text>
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <View style={styles.tipContent}><Text style={styles.tipTitle}>{tip.title}</Text><Text style={styles.tipText}>{tip.text}</Text></View>
            </View>
          ))}
        </View>
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.emergency, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.sm },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerEmoji: { fontSize: 22 },
  headerTitle: { ...Typography.h2, color: 'white' },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  dialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dialCard: { flex: 1, minWidth: '30%', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, ...Shadow.sm },
  dialEmoji: { fontSize: 28, marginBottom: Spacing.xs },
  dialLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs },
  dialNumBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  dialNum: { ...Typography.h4, color: 'white' },
  filters: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.borderLight },
  filterChipActive: { backgroundColor: Colors.emergency },
  filterEmoji: { fontSize: 14 },
  filterLabel: { ...Typography.label, color: Colors.text },
  filterLabelActive: { color: 'white' },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  tipEmoji: { fontSize: 28, marginRight: Spacing.md },
  tipContent: { flex: 1 },
  tipTitle: { ...Typography.h4, color: Colors.text, marginBottom: 4 },
  tipText: { ...Typography.body, color: Colors.textSecondary },
});
