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

  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    exerciseService.getExercises().then(setExercisesCatalog).catch(console.error);
  }, []);

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

  const filteredCatalog = exercisesCatalog.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isTrainingActive) {
    return (
      <div className="px-4 sm:px-6 py-8 w-full min-h-screen flex flex-col justify-center items-center text-center bg-steel-base font-hurme">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 text-steel-accent tracking-wide">Panel de Entrenamientos</h1>
        <p className="text-steel-muted mb-8 text-sm max-w-md">Comienza una sesión para registrar tus ejercicios y series en tiempo real.</p>
        <button
          onClick={handleStartWorkout}
          className="w-full sm:w-auto font-bold py-3.5 px-8 rounded-full transition-transform active:scale-95 cursor-pointer shadow-lg bg-steel-accent text-steel-base hover:opacity-90"
        >
          Comenzar Entrenamiento
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 w-full min-h-screen pb-36 bg-steel-base font-hurme">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-steel-accent">Entrenamiento en Curso</h1>

        <div className="space-y-4 mb-8">
          {activeExercises.map((ex, index) => {
            const lastSet = ex.sets[ex.sets.length - 1];
            return (
              <div key={index} className="p-4 rounded-xl border shadow-xl bg-steel-surface border-steel-border">
                <div 
                  className="flex justify-between items-center cursor-pointer select-none gap-2" 
                  onClick={() => handleToggleExpand(index)}
                >
                  <div className="overflow-hidden">
                    <span className="font-bold text-base sm:text-lg text-steel-accent block sm:inline">
                      {ex.name} {ex.isExpanded ? '▲' : '▼'}
                    </span>
                    {!ex.isExpanded && (
                      <span className="sm:ml-4 text-xs sm:text-sm text-steel-muted block sm:inline">
                        ({ex.sets.length} series · Última: {lastSet?.reps} reps / {lastSet?.weight_kg} kg)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveExercise(index); }}
                      className="font-bold p-1 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer border shadow-sm bg-steel-coral/15 border-steel-coral text-steel-coral"
                      title="Eliminar ejercicio"
                    >
                      X
                    </button>
                  </div>
                </div>

                {ex.isExpanded && (
                  <div className="mt-4 pt-4 border-t border-steel-border space-y-3">
                    {ex.sets.map((set, sIdx) => (
                      <div key={sIdx} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2.5 rounded-lg bg-steel-base border border-steel-border">
                        <span className="text-xs sm:text-sm font-semibold text-steel-muted w-full sm:w-16">Serie {set.set_number}</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const updated = [...activeExercises];
                              updated[index].sets[sIdx].reps = Number(e.target.value);
                              setActiveExercises(updated);
                            }}
                            className="w-16 bg-steel-surface-light border border-steel-border rounded p-1 text-center text-steel-text font-bold text-sm"
                          />
                          <span className="text-xs sm:text-sm text-steel-muted">reps</span>
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
                            className="w-20 bg-steel-surface-light border border-steel-border rounded p-1 text-center text-steel-text font-bold text-sm"
                          />
                          <span className="text-xs sm:text-sm text-steel-muted">kg</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddSetToCurrent(index)}
                      className="mt-2 text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center justify-center space-x-1 cursor-pointer font-bold bg-steel-surface-light text-steel-text border border-steel-border hover:bg-steel-base w-full sm:w-auto"
                    >
                      <span>+ Añadir Serie</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 rounded-xl border shadow-xl bg-steel-surface border-steel-border mb-8">
          <h3 className="text-xs font-bold text-steel-muted tracking-wider mb-2">AÑADIR SIGUIENTE EJERCICIO</h3>
          <input
            type="text"
            placeholder="Buscar ejercicio en el catálogo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg px-4 py-3 text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none mb-3 text-sm sm:text-base"
          />

          {searchTerm && (
            <div className="rounded-lg max-h-40 overflow-y-auto bg-steel-base border border-steel-border">
              {filteredCatalog.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToWorkout(ex)}
                  className="p-3 hover:bg-steel-accent/20 cursor-pointer text-sm font-medium border-b border-steel-border last:border-none text-steel-text"
                >
                  {ex.name}
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="p-3 text-sm text-steel-muted">No se encontraron ejercicios</div>
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-steel-base/95 backdrop-blur border-t border-steel-border flex justify-center z-50">
          <button
            onClick={handleFinishWorkout}
            className="font-bold py-3.5 px-6 rounded-full shadow-xl transition-transform active:scale-95 cursor-pointer w-full max-w-md border bg-steel-coral/20 border-steel-coral text-steel-coral hover:bg-steel-coral/30 text-sm sm:text-base"
          >
            Terminar Entrenamiento
          </button>
        </div>
      </div>
    </div>
  );
};