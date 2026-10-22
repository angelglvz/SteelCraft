import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Credenciales inválidas o error al conectar con el servidor.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-canvas flex items-center justify-center px-4 py-8 font-hurme">
      <div className="max-w-md w-full bg-dark-surface border border-border-dark rounded-lg p-6 sm:p-8 shadow-md">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-heading text-text-light font-bold mb-2">SteelCraft</h1>
          <p className="text-text-muted text-body-sm">Inicia sesión para gestionar tus entrenamientos</p>
        </div>

        {error && (
          <div className="bg-accent-coral/20 border border-accent-coral text-text-light p-3 rounded-radius-md mb-6 text-body-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-text-muted text-body-sm mb-2 font-medium">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark-canvas border border-border-dark rounded-input px-4 py-3 text-text-light placeholder-text-muted/60 focus:outline-none focus:border-accent-blue transition-colors text-sm sm:text-base"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-text-muted text-body-sm mb-2 font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-dark-canvas border border-border-dark rounded-input px-4 py-3 text-text-light placeholder-text-muted/60 focus:outline-none focus:border-accent-blue transition-colors text-sm sm:text-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue hover:bg-accent-blue/90 text-text-dark font-semibold py-3 px-4 rounded-full shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm sm:text-base"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-text-muted text-body-sm">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-accent-blue hover:underline font-semibold">
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};