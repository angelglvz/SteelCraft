// --- AUTENTICACIÓN Y USUARIO ---
export interface User {
  id: number;
  email: string;
  is_active?: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
  role?: string;
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
  load_type?: string;
  is_active?: boolean;
  muscles?: ExerciseMuscle[];
}

// --- RELACION - EJERCICIO MUSCULOS ---
export interface ExerciseMuscle {
  id?: number;
  muscle_id: number;
  role: 'primary' | 'secondary';
  muscle?: Muscle;
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

export interface ExerciseCreateInput {
  name: string;
  description?: string;
  slug: string;
  load_type: string;
  is_active: boolean;
  muscles: {
    muscle_id: number;
    role: 'primary' | 'secondary';
  }[];
}