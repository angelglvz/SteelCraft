import React, { useEffect, useState, useRef } from 'react';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import type { Workout, Exercise } from '../types';

export const WorkoutsHistoryView: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercisesCatalog, setExercisesCatalog] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Estado para el año seleccionado en el calendario (por defecto el año actual)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      workoutService.getWorkouts(),
      exerciseService.getExercises()
    ])
      .then(([workoutsData, exercisesData]) => {
        setWorkouts(workoutsData);
        
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

  // Mapear TODOS los entrenamientos por fecha y extraer los años disponibles
  const workoutsByDate = new Map<string, Workout[]>();
  const availableYearsSet = new Set<number>([new Date().getFullYear()]);

  workouts.forEach(w => {
    const dateStr = (w.performed_on || w.date || '').split('T')[0];
    if (!dateStr) return;

    const year = parseInt(dateStr.split('-')[0], 10);
    if (!isNaN(year)) {
      availableYearsSet.add(year);
    }

    const existing = workoutsByDate.get(dateStr) || [];
    workoutsByDate.set(dateStr, [...existing, w]);
  });

  const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

  // Generar las semanas para el año natural completo (del 1 de enero al 31 de diciembre)
  const generateYearWeeksData = (year: number) => {
    const weeks: { days: { dateStr: string; workoutsList: Workout[]; dateObj: Date; isCurrentYear: boolean }[] }[] = [];
    
    const startDate = new Date(year, 0, 1); // 1 de enero
    const endDate = new Date(year, 11, 31); // 31 de diciembre

    // Alinear al lunes de la semana del 1 de enero
    const dayOfWeek = startDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToMonday);

    let currentWeek: { dateStr: string; workoutsList: Workout[]; dateObj: Date; isCurrentYear: boolean }[] = [];

    const curr = new Date(startDate);
    while (curr <= endDate || currentWeek.length > 0) {
      if (currentWeek.length === 0 && curr > endDate) {
        break;
      }

      // Formatear la fecha localmente en formato YYYY-MM-DD sin desfases UTC
      const yearStr = curr.getFullYear();
      const monthStr = String(curr.getMonth() + 1).padStart(2, '0');
      const dayStr = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const dayWorkouts = workoutsByDate.get(dateStr) || [];
      const isCurrentYear = curr.getFullYear() === year;

      currentWeek.push({
        dateStr,
        workoutsList: dayWorkouts,
        dateObj: new Date(curr),
        isCurrentYear,
      });

      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    return weeks;
  };

  const weeksData = generateYearWeeksData(selectedYear);

  // Calcular cabeceras de meses para el año seleccionado
  const getMonthsHeader = () => {
    const monthsMap: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksData.forEach((week, wIdx) => {
      const validDay = week.days.find(d => d.isCurrentYear) || week.days[0];
      const month = validDay.dateObj.getMonth();
      
      if (month !== lastMonth) {
        const rawMonth = validDay.dateObj.toLocaleString('es-ES', { month: 'short' });
        const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.replace('.', '').slice(1);
        monthsMap.push({ name: monthName, weekIndex: wIdx });
        lastMonth = month;
      }
    });

    return monthsMap;
  };

  const monthsHeader = getMonthsHeader();
  
  // Calcular el número real de entrenamientos en el año seleccionado (sin límites de 20 entradas)
  const yearWorkoutsCount = Array.from(workoutsByDate.entries()).reduce((acc, [dateStr, list]) => {
    if (dateStr.startsWith(selectedYear.toString())) {
      return acc + list.length;
    }
    return acc;
  }, 0);

  const selectedWorkouts = selectedDate ? (workoutsByDate.get(selectedDate) || []) : [];

  const getIntensityClass = (workoutsList: Workout[], isSelected: boolean, isCurrentYear: boolean) => {
    if (!isCurrentYear) {
      return 'opacity-10 bg-steel-surface-light pointer-events-none';
    }

    const count = workoutsList.reduce((acc, w) => acc + (w.exercises || w.workout_exercises || []).length, 0);
    
    let baseClass = 'bg-steel-surface-light hover:bg-steel-border';
    if (count > 0 && count <= 2) baseClass = 'bg-emerald-900 hover:bg-emerald-800';
    else if (count > 2 && count <= 4) baseClass = 'bg-emerald-700 hover:bg-emerald-600';
    else if (count > 4 && count <= 8) baseClass = 'bg-emerald-500 hover:bg-emerald-400';
    else if (count > 8) baseClass = 'bg-emerald-300 hover:bg-emerald-200 shadow-sm shadow-emerald-400/50';

    if (isSelected) {
      return `${baseClass} ring-2 ring-steel-accent ring-offset-2 ring-offset-steel-base`;
    }
    return baseClass;
  };

  if (loading) {
    return <div className="p-8 text-steel-text bg-steel-base min-h-screen w-full font-hurme">Cargando historial de entrenamientos...</div>;
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 w-full min-h-screen space-y-6 sm:space-y-8 bg-steel-base font-hurme">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-accent tracking-wide drop-shadow-sm">Historial y Actividad</h1>
          <p className="text-steel-muted text-sm mt-1">Visualiza tu constancia anual y selecciona un día para ver los detalles.</p>
        </div>

        {/* Pestañas de selección de año */}
        <div className="flex flex-wrap gap-2 bg-steel-surface p-1.5 rounded-xl border border-steel-border self-start sm:self-auto">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedYear === year
                  ? 'bg-steel-accent text-steel-base shadow-md'
                  : 'text-steel-muted hover:text-steel-text hover:bg-steel-surface-light'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-xl border shadow-xl bg-steel-surface border-steel-border">
        <h3 className="text-sm font-bold text-steel-muted mb-6">
          {yearWorkoutsCount} entrenamientos registrados en el año {selectedYear}
        </h3>

        <div ref={scrollContainerRef} className="overflow-x-auto pb-4">
          <div className="min-w-[850px]">
            <div className="relative h-5 text-xs text-steel-muted mb-2 pl-7">
              {monthsHeader.map((m, idx) => {
                const leftPosition = m.weekIndex * 20; 
                return (
                  <span
                    key={idx}
                    className="absolute font-semibold"
                    style={{ left: `${7 + leftPosition}px` }}
                  >
                    {m.name}
                  </span>
                );
              })}
            </div>

            <div className="flex">
              <div className="flex flex-col text-xs text-steel-muted pr-3 select-none justify-between" style={{ height: '136px' }}>
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
                          onClick={() => day.isCurrentYear && setSelectedDate(day.dateStr)}
                          title={day.isCurrentYear ? `${day.dateStr}: ${exerciseCount} ejercicios realizados` : ''}
                          className={`w-3.5 h-3.5 rounded-sm transition-all ${day.isCurrentYear ? 'cursor-pointer' : ''} ${getIntensityClass(day.workoutsList, isSelected, day.isCurrentYear)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-xl border shadow-xl bg-steel-surface border-steel-border">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-steel-accent">
          Entrenamiento(s) del día: <span className="text-steel-text text-base sm:text-lg block sm:inline">{selectedDate || 'Ninguna fecha seleccionada'}</span>
        </h2>
        
        {selectedWorkouts.length > 0 ? (
          <div className="space-y-6">
            {selectedWorkouts.map((workout, wIdx) => (
              <div key={workout.id || wIdx} className="space-y-4 p-4 rounded-xl border bg-steel-base border-steel-border">
                <div className="flex justify-between items-center border-b border-steel-border pb-3">
                  <span className="text-steel-text text-sm font-bold">Entrenamiento #{wIdx + 1}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-steel-accent/20 border border-steel-accent/40 text-steel-accent">
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
                      <div key={idx} className="p-3 rounded-lg border bg-steel-surface border-steel-border">
                        <span className="font-bold text-steel-accent text-sm sm:text-base">
                          {exerciseName}
                        </span>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(we.sets || []).map((set: any, sIdx: number) => (
                            <div key={sIdx} className="p-2 rounded-md text-xs text-center border bg-steel-surface-light border-steel-border text-steel-muted">
                              Serie {set.set_number}: <span className="text-steel-text font-bold">{set.reps} reps</span> / {set.weight_kg ?? set.weight ?? 0} kg
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
          <p className="text-steel-muted text-sm sm:text-base">No hay entrenamientos registrados en esta fecha.</p>
        )}
      </div>
    </div>
  );
};