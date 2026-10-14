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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const isAdmin = role === 'admin' || role === 'ADMIN';

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      
      const fetchUserData = async () => {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          if (userData.role) {
            setRole(userData.role);
          }
        } catch (err) {
          console.error('Error al obtener el usuario autenticado:', err);
          handleLogout();
        }
      };

      fetchUserData();
    } else {
      localStorage.removeItem('token');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
    }

    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  }, [token, role]);

  const handleLogin = async (email: string, pass: string) => {
    try {
      const data = await authService.login(email, pass);
      setToken(data.access_token);
      if (data.role) {
        setRole(data.role);
        localStorage.setItem('role', data.role);
      }
      const userData = await authService.getMe();
      setUser(userData);
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