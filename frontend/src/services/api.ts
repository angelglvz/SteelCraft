import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // URL de tu backend FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor opcional para inyectar el token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;