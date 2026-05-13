import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, Platform, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../services/storageService';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../theme';

interface Props { navigation: any; }

export default function SettingsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const s = await StorageService.getSettings();
    setNotifications(!!(s.notifications));
    setSaveHistory(s.saveHistory !== false);
  };

  const handleClearHistory = () => {
    Alert.alert('Limpar histórico', 'Deseja apagar todos os locais visitados recentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: async () => { await StorageService.saveSettings({ recentCleared: Date.now() }); Alert.alert('Pronto!', 'Histórico limpo com sucesso.'); } },
    ]);
  };

  const handleClearFavorites = () => {
    Alert.alert('Limpar favoritos', 'Deseja remover todos os favoritos?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: async () => { await StorageService.saveSettings({ favoritesCleared: Date.now() }); Alert.alert('Pronto!', 'Favoritos removidos.'); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: `${Colors.primary}15` }]}><Ionicons name="notifications" size={20} color={Colors.primary} /></View>
            <View style={styles.rowContent}><Text style={styles.rowLabel}>Notificações</Text><Text style={styles.rowDescription}>Alertas de locais e promoções próximas</Text></View>
            <Switch value={notifications} onValueChange={async (v) => { setNotifications(v); await StorageService.saveSettings({ notifications: v }); }} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor="white" />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: `${Colors.primary}15` }]}><Ionicons name="time" size={20} color={Colors.primary} /></View>
            <View style={styles.rowContent}><Text style={styles.rowLabel}>Salvar histórico</Text><Text style={styles.rowDescription}>Guardar locais visitados recentemente</Text></View>
            <Switch value={saveHistory} onValueChange={async (v) => { setSaveHistory(v); await StorageService.saveSettings({ saveHistory: v }); }} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor="white" />
          </View>
        </View>

        <Text style={styles.sectionLabel}>DADOS</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleClearHistory} activeOpacity={0.8}>
            <View style={[styles.rowIcon, { backgroundColor: `${Colors.error}15` }]}><Ionicons name="trash" size={20} color={Colors.error} /></View>
            <View style={styles.rowContent}><Text style={[styles.rowLabel, { color: Colors.error }]}>Limpar histórico</Text><Text style={styles.rowDescription}>Apagar locais visitados recentemente</Text></View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleClearFavorites} activeOpacity={0.8}>
            <View style={[styles.rowIcon, { backgroundColor: `${Colors.error}15` }]}><Ionicons name="heart-dislike" size={20} color={Colors.error} /></View>
            <View style={styles.rowContent}><Text style={[styles.rowLabel, { color: Colors.error }]}>Limpar favoritos</Text><Text style={styles.rowDescription}>Remover todos os locais salvos</Text></View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>SOBRE O NEARME</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://console.cloud.google.com/')} activeOpacity={0.8}>
            <View style={[styles.rowIcon, { backgroundColor: '#4285F415' }]}><Ionicons name="globe" size={20} color="#4285F4" /></View>
            <View style={styles.rowContent}><Text style={styles.rowLabel}>API do Google Maps</Text><Text style={styles.rowDescription}>Configurar chave de API</Text></View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: `${Colors.primary}15` }]}><Ionicons name="information-circle" size={20} color={Colors.primary} /></View>
            <View style={styles.rowContent}><Text style={styles.rowLabel}>Versão</Text><Text style={styles.rowDescription}>1.0.0</Text></View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>NearMe — Tudo perto de você</Text>
          <Text style={styles.footerSub}>Feito com ❤️ para facilitar sua vida</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.h2, color: 'white' },
  scrollContent: { padding: Spacing.md },
  sectionLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.md, ...Shadow.sm, overflow: 'hidden', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  rowIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rowContent: { flex: 1 },
  rowLabel: { ...Typography.h4, color: Colors.text },
  rowDescription: { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.md + 36 + Spacing.md },
  footer: { alignItems: 'center', padding: Spacing.xl, marginTop: Spacing.md },
  footerText: { ...Typography.h4, color: Colors.textSecondary },
  footerSub: { ...Typography.bodySmall, color: Colors.textLight, marginTop: 4 },
});
