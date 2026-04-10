/**
 * Función 7 — Simulación de lectura desde la app
 */
import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { glucose } from '../../services/api';

type SimState = 'idle' | 'scanning' | 'done';

const PROFILES = [
  { label: 'Perfil saludable',    min: 72,  max: 99,  color: '#34D399', icon: 'fitness-outline' },
  { label: 'Perfil prediabético', min: 100, max: 145, color: '#FBBF24', icon: 'warning-outline' },
  { label: 'Perfil diabético',    min: 146, max: 280, color: '#F87171', icon: 'medical-outline' },
  { label: 'Hipoglucemia',        min: 45,  max: 69,  color: '#F472B6', icon: 'alert-outline' },
];

export default function SimulateScreen() {
  const router = useRouter();

  const [state, setState]       = useState<SimState>('idle');
  const [profile, setProfile]   = useState(0);
  const [simValue, setSimValue] = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startScan = () => {
    if (state === 'scanning') return;

    setState('scanning');

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true
        }),
      ])
    );

    animationRef.current.start();

    setTimeout(() => {
      animationRef.current?.stop();
      pulse.setValue(1);

      const { min, max } = PROFILES[profile];

      // 🎯 valor más realista (distribución ligera)
      const val = Math.round(
        min + (Math.random() ** 0.7) * (max - min)
      );

      setSimValue(val);
      setState('done');
    }, 3000);
  };

  const handleSave = async () => {
    if (!simValue || loading) return;

    setLoading(true);

    try {
      const result = await glucose.create({
        glucose_value: simValue,
        context: 'random',
        source: 'simulated',
        notes: `Simulación — Perfil: ${PROFILES[profile].label}`,
      });

      router.push(`/result/${result.id}` as any);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    animationRef.current?.stop();
    pulse.setValue(1);

    setState('idle');
    setSimValue(null);
  };

  const p = PROFILES[profile];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simular lectura</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* INFO */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={18} color="#60A5FA" />
        <Text style={styles.infoText}>
          Simula la lectura de un glucómetro externo. Útil para demostrar el flujo del sistema sin hardware real.
        </Text>
      </View>

      {/* PERFIL */}
      {state === 'idle' && (
        <>
          <Text style={styles.sectionTitle}>Selecciona un perfil</Text>

          {PROFILES.map((pf, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.profileCard,
                profile === i && { borderColor: pf.color }
              ]}
              onPress={() => setProfile(i)}
              activeOpacity={0.85}
            >
              <View style={[styles.profileIcon, { backgroundColor: pf.color + '20' }]}>
                <Ionicons name={pf.icon as any} size={22} color={pf.color} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.profileLabel}>{pf.label}</Text>
                <Text style={[styles.profileRange, { color: pf.color }]}>
                  {pf.min}–{pf.max} mg/dL
                </Text>
              </View>

              {profile === i && (
                <Ionicons name="checkmark-circle" size={20} color={pf.color} />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* SCAN */}
      {state === 'scanning' && (
        <View style={styles.scanBox}>
          <Animated.View
            style={[
              styles.scanCircle,
              { transform: [{ scale: pulse }], borderColor: p.color }
            ]}
          >
            <Ionicons name="pulse-outline" size={48} color={p.color} />
          </Animated.View>

          <Text style={styles.scanLabel}>Leyendo glucómetro...</Text>
          <Text style={[styles.scanSub, { color: p.color }]}>{p.label}</Text>
        </View>
      )}

      {/* RESULTADO */}
      {state === 'done' && simValue && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Resultado simulado</Text>
          <Text style={[styles.resultValue, { color: p.color }]}>
            {simValue}
          </Text>
          <Text style={styles.resultUnit}>mg/dL</Text>
          <Text style={[styles.resultProfile, { color: p.color }]}>
            {p.label}
          </Text>
        </View>
      )}

      {/* BOTONES */}
      <View style={styles.btnRow}>
        {state === 'idle' && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: p.color }]}
            onPress={startScan}
            activeOpacity={0.85}
          >
            <Ionicons name="play-circle-outline" size={22} color="white" />
            <Text style={styles.btnText}>Iniciar simulación</Text>
          </TouchableOpacity>
        )}

        {state === 'done' && (
          <>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: p.color, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.btnText}>
                {loading ? 'Guardando...' : 'Guardar y ver resultado'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={reset}>
              <Text style={styles.btnSecondaryText}>Simular de nuevo</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#060D1F' },
  scroll:         { flexGrow: 1, paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40 },

  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle:    { color: 'white', fontSize: 18, fontWeight: '700' },

  infoCard:       { flexDirection: 'row', gap: 10, backgroundColor: '#0F172A', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#1E293B' },
  infoText:       { flex: 1, color: '#94A3B8', fontSize: 13, lineHeight: 19 },

  sectionTitle:   { color: '#E2E8F0', fontSize: 14, fontWeight: '700', marginBottom: 12 },

  profileCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 10, gap: 14, borderWidth: 1, borderColor: '#1E293B' },
  profileIcon:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  profileLabel:   { color: 'white', fontSize: 15, fontWeight: '600' },
  profileRange:   { fontSize: 13, marginTop: 2 },

  scanBox:        { alignItems: 'center', paddingVertical: 48, gap: 16 },
  scanCircle:     { width: 120, height: 120, borderRadius: 60, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' },
  scanLabel:      { color: 'white', fontSize: 18, fontWeight: '700' },
  scanSub:        { fontSize: 14 },

  resultBox:      { alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 24, padding: 32, marginVertical: 24, borderWidth: 1, borderColor: '#1E293B', gap: 4 },
  resultLabel:    { color: '#94A3B8', fontSize: 14 },
  resultValue:    { fontSize: 72, fontWeight: '900' },
  resultUnit:     { color: '#64748B', fontSize: 18 },
  resultProfile:  { fontSize: 16, fontWeight: '700', marginTop: 8 },

  btnRow:         { gap: 12, marginTop: 8 },

  btn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 18, paddingVertical: 18, gap: 8 },
  btnText:        { color: 'white', fontSize: 17, fontWeight: '700' },

  btnSecondary:   { alignItems: 'center', paddingVertical: 14 },
  btnSecondaryText: { color: '#64748B', fontSize: 14 },
});