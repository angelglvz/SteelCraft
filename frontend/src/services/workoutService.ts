import api from './api';
import type { Workout } from '../types';

export const workoutService = {
  async getWorkouts(): Promise<Workout[]> {
    const response = await api.get<Workout[]>('/workouts/');
    return response.data;
  },

  async createWorkout(workoutData: Omit<Workout, 'id' | 'user_id'>): Promise<Workout> {
    const response = await api.post<Workout>('/workouts/', workoutData);
    return response.data;
  },

  async deleteWorkout(id: number): Promise<void> {
    await api.delete(`/workouts/${id}`);
  },
};