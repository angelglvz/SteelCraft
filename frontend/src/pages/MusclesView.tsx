import React, { useEffect, useState } from 'react';
import { muscleService } from '../services/muscleService';
import type { Muscle } from '../types';

export const MusclesView: React.FC = () => {
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario de creación
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {    
    const loadMuscles = async () => {
      try {
        setLoading(true);
        const data = await muscleService.getMuscles();
        setMuscles(data);
      } catch (err) {
        setError('Error al cargar los músculos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMuscles();
  }, []);

  const fetchMuscles = async () => {
    try {
      setLoading(true);
      const data = await muscleService.getMuscles();
      setMuscles(data);
    } catch (err) {
      setError('Error al cargar los músculos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await muscleService.createMuscle({ name, description });
      setName('');
      setDescription('');
      fetchMuscles(); // Recargar la lista
    } catch (err) {
      console.error('Error al crear músculo:', err);
      alert('No se pudo crear el músculo.');
    }
  };

  return (
    <div className="min-h-screen bg-steel-base text-steel-text px-6 py-8 font-hurme">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-extrabold text-steel-accent mb-6 tracking-wide drop-shadow-sm">Gestión de Músculos</h1>

        {/* Formulario de creación */}
        <form onSubmit={handleCreate} className="bg-steel-surface border border-steel-border rounded-xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-steel-accent">Añadir Nuevo Músculo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-steel-text mb-2">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-steel-surface-light border border-steel-border rounded-lg text-steel-text placeholder-steel-muted/60 focus:outline-none transition-colors"
                placeholder="Ej. Bíceps"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-steel-text mb-2">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-steel-surface-light border border-steel-border rounded-lg text-steel-text placeholder-steel-muted/60 focus:outline-none transition-colors"
                placeholder="Ej. Músculo flexores del brazo"
              />
            </div>
          </div>
          <button
            type="submit"
            className="font-bold py-3 px-8 rounded-full transition-transform active:scale-95 cursor-pointer shadow-lg bg-steel-accent text-steel-base hover:opacity-90"
          >
            Guardar Músculo
          </button>
        </form>

        {/* Listado de músculos */}
        <div className="bg-steel-surface border border-steel-border rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-steel-accent">Músculos Registrados</h2>

          {loading ? (
            <p className="text-steel-muted font-medium">Cargando músculos...</p>
          ) : error ? (
            <p className="text-steel-coral font-medium">{error}</p>
          ) : muscles.length === 0 ? (
            <p className="text-steel-muted font-medium">No hay músculos registrados todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-steel-border text-steel-text text-sm font-bold bg-steel-base/60">
                    <th className="py-3.5 px-4">Nombre</th>
                    <th className="py-3.5 px-4">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-border/60 text-sm">
                  {muscles.map((muscle) => (
                    <tr key={muscle.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-steel-text">{muscle.name}</td>
                      <td className="py-3.5 px-4 text-steel-muted">{muscle.description || 'Sin descripción'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};