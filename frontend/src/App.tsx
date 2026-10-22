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
  return (
    <div className="flex min-h-screen bg-steel-base text-steel-text">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 bg-steel-base min-h-screen ${collapsed ? 'ml-20' : 'ml-64'}`}>
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