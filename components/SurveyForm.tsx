
import React, { useState, useRef } from 'react';
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

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = (files: FileList | null) => {
    if (!files || readOnly) return;
    
    const newPhotos: string[] = [...formData.photos];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPhotos.push(e.target.result as string);
            setFormData(prev => ({ ...prev, photos: [...newPhotos] }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    if (readOnly) return;
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const triggerFileInput = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Fotos do Local</label>
          
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => handleFiles(e.target.files)}
          />

          {!readOnly && (
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={triggerFileInput}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition cursor-pointer ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'
              }`}
            >
              <div className="space-y-1 text-center">
                <i className={`fas fa-camera text-3xl mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`}></i>
                <div className="flex text-sm text-slate-600">
                  <span className="relative font-medium text-blue-600 hover:text-blue-500">
                    Clique para upload
                  </span>
                  <p className="pl-1 text-slate-500">ou arraste as fotos aqui</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG até 10MB</p>
              </div>
            </div>
          )}

          {formData.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={photo} alt={`Local ${index}`} className="w-full h-full object-cover" />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
