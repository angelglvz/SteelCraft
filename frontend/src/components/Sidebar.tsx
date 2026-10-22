import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, isMobileOpen, setIsMobileOpen }) => {
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
    <>
      {/* Fondo oscuro translúcido en móvil cuando el menú está abierto */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside className={`
        bg-steel-surface border-r border-steel-border transition-all duration-300 flex flex-col h-screen fixed inset-y-0 left-0 z-50 font-hurme shadow-2xl
        /* Comportamiento móvil: se oculta fuera de pantalla si no está abierto, y ocupa w-64 al abrirse */
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        /* Comportamiento escritorio: usa el estado collapsed propocionado por App */
        ${collapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Cabecera del Sidebar con el botón de colapsar / cerrar */}
        <div className="p-4 flex items-center justify-between border-b border-steel-border h-16 shrink-0">
          {(!collapsed || isMobileOpen) && <span className="font-bold text-xl text-steel-accent tracking-wide truncate">SteelCraft</span>}
          
          <button
            onClick={() => {
              // En móvil cierra el menú flotante; en escritorio alterna el colapsado
              if (window.innerWidth < 768) {
                setIsMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-2 rounded hover:bg-steel-surface-light text-steel-muted hover:text-steel-text transition cursor-pointer mx-auto md:mx-0"
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  isActive
                    ? 'bg-steel-accent text-steel-base font-bold shadow-sm'
                    : 'text-steel-muted hover:bg-steel-surface-light hover:text-steel-text'
                }`}
                title={item.label}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {(!collapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
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
            {(!collapsed || isMobileOpen) && <span className="truncate">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
};