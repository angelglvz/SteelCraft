import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const RegisterView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);

    if (val.trim() === '') {
      setUsernameError(null);
      return;
    }

    const isValidFormat = /^[a-zA-Z0-9_]{3,32}$/.test(val);
    if (!isValidFormat) {
      setUsernameError('Debe tener de 3 a 32 caracteres (letras, números o barra baja).');
    } else {
      setUsernameError(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameError) return;

    setError(null);
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Crear el usuario en la base de datos
      await authService.register(
        cleanEmail,
        password,
        username.trim() || undefined
      );

      // 2. Iniciar sesión automáticamente
      await login(cleanEmail, password);

      // 3. Redirigir al perfil del usuario
      navigate('/profile');
    } catch (err: unknown) {
      console.error('Error en el registro:', err);
      const errorObj = err as { response?: { data?: { detail?: string } } };
      setError(errorObj.response?.data?.detail || 'No se pudo completar el registro. Comprueba los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 text-white">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-lg space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400 text-center">SteelCraft</h1>
          <p className="text-gray-400 text-sm text-center mt-1">Crea tu cuenta para empezar a registrar tus entrenamientos</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-3 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Nombre de usuario <span className="text-gray-500 font-normal lowercase">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. acorazado99"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full bg-gray-950 border rounded px-3 py-2 text-white placeholder-gray-600 focus:outline-none ${
                usernameError ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-indigo-500'
              }`}
            />
            {usernameError && (
              <span className="text-xs text-red-400 mt-1 block">{usernameError}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!usernameError}
            className="w-full bg-indigo-600 hover:bg-indigo-700 font-medium py-2.5 rounded transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creando cuenta e iniciando sesión...' : 'Registrarse'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </p>
        </form>

        <div className="text-center text-sm text-gray-400 pt-2 border-t border-gray-800">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};