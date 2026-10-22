import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        throw new Error('No se pudo completar el registro. Verifica tus datos.');
      }

      navigate('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrarse');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-canvas flex items-center justify-center px-4 py-8 font-hurme">
      <div className="max-w-md w-full bg-dark-surface border border-border-dark rounded-lg p-6 sm:p-8 shadow-md">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-heading text-text-light font-bold mb-2">Únete a SteelCraft</h1>
          <p className="text-text-muted text-body-sm">Crea tu cuenta para llevar el control total de tus entrenamientos</p>
        </div>

        {error && (
          <div className="bg-accent-coral/20 border border-accent-coral text-text-light p-3 rounded-radius-md mb-6 text-body-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-text-muted text-body-sm mb-2 font-medium">Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-dark-canvas border border-border-dark rounded-input px-4 py-3 text-text-light placeholder-text-muted/60 focus:outline-none focus:border-accent-blue transition-colors text-sm sm:text-base"
              placeholder="tu_nombre"
            />
          </div>

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
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-text-muted text-body-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-accent-blue hover:underline font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};