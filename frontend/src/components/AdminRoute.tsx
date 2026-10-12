import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Si el usuario no ha iniciado sesión, lo mandamos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si ha iniciado sesión pero NO es administrador, lo redirigimos al dashboard principal (o a otra vista)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado y es admin, le permitimos acceder a la ruta protegida
  return <Outlet />;
};