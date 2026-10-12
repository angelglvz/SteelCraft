import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProfileView: React.FC = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Perfil de Usuario</h1>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm text-gray-400 block">Correo Electrónico:</label>
            <p className="text-lg font-medium">{user?.email || 'No disponible'}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block">Rol del Sistema:</label>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
              isAdmin ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {role ? role.toUpperCase() : 'USUARIO'}
            </span>
          </div>

          <div>
            <label className="text-sm text-gray-400 block">Permisos de Administrador:</label>
            <p className="text-md">{isAdmin ? 'Sí (Acceso total a gestión)' : 'No (Acceso estándar)'}</p>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};