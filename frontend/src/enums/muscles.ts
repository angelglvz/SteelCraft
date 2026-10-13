// src/enums/muscles.ts
export interface MuscleOption {
  id: number;
  name: string;
}

export const SYSTEM_MUSCLES: MuscleOption[] = [
  { id: 1, name: 'Pecho' },
  { id: 2, name: 'Espalda' },
  { id: 3, name: 'Hombro' },
  { id: 4, name: 'Bíceps' },
  { id: 5, name: 'Tríceps' },
  { id: 6, name: 'Cuádriceps' },
  { id: 7, name: 'Isquiotibiales' },
  { id: 8, name: 'Glúteo' },
  { id: 9, name: 'Aductores' },
  { id: 10, name: 'Gemelos' },
  { id: 11, name: 'Abdomen' },
  { id: 12, name: 'Lumbares' },
];