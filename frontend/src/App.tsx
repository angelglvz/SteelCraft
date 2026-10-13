import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { MusclesView } from './pages/MusclesView';
import { AdminRoute } from './components/AdminRoute'; 
import { ProfileView } from './pages/ProfileView';
import { ExercisesView } from './pages/ExercisesView'


// Componente temporal para el Dashboard principal mientras creamos las vistas de entrenamientos/músculos
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-500">Panel Principal - SteelCraft</h1>
      <p className="text-gray-400 mt-2">¡Bienvenido! Has accedido correctamente a una ruta protegida.</p>
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

          {/* Rutas protegidas que requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileView />} />

            {/* Catálogo de Ejercicios visible para cualquier usuario autenticado */}
            <Route path="/exercises" element={<ExercisesView />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/muscles" element={<MusclesView />} />
            </Route>
          </Route>

          {/* Redirección por defecto para cualquier otra ruta no encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;