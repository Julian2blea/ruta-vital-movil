/**
 * Función 11 — Edición de perfil personal
 */
import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { profile as profileApi } from '../../services/api';

type FormType = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: "M" | "F" | "O" | "";
  birth_date: string;
};

const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
];

export default function ProfileScreen() {
  const { user, isAdmin, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormType>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    birth_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) return;

    const validGenders: ("M" | "F" | "O")[] = ['M', 'F', 'O'];
    const gender = user.person?.gender && validGenders.includes(user.person.gender as any)
      ? (user.person.gender as "M" | "F" | "O")
      : '';

    setForm({
      first_name: user.person?.first_name || '',
      last_name:  user.person?.last_name  || '',
      email:      user.person?.email      || '',
      phone:      user.person?.phone      || '',
      gender:     gender,
      birth_date: user.person?.birth_date || '',
    });
  }, [user]);

  const set = (key: keyof FormType) => (val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (error) setError('');
  };

  const handleSave = async () => {
    if (loading) return;

    if (!user?.person?.id) {
      setError('No se encontró el perfil.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await profileApi.update(user.person.id, {
        ...form,
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        phone:      form.phone.trim(),
        gender: form.gender || undefined,
      });

      await refreshUser();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (e) {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* AVATAR */}
      <View style={styles.avatarBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {(form.first_name?.[0] || user?.login?.[0] || '?').toUpperCase()}
          </Text>
        </View>

        <Text style={styles.avatarName}>
          {form.first_name} {form.last_name}
        </Text>

        <Text style={styles.avatarLogin}>@{user?.login}</Text>

        {isAdmin && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#FBBF24" />
            <Text style={styles.adminBadgeText}>Administrador</Text>
          </View>
        )}
      </View>

      {/* ROLES */}
      <View style={styles.roleBox}>
        <Ionicons name="key-outline" size={16} color="#94A3B8" />

        <View style={{ flex: 1 }}>
          <Text style={styles.roleTitle}>Roles asignados</Text>
          <Text style={styles.roleValue}>
            {user?.roles?.length
              ? user.roles.map(r => r.description).join(', ')
              : 'Sin rol asignado'}
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity onPress={() => router.push('/admin/users')}>
            <Text style={styles.manageRoles}>Gestionar</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.successMsg}>✅ Perfil actualizado correctamente</Text> : null}

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información personal</Text>

        {[
          { key: 'first_name', label: 'Nombre', icon: 'person-outline' },
          { key: 'last_name',  label: 'Apellido', icon: 'person-outline' },
          { key: 'email',      label: 'Correo', icon: 'mail-outline', kb: 'email-address' },
          { key: 'phone',      label: 'Teléfono', icon: 'call-outline', kb: 'phone-pad' },
          { key: 'birth_date', label: 'Nacimiento (YYYY-MM-DD)', icon: 'calendar-outline' },
        ].map(f => (
          <View key={f.key}>
            <Text style={styles.label}>{f.label}</Text>

            <View style={styles.inputWrap}>
              <Ionicons name={f.icon as any} size={17} color="#64748B" style={styles.inputIcon} />

              <TextInput
                style={styles.input}
                value={form[f.key as keyof FormType]}
                onChangeText={set(f.key as keyof FormType)}
                placeholderTextColor="#475569"
                keyboardType={(f as any).kb || 'default'}
                autoCapitalize={f.key === 'email' ? 'none' : 'words'}
              />
            </View>
          </View>
        ))}

        <Text style={styles.label}>Género</Text>
        <View style={styles.genderRow}>
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.genderBtn,
                form.gender === g.value && styles.genderBtnActive
              ]}
              onPress={() => set('gender')(g.value)}
            >
              <Text style={[
                styles.genderText,
                form.gender === g.value && styles.genderTextActive
              ]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* GUARDAR */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="save-outline" size={20} color="white" />
            <Text style={styles.saveBtnText}>Guardar cambios</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#F87171" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#060D1F' },
  scroll:          { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40 },

  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle:     { color: 'white', fontSize: 18, fontWeight: '700' },

  avatarBox:       { alignItems: 'center', marginBottom: 24, gap: 6 },
  avatar:          { width: 80, height: 80, borderRadius: 40, backgroundColor: '#34D39930', borderWidth: 2, borderColor: '#34D399', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarLetter:    { color: '#34D399', fontSize: 32, fontWeight: '800' },
  avatarName:      { color: 'white', fontSize: 20, fontWeight: '800' },
  avatarLogin:     { color: '#64748B', fontSize: 14 },

  adminBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FBBF2420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  adminBadgeText:  { color: '#FBBF24', fontSize: 12, fontWeight: '700' },

  roleBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 14, padding: 14, marginBottom: 18, gap: 10, borderWidth: 1, borderColor: '#1E293B' },
  roleTitle:       { color: '#64748B', fontSize: 12 },
  roleValue:       { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginTop: 2 },
  manageRoles:     { color: '#34D399', fontSize: 13, fontWeight: '600' },

  error:           { backgroundColor: '#7F1D1D', color: '#FCA5A5', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13 },
  successMsg:      { backgroundColor: '#14532D', color: '#86EFAC', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13 },

  card:            { backgroundColor: '#0F172A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E293B', marginBottom: 20 },
  cardTitle:       { color: '#E2E8F0', fontSize: 15, fontWeight: '700', marginBottom: 16 },

  label:           { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 },

  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  inputIcon:       { paddingLeft: 14, paddingRight: 6 },
  input:           { flex: 1, color: 'white', fontSize: 15, paddingVertical: 13, paddingRight: 14 },

  genderRow:       { flexDirection: 'row', gap: 8 },
  genderBtn:       { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#34D39920', borderColor: '#34D399' },
  genderText:      { color: '#64748B', fontSize: 13 },
  genderTextActive:{ color: '#34D399', fontWeight: '700' },

  saveBtn:         { backgroundColor: '#34D399', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 14 },
  saveBtnText:     { color: 'white', fontSize: 17, fontWeight: '700' },

  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  logoutText:      { color: '#F87171', fontSize: 14, fontWeight: '600' },
});