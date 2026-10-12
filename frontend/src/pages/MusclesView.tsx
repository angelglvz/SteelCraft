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
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-500 mb-6">Gestión de Músculos</h1>

        {/* Formulario de creación */}
        <form onSubmit={handleCreate} className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Añadir Nuevo Músculo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej. Bíceps"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Ej. Músculo flexores del brazo"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Guardar Músculo
          </button>
        </form>

        {/* Listado de músculos */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Músculos Registrados</h2>

          {loading ? (
            <p className="text-gray-400">Cargando músculos...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : muscles.length === 0 ? (
            <p className="text-gray-400">No hay músculos registrados todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {muscles.map((muscle) => (
                    <tr key={muscle.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-medium text-white">{muscle.name}</td>
                      <td className="py-3 px-4 text-gray-400">{muscle.description || 'Sin descripción'}</td>
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