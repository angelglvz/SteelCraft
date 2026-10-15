import React, { useState, useEffect } from 'react';
import { measurementService } from '../services/measurementService';
import type { Measurement } from '../types';

export const MeasurementsView: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos del formulario (peso obligatorio, estatura y grasa opcionales)
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [bodyFatPct, setBodyFatPct] = useState<string>('');
  const [measuredAt, setMeasuredAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Función interna para recargar la lista cuando sea necesario
  const fetchMeasurements = async () => {
    try {
      const data = await measurementService.getMeasurements();
      setMeasurements(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar las medidas:', err);
      setError('No se pudieron cargar las mediciones.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchMeasurements();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const weightNum = parseFloat(weightKg);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('El peso es obligatorio y debe ser un valor válido.');
      return;
    }

    try {
      const payload = {
        measured_at: new Date(measuredAt).toISOString(),
        weight_kg: weightNum,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        body_fat_pct: bodyFatPct ? parseFloat(bodyFatPct) : undefined,
      };

      await measurementService.createMeasurement(payload);
      setSuccessMsg('¡Medida registrada con éxito!');
      
      // Limpiar formulario básico
      setWeightKg('');
      setHeightCm('');
      setBodyFatPct('');

      // Recargar lista
      await fetchMeasurements();
    } catch (err: unknown) {
      console.error('Error al guardar medida:', err);
      const errorObj = err as { response?: { data?: { detail?: string } } };
      setError(errorObj.response?.data?.detail || 'Error al registrar la medida.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-400">Medidas Corporales</h1>
      </div>

      {/* Formulario de Registro */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Añadir Nueva Medición</h2>
        
        {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded text-sm">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-300 rounded text-sm">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Peso (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Ej. 75.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Estatura (cm) (Opcional)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ej. 178"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">% Grasa Corporal (Opcional)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ej. 15.0"
              value={bodyFatPct}
              onChange={(e) => setBodyFatPct(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha y Hora</label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded transition cursor-pointer"
            >
              Guardar Medición
            </button>
          </div>
        </form>
      </div>

      {/* Historial de Medidas */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Historial de Progreso</h2>
        
        {loading ? (
          <p className="text-gray-400 text-center py-4">Cargando mediciones...</p>
        ) : measurements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay mediciones registradas todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Peso</th>
                  <th className="py-3 px-4">Estatura</th>
                  <th className="py-3 px-4">% Grasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/50 transition">
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(m.measured_at).toLocaleDateString()} {new Date(m.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-400">
                      {m.weight_kg !== undefined && m.weight_kg !== null ? `${m.weight_kg} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {m.height_cm !== undefined && m.height_cm !== null ? `${m.height_cm} cm` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {m.body_fat_pct !== undefined && m.body_fat_pct !== null ? `${m.body_fat_pct}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};