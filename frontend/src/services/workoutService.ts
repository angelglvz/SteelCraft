import api from './api';
import type { Workout } from '../types';

export const workoutService = {
  async getWorkouts(): Promise<Workout[]> {
    const response = await api.get<Workout[]>('/workouts/');
    return response.data;
  },

  async createWorkout(workoutData: {
    performed_on: string;
    source: 'manual' | 'telegram_import';
    exercises: {
      exercise_id: number;
      position: number;
      notes?: string;
      sets: {
        set_number: number;
        reps: number;
        weight_kg?: number;
      }[];
    }[];
  }): Promise<Workout> {
    const response = await api.post<Workout>('/workouts/', workoutData);
    return response.data;
  },

  async deleteWorkout(id: number): Promise<void> {
    await api.delete(`/workouts/${id}`);
  },
};