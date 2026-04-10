/**
 * Función 6 — Registrar lectura de glucosa (manual)
 */
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { glucose } from '../../services/api';

type ContextType = 'fasting' | 'postprandial' | 'random';

const CONTEXTS = [
  { value: 'fasting',      label: 'En ayunas',       icon: 'moon-outline',        hint: 'Sin comer por al menos 8 horas' },
  { value: 'postprandial', label: 'Después de comer', icon: 'restaurant-outline', hint: '2 horas después de una comida' },
  { value: 'random',       label: 'Aleatorio',       icon: 'shuffle-outline',     hint: 'En cualquier momento del día' },
];

const REF = [
  { label: 'Hipoglucemia',  range: '< 70',      color: '#F472B6' },
  { label: 'Normal',        range: '70 – 99*',  color: '#34D399' },
  { label: 'Prediabetes',   range: '100 – 125*',color: '#FBBF24' },
  { label: 'Glucosa alta',  range: '≥ 126*',    color: '#F87171' },
];

export default function ReadingScreen() {
  const router = useRouter();

  const [value, setValue]     = useState('');
  const [context, setContext] = useState<ContextType>('fasting');
  const [notes, setNotes]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (loading) return; 

    const cleaned = value.trim();
    const num = parseFloat(cleaned);

    if (!cleaned || isNaN(num)) {
      setError('Ingresa un valor numérico válido.');
      return;
    }

    if (num < 20 || num > 600) {
      setError('El valor debe estar entre 20 y 600 mg/dL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await glucose.create({
        glucose_value: num,
        context,
        source: 'manual',
        notes: notes.trim(),
      });

      router.push(`/result/${result.id}` as any);

    } catch (e) {
      setError('Error al registrar la lectura. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#060D1F' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar lectura</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* ERROR */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* INPUT VALOR */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Nivel de glucosa</Text>
          <View style={styles.valueRow}>
            <TextInput
              style={styles.valueInput}
              placeholder="---"
              placeholderTextColor="#334155"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={(text) => {
                setValue(text);
                if (error) setError('');
              }}
            />
            <Text style={styles.valueUnit}>mg/dL</Text>
          </View>
        </View>

        {/* CONTEXTO */}
        <Text style={styles.sectionTitle}>Contexto de la medición</Text>
        {CONTEXTS.map(c => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.contextCard,
              context === c.value && styles.contextCardActive
            ]}
            onPress={() => setContext(c.value as ContextType)}
            activeOpacity={0.85}
          >
            <View style={[
              styles.contextIcon,
              context === c.value && { backgroundColor: '#34D39930' }
            ]}>
              <Ionicons
                name={c.icon as any}
                size={22}
                color={context === c.value ? '#34D399' : '#64748B'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[
                styles.contextLabel,
                context === c.value && { color: '#34D399' }
              ]}>
                {c.label}
              </Text>
              <Text style={styles.contextHint}>{c.hint}</Text>
            </View>

            {context === c.value && (
              <Ionicons name="checkmark-circle" size={20} color="#34D399" />
            )}
          </TouchableOpacity>
        ))}

        {/* NOTAS */}
        <Text style={styles.sectionTitle}>Notas (opcional)</Text>
        <TextInput
          style={styles.notes}
          placeholder="Ej: Tomé la lectura antes del desayuno..."
          placeholderTextColor="#475569"
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />

        {/* REFERENCIA */}
        <Text style={styles.sectionTitle}>Valores de referencia *</Text>
        <View style={styles.refTable}>
          {REF.map(r => (
            <View key={r.label} style={styles.refRow}>
              <View style={[styles.refDot, { backgroundColor: r.color }]} />
              <Text style={styles.refLabel}>{r.label}</Text>
              <Text style={[styles.refRange, { color: r.color }]}>{r.range}</Text>
            </View>
          ))}
          <Text style={styles.refNote}>
            * Valores en ayunas. Rangos postprandiales difieren.
          </Text>
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.btnInner}>
              <Ionicons name="analytics-outline" size={20} color="white" />
              <Text style={styles.btnText}>Analizar lectura</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:           { flexGrow: 1, paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  headerTitle:      { color: 'white', fontSize: 18, fontWeight: '700' },

  error:            { backgroundColor: '#7F1D1D', color: '#FCA5A5', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 },

  valueCard:        { backgroundColor: '#0F172A', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: '#1E293B' },
  valueLabel:       { color: '#94A3B8', fontSize: 14, marginBottom: 12 },
  valueRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  valueInput:       { color: 'white', fontSize: 56, fontWeight: '900', textAlign: 'center', minWidth: 160 },
  valueUnit:        { color: '#64748B', fontSize: 18, paddingBottom: 10 },

  sectionTitle:     { color: '#E2E8F0', fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  contextCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: '#1E293B' },
  contextCardActive:{ borderColor: '#34D39960', backgroundColor: '#0F2418' },
  contextIcon:      { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  contextLabel:     { color: 'white', fontSize: 15, fontWeight: '600' },
  contextHint:      { color: '#64748B', fontSize: 12, marginTop: 2 },

  notes:            { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, color: 'white', fontSize: 14, borderWidth: 1, borderColor: '#1E293B', marginBottom: 20, textAlignVertical: 'top' },

  refTable:         { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#1E293B' },
  refRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E293B', gap: 10 },
  refDot:           { width: 10, height: 10, borderRadius: 5 },
  refLabel:         { flex: 1, color: '#94A3B8', fontSize: 14 },
  refRange:         { fontSize: 14, fontWeight: '700' },
  refNote:          { color: '#475569', fontSize: 11, marginTop: 10 },

  btn:              { backgroundColor: '#34D399', borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  btnInner:         { flexDirection: 'row', gap: 8, alignItems: 'center' },
  btnText:          { color: 'white', fontSize: 17, fontWeight: '700' },
});