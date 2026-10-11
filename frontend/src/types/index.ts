// --- AUTENTICACIÓN Y USUARIO ---
export interface User {
  id: number;
  email: string;
  is_active?: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// --- MÚSCULOS ---
export interface Muscle {
  id: number;
  name: string;
  description?: string;
}

// --- EJERCICIOS ---
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  primary_muscle_id: number;
  primary_muscle?: Muscle;
  secondary_muscles?: Muscle[];
}

// --- MEDIDAS CORPORALES ---
export interface Measurement {
  id: number;
  user_id: number;
  date: string; // O Date, según cómo lo serialice FastAPI (generalmente string ISO)
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
}

// --- ENTRENAMIENTOS Y SERIES (SetLogs) ---
export interface SetLog {
  id?: number;
  set_number: number;
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  id?: number;
  exercise_id: number;
  exercise?: Exercise;
  sets: SetLog[];
}

export interface Workout {
  id: number;
  user_id: number;
  date: string;
  notes?: string;
  workout_exercises: WorkoutExercise[];
}