/**
 * Función 5 — Dashboard principal con resumen glucémico
 */
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { glucose } from '../../services/api';

const STATUS_COLOR: Record<string, string> = {
  hypoglycemia: '#F472B6',
  normal:       '#34D399',
  prediabetes:  '#FBBF24',
  high_glucose: '#F87171',
};
const STATUS_LABEL: Record<string, string> = {
  hypoglycemia: '⚠️ Hipoglucemia',
  normal:       '✅ Normal',
  prediabetes:  '🟡 Prediabetes',
  high_glucose: '🔴 Glucosa Alta',
};

export default function DashboardScreen() {
  const { user, isAdmin, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.person?.first_name || user?.login || 'Usuario';

  const load = async () => {
    try {
      const data = await glucose.history();
      setReadings(data?.results || data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.replace('/(auth)/login');
      }
  }, [isAuthenticated, isLoading]); 

  const latest  = readings[0];
  const normal  = readings.filter(r => r.status === 'normal').length;
  const total   = readings.length;

  if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F' }}>
          <ActivityIndicator size="large" color="#34D399" />
        </View>
      );
    }

  if (!isAuthenticated) {
      return null;
    }

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#34D399" />}
    >
      {/* HERO */}
      <LinearGradient colors={['#060D1F', '#0F2356', '#0B3D2E']} style={styles.hero}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FBBF24" />
                <Text style={styles.adminBadgeText}>Administrador</Text>
              </View>
            )}
          </View>
          {isAdmin && (
          <TouchableOpacity onPress={() => router.push('/(admin)' as any)}>
            <View style={styles.adminBtn}>
              <Ionicons name="settings-outline" size={20} color="#FBBF24" />
            </View>
          </TouchableOpacity>
        )}
        </View>

        {/* Latest reading */}
        {latest ? (
          <View style={styles.latestCard}>
            <Text style={styles.latestLabel}>Última lectura</Text>
            <Text style={[styles.latestValue, { color: STATUS_COLOR[latest.status] }]}>
              {latest.glucose_value} <Text style={styles.latestUnit}>mg/dL</Text>
            </Text>
            <Text style={styles.latestStatus}>{STATUS_LABEL[latest.status]}</Text>
          </View>
        ) : (
          <View style={styles.latestCard}>
            <Text style={styles.latestLabel}>Sin lecturas aún</Text>
            <Text style={styles.noReadingText}>Registra tu primera medición</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{total}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#34D399' }]}>{normal}</Text>
            <Text style={styles.statLbl}>Normales</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#F87171' }]}>{total - normal}</Text>
            <Text style={styles.statLbl}>Alertas</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'add-circle-outline', label: 'Registrar\nlectura',   route: '/reading',    color: '#34D399' },
            { icon: 'pulse-outline',      label: 'Simular\nlectura',     route: '/simulate',   color: '#60A5FA' },
            { icon: 'time-outline',       label: 'Historial',            route: '/history',    color: '#FBBF24' },
            { icon: 'bar-chart-outline',  label: 'Gráfica',              route: '/result/chart',      color: '#F472B6' },
            { icon: 'book-outline',       label: 'Referencia\nADA',      route: '/result/reference',  color: '#A78BFA' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard}
              onPress={() => router.push(a.route as any)}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon as any} size={24} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent readings */}
      {readings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Lecturas recientes</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          {readings.slice(0, 4).map(r => (
            <TouchableOpacity key={r.id} style={styles.readingRow}
              onPress={() => router.push(`/result/${r.id}` as any)}>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[r.status] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.readingVal}>{r.glucose_value} mg/dL</Text>
                <Text style={styles.readingCtx}>{r.context}</Text>
              </View>
              <Text style={styles.readingStatus}>{STATUS_LABEL[r.status]}</Text>
              <Ionicons name="chevron-forward" size={16} color="#475569" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#F87171" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#060D1F' },
  hero:           { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 22, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:       { color: 'white', fontSize: 22, fontWeight: '800' },
  adminBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FBBF2422', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  adminBadgeText: { color: '#FBBF24', fontSize: 11, fontWeight: '700' },
  adminBtn:       { backgroundColor: '#FBBF2420', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#FBBF2440' },
  latestCard:     { backgroundColor: '#FFFFFF0D', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#FFFFFF12' },
  latestLabel:    { color: '#94A3B8', fontSize: 13, marginBottom: 6 },
  latestValue:    { fontSize: 48, fontWeight: '900' },
  latestUnit:     { fontSize: 20, fontWeight: '400', color: '#94A3B8' },
  latestStatus:   { color: '#E2E8F0', fontSize: 16, marginTop: 4 },
  noReadingText:  { color: '#64748B', fontSize: 15, marginTop: 6 },
  statsRow:       { flexDirection: 'row', gap: 10 },
  statBox:        { flex: 1, backgroundColor: '#FFFFFF0D', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF10' },
  statVal:        { color: 'white', fontSize: 22, fontWeight: '800' },
  statLbl:        { color: '#64748B', fontSize: 12, marginTop: 2 },
  section:        { paddingHorizontal: 22, marginTop: 28 },
  sectionRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:   { color: '#E2E8F0', fontSize: 16, fontWeight: '700' },
  seeAll:         { color: '#34D399', fontSize: 13 },
  actionsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard:     { width: '30%', backgroundColor: '#0F172A', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  actionIcon:     { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel:    { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 16 },
  readingRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 14, padding: 14, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#1E293B' },
  statusDot:      { width: 10, height: 10, borderRadius: 5 },
  readingVal:     { color: 'white', fontSize: 15, fontWeight: '700' },
  readingCtx:     { color: '#64748B', fontSize: 12, marginTop: 2 },
  readingStatus:  { color: '#94A3B8', fontSize: 12 },
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 36 },
  logoutText:     { color: '#F87171', fontSize: 14, fontWeight: '600' },
});