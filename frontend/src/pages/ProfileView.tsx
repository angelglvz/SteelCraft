import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import api from '../services/api';

export const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [measurementsCount, setMeasurementsCount] = useState<number>(0);

  useEffect(() => {
    workoutService.getWorkouts()
      .then((data) => setWorkoutCount(data.length))
      .catch(() => setWorkoutCount(0));

    api.get('/measurements/')
      .then((res) => setMeasurementsCount(res.data?.length || 0))
      .catch(() => setMeasurementsCount(0));
  }, []);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-400">Perfil de Usuario</h1>
        
        {/* Espacio para avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xs overflow-hidden shadow-inner">
            <span>Sin Avatar</span>
          </div>
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
              <span className="text-gray-400">Entrenamientos registrados:</span>
              <span className="font-bold text-white">{workoutCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Datos de mediciones:</span>
              <span className="font-bold text-white">{measurementsCount} registros</span>
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