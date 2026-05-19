/**
 * api.ts — Servicio central de conexión con el backend Django
 * Ruta Vital · Expo → Django REST Framework + Simple JWT
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://10.52.241.124:8000/api';

// ─── Claves de almacenamiento ─────────────────────────────────
const ACCESS_TOKEN_KEY  = 'ruta_vital_access';
const REFRESH_TOKEN_KEY = 'ruta_vital_refresh';
const USER_KEY          = 'ruta_vital_user';

// ─── Helpers de AsyncStorage ──────────────────────────────────
export async function saveTokens(access: string, refresh: string) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY,  access],
    [REFRESH_TOKEN_KEY, refresh],
  ]);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function removeToken() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
}

export async function saveUser(user: object) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}


async function renewAccessToken(): Promise<string> {
  const refresh = await getRefreshToken();

  if (!refresh) {
    throw new Error('NO_REFRESH_TOKEN');
  }

  const response = await fetch(`${BASE_URL.replace('/api', '')}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    // Refresh expirado o inválido → forzar logout
    throw new Error('REFRESH_EXPIRED');
  }

  const data = await response.json();

  
  const newAccess  = data.access;
  const newRefresh = data.refresh ?? refresh; // fallback si no rota

  await saveTokens(newAccess, newRefresh);

  return newAccess;
}

// ─── Petición central con interceptor 401 ────────────────────
async function request(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false     // evita loop infinito
): Promise<any> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;  
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // ── Interceptor 401 ──────────────────────────────────────
  if (response.status === 401 && !isRetry) {
    try {
      await renewAccessToken();
      // Reintenta la misma petición con el token nuevo (isRetry=true)
      return request(endpoint, options, true);
    } catch (refreshError: any) {
      // Refresh también falló → sesión muerta
      throw {
        status: 401,
        data: { refresh_expired: true },
      };
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { status: response.status, data: error };
  }

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

  logout: (refresh: string) =>
    request('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

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
  history: ()           => request('/readings/history/'),
  myReadings: ()        => request('/readings/my_readings/'),
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
  listUsers:       () => request('/users/'),
  listRoles:       () => request('/roles/'),
  listPermissions: () => request('/permissions/'),
  allReadings:     () => request('/readings/my_readings/'),

  assignRole: (userId: number, roleId: number) =>
    request('/user-roles/', {
      method: 'POST',
      body: JSON.stringify({ user: userId, role: roleId }),
    }),
};