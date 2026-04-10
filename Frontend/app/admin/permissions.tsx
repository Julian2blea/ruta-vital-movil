/**
 * Función 15 — Visualización de permisos del sistema
 */
import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet,ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { admin } from '../../services/api';
 
export default function AdminPermissionsScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [roles, setRoles]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
 
  useEffect(() => {
    Promise.all([admin.listPermissions(), admin.listRoles()])
      .then(([p, r]) => {
        setPermissions(p?.results || p || []);
        setRoles(r?.results || r || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
 
  // For each permission, find which roles have it
  const rolesForPermission = (permId: number) =>
    roles.filter(r => r.permissions?.some((p: any) => p.id === permId));
 
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#34D399" /></View>;
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permisos del sistema</Text>
        <Text style={styles.count}>{permissions.length}</Text>
      </View>
 
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={16} color="#60A5FA" />
        <Text style={styles.infoText}>
          Vista de solo lectura. Los permisos se configuran desde el panel de administración de Django.
        </Text>
      </View>
 
      {permissions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="shield-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>No hay permisos registrados</Text>
          <Text style={styles.emptyHint}>
            Crea permisos desde /api/permissions/ o el admin de Django
          </Text>
        </View>
      ) : (
        <FlatList
          data={permissions}
          keyExtractor={p => String(p.id)}
          contentContainerStyle={{ padding: 22, gap: 10 }}
          renderItem={({ item: perm }) => {
            const assigned = rolesForPermission(perm.id);
            return (
              <View style={styles.permCard}>
                <View style={styles.permHeader}>
                  <View style={styles.permIcon}>
                    <Ionicons name="key-outline" size={18} color="#34D399" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.permDesc}>{perm.description}</Text>
                    <Text style={styles.permId}>ID: {perm.id}</Text>
                  </View>
                </View>
 
                <View style={styles.permRoles}>
                  <Text style={styles.permRolesLabel}>Asignado a:</Text>
                  <View style={styles.rolesRow}>
                    {assigned.length > 0 ? assigned.map((r: any) => (
                      <View key={r.id} style={styles.rolePill}>
                        <Text style={styles.rolePillText}>{r.description}</Text>
                      </View>
                    )) : (
                      <Text style={styles.noRole}>Sin roles asignados</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#060D1F' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 56, paddingBottom: 16, gap: 12 },
  headerTitle:    { flex: 1, color: 'white', fontSize: 18, fontWeight: '700' },
  count:          { color: '#475569', fontSize: 14 },
  infoBox:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#0F172A', borderRadius: 12, marginHorizontal: 22, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: '#1E293B' },
  infoText:       { flex: 1, color: '#64748B', fontSize: 12, lineHeight: 18 },
  permCard:       { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1E293B' },
  permHeader:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  permIcon:       { width: 38, height: 38, borderRadius: 10, backgroundColor: '#34D39915', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#34D39930' },
  permDesc:       { color: '#E2E8F0', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  permId:         { color: '#475569', fontSize: 12, marginTop: 2 },
  permRoles:      { borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 10 },
  permRolesLabel: { color: '#64748B', fontSize: 12, marginBottom: 6 },
  rolesRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rolePill:       { backgroundColor: '#A78BFA20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#A78BFA40' },
  rolePillText:   { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  noRole:         { color: '#334155', fontSize: 12 },
  emptyText:      { color: '#475569', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyHint:      { color: '#334155', fontSize: 13, textAlign: 'center' },
});