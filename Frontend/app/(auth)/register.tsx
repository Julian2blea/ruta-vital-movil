/**
 * Función 2 — Registro de nuevo usuario
 */
import { use, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function RegisterScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', login: '',
    password: '', confirm: '',
  });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);


  const validate = () => {
    if (!form.first_name || !form.last_name || !form.login || !form.password)
      return 'Nombre, apellido, usuario y contraseña son obligatorios.';
    if (form.login.length < 4)
      return 'El usuario debe tener al menos 4 caracteres.';
    if (form.password.length < 8)
      return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(form.password))
      return 'La contraseña debe tener al menos una mayúscula.';
    if (!/[0-9]/.test(form.password))
      return 'La contraseña debe tener al menos un número.';
    if (form.password !== form.confirm)
      return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await auth.register({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        login:      form.login,
        password:   form.password,
      });
      setSuccess(true);
    } catch (e: any) {
      const msg = e?.data?.login?.[0] || e?.data?.detail || 'Error al registrar. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }


  if (success) {
    return (
      <LinearGradient colors={['#060D1F', '#0F2356', '#0B3D2E']} style={styles.bg}>
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={72} color="#34D399" />
          <Text style={styles.successTitle}>¡Cuenta creada!</Text>
          <Text style={styles.successText}>Ya puedes iniciar sesión con tu usuario.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.btnText}>Ir al login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#060D1F', '#0F2356', '#0B3D2E']} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.logoRow}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>Ruta Vital</Text>
          </View>

          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Completa los datos para comenzar</Text>

          <View style={styles.card}>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {[
              { key: 'first_name', label: 'Nombre',      icon: 'person-outline',   placeholder: 'Tu nombre' },
              { key: 'last_name',  label: 'Apellido',    icon: 'person-outline',   placeholder: 'Tu apellido' },
              { key: 'email',      label: 'Correo (opcional)', icon: 'mail-outline', placeholder: 'correo@ejemplo.com' },
              { key: 'login',      label: 'Usuario',     icon: 'at-outline',       placeholder: 'Mínimo 4 caracteres' },
            ].map(f => (
              <View key={f.key}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={f.icon as any} size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#475569"
                    autoCapitalize={f.key === 'email' || f.key === 'login' ? 'none' : 'words'}
                    keyboardType={f.key === 'email' ? 'email-address' : 'default'}
                    value={(form as any)[f.key]}
                    onChangeText={set(f.key)}
                  />
                </View>
              </View>
            ))}

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
                placeholderTextColor="#475569"
                secureTextEntry={!showPass}
                value={form.password}
                onChangeText={set('password')}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ paddingRight: 14 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#475569"
                secureTextEntry
                value={form.confirm}
                onChangeText={set('confirm')}
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Crear cuenta</Text>}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Iniciar sesión</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },  
  bg:           { flex: 1 },
  scroll:       { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  logoDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34D399' },
  logoText:     { color: 'white', fontSize: 20, fontWeight: '800' },
  title:        { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle:     { color: '#94A3B8', fontSize: 14, marginBottom: 24 },
  card:         { backgroundColor: '#0F172A', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
  error:        { backgroundColor: '#7F1D1D', color: '#FCA5A5', borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 13 },
  label:        { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  inputIcon:    { paddingLeft: 14, paddingRight: 6 },
  input:        { flex: 1, color: 'white', fontSize: 15, paddingVertical: 13, paddingRight: 14 },
  btn:          { backgroundColor: '#34D399', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 6, marginBottom: 18 },
  btnText:      { color: 'white', fontSize: 16, fontWeight: '700' },
  loginRow:     { flexDirection: 'row', justifyContent: 'center' },
  loginText:    { color: '#64748B', fontSize: 14 },
  loginLink:    { color: '#34D399', fontSize: 14, fontWeight: '600' },
  successBox:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  successTitle: { color: 'white', fontSize: 26, fontWeight: '800' },
  successText:  { color: '#94A3B8', fontSize: 15, textAlign: 'center' },
});