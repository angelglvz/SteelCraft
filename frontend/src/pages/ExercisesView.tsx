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
      return <span className="text-steel-muted/70">Sin asignar</span>;
    }

    return (
      <div className="space-y-1">
        {ex.muscles.map((m, idx) => {
          const matchedMuscle = muscles.find(mu => mu.id === m.muscle_id);
          const muscleName = m.muscle?.name || matchedMuscle?.name || `Músculo #${m.muscle_id}`;
          const isPrimary = m.role === 'primary';
          return (
            <div key={idx} className="text-sm">
              <span className={`font-semibold ${isPrimary ? 'text-steel-accent' : 'text-steel-muted'}`}>
                {muscleName}
              </span>{' '}
              <span className={`text-xs font-medium ${isPrimary ? 'text-steel-accent' : 'text-steel-muted/80'}`}>
                ({isPrimary ? 'Principal' : 'Secundario'})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 w-full min-h-screen bg-steel-base font-hurme">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-steel-text drop-shadow-sm">Catálogo de Ejercicios</h1>
          <p className="text-sm mt-1 font-medium text-steel-muted">
            {isAdmin ? 'Modo Administrador' : 'Consulta los ejercicios disponibles'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg mb-6 text-sm border shadow-md font-medium bg-steel-coral/15 border-steel-coral text-steel-text">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="p-4 sm:p-6 rounded-xl mb-8 border shadow-xl bg-steel-surface border-steel-border">
          <h2 className="text-xl font-bold mb-4 text-steel-accent">Añadir Nuevo Ejercicio</h2>
          <form onSubmit={handleCreateExercise}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre del ejercicio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-lg text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-4 py-3 rounded-lg text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2 font-medium text-steel-text">
                Selecciona músculos (El primero será el <span className="font-bold text-steel-accent">Principal</span>, los siguientes <span className="font-bold text-steel-muted">Secundarios</span>):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg border max-h-44 overflow-y-auto bg-steel-base border-steel-border">
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
                      className={`p-2.5 rounded-md text-xs text-left border transition-all cursor-pointer font-semibold shadow-sm ${
                        isSelected 
                          ? 'bg-steel-accent text-steel-base border-steel-accent' 
                          : 'bg-steel-surface-light text-steel-text border-steel-border hover:bg-steel-surface'
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
              className="w-full sm:w-auto font-bold py-3 px-8 rounded-full transition-transform active:scale-95 cursor-pointer shadow-lg bg-steel-accent text-steel-base hover:opacity-90"
            >
              Guardar Ejercicio
            </button>
          </form>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar ejercicio por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl pl-4 pr-4 py-3.5 text-steel-text placeholder-steel-muted/60 border shadow-md bg-steel-surface border-steel-border focus:outline-none transition-colors"
        />
      </div>

      {loading ? (
        <p className="text-steel-text font-medium">Cargando ejercicios...</p>
      ) : (
        <div className="rounded-xl overflow-x-auto border shadow-xl bg-steel-surface border-steel-border">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b text-sm font-bold tracking-wider bg-steel-base/60 border-steel-border text-steel-text">
                <th className="p-4">Nombre</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Músculos Afectados</th>
                {isAdmin && <th className="p-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-border/60">
              {filteredExercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-steel-text text-base">{ex.name}</td>
                  <td className="p-4 text-sm text-steel-muted">{ex.description || 'Sin descripción'}</td>
                  <td className="p-4">{getMusclesDisplay(ex)}</td>
                  
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer font-bold border shadow-sm bg-steel-coral/15 border-steel-coral text-steel-coral"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredExercises.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="p-6 text-center font-medium text-steel-muted">
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