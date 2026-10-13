import React, { useEffect, useState } from 'react';
import { exerciseService } from '../services/exerciseService';
import type { Exercise, Muscle } from '../types';
import { useAuth } from '../context/AuthContext';
import { SYSTEM_MUSCLES } from '../enums/muscles';

export const ExercisesView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscles] = useState<Muscle[]>(SYSTEM_MUSCLES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<number[]>([]);
  
  // Estado para el buscador de ejercicios
  const [searchTerm, setSearchTerm] = useState('');

  const { role } = useAuth();
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exercisesData = await exerciseService.getExercises();
        setExercises(exercisesData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del catálogo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMuscleIds.length === 0) {
      alert('Debes seleccionar al menos un músculo.');
      return;
    }

    try {
      const musclesPayload = selectedMuscleIds.map((mId, index) => ({
        muscle_id: Number(mId),
        role: index === 0 ? ('primary' as const) : ('secondary' as const),
      }));

      await exerciseService.createExercise({
        name,
        description,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        load_type: 'barbell',
        is_active: true,
        muscles: musclesPayload,
      } as unknown as Parameters<typeof exerciseService.createExercise>[0]);

      setName('');
      setDescription('');
      setSelectedMuscleIds([]);
      
      const data = await exerciseService.getExercises();
      setExercises(data);
    } catch (err) {
      alert('No se pudo crear el ejercicio.');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este ejercicio?')) return;
    try {
      await exerciseService.deleteExercise(id);
      setExercises(exercises.filter((ex) => ex.id !== id));
    } catch (err) {
      alert('Error al eliminar el ejercicio.');
      console.error(err);
    }
  };

  const getMusclesDisplay = (ex: Exercise) => {
    if (!ex.muscles || ex.muscles.length === 0) {
      return <span className="text-gray-500">Sin asignar</span>;
    }

    return (
      <div className="space-y-1">
        {ex.muscles.map((m, idx) => {
          const matchedMuscle = muscles.find(mu => mu.id === m.muscle_id);
          const muscleName = m.muscle?.name || matchedMuscle?.name || `Músculo #${m.muscle_id}`;
          const isPrimary = m.role === 'primary';
          return (
            <div key={idx} className="text-sm">
              <span className={`font-medium ${isPrimary ? 'text-indigo-300' : 'text-gray-400'}`}>
                {muscleName}
              </span>{' '}
              <span className="text-xs text-gray-500">
                ({isPrimary ? 'Principal' : 'Secundario'})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Filtrar los ejercicios según el término de búsqueda
  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">Catálogo de Ejercicios</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isAdmin ? 'Modo Administrador' : 'Consulta los ejercicios disponibles'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 p-4 rounded mb-6 text-red-200">
          {error}
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleCreateExercise} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">Añadir Nuevo Ejercicio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Selecciona músculos (El primero seleccionado será el <span className="text-indigo-400 font-semibold">Principal</span>, los siguientes <span className="text-gray-300 font-semibold">Secundarios</span>):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-900 p-3 rounded border border-gray-700 max-h-40 overflow-y-auto">
              {muscles.map((muscle) => {
                const isSelected = selectedMuscleIds.includes(muscle.id);
                return (
                  <button
                    type="button"
                    key={muscle.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMuscleIds(selectedMuscleIds.filter(id => id !== muscle.id));
                      } else {
                        setSelectedMuscleIds([...selectedMuscleIds, muscle.id]);
                      }
                    }}
                    className={`p-2 rounded text-xs text-left border transition cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold' 
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750'
                    }`}
                  >
                    {muscle.name} {isSelected && selectedMuscleIds[0] === muscle.id && '👑'}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded transition cursor-pointer"
          >
            Guardar Ejercicio
          </button>
        </form>
      )}

      {/* Buscador de Ejercicios */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar ejercicio por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando ejercicios...</p>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-750 border-b border-gray-700 text-gray-300">
                <th className="p-4">Nombre</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Músculos Afectados</th>
                {isAdmin && <th className="p-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((ex) => (
                <tr key={ex.id} className="border-b border-gray-700/50 hover:bg-gray-750/50 transition">
                  <td className="p-4 font-medium">{ex.name}</td>
                  <td className="p-4 text-gray-400">{ex.description || 'Sin descripción'}</td>
                  <td className="p-4">{getMusclesDisplay(ex)}</td>
                  
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
              {filteredExercises.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="p-6 text-center text-gray-400">
                    No se encontraron ejercicios que coincidan con la búsqueda.
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