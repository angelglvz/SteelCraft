import api from './api';
import type { Exercise } from '../types';

export const exerciseService = {
  async getExercises(): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>('/exercises/');
    return response.data;
  },

  async createExercise(exerciseData: Omit<Exercise, 'id' | 'primary_muscle' | 'secondary_muscles'>): Promise<Exercise> {
    const response = await api.post<Exercise>('/exercises/', exerciseData);
    return response.data;
  },
};