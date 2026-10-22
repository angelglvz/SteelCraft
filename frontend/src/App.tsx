import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { RegisterView } from './pages/RegisterView';
import { MusclesView } from './pages/MusclesView';
import { AdminRoute } from './components/AdminRoute'; 
import { ProfileView } from './pages/ProfileView';
import { ExercisesView } from './pages/ExercisesView';
import { WorkoutsView } from './pages/WorkoutsView';
import { Sidebar } from './components/Sidebar';
import { WorkoutsHistoryView } from './pages/WorkoutsHistoryView';
import { MeasurementsView } from './pages/MeasurementsView';
import { Outlet } from 'react-router-dom';

// Layout principal que incluye el Sidebar lateral y el área de contenido
const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-steel-base text-steel-text relative">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {/* Contenido principal: en móvil ocupa el 100% (ml-0), en escritorio respeta el ancho del sidebar colapsado o expandido */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 bg-steel-base min-h-screen ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        
        {/* Botón flotante superior exclusivo para móviles cuando el menú está cerrado */}
        {!isMobileOpen && (
          <div className="p-4 md:hidden sticky top-0 z-30 bg-steel-base/80 backdrop-blur-sm">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2.5 rounded-xl bg-steel-surface border border-steel-border text-steel-text shadow-lg cursor-pointer flex items-center space-x-2"
              aria-label="Abrir menú"
            >
              <div className="space-y-1 w-5">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Menú</span>
            </button>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterView />} />

          {/* Rutas protegidas con el layout del Sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/workouts" replace />} />
              <Route path="/workouts" element={<WorkoutsView />} />
              <Route path="/history" element={<WorkoutsHistoryView />} />
              <Route path="/exercises" element={<ExercisesView />} />
              <Route path="/measurements" element={<MeasurementsView />} />
              <Route path="/profile" element={<ProfileView />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/muscles" element={<MusclesView />} />
              </Route>
            </Route>
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;