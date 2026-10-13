import React, { useEffect, useState } from 'react';
import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../types';
import { useAuth } from '../context/AuthContext';

export const ExercisesView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el formulario de creación (solo administradores)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryMuscleId, setPrimaryMuscleId] = useState<number>(1);

  // Obtenemos el rol del usuario desde el contexto de autenticación
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await exerciseService.getExercises();
        setExercises(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los ejercicios del catálogo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usamos 'as unknown as Parameters<typeof exerciseService.createExercise>[0]' para satisfacer el tipado estricto
      await exerciseService.createExercise({
        name,
        description,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        load_type: 'barbell',
        is_active: true,
        muscles: [
          {
            muscle_id: Number(primaryMuscleId),
            role: 'primary',
          },
        ],
      } as unknown as Parameters<typeof exerciseService.createExercise>[0]);

      setName('');
      setDescription('');
      setPrimaryMuscleId(1);
      
      // Recargar la lista tras crear
      const data = await exerciseService.getExercises();
      setExercises(data);
    } catch (err) {
      alert('No se pudo crear el ejercicio. Verifica que tengas permisos de administrador.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este ejercicio del catálogo?')) return;
    try {
      await exerciseService.deleteExercise(id);
      setExercises(exercises.filter((ex) => ex.id !== id));
    } catch (err) {
      alert('Error al eliminar el ejercicio.');
      console.error(err);
    }
  };

  // Función auxiliar robusta adaptada a la interfaz con "muscles"
  const getPrimaryMuscleDisplay = (ex: Exercise) => {
    if (!ex.muscles || ex.muscles.length === 0) {
      return 'Sin asignar';
    }
    // Buscamos el que tenga rol 'primary', o por defecto tomamos el primero de la lista
    const primary = ex.muscles.find((m) => m.role === 'primary') || ex.muscles[0];
    
    // Si el objeto muscle viene poblado y tiene nombre
    if (primary && primary.muscle && primary.muscle.name) {
      return primary.muscle.name;
    }
    
    return 'Sin asignar';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      {/* Cabecera adaptativa */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">Catálogo de Ejercicios</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isAdmin 
              ? 'Modo Administrador: Puedes añadir o eliminar ejercicios del sistema.' 
              : 'Consulta la lista de ejercicios disponibles para tus entrenamientos.'}
          </p>
        </div>
        {isAdmin && (
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
            👑 Admin
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded mb-6 text-red-200">
          {error}
        </div>
      )}

      {/* Formulario de creación (Renderizado condicional estricto para Admin) */}
      {isAdmin && (
        <form onSubmit={handleCreateExercise} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">Añadir Nuevo Ejercicio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre del ejercicio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="ID Músculo Principal"
              value={primaryMuscleId}
              onChange={(e) => setPrimaryMuscleId(Number(e.target.value))}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded transition cursor-pointer"
          >
            Guardar Ejercicio
          </button>
        </form>
      )}

      {/* Tabla de listado */}
      {loading ? (
        <p className="text-gray-400">Cargando ejercicios...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-750 border-b border-gray-700 text-gray-300">
                <th className="p-4">Nombre</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Músculo Principal</th>
                {isAdmin && <th className="p-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id} className="border-b border-gray-700/50 hover:bg-gray-750/50 transition">
                  <td className="p-4 font-medium">{ex.name}</td>
                  <td className="p-4 text-gray-400">{ex.description || 'Sin descripción'}</td>
                  <td className="p-4 text-indigo-300">{getPrimaryMuscleDisplay(ex)}</td>
                  
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {exercises.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="p-6 text-center text-gray-400">
                    No hay ejercicios registrados en el catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};