
import React, { useState, useRef } from 'react';
import { SurveyData, Project } from '../types';

interface SurveyFormProps {
  project: Project;
  onSave: (data: SurveyData) => void;
  readOnly?: boolean;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ project, onSave, readOnly }) => {
  const [formData, setFormData] = useState<SurveyData>(project.surveyData || {
    // 1. Local
    address: project.address,
    coordinates: null,

    // 2. Telhado
    roofType: 'Cerâmica',
    roofOrientation: 'Norte',
    inclination: 15,
    roofCondition: 'Bom',
    roofLoadCapacity: 'Normal',

    // 3. Consumo
    averageConsumption: 0,
    consumptionHistory: '',
    contractedDemand: 0,

    // 4. Elétrica
    connectionType: 'Bifásico',
    voltage: '220V',
    breakerCurrent: 63,
    panelLocation: 'Interno',

    // 5. Sombreamento
    shadingIssues: 'Nenhum',
    shadingAngle: '',
    shadingPeriod: '',

    // 6. Acesso
    accessEase: 'Fácil',
    safetyConditions: 'Com guarda-corpo',

    // 7. Docs
    hasElectricalProject: false,
    hasPropertyDeed: true,
    documentsNotes: '',

    // 8. Equipamentos
    existingEquipmentType: '',
    existingEquipmentCondition: 'Normal',
    structureReusePossible: false,

    // 9. Meteo
    averageIrradiation: 0,

    // 10. Cliente
    clientObjectives: 'Economia',
    investmentAvailability: 'Imediata',

    photos: []
  });

  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 0, title: 'Local e Clima', icon: 'fa-map-marked-alt' },
    { id: 1, title: 'Telhado', icon: 'fa-home' },
    { id: 2, title: 'Elétrica', icon: 'fa-bolt' },
    { id: 3, title: 'Sombra', icon: 'fa-cloud-sun' },
    { id: 4, title: 'Docs e Cliente', icon: 'fa-file-signature' },
    { id: 5, title: 'Fotos', icon: 'fa-camera' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    if (formData.photos.length < 3) {
      alert('É obrigatório enviar pelo menos 3 fotos do local para prosseguir.');
      return;
    }

    onSave(formData);
  };

  const getCurrentLocation = () => {
    if (readOnly) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData({
        ...formData,
        coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
      });
    }, (err) => alert("Erro ao capturar localização. Verifique as permissões."));
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

  const removePhoto = (index: number) => {
    if (readOnly) return;
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Dados do Local e Meteorológicos
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">1. Dados do Local e 9. Meteorologia</h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Localização</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                <input
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-white focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Coordenadas Geográficas</label>
                  {!readOnly && (
                    <button type="button" onClick={getCurrentLocation} className="text-xs text-blue-600 hover:underline">
                      <i className="fas fa-crosshairs mr-1"></i>Capturar Agora
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <input
                    readOnly={readOnly}
                    placeholder="Latitude"
                    type="number"
                    className="w-1/2 rounded-xl border-slate-200 bg-white"
                    value={formData.coordinates?.lat || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: { lat: Number(e.target.value), lng: formData.coordinates?.lng || 0 } })}
                  />
                  <input
                    readOnly={readOnly}
                    placeholder="Longitude"
                    type="number"
                    className="w-1/2 rounded-xl border-slate-200 bg-white"
                    value={formData.coordinates?.lng || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: { lat: formData.coordinates?.lat || 0, lng: Number(e.target.value) } })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dados Meteorológicos</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Radiação Solar Média (Wh/m²/dia)</label>
                <input
                  type="number"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-white"
                  placeholder="Se disponível (Ex: 5.2)"
                  value={formData.averageIrradiation || ''}
                  onChange={(e) => setFormData({ ...formData, averageIrradiation: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );
      case 1: // Telhado e Acesso
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">2. Telhado e 6. Acesso</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Material</label>
                <select
                  disabled={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.roofType}
                  onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                >
                  <option>Cerâmica</option>
                  <option>Fibrocimento</option>
                  <option>Metálico</option>
                  <option>Laje de Concreto</option>
                  <option>Solo</option>
                  <option>Shingle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Conservação</label>
                <select
                  disabled={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.roofCondition}
                  onChange={(e) => setFormData({ ...formData, roofCondition: e.target.value })}
                >
                  <option>Novo / Excelente</option>
                  <option>Bom</option>
                  <option>Regular - Requer Reparos</option>
                  <option>Ruim - Requer Troca</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Orientação (Azimute)</label>
                <select
                  disabled={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.roofOrientation}
                  onChange={(e) => setFormData({ ...formData, roofOrientation: e.target.value })}
                >
                  <option>Norte</option>
                  <option>Nordeste</option>
                  <option>Noroeste</option>
                  <option>Leste</option>
                  <option>Oeste</option>
                  <option>Sul</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Inclinação Estimada (°)</label>
                <input
                  type="number"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.inclination}
                  onChange={(e) => setFormData({ ...formData, inclination: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade de Carga</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.roofLoadCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, roofLoadCapacity: e.target.value })}
                  placeholder="Ex: Reforçada, Precisa de análise..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facilidade de Acesso</label>
                <select
                  disabled={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.accessEase}
                  onChange={(e) => setFormData({ ...formData, accessEase: e.target.value })}
                >
                  <option>Fácil - Nível da rua</option>
                  <option>Médio - Escada necessária</option>
                  <option>Difícil - Andaime/Elevador necessário</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Condições de Segurança</label>
              <textarea
                readOnly={readOnly}
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-slate-50"
                value={formData.safetyConditions}
                onChange={(e) => setFormData({ ...formData, safetyConditions: e.target.value })}
                placeholder="Guarda-corpo, linha de vida, pontos de ancoragem..."
              ></textarea>
            </div>
          </div>
        );
      case 2: // Elétrica, Consumo e Equipamentos
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">3. Consumo, 4. Conexão e 8. Equipamentos</h3>

            {/* Consumo */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Consumo de Energia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Consumo Médio (kWh)</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.averageConsumption}
                    onChange={(e) => setFormData({ ...formData, averageConsumption: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Demanda Contratada (kW)</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.contractedDemand}
                    onChange={(e) => setFormData({ ...formData, contractedDemand: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Histórico (Últimos 12 meses)</label>
                <textarea
                  readOnly={readOnly}
                  rows={2}
                  className="w-full rounded-xl border-slate-200 bg-white"
                  value={formData.consumptionHistory || ''}
                  onChange={(e) => setFormData({ ...formData, consumptionHistory: e.target.value })}
                  placeholder="Insira os dados de consumo mês a mês ou copie o histórico..."
                ></textarea>
              </div>
            </div>

            {/* Conexão */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Conexão Elétrica</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.connectionType}
                    onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
                  >
                    <option>Monofásico</option>
                    <option>Bifásico</option>
                    <option>Trifásico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tensão</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.voltage}
                    onChange={(e) => setFormData({ ...formData, voltage: e.target.value as any })}
                  >
                    <option>127V</option>
                    <option>220V</option>
                    <option>380V</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Local Quadro</label>
                  <input
                    type="text"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.panelLocation}
                    onChange={(e) => setFormData({ ...formData, panelLocation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Equipamentos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Equipamentos Existentes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Equipamento</label>
                  <input
                    type="text"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.existingEquipmentType || ''}
                    onChange={(e) => setFormData({ ...formData, existingEquipmentType: e.target.value })}
                    placeholder="Ex: Inversor antigo, Transformador..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Conservação</label>
                  <input
                    type="text"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.existingEquipmentCondition}
                    onChange={(e) => setFormData({ ...formData, existingEquipmentCondition: e.target.value })}
                    placeholder="Ex: Bom, Regular, Oxidado..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={formData.structureReusePossible}
                  onChange={(e) => setFormData({ ...formData, structureReusePossible: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-slate-700">Possibilidade de aproveitamento de estruturas existentes</label>
              </div>
            </div>
          </div>
        );
      case 3: // Sombreamento
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">5. Sombreamento</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Obstáculos Identificados</label>
              <textarea
                readOnly={readOnly}
                rows={3}
                className="w-full rounded-xl border-slate-200 bg-slate-50"
                value={formData.shadingIssues}
                onChange={(e) => setFormData({ ...formData, shadingIssues: e.target.value })}
                placeholder="Árvores, prédios vizinhos, chaminés, platibandas..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ângulo Estimado</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.shadingAngle || ''}
                  onChange={(e) => setFormData({ ...formData, shadingAngle: e.target.value })}
                  placeholder="Ex: 15° Oeste"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Período Crítico</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-slate-50"
                  value={formData.shadingPeriod || ''}
                  onChange={(e) => setFormData({ ...formData, shadingPeriod: e.target.value })}
                  placeholder="Ex: Manhã (até as 9h)"
                />
              </div>
            </div>
          </div>
        );
      case 4: // Extras e Doc
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">10. Cliente e 7. Documentação</h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Informações do Cliente</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.clientObjectives || 'Economia'}
                    onChange={(e) => setFormData({ ...formData, clientObjectives: e.target.value })}
                  >
                    <option>Economia Máxima</option>
                    <option>Sustentabilidade</option>
                    <option>Independência Energética</option>
                    <option>Investimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidade Investimento</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 bg-white"
                    value={formData.investmentAvailability || 'Imediata'}
                    onChange={(e) => setFormData({ ...formData, investmentAvailability: e.target.value })}
                  >
                    <option>Imediata</option>
                    <option>Financiamento</option>
                    <option>Curto Prazo</option>
                    <option>Médio Prazo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Checklist de Documentação</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.hasElectricalProject}
                    disabled={readOnly}
                    onChange={(e) => setFormData({ ...formData, hasElectricalProject: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <label className="text-sm text-slate-600">Possui projetos elétricos do imóvel?</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.hasPropertyDeed}
                    disabled={readOnly}
                    onChange={(e) => setFormData({ ...formData, hasPropertyDeed: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <label className="text-sm text-slate-600">Possui escritura/matrícula do imóvel?</label>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observações sobre documentos</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 bg-white"
                  value={formData.documentsNotes || ''}
                  onChange={(e) => setFormData({ ...formData, documentsNotes: e.target.value })}
                  placeholder="Ex: Projeto elétrico desatualizado..."
                />
              </div>
            </div>
          </div>
        );
      case 5: // Fotos
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Registro Fotográfico</h3>
            <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <i className="fas fa-info-circle mr-2"></i>
              É necessário enviar pelo menos 3 fotos (Telhado, Quadro de Energia, Visão Geral).
            </p>

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
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                <p className="text-slate-600 font-medium">Clique para adicionar fotos</p>
                <p className="text-slate-400 text-sm">ou arraste os arquivos aqui</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md backdrop-blur-sm">
                    Foto {index + 1}
                  </span>
                </div>
              ))}
            </div>

            {formData.photos.length < 3 && !readOnly && (
              <p className="text-red-500 text-sm font-bold mt-2 text-center">
                Faltam {3 - formData.photos.length} fotos para concluir.
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[700px]">
      {/* Stepper Header */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              disabled={step.id > activeStep + 1 && !readOnly} // Prevent skipping too far ahead
              className={`flex flex-col items-center min-w-[80px] gap-2 transition-opacity ${activeStep === step.id ? 'opacity-100 font-bold text-amber-400' : 'opacity-50 hover:opacity-80'
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${activeStep === step.id ? 'border-amber-400 bg-slate-800' : 'border-slate-600 bg-slate-800'
                }`}>
                <i className={`fas ${step.icon}`}></i>
              </div>
              <span className="text-xs">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 font-semibold"
        >
          Voltar
        </button>

        {activeStep === steps.length - 1 ? (
          !readOnly ? (
            <button
              onClick={handleSubmit}
              disabled={formData.photos.length < 3}
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i className="fas fa-check-circle"></i>
              Finalizar Vistoria
            </button>
          ) : null
        ) : (
          <button
            type="button"
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
          >
            Próximo
            <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;
