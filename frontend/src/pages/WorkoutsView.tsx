import React, { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../types';

interface ActiveSet {
  set_number: number;
  reps: number;
  weight_kg: number;
}

interface ActiveExercise {
  exercise_id: number;
  name: string;
  sets: ActiveSet[];
  isExpanded?: boolean;
}

export const WorkoutsView: React.FC = () => {
  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(() => {
    return !!localStorage.getItem('steelcraft_active_workout');
  });
  
  const [exercisesCatalog, setExercisesCatalog] = useState<Exercise[]>([]);
  
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() => {
    const savedSession = localStorage.getItem('steelcraft_active_workout');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error al recuperar la sesión anterior', e);
      }
    }
    return [];
  });
  // Estados para el buscador del siguiente ejercicio
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cargar catálogo de ejercicios 
  useEffect(() => {
    exerciseService.getExercises().then(setExercisesCatalog).catch(console.error);
  }, []);

  // Guardar en localStorage cada vez que cambie el estado local (ahorro de llamadas al API)
  useEffect(() => {
    if (isTrainingActive) {
      localStorage.setItem('steelcraft_active_workout', JSON.stringify(activeExercises));
    } else {
      localStorage.removeItem('steelcraft_active_workout');
    }
  }, [activeExercises, isTrainingActive]);

  const handleStartWorkout = () => {
    setIsTrainingActive(true);
    setActiveExercises([]);
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: ActiveExercise = {
      exercise_id: exercise.id,
      name: exercise.name,
      sets: [{ set_number: 1, reps: 8, weight_kg: 0 }],
      isExpanded: true,
    };

    // Al añadir un nuevo ejercicio, colapsamos los anteriores y añadimos este abajo
    const updated = activeExercises.map(ex => ({ ...ex, isExpanded: false }));
    setActiveExercises([...updated, newExercise]);
    setSearchTerm('');
  };

  const handleAddSetToCurrent = (index: number) => {
    const updated = [...activeExercises];
    const target = updated[index];
    const nextSetNumber = target.sets.length + 1;
    const lastSet = target.sets[target.sets.length - 1];

    target.sets.push({
      set_number: nextSetNumber,
      reps: lastSet ? lastSet.reps : 8,
      weight_kg: lastSet ? lastSet.weight_kg : 0,
    });
    setActiveExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = activeExercises.filter((_, i) => i !== index);
    setActiveExercises(updated);
  };

  const handleToggleExpand = (index: number) => {
    const updated = [...activeExercises];
    updated[index].isExpanded = !updated[index].isExpanded;
    setActiveExercises(updated);
  };

  const handleFinishWorkout = async () => {
    if (activeExercises.length === 0) {
      if (!window.confirm('No has añadido ningún ejercicio. ¿Deseas descartar el entrenamiento?')) return;
      setIsTrainingActive(false);
      localStorage.removeItem('steelcraft_active_workout');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        performed_on: today,
        source: 'manual' as const,
        exercises: activeExercises.map((ex, idx) => ({
          exercise_id: ex.exercise_id,
          position: idx + 1,
          sets: ex.sets.map(s => ({
            set_number: s.set_number,
            reps: s.reps,
            weight_kg: s.weight_kg,
          })),
        })),
      };

      // Única llamada al API al finalizar el entrenamiento
      await workoutService.createWorkout(payload);
      
      alert('¡Entrenamiento guardado con éxito!');
      setIsTrainingActive(false);
      setActiveExercises([]);
      localStorage.removeItem('steelcraft_active_workout');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el entrenamiento en el servidor.');
    }
  };

  // Filtrado de ejercicios para el buscador dinámico
  const filteredCatalog = exercisesCatalog.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isTrainingActive) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center text-white min-h-[80vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4 text-indigo-400">Panel de Entrenamientos</h1>
        <p className="text-gray-400 mb-8">Comienza una sesión para registrar tus ejercicios y series.</p>
        <button
          onClick={handleStartWorkout}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition cursor-pointer"
        >
          Comenzar Entrenamiento
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white pb-32">
      <h1 className="text-2xl font-bold mb-6 text-indigo-400">Entrenamiento</h1>

      {/* Lista de ejercicios activos y pasados */}
      <div className="space-y-4 mb-8">
        {activeExercises.map((ex, index) => {
          const lastSet = ex.sets[ex.sets.length - 1];
          return (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow">
              <div 
                className="flex justify-between items-center cursor-pointer select-none" 
                onClick={() => handleToggleExpand(index)}
              >
                <div>
                  <span className="font-semibold text-lg text-indigo-300">
                    {ex.name} {ex.isExpanded ? '▲' : '▼'}
                  </span>
                  {!ex.isExpanded && (
                    <span className="ml-4 text-sm text-gray-400">
                      ({ex.sets.length} series · Última: {lastSet?.reps} reps / {lastSet?.weight_kg} kg)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveExercise(index); }}
                    className="text-red-400 hover:text-red-300 font-bold p-1 bg-red-950/40 border border-red-500/40 rounded px-2 text-xs"
                    title="Eliminar ejercicio"
                  >
                    X
                  </button>
                </div>
              </div>

              {/* Contenido expandido con todas las series del ejercicio */}
              {ex.isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                  {ex.sets.map((set, sIdx) => (
                    <div key={sIdx} className="flex items-center space-x-4 bg-gray-900 p-2 rounded">
                      <span className="text-sm text-gray-400 w-16">Serie {set.set_number}</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => {
                            const updated = [...activeExercises];
                            updated[index].sets[sIdx].reps = Number(e.target.value);
                            setActiveExercises(updated);
                          }}
                          className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                        />
                        <span className="text-sm text-gray-400">reps</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={set.weight_kg}
                          onChange={(e) => {
                            const updated = [...activeExercises];
                            updated[index].sets[sIdx].weight_kg = Number(e.target.value);
                            setActiveExercises(updated);
                          }}
                          className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center text-white"
                        />
                        <span className="text-sm text-gray-400">kg</span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddSetToCurrent(index)}
                    className="mt-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <span>+</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sección inferior: Pestaña para añadir el siguiente ejercicio con buscador */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">AÑADIR SIGUIENTE EJERCICIO</h3>
        <input
          type="text"
          placeholder="Buscar ejercicio en el catálogo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 mb-3"
        />

        {searchTerm && (
          <div className="bg-gray-900 border border-gray-700 rounded max-h-40 overflow-y-auto">
            {filteredCatalog.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleAddExerciseToWorkout(ex)}
                className="p-2 hover:bg-indigo-600/35 cursor-pointer text-sm border-b border-gray-800 last:border-none"
              >
                {ex.name}
              </div>
            ))}
            {filteredCatalog.length === 0 && (
              <div className="p-2 text-sm text-gray-500">No se encontraron ejercicios</div>
            )}
          </div>
        )}
      </div>

      {/* Botón rojo fijo inferior para terminar el entrenamiento */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur border-t border-gray-800 flex justify-center z-50">
        <button
          onClick={handleFinishWorkout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition cursor-pointer w-full max-w-md border border-red-500"
        >
          terminar entrenamiento
        </button>
      </div>
    </div>
  );
};