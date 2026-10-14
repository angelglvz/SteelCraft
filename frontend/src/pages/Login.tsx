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
      navigate('/'); // Redirige al dashboard o página principal tras iniciar sesión con éxito
    } catch (err) {
      setError('Credenciales inválidas o error al conectar con el servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-500">SteelCraft</h1>
          <p className="text-sm text-gray-400 mt-2">Inicia sesión para gestionar tus entrenamientos</p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 pt-2 border-t border-gray-800">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-medium">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};