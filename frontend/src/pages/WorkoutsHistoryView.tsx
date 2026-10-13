import React, { useEffect, useState } from 'react';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import type { Workout, Exercise } from '../types';

export const WorkoutsHistoryView: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercisesCatalog, setExercisesCatalog] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      workoutService.getWorkouts(),
      exerciseService.getExercises()
    ])
      .then(([workoutsData, exercisesData]) => {
        setWorkouts(workoutsData);
        
        // Crear un mapa de ID -> Nombre del ejercicio del catálogo
        const catalogMap = new Map<number, string>();
        exercisesData.forEach((ex: Exercise) => {
          catalogMap.set(ex.id, ex.name);
        });
        setExercisesCatalog(catalogMap);

        setLoading(false);
        if (workoutsData.length > 0) {
          const lastDate = (workoutsData[0].performed_on || workoutsData[0].date || '').split('T')[0];
          setSelectedDate(lastDate);
        }
      })
      .catch((err) => {
        console.error('Error al cargar datos:', err);
        setLoading(false);
      });
  }, []);

  const workoutsByDate = new Map<string, Workout[]>();
  let totalYearWorkouts = 0;

  workouts.forEach(w => {
    const dateStr = (w.performed_on || w.date || '').split('T')[0];
    if (!dateStr) return;

    const existing = workoutsByDate.get(dateStr) || [];
    workoutsByDate.set(dateStr, [...existing, w]);
    totalYearWorkouts++;
  });

  const generateWeeksData = () => {
    const weeks: { days: { dateStr: string; workoutsList: Workout[]; dateObj: Date }[] }[] = [];
    const today = new Date();
    
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    const dayOfWeek = startDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToMonday);

    let currentWeek: { dateStr: string; workoutsList: Workout[]; dateObj: Date }[] = [];

    const curr = new Date(startDate);
    while (curr <= today) {
      const dateStr = curr.toISOString().split('T')[0];
      const dayWorkouts = workoutsByDate.get(dateStr) || [];

      currentWeek.push({
        dateStr,
        workoutsList: dayWorkouts,
        dateObj: new Date(curr),
      });

      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push({ days: currentWeek });
    }

    return weeks;
  };

  const weeksData = generateWeeksData();

  const getMonthsHeader = () => {
    const monthsMap: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksData.forEach((week, wIdx) => {
      const firstDayOfWeek = week.days[0].dateObj;
      const month = firstDayOfWeek.getMonth();
      
      if (month !== lastMonth) {
        const rawMonth = firstDayOfWeek.toLocaleString('es-ES', { month: 'short' });
        const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.replace('.', '').slice(1);
        monthsMap.push({ name: monthName, weekIndex: wIdx });
        lastMonth = month;
      }
    });

    return monthsMap;
  };

  const monthsHeader = getMonthsHeader();
  const selectedWorkouts = selectedDate ? (workoutsByDate.get(selectedDate) || []) : [];

  const getIntensityClass = (workoutsList: Workout[], isSelected: boolean) => {
    const count = workoutsList.reduce((acc, w) => acc + (w.exercises || w.workout_exercises || []).length, 0);
    
    let baseClass = 'bg-gray-800 hover:bg-gray-700';
    if (count > 0 && count <= 2) baseClass = 'bg-emerald-900 hover:bg-emerald-800';
    else if (count > 2 && count <= 4) baseClass = 'bg-emerald-700 hover:bg-emerald-600';
    else if (count > 4 && count <= 8) baseClass = 'bg-emerald-500 hover:bg-emerald-400';
    else if (count > 8) baseClass = 'bg-emerald-300 hover:bg-emerald-200 shadow-sm shadow-emerald-400/50';

    if (isSelected) {
      return `${baseClass} ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900`;
    }
    return baseClass;
  };

  if (loading) {
    return <div className="p-8 text-white">Cargando historial de entrenamientos...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-white space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-indigo-400">Historial y Actividad</h1>
        <p className="text-gray-400 text-sm mt-1">Visualiza tu constancia anual y selecciona un día para ver los detalles.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-400 mb-6">
          {totalYearWorkouts} entrenamientos registrados en el último año
        </h3>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[750px]">
            <div className="relative h-5 text-xs text-gray-400 mb-2 pl-7">
              {monthsHeader.map((m, idx) => {
                const leftPosition = m.weekIndex * 20; 
                return (
                  <span
                    key={idx}
                    className="absolute"
                    style={{ left: `${7 + leftPosition}px` }}
                  >
                    {m.name}
                  </span>
                );
              })}
            </div>

            <div className="flex">
              <div className="flex flex-col text-xs text-gray-400 pr-3 select-none justify-between" style={{ height: '136px' }}>
                <span className="leading-none">Lun</span>
                <span className="leading-none"></span>
                <span className="leading-none">Mié</span>
                <span className="leading-none"></span>
                <span className="leading-none">Vie</span>
                <span className="leading-none"></span>
                <span className="leading-none"></span>
              </div>

              <div className="flex space-x-1.5">
                {weeksData.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col space-y-1.5">
                    {week.days.map((day, dIdx) => {
                      const exerciseCount = day.workoutsList.reduce((acc, w) => acc + (w.exercises || w.workout_exercises || []).length, 0);
                      const isSelected = selectedDate === day.dateStr;
                      return (
                        <div
                          key={dIdx}
                          onClick={() => setSelectedDate(day.dateStr)}
                          title={`${day.dateStr}: ${exerciseCount} ejercicios realizados`}
                          className={`w-3.5 h-3.5 rounded-sm transition-all cursor-pointer ${getIntensityClass(day.workoutsList, isSelected)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-800/60 text-xs text-gray-400">
          <span>Menos</span>
          <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
          <span>Más</span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">
          Entrenamiento(s) del día: <span className="text-white">{selectedDate || 'Ninguna fecha seleccionada'}</span>
        </h2>
        
        {selectedWorkouts.length > 0 ? (
          <div className="space-y-6">
            {selectedWorkouts.map((workout, wIdx) => (
              <div key={workout.id || wIdx} className="space-y-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-300 text-sm font-semibold">Entrenamiento #{wIdx + 1}</span>
                  <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs">
                    {(workout.exercises || workout.workout_exercises || []).length} ejercicios
                  </span>
                </div>
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(workout.exercises || workout.workout_exercises || []).map((we: any, idx) => {
                    const exerciseId = we.exercise_id || we.exercise?.id;
                    const exerciseName = 
                      we.exercise?.name || 
                      we.exercise_name || 
                      we.name || 
                      (exerciseId ? exercisesCatalog.get(Number(exerciseId)) : null) || 
                      `Ejercicio #${exerciseId || idx + 1}`;

                    return (
                      <div key={idx} className="bg-gray-900 p-3 rounded border border-gray-800/60">
                        <span className="font-semibold text-indigo-200">
                          {exerciseName}
                        </span>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(we.sets || []).map((set: any, sIdx: number) => (
                            <div key={sIdx} className="bg-gray-950 p-1.5 rounded text-xs text-gray-300 text-center border border-gray-800">
                              Serie {set.set_number}: <span className="text-white font-bold">{set.reps} reps</span> / {set.weight_kg ?? set.weight ?? 0} kg
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay entrenamientos registrados en esta fecha.</p>
        )}
      </div>
    </div>
  );
};