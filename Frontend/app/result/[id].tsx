/**
 * Función 8 — Ver resultado con recomendación detallada
 */
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { glucose } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
 
const STATUS_COLOR: Record<string, string> = {
  hypoglycemia: '#F472B6', normal: '#34D399', prediabetes: '#FBBF24', high_glucose: '#F87171',
};
const STATUS_LABEL: Record<string, string> = {
  hypoglycemia: 'Hipoglucemia', normal: 'Normal', prediabetes: 'Prediabetes', high_glucose: 'Glucosa Alta',
};
const STATUS_ICON: Record<string, string> = {
  hypoglycemia: 'alert-circle', normal: 'checkmark-circle', prediabetes: 'warning', high_glucose: 'close-circle',
};
const CONTEXT_LABEL: Record<string, string> = {
  fasting: 'En ayunas', postprandial: 'Postprandial', random: 'Aleatorio',
};
 
export default function ResultScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (isLoading) {
    return (
        <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
        </View>
    );
    }

  if (!isAuthenticated) {
    router.replace('/(auth)/login');
    return null;
    }
 

  useEffect(() => {
    glucose.getById(Number(id))
      .then(setReading)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);
 
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#34D399" /></View>;
  }
  if (!reading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#94A3B8' }}>Lectura no encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#34D399' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  const color = STATUS_COLOR[reading.status];
  const rec   = reading.recommendation;
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultado</Text>
        <View style={{ width: 22 }} />
      </View>
 
      {/* Main result card */}
      <LinearGradient colors={['#0F172A', '#1E293B']} style={[styles.resultCard, { borderColor: color + '40' }]}>
        <Ionicons name={STATUS_ICON[reading.status] as any} size={52} color={color} style={{ marginBottom: 10 }} />
        <Text style={[styles.resultValue, { color }]}>{reading.glucose_value}</Text>
        <Text style={styles.resultUnit}>mg/dL</Text>
        <View style={[styles.statusBadge, { backgroundColor: color + '20', borderColor: color + '60' }]}>
          <Text style={[styles.statusText, { color }]}>{STATUS_LABEL[reading.status]}</Text>
        </View>
        <Text style={styles.resultMeta}>
          {CONTEXT_LABEL[reading.context]} · {new Date(reading.reading_date).toLocaleString('es-CO')}
        </Text>
      </LinearGradient>
 
      {/* Medical warning */}
      {rec?.medical_warning && (
        <View style={styles.warningBanner}>
          <Ionicons name="medical-outline" size={20} color="#FCA5A5" />
          <Text style={styles.warningText}>Se recomienda consultar a un médico.</Text>
        </View>
      )}
 
      {/* Recommendation cards */}
      {rec && (
        <>{!rec && (
            <View style={styles.recCard}>
                <Text style={styles.recText}>
                No hay recomendaciones disponibles para esta lectura.
                </Text>
            </View>
            )}
          <View style={styles.recCard}>
            <View style={styles.recHeader}>
              <Ionicons name="flash-outline" size={18} color="#34D399" />
              <Text style={styles.recTitle}>¿Qué hacer ahora?</Text>
            </View>
            <Text style={styles.recText}>{rec.immediate_action}</Text>
          </View>
 
          {rec.additional_advice ? (
            <View style={styles.recCard}>
              <View style={styles.recHeader}>
                <Ionicons name="bulb-outline" size={18} color="#FBBF24" />
                <Text style={styles.recTitle}>Consejo adicional</Text>
              </View>
              <Text style={styles.recText}>{rec.additional_advice}</Text>
            </View>
          ) : null}
 
          <View style={styles.recCard}>
            <View style={styles.recHeader}>
              <Ionicons name="time-outline" size={18} color="#60A5FA" />
              <Text style={styles.recTitle}>¿Cuándo volver a medir?</Text>
            </View>
            <Text style={styles.recText}>{rec.when_to_measure}</Text>
          </View>
        </>
      )}
 
      {/* Notes */}
      {reading.notes ? (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Tus notas</Text>
          <Text style={styles.notesText}>{reading.notes}</Text>
        </View>
      ) : null}
 
      <Text style={styles.disclaimer}>
        ⚠️ Esta herramienta es de orientación general y no reemplaza el diagnóstico médico profesional.
      </Text>
 
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/reading')}>
          <Ionicons name="add-circle-outline" size={18} color="white" />
          <Text style={styles.btnText}>Nueva lectura</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(tabs)/history')}>
          <Text style={styles.btnSecondaryText}>Ver historial</Text>
        </TouchableOpacity>
      </View>
 
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#060D1F' },
  scroll:           { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40 },
  center:           { flex: 1, backgroundColor: '#060D1F', justifyContent: 'center', alignItems: 'center', gap: 14 },
  backBtn:          { padding: 12 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle:      { color: 'white', fontSize: 18, fontWeight: '700' },
  resultCard:       { borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 18, borderWidth: 1 },
  resultValue:      { fontSize: 64, fontWeight: '900' },
  resultUnit:       { color: '#64748B', fontSize: 18, marginBottom: 14 },
  statusBadge:      { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, marginBottom: 10 },
  statusText:       { fontSize: 16, fontWeight: '800' },
  resultMeta:       { color: '#64748B', fontSize: 13 },
  warningBanner:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#7F1D1D', borderRadius: 14, padding: 14, marginBottom: 16 },
  warningText:      { color: '#FCA5A5', fontSize: 14, flex: 1 },
  recCard:          { backgroundColor: '#0F172A', borderRadius: 18, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  recHeader:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  recTitle:         { color: '#E2E8F0', fontSize: 15, fontWeight: '700' },
  recText:          { color: '#94A3B8', fontSize: 14, lineHeight: 22 },
  notesCard:        { backgroundColor: '#0F172A', borderRadius: 18, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  notesTitle:       { color: '#64748B', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  notesText:        { color: '#94A3B8', fontSize: 14 },
  disclaimer:       { color: '#334155', fontSize: 12, textAlign: 'center', marginVertical: 18, lineHeight: 18 },
  btnRow:           { gap: 10 },
  btn:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#34D399', borderRadius: 16, paddingVertical: 16 },
  btnText:          { color: 'white', fontSize: 16, fontWeight: '700' },
  btnSecondary:     { alignItems: 'center', paddingVertical: 14 },
  btnSecondaryText: { color: '#64748B', fontSize: 14 },
});
 