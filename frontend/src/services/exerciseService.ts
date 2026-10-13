import api from './api';
import type { Exercise, ExerciseCreateInput } from '../types';

export const exerciseService = {
  async getExercises(): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>('/exercises/');
    return response.data;
  },

  async createExercise(exerciseData: ExerciseCreateInput): Promise<Exercise> {
    const response = await api.post<Exercise>('/exercises/', exerciseData);
    return response.data;
  },

  async deleteExercise(id: number): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },
};