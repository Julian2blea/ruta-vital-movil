/**
 * Función 9 — Historial de lecturas
 */
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { glucose } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
 
const STATUS_COLOR: Record<string, string> = {
  hypoglycemia: '#F472B6', normal: '#34D399', prediabetes: '#FBBF24', high_glucose: '#F87171',
};
const STATUS_LABEL: Record<string, string> = {
  hypoglycemia: 'Hipoglucemia', normal: 'Normal', prediabetes: 'Prediabetes', high_glucose: 'Glucosa Alta',
};
const CONTEXT_LABEL: Record<string, string> = {
  fasting: 'Ayunas', postprandial: 'Postprandial', random: 'Aleatorio',
};
const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual', simulated: 'Simulado', device: 'Dispositivo',
};
 
const FILTERS = ['all', 'normal', 'prediabetes', 'high_glucose', 'hypoglycemia'];
 
export default function HistoryScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [readings, setReadings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
 
  const load = async () => {
    try {
      const data = await glucose.history();
      setReadings(data?.results || data || []);
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated]);
 
  if (isLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }
 
  const filtered = filter === 'all'
    ? readings
    : readings.filter(r => r.status === filter);
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity onPress={() => router.push('/result/chart')}>
          <Ionicons name="bar-chart-outline" size={22} color="#34D399" />
        </TouchableOpacity>
      </View>
 
      {/* Filter pills */}
      <View style={styles.filtersWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={i => i}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 22 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.pill,
                filter === item && styles.pillActive,
                item !== 'all' && { borderColor: STATUS_COLOR[item] + '60' }
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  styles.pillText,
                  filter === item && styles.pillTextActive,
                  item !== 'all' && filter !== item && { color: STATUS_COLOR[item] }
                ]}
              >
                {item === 'all' ? 'Todas' : STATUS_LABEL[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
 
      <Text style={styles.count}>
        {filtered.length} lectura{filtered.length !== 1 ? 's' : ''}
      </Text>
 
      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>
            No hay lecturas{filter !== 'all' ? ' con este filtro' : ' aún'}
          </Text>

          {filter === 'all' && (
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => router.push('/(tabs)/reading')}
            >
              <Text style={styles.newBtnText}>
                Registrar primera lectura
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => String(r.id)}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#34D399"
            />
          }
          renderItem={({ item: r }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/result/${r.id}` as any)}
            >
              <View
                style={[
                  styles.colorBar,
                  { backgroundColor: STATUS_COLOR[r.status] }
                ]}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text
                    style={[
                      styles.cardValue,
                      { color: STATUS_COLOR[r.status] }
                    ]}
                  >
                    {r.glucose_value} mg/dL
                  </Text>
                  <Text style={styles.cardDate}>
                    {new Date(r.reading_date).toLocaleDateString('es-CO')}
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: STATUS_COLOR[r.status] + '20' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: STATUS_COLOR[r.status] }
                      ]}
                    >
                      {STATUS_LABEL[r.status]}
                    </Text>
                  </View>

                  <Text style={styles.cardMeta}>
                    {CONTEXT_LABEL[r.context]} · {SOURCE_LABEL[r.source]}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060D1F' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 16
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  filtersWrap: { marginBottom: 12 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  pillActive: {
    backgroundColor: '#34D39920',
    borderColor: '#34D399'
  },
  pillText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#34D399' },
  count: {
    color: '#475569',
    fontSize: 13,
    paddingHorizontal: 22,
    marginBottom: 12
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden'
  },
  colorBar: { width: 5, alignSelf: 'stretch' },
  cardContent: { flex: 1, padding: 14 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  cardValue: { fontSize: 18, fontWeight: '800' },
  cardDate: { color: '#475569', fontSize: 13 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  cardMeta: { color: '#475569', fontSize: 12 },
  emptyText: {
    color: '#475569',
    fontSize: 15,
    textAlign: 'center'
  },
  newBtn: {
    backgroundColor: '#34D399',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  newBtnText: { color: 'white', fontWeight: '700' }
});