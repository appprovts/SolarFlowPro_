
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
    // Fotos específicas
    photoFacade: '',
    photoMeter: '',
    photoBreaker: '',
    photoEntrance: '',
    photoInverterLocation: '',
    // Distâncias
    distMeterInverter: 0,
    distInverterPanels: 0,
    distInverterInternalPanel: 0,

    // 2. Telhado
    roofType: 'Cerâmica',
    roofOrientation: [], // Multi select
    inclination: 15,
    roofCondition: 'Bom',
    roofLoadCapacity: 'Normal',

    // 3. Consumo
    averageConsumption: 0,
    consumptionHistory: '',
    contractedDemand: 0,
    invoiceFile: '',

    // 4. Elétrica
    connectionType: 'Bifásico',
    voltage: '220V',
    breakerCurrent: 63,
    panelLocation: 'Interno',

    // 5. Sombreamento
    shadingIssues: '',
    shadingType: 'Nenhum',
    shadingDescription: '',
    shadingAngle: '',
    shadingPeriod: '',

    // 7. Docs
    hasElectricalProject: false,
    hasPropertyDeed: true,
    documentsNotes: '',

    // 8. Equipamentos
    existingEquipmentType: '',
    existingEquipmentCondition: 'Normal',
    structureReusePossible: false,

    // 10. Cliente
    clientObjectives: 'Vistoria Inicial',
    investmentAvailability: 'Imediata',
    clientDocPhoto: '',

    photos: []
  });

  // Sincronizar dados quando o projeto ou surveyData mudar (importante para Engenharia ver dados recém-chegados)
  React.useEffect(() => {
    if (project.surveyData) {
      setFormData(project.surveyData);
    }
  }, [project.surveyData, project.id]);

  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 0, title: 'Local', icon: 'fa-map-marked-alt' },
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

  const handleSingleFile = (field: keyof SurveyData, file: File) => {
    if (readOnly) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({ ...prev, [field]: e.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    if (readOnly) return;
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Dados do Local
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Dados do Local</h3>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Localização</h4>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Endereço Completo</label>
                <input
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400">Coordenadas Geográficas</label>
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
                    className="w-1/2 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.coordinates?.lat || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: { lat: Number(e.target.value), lng: formData.coordinates?.lng || 0 } })}
                  />
                  <input
                    readOnly={readOnly}
                    placeholder="Longitude"
                    type="number"
                    className="w-1/2 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.coordinates?.lng || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: { lat: formData.coordinates?.lat || 0, lng: Number(e.target.value) } })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Fotos Específicas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Fachada', field: 'photoFacade' },
                  { label: 'Medidor', field: 'photoMeter' },
                  { label: 'Disjuntor do Medidor', field: 'photoBreaker' },
                  { label: 'Padrão de Entrada', field: 'photoEntrance' },
                  { label: 'Local do Inversor', field: 'photoInverterLocation' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">{item.label}</label>
                    <div className="flex items-center gap-2">
                      {formData[item.field as keyof SurveyData] ? (
                        <div className="relative w-full h-20 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                          <img src={formData[item.field as keyof SurveyData] as string} className="w-full h-full object-cover" />
                          {!readOnly && (
                            <button
                              onClick={() => setFormData({ ...formData, [item.field]: '' })}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                            >
                              X
                            </button>
                          )}
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          disabled={readOnly}
                          className="block w-full text-sm text-slate-500 dark:text-slate-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
                              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                          onChange={(e) => e.target.files?.[0] && handleSingleFile(item.field as keyof SurveyData, e.target.files[0])}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Distâncias (Metros)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Medidor até Inversor</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.distMeterInverter || ''}
                    onChange={(e) => setFormData({ ...formData, distMeterInverter: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Inversor até Placas</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.distInverterPanels || ''}
                    onChange={(e) => setFormData({ ...formData, distInverterPanels: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Inversor até Quadro Interno</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.distInverterInternalPanel || ''}
                    onChange={(e) => setFormData({ ...formData, distInverterInternalPanel: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // Telhado
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Características do Telhado</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Tipo de Material</label>
                <select
                  disabled={readOnly}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Estado de Conservação</label>
                <select
                  disabled={readOnly}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Orientação (Multi-seleção)</label>
                <div className="space-y-1 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  {['Norte', 'Nordeste', 'Noroeste', 'Leste', 'Oeste', 'Sul'].map(opt => (
                    <label key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={formData.roofOrientation.includes(opt)}
                        onChange={(e) => {
                          const newOrientation = e.target.checked
                            ? [...formData.roofOrientation, opt]
                            : formData.roofOrientation.filter(o => o !== opt);
                          setFormData({ ...formData, roofOrientation: newOrientation });
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Inclinação Estimada (°)</label>
                <input
                  type="number"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.inclination}
                  onChange={(e) => setFormData({ ...formData, inclination: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Capacidade de Carga</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={formData.roofLoadCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, roofLoadCapacity: e.target.value })}
                  placeholder="Ex: Reforçada, Precisa de análise..."
                />
              </div>
            </div>
          </div>
        );
      case 2: // Elétrica, Consumo e Equipamentos
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Elétrica: Consumo, Conexão e Equipamentos</h3>

            {/* Consumo */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">Consumo de Energia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Consumo Médio (kWh)</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.averageConsumption}
                    onChange={(e) => setFormData({ ...formData, averageConsumption: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Demanda Contratada (kW)</label>
                  <input
                    type="number"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.contractedDemand}
                    onChange={(e) => setFormData({ ...formData, contractedDemand: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Histórico (Últimos 12 meses)</label>
                  <textarea
                    readOnly={readOnly}
                    rows={3}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.consumptionHistory || ''}
                    onChange={(e) => setFormData({ ...formData, consumptionHistory: e.target.value })}
                    placeholder="Insira os dados de consumo mês a mês..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Fatura de Energia</label>
                  <div className="flex items-center gap-2">
                    {formData.invoiceFile ? (
                      <div className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"><i className="fas fa-check-circle mr-1"></i>Fatura anexada</span>
                        {!readOnly && (
                          <button onClick={() => setFormData({ ...formData, invoiceFile: '' })} className="text-red-500 hover:text-red-700">
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        capture="environment"
                        disabled={readOnly}
                        className="block w-full text-sm text-slate-500 dark:text-slate-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-emerald-50 dark:file:bg-emerald-900/30 file:text-emerald-700 dark:file:text-emerald-400
                           hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/50"
                        onChange={(e) => e.target.files?.[0] && handleSingleFile('invoiceFile', e.target.files[0])}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Envie uma foto ou PDF da fatura para extração automática.</p>
                </div>
              </div>
            </div>

            {/* Conexão */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">Conexão Elétrica</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Tipo</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.connectionType}
                    onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
                  >
                    <option>Monofásico</option>
                    <option>Bifásico</option>
                    <option>Trifásico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Tensão</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.voltage}
                    onChange={(e) => setFormData({ ...formData, voltage: e.target.value as any })}
                  >
                    <option>127V</option>
                    <option>220V</option>
                    <option>380V</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Local Quadro</label>
                  <input
                    type="text"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.panelLocation}
                    onChange={(e) => setFormData({ ...formData, panelLocation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Equipamentos */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">Equipamentos Existentes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Tipo de Equipamento</label>
                  <input
                    type="text"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.existingEquipmentType || ''}
                    onChange={(e) => setFormData({ ...formData, existingEquipmentType: e.target.value })}
                    placeholder="Ex: Inversor antigo, Transformador..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Estado de Conservação</label>
                  <input
                    type="text"
                    readOnly={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <label className="text-sm text-slate-700 dark:text-slate-300">Possibilidade de aproveitamento de estruturas existentes</label>
              </div>
            </div>
          </div>
        );
      case 3: // Sombreamento
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Análise de Sombreamento</h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Tipo de Sombreamento</label>
              <select
                disabled={readOnly}
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-3"
                value={formData.shadingType || 'Nenhum'}
                onChange={(e) => setFormData({ ...formData, shadingType: e.target.value as any })}
              >
                <option>Nenhum</option>
                <option>Vegetação</option>
                <option>Prédio</option>
                <option>Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Descrição</label>
              <textarea
                readOnly={readOnly}
                rows={3}
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={formData.shadingDescription || ''}
                onChange={(e) => setFormData({ ...formData, shadingDescription: e.target.value })}
                placeholder="Descreva detalhadamente o sombreamento..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Obstáculos Identificados (Fallback)</label>
              <input
                readOnly={readOnly}
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={formData.shadingIssues}
                onChange={(e) => setFormData({ ...formData, shadingIssues: e.target.value })}
                placeholder="Árvores, prédios vizinhos, chaminés, platibandas..."
              />
            </div>
          </div>
        );
      case 4: // Extras e Doc
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Cliente e Documentação</h3>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">Informações do Cliente</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Objetivo</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={formData.clientObjectives || 'Vistoria Inicial'}
                    onChange={(e) => setFormData({ ...formData, clientObjectives: e.target.value })}
                  >
                    <option>Vistoria Inicial</option>
                    <option>Instalação</option>
                    <option>Comissionamento</option>
                    <option>Economia Máxima</option>
                    <option>Sustentabilidade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Disponibilidade Investimento</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Foto Documento (CNH/Profissional)</label>
                <div className="flex items-center gap-2">
                  {formData.clientDocPhoto ? (
                    <div className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium"><i className="fas fa-id-card mr-1"></i>Documento anexado</span>
                      {!readOnly && (
                        <button onClick={() => setFormData({ ...formData, clientDocPhoto: '' })} className="text-red-500 hover:text-red-700">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      disabled={readOnly}
                      className="block w-full text-sm text-slate-500 dark:text-slate-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400
                           hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                      onChange={(e) => e.target.files?.[0] && handleSingleFile('clientDocPhoto', e.target.files[0])}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">Checklist de Documentação</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.hasElectricalProject}
                    disabled={readOnly}
                    onChange={(e) => setFormData({ ...formData, hasElectricalProject: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-300">Possui projetos elétricos do imóvel?</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.hasPropertyDeed}
                    disabled={readOnly}
                    onChange={(e) => setFormData({ ...formData, hasPropertyDeed: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-300">Possui escritura/matrícula do imóvel?</label>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1">Observações sobre documentos</label>
                <input
                  type="text"
                  readOnly={readOnly}
                  className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Registro Fotográfico</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <i className="fas fa-info-circle mr-2"></i>
              É necessário enviar pelo menos 3 fotos (Telhado, Quadro de Energia, Visão Geral).
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
            />

            {!readOnly && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 dark:text-slate-500 mb-3"></i>
                <p className="text-slate-700 dark:text-slate-300 font-medium">Clique para adicionar fotos</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm">ou arraste os arquivos aqui</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
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
              <p className="text-red-500 dark:text-red-400 text-sm font-bold mt-2 text-center">
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full md:h-[700px] border dark:border-slate-800">
      {/* Stepper Header */}
      <div className="bg-slate-900 text-white p-2 md:p-4">
        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-none gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              disabled={step.id > activeStep + 1 && !readOnly} // Prevent skipping too far ahead
              className={`flex flex-col items-center min-w-[70px] md:min-w-[80px] gap-1 md:gap-2 transition-opacity ${activeStep === step.id ? 'opacity-100 font-bold text-amber-400' : 'opacity-50 hover:opacity-80'
                }`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 ${activeStep === step.id ? 'border-amber-400 bg-slate-800' : 'border-slate-600 bg-slate-800'
                }`}>
                <i className={`fas ${step.icon} text-xs md:text-base`}></i>
              </div>
              <span className="text-[10px] md:text-xs text-center">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center mt-auto">
        <button
          type="button"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="px-4 md:px-6 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 font-semibold text-sm md:text-base"
        >
          Voltar
        </button>

        {activeStep === steps.length - 1 ? (
          !readOnly ? (
            <button
              onClick={handleSubmit}
              disabled={formData.photos.length < 3}
              className="bg-emerald-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
            >
              <i className="fas fa-check-circle"></i>
              Finalizar
            </button>
          ) : null
        ) : (
          <button
            type="button"
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            className="bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-900 px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-amber-500 transition shadow-lg flex items-center gap-2 text-sm md:text-base"
          >
            Próximo
            <i className="fas fa-arrow-right text-xs md:text-sm"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyForm;
