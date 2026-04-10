/**
 * Función 13 — Panel de administrador
 */
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { admin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
 
export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const router   = useRouter();
  const [stats, setStats]   = useState({ users: 0, roles: 0, readings: 0, permissions: 0 });
  const [loading, setLoading] = useState(true);

  if (isLoading) {
  return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F' }}>
        <ActivityIndicator size="large" color="#FBBF24" />
        </View>
    );
    }

  if (!isAuthenticated) {
    router.replace('/(auth)/login');
    return null;
    }
    
  if (!isAdmin) {
    return (
        <View style={styles.blockedContainer}>
        <Ionicons name="lock-closed-outline" size={60} color="#F87171" />
        <Text style={styles.blockedTitle}>Acceso restringido</Text>
        <Text style={styles.blockedText}>
            No tienes permisos para acceder a este módulo.
        </Text>

        <TouchableOpacity
            style={styles.blockedBtn}
            onPress={() => router.replace('/(tabs)')}
        >
            <Text style={styles.blockedBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
        </View>
    );
    }  
 
  useEffect(() => {
    Promise.all([admin.listUsers(), admin.listRoles(), admin.allReadings(), admin.listPermissions()])
      .then(([u, r, rd, p]) => setStats({
        users:       u?.count || (Array.isArray(u) ? u.length : 0),
        roles:       Array.isArray(r) ? r.length : 0,
        readings:    rd?.count || (Array.isArray(rd) ? rd.length : 0),
        permissions: Array.isArray(p) ? p.length : 0,
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
 
  const ACTIONS = [
    { icon: 'people-outline',        label: 'Gestión de\nusuarios',     route: '/admin/users',       color: '#60A5FA' },
    { icon: 'key-outline',           label: 'Asignación\nde roles',     route: '/admin/users',       color: '#A78BFA' },
    { icon: 'shield-outline',        label: 'Permisos\ndel sistema',    route: '/admin/permissions', color: '#34D399' },
    { icon: 'pulse-outline',         label: 'Lecturas\nglobales',       route: '/admin/readings',    color: '#FBBF24' },
  ];
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
 
      <LinearGradient colors={['#1A0A00', '#3D2000', '#1A0A00']} style={styles.hero}>
        <View style={styles.heroHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FBBF24" />
            <Text style={styles.adminBadgeText}>Panel Admin</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>Bienvenido,</Text>
        <Text style={styles.heroName}>{user?.login}</Text>
        <Text style={styles.heroSub}>Vista de administrador del sistema</Text>
      </LinearGradient>
 
      {loading ? <ActivityIndicator color="#FBBF24" style={{ marginTop: 32 }} /> : (
        <>
          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Usuarios',    val: stats.users,       icon: 'people-outline',  color: '#60A5FA' },
              { label: 'Roles',       val: stats.roles,       icon: 'key-outline',     color: '#A78BFA' },
              { label: 'Lecturas',    val: stats.readings,    icon: 'pulse-outline',   color: '#FBBF24' },
              { label: 'Permisos',    val: stats.permissions, icon: 'shield-outline',  color: '#34D399' },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon as any} size={22} color={s.color} style={{ marginBottom: 8 }} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
 
          {/* Actions */}
          <Text style={styles.sectionTitle}>Acciones de administración</Text>
          <View style={styles.actionsGrid}>
            {ACTIONS.map(a => (
              <TouchableOpacity key={a.label} style={styles.actionCard}
                onPress={() => router.push(a.route as any)}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                  <Ionicons name={a.icon as any} size={26} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
              </TouchableOpacity>
            ))}
          </View>
 
          {/* Warning */}
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={18} color="#FBBF24" />
            <Text style={styles.warningText}>
              Las acciones en este panel afectan directamente al sistema. Procede con cuidado.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#060D1F' },
  scroll:          { paddingBottom: 40 },
  hero:            { paddingTop: 56, paddingBottom: 28, paddingHorizontal: 22, marginBottom: 24 },
  heroHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  adminBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FBBF2425', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FBBF2450' },
  adminBadgeText:  { color: '#FBBF24', fontSize: 13, fontWeight: '700' },
  heroTitle:       { color: '#94A3B8', fontSize: 16 },
  heroName:        { color: 'white', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  heroSub:         { color: '#64748B', fontSize: 14 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 22, marginBottom: 28 },
  statCard:        { width: '47%', backgroundColor: '#0F172A', borderRadius: 18, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  statVal:         { fontSize: 28, fontWeight: '900' },
  statLbl:         { color: '#64748B', fontSize: 13, marginTop: 2 },
  sectionTitle:    { color: '#E2E8F0', fontSize: 15, fontWeight: '700', paddingHorizontal: 22, marginBottom: 12 },
  actionsGrid:     { paddingHorizontal: 22, gap: 10, marginBottom: 24 },
  actionCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: '#1E293B' },
  actionIcon:      { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel:     { flex: 1, color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  warningBox:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FBBF2415', borderRadius: 14, margin: 22, padding: 14, borderWidth: 1, borderColor: '#FBBF2430' },
  warningText:     { flex: 1, color: '#FBBF24', fontSize: 13, lineHeight: 19 },
  blockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F', padding: 24},
  blockedTitle:    { color: 'white', fontSize: 22, fontWeight: '800', marginTop: 16},
  blockedText:     { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 20, marginVertical: 12 },
  blockedBtn:      { backgroundColor: '#34D399', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginTop: 20 },
  blockedBtnText:  { color: 'white', fontSize: 15, fontWeight: '600' },
  adminBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FBBF2420', alignItems: 'center', justifyContent: 'center' },

});