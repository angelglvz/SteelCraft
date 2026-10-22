import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { role, logout } = useAuth();
  const location = useLocation();
  const isAdmin = role === 'admin';

  const navItems = [
    { label: 'Entrenamientos', path: '/workouts', icon: '🏋️‍♂️' },
    { label: 'Historial', path: '/history', icon: '📅' },
    { label: 'Catálogo Ejercicios', path: '/exercises', icon: '📋' },
    { label: 'Medidas Corporales', path: '/measurements', icon: '⚖️' },
    ...(isAdmin ? [{ label: 'Gestión Músculos', path: '/muscles', icon: '💪' }] : []),
    { label: 'Mi Perfil', path: '/profile', icon: '👤' },
  ];

  return (
    <aside className={`bg-steel-surface border-r border-steel-border transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} h-screen fixed inset-y-0 left-0 z-50 font-hurme shadow-2xl`}>
      {/* Cabecera del Sidebar con el botón de colapsar (3 barritas) */}
      <div className="p-4 flex items-center justify-between border-b border-steel-border h-16 shrink-0">
        {!collapsed && <span className="font-bold text-xl text-steel-accent tracking-wide truncate">SteelCraft</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-steel-surface-light text-steel-muted hover:text-steel-text transition cursor-pointer mx-auto"
          title="Alternar menú"
        >
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-current"></div>
            <div className="w-5 h-0.5 bg-current"></div>
            <div className="w-5 h-0.5 bg-current"></div>
          </div>
        </button>
      </div>

      {/* Enlaces de navegación con scroll interno si fuera necesario */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                isActive
                  ? 'bg-steel-accent text-steel-base font-bold shadow-sm'
                  : 'text-steel-muted hover:bg-steel-surface-light hover:text-steel-text'
              }`}
              title={item.label}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Botón de cerrar sesión fijo en la parte inferior */}
      <div className="p-4 border-t border-steel-border shrink-0">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-steel-coral bg-steel-coral/15 border border-steel-coral/30 hover:bg-steel-coral/25 transition cursor-pointer font-semibold"
          title="Cerrar sesión"
        >
          <span className="text-xl shrink-0">🚪</span>
          {!collapsed && <span className="truncate">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};