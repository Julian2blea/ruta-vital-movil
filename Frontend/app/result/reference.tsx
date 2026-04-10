/**
 * Función 12 — Pantalla informativa: Rangos de referencia ADA
 */
import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
 
const RANGES = [
  {
    context: 'En ayunas (8+ horas sin comer)',
    icon: 'moon-outline',
    rows: [
      { status: 'Hipoglucemia',  range: '< 70 mg/dL',     color: '#F472B6', action: 'Ingesta inmediata de azúcar' },
      { status: 'Normal',        range: '70 – 99 mg/dL',   color: '#34D399', action: 'Mantén tus hábitos' },
      { status: 'Prediabetes',   range: '100 – 125 mg/dL', color: '#FBBF24', action: 'Ejercicio y ajuste dietario' },
      { status: 'Diabetes',      range: '≥ 126 mg/dL',     color: '#F87171', action: 'Atención médica' },
    ]
  },
  {
    context: 'Postprandial (2 horas después de comer)',
    icon: 'restaurant-outline',
    rows: [
      { status: 'Hipoglucemia',  range: '< 70 mg/dL',     color: '#F472B6', action: 'Ingesta inmediata de azúcar' },
      { status: 'Normal',        range: '70 – 139 mg/dL',  color: '#34D399', action: 'Respuesta glucémica adecuada' },
      { status: 'Prediabetes',   range: '140 – 199 mg/dL', color: '#FBBF24', action: 'Caminata + reducir carbos' },
      { status: 'Diabetes',      range: '≥ 200 mg/dL',     color: '#F87171', action: 'Consulta médica' },
    ]
  },
  {
    context: 'Aleatorio (cualquier momento)',
    icon: 'shuffle-outline',
    rows: [
      { status: 'Hipoglucemia',  range: '< 70 mg/dL',     color: '#F472B6', action: 'Ingesta inmediata de azúcar' },
      { status: 'Normal',        range: '70 – 139 mg/dL',  color: '#34D399', action: 'Sin acción necesaria' },
      { status: 'Elevado',       range: '140 – 199 mg/dL', color: '#FBBF24', action: 'Medir en ayunas para confirmar' },
      { status: 'Muy elevado',   range: '≥ 200 mg/dL',     color: '#F87171', action: 'Atención médica' },
    ]
  },
];
 
const TIPS = [
  { icon: 'water-outline',      color: '#60A5FA', tip: 'Beber suficiente agua ayuda a los riñones a eliminar el exceso de glucosa.' },
  { icon: 'walk-outline',       color: '#34D399', tip: 'Una caminata de 20-30 min después de comer reduce el pico glucémico hasta un 30%.' },
  { icon: 'leaf-outline',       color: '#A78BFA', tip: 'Los alimentos con bajo índice glucémico evitan picos bruscos de azúcar.' },
  { icon: 'bed-outline',        color: '#FBBF24', tip: 'Dormir menos de 6 horas puede aumentar la resistencia a la insulina.' },
  { icon: 'fitness-outline',    color: '#F472B6', tip: 'El ejercicio regular mejora la sensibilidad a la insulina a largo plazo.' },
];
 
export default function ReferenceScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rangos ADA</Text>
        <View style={{ width: 22 }} />
      </View>
 
      <View style={styles.sourceBox}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#60A5FA" />
        <Text style={styles.sourceText}>
          Basado en los estándares clínicos de la{' '}
          <Text style={styles.sourceLink}>American Diabetes Association (ADA) 2024</Text>
        </Text>
      </View>
 
      {RANGES.map((section, si) => (
        <View key={si} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name={section.icon as any} size={18} color="#94A3B8" />
            <Text style={styles.sectionTitle}>{section.context}</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHCell, { flex: 1.2 }]}>Estado</Text>
              <Text style={[styles.tableHCell, { flex: 1.5 }]}>Rango</Text>
              <Text style={[styles.tableHCell, { flex: 2 }]}>Acción sugerida</Text>
            </View>
            {section.rows.map((row, ri) => (
              <View key={ri} style={[styles.tableRow, ri % 2 === 0 && styles.tableRowAlt]}>
                <View style={[styles.statusCell, { flex: 1.2 }]}>
                  <View style={[styles.statusDot, { backgroundColor: row.color }]} />
                  <Text style={[styles.statusText, { color: row.color }]}>{row.status}</Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1.5, color: row.color, fontWeight: '700' }]}>{row.range}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{row.action}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
 
      <Text style={styles.tipsTitle}>Consejos para el control glucémico</Text>
      {TIPS.map((t, i) => (
        <View key={i} style={styles.tipCard}>
          <View style={[styles.tipIcon, { backgroundColor: t.color + '20' }]}>
            <Ionicons name={t.icon as any} size={20} color={t.color} />
          </View>
          <Text style={styles.tipText}>{t.tip}</Text>
        </View>
      ))}
 
      <Text style={styles.disclaimer}>
        Esta información es de carácter educativo. No reemplaza el diagnóstico ni el tratamiento médico profesional. Consulta siempre a tu médico.
      </Text>
 
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F' },
  container:     { flex: 1, backgroundColor: '#060D1F' },
  scroll:        { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle:   { color: 'white', fontSize: 18, fontWeight: '700' },
  sourceBox:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#0F172A', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#1E293B' },
  sourceText:    { flex: 1, color: '#94A3B8', fontSize: 13, lineHeight: 19 },
  sourceLink:    { color: '#60A5FA', fontWeight: '700' },
  section:       { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle:  { color: '#E2E8F0', fontSize: 14, fontWeight: '700' },
  table:         { backgroundColor: '#0F172A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  tableHeader:   { flexDirection: 'row', backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 10 },
  tableHCell:    { color: '#64748B', fontSize: 12, fontWeight: '700' },
  tableRow:      { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  tableRowAlt:   { backgroundColor: '#FFFFFF04' },
  statusCell:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot:     { width: 8, height: 8, borderRadius: 4 },
  statusText:    { fontSize: 12, fontWeight: '600' },
  tableCell:     { color: '#94A3B8', fontSize: 12 },
  tipsTitle:     { color: '#E2E8F0', fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  tipCard:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#0F172A', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1E293B' },
  tipIcon:       { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipText:       { flex: 1, color: '#94A3B8', fontSize: 13, lineHeight: 20 },
  disclaimer:    { color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 20, lineHeight: 18 },
});