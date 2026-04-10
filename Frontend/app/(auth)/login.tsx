/**
 * Función 1 — Inicio de sesión
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
 
export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
 
  const [loginVal, setLoginVal]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
  if (isAuthenticated) {
    router.replace('/(tabs)');
  }
}, [isAuthenticated]);
 
  const handleLogin = async () => {
    if (!loginVal.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(loginVal.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
                if (e?.status === 400 || e?.status === 401) {
            setError('Credenciales inválidas.');
        } else if (e?.status >= 500) {
            setError('Error del servidor. Intenta más tarde.');
        } else {
            setError('Error inesperado.');
        }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <LinearGradient colors={['#060D1F', '#0F2356', '#0B3D2E']} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
 
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>Ruta Vital</Text>
          </View>
 
          <Text style={styles.title}>Bienvenido de{'\n'}nuevo 👋</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
 
          <View style={styles.card}>
 
            {error ? <Text style={styles.error}>{error}</Text> : null}
 
            <Text style={styles.label}>Usuario</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre de usuario"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                autoCorrect={false}
                value={loginVal}
                onChangeText={(text) => {
                    setLoginVal(text);
                    setError('');
                    }}
              />
            </View>
 
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Tu contraseña"
                placeholderTextColor="#475569"
                secureTextEntry={!showPass}
                autoCorrect={false}
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                    }}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ paddingRight: 14 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
 
            {/* Forgot password */}
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </Link>
 
            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.btn,
                loading && { opacity: 0.7 }
                ]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>Iniciar sesión</Text>
              }
            </TouchableOpacity>
 
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Regístrate</Text>
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
  bg:           { flex: 1 },
  scroll:       { flexGrow: 1, paddingHorizontal: 24, paddingTop: 70, paddingBottom: 40 },
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34D399' },
  logoText:     { color: 'white', fontSize: 20, fontWeight: '800' },
  title:        { color: 'white', fontSize: 30, fontWeight: '800', lineHeight: 38, marginBottom: 8 },
  subtitle:     { color: '#94A3B8', fontSize: 15, marginBottom: 32 },
  card:         { backgroundColor: '#0F172A', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
  error:        { backgroundColor: '#7F1D1D', color: '#FCA5A5', borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 13 },
  label:        { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  inputIcon:    { paddingLeft: 14, paddingRight: 6 },
  input:        { flex: 1, color: 'white', fontSize: 15, paddingVertical: 14, paddingRight: 14 },
  forgotWrap:   { alignItems: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText:   { color: '#34D399', fontSize: 13 },
  btn:          { backgroundColor: '#34D399', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  btnText:      { color: 'white', fontSize: 16, fontWeight: '700' },
  registerRow:  { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#34D399', fontSize: 14, fontWeight: '600' },
});