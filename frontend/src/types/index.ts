// --- AUTENTICACIÓN Y USUARIO ---
export interface User {
  id: number;
  email: string;
  username?: string;
  is_active?: boolean;
  avatar_key?: string | null;
  birth_date?: string | null;
  role?: string;
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
  id?: string;
  user_id?: string;
  measured_at: string;
  weight_kg?: number;
  height_cm?: number;
  body_fat_pct?: number;
  source?: 'manual' | 'telegram_import';
  created_at?: string;
}

// --- ENTRENAMIENTOS Y SERIES (SetLogs) ---
export interface SetLog {
  id?: number;
  set_number: number;
  reps: number;
  weight_kg?: number;
  weight?: number;
  extra_kg?: number;
  assist_kg?: number;
  rpe?: number;
}

export interface WorkoutExercise {
  id?: number;
  exercise_id: number;
  exercise?: Exercise;
  position?: number;
  notes?: string;
  sets: SetLog[];
}

export interface Workout {
  id?: string | number;
  user_id?: string | number;
  performed_on?: string;
  date?: string;
  notes?: string;
  source?: 'manual' | 'telegram_import';
  exercises?: WorkoutExercise[];
  workout_exercises?: WorkoutExercise[];
  created_at?: string;
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