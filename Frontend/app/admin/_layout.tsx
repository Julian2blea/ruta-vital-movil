import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.denied}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Verificando permisos...</Text>
      </View>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <View style={styles.denied}>
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={42} color="#F87171" />
        </View>
        <Text style={styles.deniedTitle}>Acceso restringido</Text>
        <Text style={styles.deniedText}>
          No tienes permisos de administrador para acceder a esta sección.
          Contacta al administrador del sistema si crees que esto es un error.
        </Text>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={16} color="#475569" />
          <Text style={styles.userInfoText}>Conectado como: @{user.login}</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  denied:        { flex: 1, backgroundColor: '#060D1F', justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  lockIcon:      { width: 88, height: 88, borderRadius: 44, backgroundColor: '#F871711A', borderWidth: 1, borderColor: '#F8717140', alignItems: 'center', justifyContent: 'center' },
  deniedTitle:   { color: '#F87171', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  deniedText:    { color: '#64748B', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  userInfo:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#1E293B' },
  userInfoText:  { color: '#475569', fontSize: 13 },
  backBtn:       { backgroundColor: '#0F172A', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, borderWidth: 1, borderColor: '#1E293B', marginTop: 8 },
  backBtnText:   { color: '#94A3B8', fontWeight: '600' },
  loadingText:   { color: '#64748B', fontSize: 14, marginTop: 8 },
});