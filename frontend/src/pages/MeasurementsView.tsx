import React, { useState, useEffect } from 'react';
import { measurementService } from '../services/measurementService';
import type { Measurement } from '../types';

export const MeasurementsView: React.FC = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [bodyFatPct, setBodyFatPct] = useState<string>('');
  const [measuredAt, setMeasuredAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

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
      
      setWeightKg('');
      setHeightCm('');
      setBodyFatPct('');

      await fetchMeasurements();
    } catch (err: unknown) {
      console.error('Error al guardar medida:', err);
      const errorObj = err as { response?: { data?: { detail?: string } } };
      setError(errorObj.response?.data?.detail || 'Error al registrar la medida.');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 w-full min-h-screen space-y-8 bg-steel-base font-hurme">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-steel-text drop-shadow-sm">Medidas Corporales</h1>
      </div>

      <div className="p-4 sm:p-6 rounded-xl border shadow-xl bg-steel-surface border-steel-border">
        <h2 className="text-xl font-bold mb-4 text-steel-accent">Añadir Nueva Medición</h2>
        
        {error && <div className="mb-4 p-3 rounded-lg text-sm border font-medium bg-steel-coral/15 border-steel-coral text-steel-text">{error}</div>}
        {successMsg && <div className="mb-4 p-3 rounded-lg text-sm border font-medium bg-steel-accent/15 border-steel-accent text-steel-text">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 font-semibold text-steel-text">Peso (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Ej. 75.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-semibold text-steel-text">Estatura (cm) (Opcional)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ej. 178"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-semibold text-steel-text">% Grasa Corporal (Opcional)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ej. 15.0"
              value={bodyFatPct}
              onChange={(e) => setBodyFatPct(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-semibold text-steel-text">Fecha y Hora</label>
            <input
              type="datetime-local"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-steel-text placeholder-steel-muted/60 border bg-steel-surface-light border-steel-border focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              className="w-full font-bold py-3.5 px-4 rounded-full transition-transform active:scale-95 cursor-pointer shadow-lg bg-steel-accent text-steel-base hover:opacity-90"
            >
              Guardar Medición
            </button>
          </div>
        </form>
      </div>

      <div className="p-4 sm:p-6 rounded-xl border shadow-xl bg-steel-surface border-steel-border">
        <h2 className="text-xl font-bold mb-4 text-steel-accent">Historial de Progreso</h2>
        
        {loading ? (
          <p className="text-center py-4 text-steel-text font-medium">Cargando mediciones...</p>
        ) : measurements.length === 0 ? (
          <p className="text-center py-4 font-medium text-steel-muted">No hay mediciones registradas todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b text-sm font-bold tracking-wider bg-steel-base/60 border-steel-border text-steel-text">
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Peso</th>
                  <th className="py-3.5 px-4">Estatura</th>
                  <th className="py-3.5 px-4">% Grasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-border/60 text-sm">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-steel-text">
                      {new Date(m.measured_at).toLocaleDateString()} {new Date(m.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-steel-accent">
                      {m.weight_kg !== undefined && m.weight_kg !== null ? `${m.weight_kg} kg` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-steel-muted">
                      {m.height_cm !== undefined && m.height_cm !== null ? `${m.height_cm} cm` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-steel-muted">
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