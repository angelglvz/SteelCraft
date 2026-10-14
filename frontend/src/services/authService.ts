import api from './api';
import type { Token, User } from '../types';

export const authService = {
  /**
   * Inicia sesión enviando las credenciales en formato x-www-form-urlencoded
   * tal como lo requiere el flujo OAuth2 de FastAPI.
   */
  async login(email: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI espera el campo 'username' por defecto en OAuth2
    formData.append('password', password);

    const response = await api.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Registra un nuevo usuario en el sistema.
   */
  async register(email: string, password: string, username?: string): Promise<User> {
    const response = await api.post<User>('/auth/register', {
      email,
      password,
      username: username || undefined,
    });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/users/me');
    return response.data;
  },

  async uploadAvatar(formData: FormData): Promise<User> {
    const response = await api.post<User>('/auth/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpieza local obligatoria
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  },
};