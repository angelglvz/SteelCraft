import api from './api';
import type { Muscle } from '../types';

export const muscleService = {
  async getMuscles(): Promise<Muscle[]> {
    const response = await api.get<Muscle[]>('/muscles/');
    return response.data;
  },

  async createMuscle(muscleData: Omit<Muscle, 'id'>): Promise<Muscle> {
    const response = await api.post<Muscle>('/muscles/', muscleData);
    return response.data;
  },
};