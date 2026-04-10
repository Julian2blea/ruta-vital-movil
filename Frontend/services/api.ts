/**
 * api.ts — Servicio central de conexión con el backend Django
 * Ruta Vital · Expo → Django REST Framework
 *
 * Cambia BASE_URL por la IP de tu máquina cuando pruebes en dispositivo físico.
 * Ej: 'http://192.168.1.X:8000/api'
 */
 
import AsyncStorage from '@react-native-async-storage/async-storage';
 
export const BASE_URL = 'http://10.64.105.124:8000/api';
 
// ─── Token storage helpers ────────────────────────────────────
const TOKEN_KEY = 'ruta_vital_token';
const USER_KEY  = 'ruta_vital_user';
 
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}
export async function saveUser(user: object) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}
export async function getStoredUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
 
// ─── Core fetch wrapper ───────────────────────────────────────
async function request(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getToken();
 
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
 
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
 
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
 
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { status: response.status, data: error };
  }
 
  // 204 No Content — no body
  if (response.status === 204) return null;
 
  return response.json();
}
 
// ─── AUTH ─────────────────────────────────────────────────────
export const auth = {
  login: (login: string, password: string) =>
    request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),
 
  register: (data: {
    login: string;
    password: string;
    first_name: string;
    last_name: string;
    email?: string;
  }) =>
    request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
 
  logout: () =>
    request('/auth/logout/', { method: 'POST' }),
 
  me: () => request('/users/me/'),
};
 
// ─── GLUCOSE READINGS ─────────────────────────────────────────
export const glucose = {
  create: (data: {
    glucose_value: number;
    context: 'fasting' | 'postprandial' | 'random';
    source: 'manual' | 'simulated' | 'device';
    notes?: string;
  }) =>
    request('/readings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
 
  getById: (id: number) => request(`/readings/${id}/`),
 
  history: () => request('/readings/history/'),
 
  myReadings: () => request('/readings/my_readings/'),
};
 
// ─── PROFILE ──────────────────────────────────────────────────
export const profile = {
  update: (personId: number, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    birth_date?: string;
    gender?: 'M' | 'F' | 'O';
  }) =>
    request(`/persons/${personId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
 
// ─── ADMIN ────────────────────────────────────────────────────
export const admin = {
  listUsers: ()           => request('/users/'),
  listRoles: ()           => request('/roles/'),
  listPermissions: ()     => request('/permissions/'),
  allReadings: ()         => request('/readings/my_readings/'),
 
  assignRole: (userId: number, roleId: number) =>
    request('/user-roles/', {
      method: 'POST',
      body: JSON.stringify({ user: userId, role: roleId }),
    }),
};
 




















