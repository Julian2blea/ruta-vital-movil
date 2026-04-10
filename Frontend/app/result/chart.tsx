/**
 * Función 10 — Gráfica de tendencia glucémica
 */
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { glucose } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
 
const { width } = Dimensions.get('window');
const CHART_H = 200;
 
const STATUS_COLOR: Record<string, string> = {
  hypoglycemia: '#F472B6',
  normal: '#34D399',
  prediabetes: '#FBBF24',
  high_glucose: '#F87171',
};
 
export default function ChartScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 14 | 30>(7);
 
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (user) {
      glucose.history()
        .then(d => setReadings(d?.results || d || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);
 
  if (isLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }
 
  const sliced = readings.slice(0, range).reverse();
   const values = sliced.map((r: any) => r.glucose_value);
  const max = Math.max(...values, 200);
  const min = Math.min(...values, 60);
  const span = max - min || 1;
 
  const avg    = values.length
    ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
    : 0;

  const inRange = values.filter((v: number) => v >= 70 && v <= 139).length;

  const pct = values.length
    ? Math.round((inRange / values.length) * 100)
    : 0;
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tendencia glucémica</Text>
        <View style={{ width: 22 }} />
      </View>
 
      {/* Range pills */}
      <View style={styles.rangePills}>
        {([7, 14, 30]as const).map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.rangePill, range === r && styles.rangePillActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangePillText, range === r && styles.rangePillTextActive]}>
              {r} días
            </Text>
          </TouchableOpacity>
        ))}
      </View>
 
      {sliced.length < 2 ? (
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>
            Necesitas al menos 2 lecturas para ver la gráfica
          </Text> 

          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/(tabs)/reading')}
          >
            <Text style={styles.emptyBtnText}>Registrar lectura</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Chart */}
          <View style={styles.chartBox}>
            {/* Y axis */}
            <View style={styles.yAxis}>
              {[max, Math.round((max + min) / 2), min].map((v, i) => (
                <Text key={i} style={styles.yLabel}>{Math.round(v)}</Text>
              ))}
            </View>
 
            {/* Bars */}
            <View style={styles.bars}>
              {sliced.map((r: any,  i: number) => {
                const heightPct = (r.glucose_value - min) / span;
                const barH = Math.max(heightPct * CHART_H, 6);

                return (
                  <View key={i} style={styles.barWrap}>
                    <View
                      style={[
                        styles.bar,
                        { height: barH, backgroundColor: STATUS_COLOR[r.status] }
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {new Date(r.reading_date).getDate()}/
                      {new Date(r.reading_date).getMonth() + 1}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
 
          {/* Legend */}
          <View style={styles.legend}>
            {[
              { color: '#34D399', label: 'Normal: 70–139 mg/dL' },
              { color: '#FBBF24', label: 'Prediabetes / Elevado' },
              { color: '#F87171', label: 'Glucosa alta' },
              { color: '#F472B6', label: 'Hipoglucemia' },
            ].map(l => (
              <View key={l.label} style={styles.legendRow}>
                <View style={[styles.legendLine, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
 
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[
                styles.statVal,
                { color: avg >= 70 && avg <= 139 ? '#34D399' : '#FBBF24' }
              ]}>
                {avg}
              </Text>
              <Text style={styles.statLbl}>Promedio{'\n'}mg/dL</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[
                styles.statVal,
                { color: pct >= 70 ? '#34D399' : '#FBBF24' }
              ]}>
                {pct}%
              </Text>
              <Text style={styles.statLbl}>En rango{'\n'}normal</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statVal}>{values.length}</Text>
              <Text style={styles.statLbl}>Lecturas{'\n'}analizadas</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#060D1F' },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F' },
  scroll:             { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40 },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle:        { color: 'white', fontSize: 18, fontWeight: '700' },
  rangePills:         { flexDirection: 'row', gap: 10, marginBottom: 24 },
  rangePill:          { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B' },
  rangePillActive:    { backgroundColor: '#34D39920', borderColor: '#34D399' },
  rangePillText:      { color: '#64748B', fontWeight: '600' },
  rangePillTextActive:{ color: '#34D399' },
  chartBox:           { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1E293B', height: CHART_H + 50 },
  yAxis:              { justifyContent: 'space-between', paddingRight: 8, paddingBottom: 24 },
  yLabel:             { color: '#475569', fontSize: 11 },
  bars:               { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barWrap:            { flex: 1, alignItems: 'center', gap: 4 },
  bar:                { width: '80%', borderRadius: 4, minHeight: 6 },
  barLabel:           { color: '#475569', fontSize: 9 },
  legend:             { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 16, gap: 8, borderWidth: 1, borderColor: '#1E293B' },
  legendRow:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendLine:         { width: 20, height: 4, borderRadius: 2 },
  legendText:         { color: '#94A3B8', fontSize: 13 },
  statsRow:           { flexDirection: 'row', gap: 10 },
  statCard:           { flex: 1, backgroundColor: '#0F172A', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  statVal:            { color: 'white', fontSize: 22, fontWeight: '900' },
  statLbl:            { color: '#64748B', fontSize: 11, textAlign: 'center', marginTop: 4 },
  empty:              { alignItems: 'center', paddingVertical: 40, gap: 14 },
  emptyText:          { color: '#475569', fontSize: 15, textAlign: 'center' },
  emptyBtn:           { backgroundColor: '#34D399', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:       { color: 'white', fontWeight: '700' },
});