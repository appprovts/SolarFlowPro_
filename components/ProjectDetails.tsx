
import React, { useState } from 'react';
import { Project, ProjectStatus, SurveyData, User, UserRole } from '../types';
import { STATUS_COLORS, STATUS_ICONS } from '../constants';
import SurveyForm from './SurveyForm';
import { analyzeSurvey, generateTechnicalMemorial } from '../services/geminiService';

interface ProjectDetailsProps {
  project: Project;
  currentUser: User;
  onUpdate: (updated: Project) => void;
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, currentUser, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'vistoria' | 'documentos'>('info');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memorial, setMemorial] = useState<string | null>(null);

  const isIntegrador = currentUser.role === UserRole.INTEGRADOR;
  const isEngenharia = currentUser.role === UserRole.ENGENHARIA;

  // Integrador can only edit survey if status is Vistoria
  const canEditSurvey = isIntegrador && project.status === ProjectStatus.VISTORIA;
  // Engineering can see everything and edit everything
  const canPerformAnalysis = isEngenharia && project.status === ProjectStatus.AGUARDANDO_ANALISE;
  const canAdvanceStatus = isEngenharia && project.status !== ProjectStatus.AGUARDANDO_ANALISE && project.status !== ProjectStatus.CONCLUIDO;

  const handleSaveSurvey = async (data: SurveyData) => {
    setLoading(true);
    const updatedProject = { 
      ...project, 
      surveyData: data, 
      status: ProjectStatus.AGUARDANDO_ANALISE 
    };
    onUpdate(updatedProject);
    setLoading(false);
    alert("Vistoria enviada para análise da engenharia!");
  };

  const handlePerformAnalysis = async () => {
    if (!project.surveyData) return;
    setLoading(true);
    try {
      const result = await analyzeSurvey(project.surveyData, project);
      setAnalysis(result);
      onUpdate({ ...project, status: ProjectStatus.ANALISE });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMemorial = async () => {
    setLoading(true);
    const text = await generateTechnicalMemorial(project);
    setMemorial(text);
    setLoading(false);
  };

  const advanceStatus = () => {
    const statuses = Object.values(ProjectStatus);
    const currentIndex = statuses.indexOf(project.status);
    if (currentIndex < statuses.length - 1) {
      onUpdate({ ...project, status: statuses[currentIndex + 1] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-slate-50 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{project.clientName}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[project.status]}`}>
                {STATUS_ICONS[project.status]} {project.status}
              </span>
            </div>
            <p className="text-slate-500 mt-1">{project.address}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white px-8 border-b border-slate-200">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Visão Geral" />
          <TabButton active={activeTab === 'vistoria'} onClick={() => setActiveTab('vistoria')} label="Vistoria Técnica" />
          {isEngenharia && <TabButton active={activeTab === 'documentos'} onClick={() => setActiveTab('documentos')} label="Documentação" />}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-4">Informações do Sistema</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Potência Instalada" value={`${project.powerKwp} kWp`} />
                    <InfoItem label="Geração Estimada" value={`${project.estimatedProduction} kWh/mês`} />
                    <InfoItem label="Data de Início" value={new Date(project.startDate).toLocaleDateString()} />
                    <InfoItem label="Concessionária" value="CPFL Paulista" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-4">Notas do Projeto</h3>
                  <p className="text-slate-600 italic whitespace-pre-wrap">{project.notes || 'Nenhuma observação adicionada.'}</p>
                </div>
              </div>

              <div className="space-y-6">
                {canAdvanceStatus && (
                  <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Ações de Engenharia</h3>
                    <p className="text-blue-100 text-sm mb-6">Mova o projeto para a próxima fase do fluxo de trabalho.</p>
                    <button 
                      onClick={advanceStatus}
                      className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
                    >
                      Avançar Fluxo
                    </button>
                  </div>
                )}

                {canPerformAnalysis && (
                  <div className="bg-amber-400 text-slate-900 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Análise de Campo Pendente</h3>
                    <p className="text-amber-900 text-sm mb-6">O integrador finalizou a vistoria. Utilize a IA para gerar o parecer técnico.</p>
                    <button 
                      onClick={handlePerformAnalysis}
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                    >
                      {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>}
                      Gerar Análise IA
                    </button>
                  </div>
                )}

                {analysis && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                    <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-robot"></i>
                      Insight do Gemini AI
                    </h3>
                    <div className="text-amber-900 text-sm leading-relaxed prose prose-sm max-h-48 overflow-y-auto">
                      {analysis}
                    </div>
                  </div>
                )}

                {isIntegrador && project.status === ProjectStatus.VISTORIA && (
                  <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Coleta de Dados</h3>
                    <p className="text-emerald-100 text-sm">Vá para a aba de Vistoria para preencher os dados técnicos e enviar para a engenharia.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vistoria' && (
            <div className="space-y-6">
              {!canEditSurvey && !project.surveyData && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-700">
                  Aguardando preenchimento da vistoria pelo integrador em campo.
                </div>
              )}
              {(canEditSurvey || project.surveyData) ? (
                <SurveyForm 
                  project={project} 
                  onSave={handleSaveSurvey} 
                  readOnly={!canEditSurvey}
                />
              ) : null}
            </div>
          )}

          {activeTab === 'documentos' && isEngenharia && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Arquivos Gerados</h3>
                  <button 
                    onClick={handleGenerateMemorial}
                    disabled={loading || project.status === ProjectStatus.VISTORIA}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    <i className="fas fa-magic"></i>
                    {loading ? 'Gerando...' : 'Gerar Memorial Descritivo'}
                  </button>
                </div>
                
                {memorial ? (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 font-serif whitespace-pre-wrap text-slate-800">
                    {memorial}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    <i className="far fa-file-alt text-4xl mb-3"></i>
                    <p>Nenhum documento gerado para este projeto ainda.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentCard title="ART de Projeto" status="Pendente" icon="fa-stamp" />
                <DocumentCard title="Diagrama Unifilar" status="Pendente" icon="fa-project-diagram" />
                <DocumentCard title="Formulário Concessionária" status="Pendente" icon="fa-edit" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
      active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-slate-900 font-semibold">{value}</p>
  </div>
);

const DocumentCard = ({ title, status, icon }: { title: string; status: string; icon: string }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:border-blue-300 transition cursor-pointer">
    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{status}</p>
    </div>
    <i className="fas fa-chevron-right text-slate-300 text-sm"></i>
  </div>
);

export default ProjectDetails;
