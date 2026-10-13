import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { MusclesView } from './pages/MusclesView';
import { AdminRoute } from './components/AdminRoute'; 
import { ProfileView } from './pages/ProfileView';
import { ExercisesView } from './pages/ExercisesView';
import { WorkoutsView } from './pages/WorkoutsView';
import { Sidebar } from './components/Sidebar';
import { WorkoutsHistoryView } from './pages/WorkoutsHistoryView';
import { Outlet } from 'react-router-dom';

// Layout principal que incluye el Sidebar lateral y el área de contenido
const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
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
          {/* Ruta pública de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con el layout del Sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/workouts" replace />} />
              <Route path="/workouts" element={<WorkoutsView />} />
              <Route path="/history" element={<WorkoutsHistoryView />} />
              <Route path="/exercises" element={<ExercisesView />} />
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