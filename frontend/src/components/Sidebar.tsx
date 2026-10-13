import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role, logout } = useAuth();
  const location = useLocation();
  const isAdmin = role === 'admin';

  const navItems = [
    { label: 'Entrenamientos', path: '/workouts', icon: '🏋️‍♂️' },
    { label: 'Historial', path: '/history', icon: '📅' },
    { label: 'Catálogo Ejercicios', path: '/exercises', icon: '📋' },
    ...(isAdmin ? [{ label: 'Gestión Músculos', path: '/muscles', icon: '💪' }] : []),
    { label: 'Mi Perfil', path: '/profile', icon: '👤' },
  ];

  return (
    <aside className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} min-h-screen`}>
      {/* Cabecera del Sidebar con el botón de colapsar (3 barritas) */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && <span className="font-bold text-xl text-indigo-400">SteelCraft</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer mx-auto"
          title="Alternar menú"
        >
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-current"></div>
            <div className="w-5 h-0.5 bg-current"></div>
            <div className="w-5 h-0.5 bg-current"></div>
          </div>
        </button>
      </div>

      {/* Enlaces de navegación */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Botón de cerrar sesión */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className={`flex items-center space-x-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer`}
          title="Cerrar sesión"
        >
          <span className="text-xl">🚪</span>
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};