/**
 * Función 3 — Recuperación de contraseña
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
 
type Step = 'email' | 'code' | 'newpass' | 'done';
 
export default function ForgotPasswordScreen() {
  const router  = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep]       = useState<Step>('email');
  const [email, setEmail]     = useState('');
  const [code, setCode]       = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }
 
  const simulate = (next: Step) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setStep(next);
    }, 1200);
  };
 
  const stepConfig = {
    email:   { icon: 'mail-outline', title: 'Recuperar contraseña', subtitle: 'Ingresa tu correo registrado' },
    code:    { icon: 'keypad-outline', title: 'Código de verificación', subtitle: `Enviamos un código a ${email}` },
    newpass: { icon: 'lock-closed-outline', title: 'Nueva contraseña', subtitle: 'Elige una contraseña segura' },
    done:    { icon: 'checkmark-circle', title: '¡Listo!', subtitle: 'Tu contraseña fue actualizada' },
  };
 
  const cfg = stepConfig[step];
 
  return (
    <LinearGradient colors={['#060D1F', '#0F2356', '#0B3D2E']} style={styles.bg}>
      <View style={styles.container}>
 
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
 
        <Ionicons name={cfg.icon as any} size={52} color="#34D399" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>{cfg.title}</Text>
        <Text style={styles.subtitle}>{cfg.subtitle}</Text>
 
        <View style={styles.dots}>
          {(['email', 'code', 'newpass', 'done'] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.dot,
                step === s && styles.dotActive,
                (['email','code','newpass','done'] as Step[]).indexOf(step) > i && styles.dotDone
              ]}
            />
          ))}
        </View>
 
        <View style={styles.card}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
 
          {step === 'email' && (
            <>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <TouchableOpacity style={styles.btn} onPress={() => {
                if (!email.includes('@')) { setError('Ingresa un correo válido.'); return; }
                simulate('code');
              }} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Enviar código</Text>}
              </TouchableOpacity>
            </>
          )}
 
          {step === 'code' && (
            <>
              <Text style={styles.label}>Código de 6 dígitos</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="keypad-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#475569"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />
              </View>
              <TouchableOpacity style={styles.btn} onPress={() => {
                if (code.length !== 6) { setError('El código debe tener 6 dígitos.'); return; }
                simulate('newpass');
              }} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Verificar código</Text>}
              </TouchableOpacity>
            </>
          )}
 
          {step === 'newpass' && (
            <>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mín. 8 chars"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={newPass}
                  onChangeText={setNewPass}
                />
              </View>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repite la contraseña"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>
              <TouchableOpacity style={styles.btn} onPress={() => {
                if (newPass.length < 8) { setError('Mínimo 8 caracteres.'); return; }
                if (newPass !== confirm) { setError('Las contraseñas no coinciden.'); return; }
                simulate('done');
              }} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Actualizar contraseña</Text>}
              </TouchableOpacity>
            </>
          )}
 
          {step === 'done' && (
            <>
              <Text style={styles.doneText}>
                Tu contraseña fue actualizada exitosamente. Ya puedes iniciar sesión.
              </Text>
              <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.btnText}>Ir al login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
 
const styles = StyleSheet.create({
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bg:         { flex: 1 },
  container:  { flex: 1, padding: 24, paddingTop: 64, alignItems: 'center' },
  back:       { position: 'absolute', top: 56, left: 24 },
  title:      { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subtitle:   { color: '#94A3B8', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  dots:       { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1E293B' },
  dotActive:  { backgroundColor: '#34D399', width: 24, borderRadius: 5 },
  dotDone:    { backgroundColor: '#059669' },
  card:       { width: '100%', backgroundColor: '#0F172A', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
  error:      { backgroundColor: '#7F1D1D', color: '#FCA5A5', borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 13 },
  label:      { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  inputIcon:  { paddingLeft: 14, paddingRight: 6 },
  input:      { flex: 1, color: 'white', fontSize: 15, paddingVertical: 14, paddingRight: 14 },
  btn:        { backgroundColor: '#34D399', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnText:    { color: 'white', fontSize: 16, fontWeight: '700' },
  doneText:   { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
}); 