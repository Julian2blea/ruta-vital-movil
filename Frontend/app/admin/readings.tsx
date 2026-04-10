/**
 * Función 16 — Visualización de lecturas globales del sistema
 */
import { useEffect, useState } from 'react';
import {View, Text, FlatList, TouchableOpacity,StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { admin } from '../../services/api';
 
const STATUS_COLOR: Record<string, string> = {
  hypoglycemia: '#F472B6',
  normal:       '#34D399',
  prediabetes:  '#FBBF24',
  high_glucose: '#F87171',
};
const STATUS_LABEL: Record<string, string> = {
  hypoglycemia: 'Hipoglucemia',
  normal:       'Normal',
  prediabetes:  'Prediabetes',
  high_glucose: 'Glucosa Alta',
};
const CONTEXT_LABEL: Record<string, string> = {
  fasting:      'Ayunas',
  postprandial: 'Postprandial',
  random:       'Aleatorio',
};
 
export default function AdminReadingsScreen() {
  const router = useRouter();
  const [readings, setReadings]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
 
  const load = async () => {
    try {
      const data = await admin.allReadings();
      setReadings(data?.results || data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };
 
  useEffect(() => { load(); }, []);
 
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FBBF24" /></View>;
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lecturas globales</Text>
        <Text style={styles.count}>{readings.length} total</Text>
      </View>
 
      {/* Summary stats */}
      <View style={styles.statsRow}>
        {Object.entries(STATUS_LABEL).map(([key, label]) => {
          const c = readings.filter(r => r.status === key).length;
          return (
            <View key={key} style={styles.statCard}>
              <Text style={[styles.statVal, { color: STATUS_COLOR[key] }]}>{c}</Text>
              <Text style={styles.statLbl}>{label}</Text>
            </View>
          );
        })}
      </View>
 
      {readings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="pulse-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>No hay lecturas en el sistema aún</Text>
        </View>
      ) : (
        <FlatList
          data={readings}
          keyExtractor={r => String(r.id)}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor="#FBBF24"
            />
          }
          renderItem={({ item: r }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/result/${r.id}` as any)}
            >
              <View style={[styles.colorBar, { backgroundColor: STATUS_COLOR[r.status] }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.userRow}>
                    <Ionicons name="person-circle-outline" size={16} color="#64748B" />
                    <Text style={styles.userLogin}>
                      {r.user?.login || `ID: ${r.id}`}
                    </Text>
                  </View>
                  <Text style={styles.cardDate}>
                    {new Date(r.reading_date).toLocaleDateString('es-CO')}
                  </Text>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={[styles.cardValue, { color: STATUS_COLOR[r.status] }]}>
                    {r.glucose_value} mg/dL
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[r.status] + '20' }]}>
                    <Text style={[styles.statusPillText, { color: STATUS_COLOR[r.status] }]}>
                      {STATUS_LABEL[r.status]}
                    </Text>
                  </View>
                  <Text style={styles.contextText}>{CONTEXT_LABEL[r.context] || r.context}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#475569" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#060D1F' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 56, paddingBottom: 16, gap: 12 },
  headerTitle:    { flex: 1, color: 'white', fontSize: 18, fontWeight: '700' },
  count:          { color: '#FBBF24', fontSize: 13, fontWeight: '600' },
  statsRow:       { flexDirection: 'row', paddingHorizontal: 22, gap: 8, marginBottom: 16 },
  statCard:       { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  statVal:        { fontSize: 18, fontWeight: '900' },
  statLbl:        { color: '#64748B', fontSize: 9, textAlign: 'center', marginTop: 2 },
  card:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden' },
  colorBar:       { width: 5, alignSelf: 'stretch' },
  cardContent:    { flex: 1, padding: 14 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  userRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userLogin:      { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  cardDate:       { color: '#475569', fontSize: 12 },
  cardBottom:     { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardValue:      { fontSize: 16, fontWeight: '800' },
  statusPill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  contextText:    { color: '#475569', fontSize: 12 },
  emptyText:      { color: '#475569', fontSize: 15, textAlign: 'center' },
});