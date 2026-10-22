import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { authService } from '../services/authService';
import api from '../services/api';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [measurementsCount, setMeasurementsCount] = useState<number>(0);
  const [latestWeight, setLatestWeight] = useState<string>('No registrado');
  const [latestHeight, setLatestHeight] = useState<string>('No registrada');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    const rawKey = user?.avatar_key;
    if (!rawKey) return null;
    const normalizedKey = rawKey.replace(/\\/g, '/').replace(/\s+/g, '_');
    return `${BACKEND_URL}/${normalizedKey}`;
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadAvatar = async () => {
      if (user?.avatar_key) {
        try {
          const normalizedKey = user.avatar_key.replace(/\\/g, '/').replace(/\s+/g, '_');
          const rootBase = BACKEND_URL.replace(/\/api\/v1\/?$/, '');
          const imageUrl = `${rootBase}/${normalizedKey}`;

          const response = await fetch(imageUrl, { method: 'HEAD' });
          
          if (response.ok && isMounted) {
            setAvatarUrl(imageUrl);
          } else if (isMounted) {
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
    <div className="min-h-screen bg-steel-base text-steel-text px-4 sm:px-6 py-6 sm:py-8 font-hurme flex items-center justify-center">
      <div className="max-w-md w-full bg-steel-surface rounded-xl shadow-xl p-5 sm:p-6 border border-steel-border space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-steel-accent tracking-wide drop-shadow-sm">Perfil de Usuario</h1>
        
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-steel-base border-2 border-dashed border-steel-border flex items-center justify-center text-steel-muted text-xs overflow-hidden shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{uploading ? 'Subiendo...' : 'Sin Avatar'}</span>
              )}
            </div>

            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-steel-accent text-steel-base p-2 rounded-full shadow-lg border border-steel-border transition-transform hover:scale-105 cursor-pointer font-bold"
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
            <p className="text-xs text-steel-coral mt-2 text-center font-medium">{uploadError}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-steel-muted font-medium block">Nombre de Usuario:</label>
            <p className="text-base sm:text-lg font-semibold text-steel-text break-all">{user?.username || 'Usuario SteelCraft'}</p>
          </div>

          <div>
            <label className="text-sm text-steel-muted font-medium block">Correo Electrónico:</label>
            <p className="text-base sm:text-lg font-semibold text-steel-text break-all">{user?.email || 'No disponible'}</p>
          </div>

          <div>
            <label className="text-sm text-steel-muted font-medium block">Plan de Usuario:</label>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 bg-steel-accent text-steel-base shadow-sm">
              Standard / V1.0
            </span>
          </div>

          <div className="bg-steel-base p-4 rounded-lg border border-steel-border space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-muted">Peso actual:</span>
              <span className="font-bold text-steel-accent">{latestWeight}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-muted">Estatura actual:</span>
              <span className="font-bold text-steel-text">{latestHeight}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-muted">Entrenamientos registrados:</span>
              <span className="font-bold text-steel-text">{workoutCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-steel-muted">Registros de mediciones:</span>
              <span className="font-bold text-steel-text">{measurementsCount}</span>
            </div>
          </div>
        </div> 

        <div className="space-y-3 pt-2">
          <button
            onClick={handleLogoutClick}
            className="w-full bg-steel-coral/15 border border-steel-coral text-steel-coral hover:bg-steel-coral/25 font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Cerrar Sesión
          </button>

          <button
            disabled
            className="w-full bg-steel-surface-light text-steel-muted font-semibold py-2.5 px-4 rounded-xl cursor-not-allowed border border-steel-border opacity-60"
            title="Próximamente"
          >
            Eliminar Cuenta (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
};