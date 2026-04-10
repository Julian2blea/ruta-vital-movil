import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
 
export default function AdminLayout() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
 
if (isLoading) {
    return (
        <View style={styles.denied}>
        <Ionicons name="time-outline" size={52} color="#60A5FA" />
        <Text style={styles.deniedTitle}>Cargando...</Text>
        </View>
    );
}

if (!isAuthenticated) {
  router.replace('/(auth)/login');
  return null;
}

if (!isAdmin) {
  return (
    <View style={styles.denied}>
      <Ionicons name="lock-closed" size={52} color="#F87171" />
      <Text style={styles.deniedTitle}>Acceso restringido</Text>
      <Text style={styles.deniedText}>
        No tienes permisos de administrador para ver esta sección.
      </Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.backBtnText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}
 
  return <Stack screenOptions={{ headerShown: false }} />;
}
 
const styles = StyleSheet.create({
  denied:       { flex: 1, backgroundColor: '#060D1F', justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  deniedTitle:  { color: '#F87171', fontSize: 22, fontWeight: '800' },
  deniedText:   { color: '#64748B', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  backBtn:      { backgroundColor: '#0F172A', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, borderWidth: 1, borderColor: '#1E293B', marginTop: 8 },
  backBtnText:  { color: '#94A3B8', fontWeight: '600' },
});
 