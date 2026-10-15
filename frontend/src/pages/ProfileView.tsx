import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { authService } from '../services/authService';
import api from '../services/api';

// Obtenemos la URL base del backend desde las variables de entorno de Vite, con fallback a localhost para desarrollo
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [measurementsCount, setMeasurementsCount] = useState<number>(0);
  const [latestWeight, setLatestWeight] = useState<string>('No registrado');
  const [latestHeight, setLatestHeight] = useState<string>('No registrada');

  
  // Inicializamos el avatar de forma segura al montar el componente usando el usuario actual
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    const rawKey = user?.avatar_key;
    if (!rawKey) return null;
    const normalizedKey = rawKey.replace(/\\/g, '/').replace(/\s+/g, '_');
    return `${BACKEND_URL}/${normalizedKey}`;
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efecto limpio para sincronizar si el usuario cambia
  React.useEffect(() => {
    let isMounted = true;

    const loadAvatar = async () => {
      if (user?.avatar_key) {
        try {
          const normalizedKey = user.avatar_key.replace(/\\/g, '/').replace(/\s+/g, '_');
          const rootBase = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
          const imageUrl = `${rootBase}/${normalizedKey}`;

          // Verificamos mediante fetch si la imagen realmente existe en el servidor antes de asignarla
          const response = await fetch(imageUrl, { method: 'HEAD' });
          
          if (response.ok && isMounted) {
            setAvatarUrl(imageUrl);
          } else if (isMounted) {
            // Si da 404 o no existe físicamente, evitamos romper y dejamos el avatar en null
            setAvatarUrl(null);
          }
        } catch (err) {
          console.warn('No se pudo verificar el archivo de imagen en el servidor:', err);
          if (isMounted) {
            setAvatarUrl(null);
          }
        }
      } else {
        if (isMounted) {
          setAvatarUrl(null);
        }
      }
    };

    loadAvatar();

    workoutService.getWorkouts()
      .then((data) => setWorkoutCount(data.length))
      .catch(() => setWorkoutCount(0));

    api.get('/measurements/')
      .then((res) => {
        const list = res.data || [];
        setMeasurementsCount(list.length);
        if (list.length > 0) {
          // Como vienen ordenadas de más reciente a más antigua
          const latest = list[0];
          if (latest.weight_kg) setLatestWeight(`${latest.weight_kg} kg`);
          if (latest.height_cm) setLatestHeight(`${latest.height_cm} cm`);
        }
      })
      .catch(() => {
        setMeasurementsCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.avatar_key]);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Formato no válido. Solo se permiten imágenes PNG o JPG.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadError(null);

    try {
      const updatedUser = await authService.uploadAvatar(formData);

      if (updatedUser?.avatar_key) {
        const rawKey = updatedUser.avatar_key.replace(/\\/g, '/').replace(/\s+/g, '_');
        const rootBase = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
        setAvatarUrl(`${rootBase}/${rawKey}?t=${Date.now()}`);
      } else {
        setAvatarUrl(URL.createObjectURL(file));
      }
    } catch (err: unknown) {
      console.error('Detalle del error:', err);
      const errorObj = err as { response?: { data?: { detail?: string } } };
      const serverMessage = errorObj.response?.data?.detail;
      
      setUploadError(serverMessage || 'Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-400">Perfil de Usuario</h1>
        
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xs overflow-hidden shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{uploading ? 'Subiendo...' : 'Sin Avatar'}</span>
              )}
            </div>

            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg border border-gray-800 transition transform hover:scale-105 cursor-pointer"
              title="Cambiar foto de perfil"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png, .jpg, .jpeg"
              className="hidden"
            />
          </div>

          {uploadError && (
            <p className="text-xs text-red-400 mt-2 text-center">{uploadError}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block">Nombre de Usuario:</label>
            <p className="text-lg font-medium">{user?.username || 'Usuario SteelCraft'}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block">Correo Electrónico:</label>
            <p className="text-lg font-medium">{user?.email || 'No disponible'}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block">Plan de Usuario:</label>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 bg-indigo-600 text-white">
              Standard / V1.0
            </span>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg border border-gray-700/60 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Peso actual:</span>
              <span className="font-bold text-white">{latestWeight}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Estatura actual:</span>
              <span className="font-bold text-white">{latestHeight}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Entrenamientos registrados:</span>
              <span className="font-bold text-white">{workoutCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Registros de mediciones:</span>
              <span className="font-bold text-white">{measurementsCount}</span>
            </div>
          </div>
        </div> 

        <div className="space-y-3 pt-2">
          <button
            onClick={handleLogoutClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer"
          >
            Cerrar Sesión
          </button>

          <button
            disabled
            className="w-full bg-gray-700 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed border border-gray-600"
            title="Próximamente"
          >
            Eliminar Cuenta (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
};