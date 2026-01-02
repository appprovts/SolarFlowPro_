
import React, { useState } from 'react';
import { SurveyData, Project } from '../types';

interface SurveyFormProps {
  project: Project;
  onSave: (data: SurveyData) => void;
  readOnly?: boolean;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ project, onSave, readOnly }) => {
  const [formData, setFormData] = useState<SurveyData>(project.surveyData || {
    roofType: 'Cerâmico',
    azimuth: 0,
    inclination: 15,
    shadingIssues: 'Nenhum',
    electricalPanelStatus: 'Bom estado, requer disjuntor extra',
    transformerDistance: 20,
    coordinates: null,
    photos: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    onSave(formData);
  };

  const getCurrentLocation = () => {
    if (readOnly) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData({
        ...formData,
        coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Vistoria Técnica: {project.clientName}</h2>
        {!readOnly && (
          <button 
            type="button" 
            onClick={getCurrentLocation}
            className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            <i className="fas fa-location-dot"></i>
            Capturar Localização
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Telhado</label>
          <select 
            disabled={readOnly}
            className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75"
            value={formData.roofType}
            onChange={(e) => setFormData({...formData, roofType: e.target.value})}
          >
            <option>Cerâmico</option>
            <option>Fibrocimento</option>
            <option>Metálico Trapeizodal</option>
            <option>Laje</option>
            <option>Solo</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Azimute (°)</label>
            <input 
              readOnly={readOnly}
              type="number"
              className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500 disabled:opacity-75"
              value={formData.azimuth}
              onChange={(e) => setFormData({...formData, azimuth: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Inclinação (°)</label>
            <input 
              readOnly={readOnly}
              type="number"
              className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500 disabled:opacity-75"
              value={formData.inclination}
              onChange={(e) => setFormData({...formData, inclination: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Problemas de Sombreamento</label>
          <textarea 
            readOnly={readOnly}
            className="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500 disabled:opacity-75"
            rows={3}
            value={formData.shadingIssues}
            onChange={(e) => setFormData({...formData, shadingIssues: e.target.value})}
            placeholder="Descreva obstáculos..."
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Localização Capturada</label>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-red-500"></i>
            {formData.coordinates 
              ? `Latitude: ${formData.coordinates.lat.toFixed(6)}, Longitude: ${formData.coordinates.lng.toFixed(6)}`
              : 'Nenhuma localização capturada.'}
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <i className="fas fa-paper-plane"></i>
            Enviar para Engenharia
          </button>
        </div>
      )}
    </form>
  );
};

export default SurveyForm;
