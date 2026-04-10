/**
 * Función 14 — Gestión de usuarios y asignación de roles
 */
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { admin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
 
export default function AdminUsersScreen() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const [users, setUsers]       = useState<any[]>([]);
  const [roles, setRoles]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  if (isLoading) {
    return (
        <View style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
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
            No tienes permisos para gestionar usuarios.
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
    Promise.all([admin.listUsers(), admin.listRoles()])
      .then(([u, r]) => {
        setUsers(u?.results || u || []);
        setRoles(r?.results || r || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
 
  const assignRole = async (userId: number, roleId: number) => {
    setSaving(true);
    try {
      await admin.assignRole(userId, roleId);
      setMsg('✅ Rol asignado correctamente');
      setSelected(null);
      const updated = await admin.listUsers();
      setUsers(updated?.results || updated || []);
    } catch (_) {
      setMsg('❌ Error al asignar el rol');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };
 
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#60A5FA" /></View>;
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de usuarios</Text>
        <Text style={styles.count}>{users.length}</Text>
      </View>
 
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
 
      <FlatList
        data={users}
        keyExtractor={u => String(u.id)}
        contentContainerStyle={{ padding: 22, gap: 10 }}
        renderItem={({ item: u }) => (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{(u.login?.[0] || '?').toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userLogin}>@{u.login}</Text>
              <Text style={styles.userName}>
                {u.person?.first_name || ''} {u.person?.last_name || ''}
              </Text>
              <View style={styles.rolesRow}>
                {u.roles?.length ? u.roles.map((r: any) => (
                  <View key={r.id} style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{r.description}</Text>
                  </View>
                )) : <Text style={styles.noRole}>Sin rol</Text>}
              </View>
            </View>
            <TouchableOpacity style={styles.assignBtn} onPress={() => setSelected(u)}>
              <Ionicons name="key-outline" size={18} color="#60A5FA" />
            </TouchableOpacity>
          </View>
        )}
      />
 
      {/* Role assignment modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Asignar rol</Text>
            <Text style={styles.modalSub}>Usuario: @{selected?.login}</Text>
 
            {saving ? <ActivityIndicator color="#60A5FA" style={{ marginVertical: 20 }} /> : (
              roles.map(r => (
                <TouchableOpacity key={r.id} style={styles.roleOption}
                  onPress={() => assignRole(selected.id, r.id)}>
                  <View style={styles.roleOptionIcon}>
                    <Ionicons name="shield-outline" size={18} color="#60A5FA" />
                  </View>
                  <Text style={styles.roleOptionText}>{r.description}</Text>
                  {selected?.roles?.some((ur: any) => ur.id === r.id) && (
                    <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                  )}
                </TouchableOpacity>
              ))
            )}
 
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#060D1F' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 56, paddingBottom: 16, gap: 12 },
  headerTitle:     { flex: 1, color: 'white', fontSize: 18, fontWeight: '700' },
  count:           { color: '#475569', fontSize: 14 },
  msg:             { backgroundColor: '#1E293B', color: '#E2E8F0', marginHorizontal: 22, padding: 12, borderRadius: 10, marginBottom: 8, fontSize: 13 },
  userCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1E293B', gap: 12 },
  userAvatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#60A5FA20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#60A5FA40' },
  userAvatarText:  { color: '#60A5FA', fontSize: 18, fontWeight: '800' },
  userInfo:        { flex: 1, gap: 2 },
  userLogin:       { color: 'white', fontSize: 15, fontWeight: '700' },
  userName:        { color: '#64748B', fontSize: 13 },
  rolesRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  rolePill:        { backgroundColor: '#60A5FA20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#60A5FA40' },
  rolePillText:    { color: '#60A5FA', fontSize: 11, fontWeight: '600' },
  noRole:          { color: '#334155', fontSize: 12 },
  assignBtn:       { backgroundColor: '#60A5FA15', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#60A5FA30' },
  modalOverlay:    { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: '#0F172A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, gap: 10 },
  modalTitle:      { color: 'white', fontSize: 20, fontWeight: '800' },
  modalSub:        { color: '#64748B', fontSize: 14, marginBottom: 8 },
  roleOption:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: '#334155' },
  roleOptionIcon:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#60A5FA15', alignItems: 'center', justifyContent: 'center' },
  roleOptionText:  { flex: 1, color: 'white', fontSize: 15, fontWeight: '600' },
  cancelBtn:       { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText:      { color: '#64748B', fontWeight: '600' },
  blockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F', padding: 24},
  blockedTitle:    { color: 'white', fontSize: 22, fontWeight: '800', marginTop: 16},
  blockedText:     { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 20, marginVertical: 12 },
  blockedBtn:      { backgroundColor: '#34D399', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginTop: 20 },
  blockedBtnText:  { color: 'white', fontSize: 15, fontWeight: '600' },
});
 