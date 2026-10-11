import api from './api';
import type { Measurement } from '../types';

export const measurementService = {
  async getMeasurements(): Promise<Measurement[]> {
    const response = await api.get<Measurement[]>('/measurements/');
    return response.data;
  },

  async createMeasurement(measurementData: Omit<Measurement, 'id' | 'user_id'>): Promise<Measurement> {
    const response = await api.post<Measurement>('/measurements/', measurementData);
    return response.data;
  },

  async deleteMeasurement(id: number): Promise<void> {
    await api.delete(`/measurements/${id}`);
  },
};