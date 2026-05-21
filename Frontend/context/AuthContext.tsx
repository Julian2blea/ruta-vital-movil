/**
 * AuthContext.tsx — Contexto global de autenticación
 * Maneja: sesión JWT, rol del usuario, renovación automática y logout forzado
 */

import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react';
import {
  auth,
  getStoredUser,
  getToken,
  getRefreshToken,
  removeToken,
  saveTokens,
  saveUser,
} from '../services/api';


export interface UserRole {
  id: number;
  description: string;
}

export interface AppUser {
  id: number;
  login: string;
  is_staff: boolean;
  person?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: string | null;
    gender: string;
  };
  roles: UserRole[];
}

interface AuthContextType {
  user:            AppUser | null;
  token:           string | null;
  isLoading:       boolean;
  isAdmin:         boolean;
  isAuthenticated: boolean;
  login:           (login: string, password: string) => Promise<void>;
  logout:          () => Promise<void>;
  refreshUser:     () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AppUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token;
  const isAdmin =
    user?.is_staff === true ||
    user?.roles?.some(r => r.description.toLowerCase() === 'admin') === true;

  
  useEffect(() => {
    (async () => {
      try {
        const storedAccess = await getToken();
        const storedUser   = await getStoredUser();
        if (storedAccess && storedUser) {
          setToken(storedAccess);
          setUser(storedUser);
        }
      } catch (_) {}
      finally { setIsLoading(false); }
    })();
  }, []);

 
  const login = async (loginVal: string, password: string) => {
    // api.ts devuelve { access, refresh, user }
    const data = await auth.login(loginVal, password);

    await saveTokens(data.access, data.refresh);
    await saveUser(data.user);

    setToken(data.access);
    setUser(data.user);
  };


  const logout = async () => {
    try {
      const refresh = await getRefreshToken();
      if (refresh) {
        await auth.logout(refresh); 
      }
    } catch (_) {
      
    }
    await removeToken();
    setToken(null);
    setUser(null);
  };


  const refreshUser = async () => {
    try {
      const me = await auth.me();
      await saveUser(me);
      setUser(me);
    } catch (error: any) {
      
      if (error?.data?.refresh_expired) {
        await logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, isAdmin, isAuthenticated,
      login, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}