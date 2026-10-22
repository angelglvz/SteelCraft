import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
  const isAdmin = role === 'admin' || role === 'ADMIN';

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  // Efecto para sincronizar el usuario al iniciar la app si hay un token guardado
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      localStorage.setItem('token', token);

      try {
        const userData = await authService.getMe();
        setUser(userData);
        if (userData.role) {
          setRole(userData.role);
          localStorage.setItem('role', userData.role);
        }
      } catch (err: unknown) {
        console.error('Sesión inválida o expirada:', err);
        // Comprobación segura de error de Axios sin usar 'any'
        const axiosError = err as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) {
          handleLogout();
        }
      }
    };

    initAuth();
  }, [token]);

  const handleLogin = async (email: string, pass: string) => {
    try {
      // 1. Obtenemos el token de acceso
      const data = await authService.login(email, pass);
      const accessToken = data.access_token;
      
      setToken(accessToken);
      localStorage.setItem('token', accessToken);

      // 2. Obtenemos los datos del usuario inmediatamente de forma sincrónica para evitar el bug del doble login
      const userData = await authService.getMe();
      setUser(userData);

      if (userData.role) {
        setRole(userData.role);
        localStorage.setItem('role', userData.role);
      } else if (data.role) {
        setRole(data.role);
        localStorage.setItem('role', data.role);
      }
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};