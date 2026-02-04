
import React, { useState } from 'react';
import { Project, ProjectStatus, SurveyData, User, UserRole, Notification } from '../tipos/index';
import { STATUS_COLORS, STATUS_ICONS } from '../constantes/index';
import SurveyForm from '../paginas/FormularioVistoria';
import { analyzeSurvey, generateTechnicalMemorial } from '../servicos/geminiServico';

interface ProjectDetailsProps {
  project: Project;
  currentUser: User;
  onUpdate: (updated: Project) => void;
  onClose: () => void;
  onNotify: (n: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'userId'> & { userId?: string }) => void;
  onSelectProject?: (p: Project | null) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, currentUser, onUpdate, onClose, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'vistoria' | 'documentos'>('info');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memorial, setMemorial] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);

  // Lista de membros para atribuição
  const MOCK_INTEGRATORS = [
    'João Gabriel',
    'João Técnico',
    'Maria Solar',
    'Carlos Instalações',
    'Pedro Campo',
    currentUser.role === UserRole.INTEGRADOR ? currentUser.name : null,
    project.assignedIntegrator
  ].filter((name, index, self) => name && self.indexOf(name) === index) as string[];

  const MOCK_ENGINEERS = ['Altamirandus', 'Maria Engenheira', 'Carlos Admin'];

  const handleSaveChanges = () => {
    onUpdate(editedProject);
    setEditMode(false);

    // Check if integrator was assigned or changed
    if (editedProject.assignedIntegrator && editedProject.assignedIntegrator !== project.assignedIntegrator) {
      onNotify({
        title: 'Nova Vistoria Agendada',
        message: `Você foi designado para realizar a vistoria técnica do projeto ${editedProject.clientName}.`,
        type: 'info',
        projectId: project.id,
        action: 'accept_survey',
        actionData: {
          // Link do WhatsApp com mensagem pré-formatada para confirmar agendamento
          whatsappLink: `https://wa.me/5511999999999?text=Ol%C3%A1%2C%20confirmo%20o%20agendamento%20da%20vistoria%20para%20o%20clieente%20${encodeURIComponent(editedProject.clientName)}.`
        }
      });
    } else {
      onNotify({
        title: 'Projeto Atualizado',
        message: 'As informações do projeto foram atualizadas.',
        type: 'success',
        projectId: project.id
      });
    }
  };

  const isIntegrador = currentUser.role === UserRole.INTEGRADOR;
  const isEngenharia = currentUser.role === UserRole.ENGENHARIA;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isManagement = isEngenharia || isAdmin;

  const canEditSurvey = isIntegrador && project.status === ProjectStatus.VISTORIA;
  const canPerformAnalysis = isManagement && project.status === ProjectStatus.AGUARDANDO_ANALISE;
  const canManageFlow = isManagement;

  const handleSaveSurvey = async (data: SurveyData) => {
    setLoading(true);
    const updatedProject = {
      ...project,
      surveyData: data,
      status: ProjectStatus.AGUARDANDO_ANALISE
    };
    onUpdate(updatedProject);
    setLoading(false);

    onNotify({
      title: 'Vistoria Enviada',
      message: `O integrador enviou os dados de campo para o projeto: ${project.clientName}.`,
      type: 'success',
      projectId: project.id
    });

    alert("Vistoria enviada para análise da engenharia!");
  };

  const handlePerformAnalysis = async () => {
    if (!project.surveyData) return;
    setLoading(true);
    try {
      const result = await analyzeSurvey(project.surveyData, project);
      setAnalysis(result);
      onUpdate({ ...project, status: ProjectStatus.ANALISE });

      onNotify({
        title: 'Análise de IA Concluída',
        message: `O parecer técnico automatizado foi gerado para ${project.clientName}.`,
        type: 'info',
        projectId: project.id
      });
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

    onNotify({
      title: 'Documento Gerado',
      message: `Memorial descritivo gerado com sucesso para ${project.clientName}.`,
      type: 'success',
      projectId: project.id
    });
  };

  const advanceStatus = () => {
    const statuses = Object.values(ProjectStatus);
    const currentIndex = statuses.indexOf(project.status);
    if (currentIndex < statuses.length - 1) {
      const newStatus = statuses[currentIndex + 1];
      onUpdate({ ...project, status: newStatus });

      onNotify({
        title: 'Status Atualizado',
        message: `O projeto ${project.clientName} avançou para a fase: ${newStatus}.`,
        type: 'info',
        projectId: project.id
      });
    }
  };

  const retractStatus = () => {
    const statuses = Object.values(ProjectStatus);
    const currentIndex = statuses.indexOf(project.status);
    if (currentIndex > 0) {
      const newStatus = statuses[currentIndex - 1];
      onUpdate({ ...project, status: newStatus });

      onNotify({
        title: 'Fluxo Retraído',
        message: `O projeto ${project.clientName} retornou para a fase: ${newStatus}.`,
        type: 'warning',
        projectId: project.id
      });
    }
  };

  const resetToSurvey = () => {
    if (confirm("Tem certeza que deseja reiniciar o fluxo? Isso retornará o projeto para a fase de Vistoria.")) {
      onUpdate({
        ...project,
        status: ProjectStatus.VISTORIA,
        surveyData: undefined // Optional: decide if we want to clear survey data
      });

      onNotify({
        title: 'Fluxo Reiniciado',
        message: `O fluxo do projeto ${project.clientName} foi reiniciado pela gestão.`,
        type: 'warning',
        projectId: project.id
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full md:h-[90vh] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-4 md:px-8 py-4 md:py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">{project.clientName}</h2>
              <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold border ${STATUS_COLORS[project.status]}`}>
                {STATUS_ICONS[project.status]} {project.status}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">{project.address}</p>
          </div>
          <button onClick={onClose} className="min-w-[40px] h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-900 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Geral" />
          <TabButton active={activeTab === 'vistoria'} onClick={() => setActiveTab('vistoria')} label="Vistoria" />
          {isManagement && <TabButton active={activeTab === 'documentos'} onClick={() => setActiveTab('documentos')} label="Docs" />}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold dark:text-white">Informações do Projeto e Cliente</h3>
                    {isManagement && (
                      <button onClick={() => setEditMode(!editMode)} className="text-sm text-blue-600 font-bold hover:underline">
                        <i className={`fas ${editMode ? 'fa-times' : 'fa-edit'} mr-1`}></i>
                        {editMode ? 'Cancelar Edição' : 'Editar Dados'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Cliente</label>
                      {editMode ? (
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                          value={editedProject.clientName}
                          onChange={e => setEditedProject({ ...editedProject, clientName: e.target.value })}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-semibold">{project.clientName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Endereço</label>
                      {editMode ? (
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                          value={editedProject.address}
                          onChange={e => setEditedProject({ ...editedProject, address: e.target.value })}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-semibold">{project.address}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Integrador Responsável</label>
                      {editMode ? (
                        <select
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                          value={editedProject.assignedIntegrator || ''}
                          onChange={e => setEditedProject({ ...editedProject, assignedIntegrator: e.target.value })}
                        >
                          <option value="">Selecione um integrador...</option>
                          {MOCK_INTEGRATORS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-semibold">{project.assignedIntegrator || 'Não atribuído'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border inline-block ${STATUS_COLORS[project.status]}`}>
                        {STATUS_ICONS[project.status]} {project.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Potência (kWp)</label>
                      {editMode ? (
                        <input
                          type="number"
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                          value={editedProject.powerKwp}
                          onChange={e => setEditedProject({ ...editedProject, powerKwp: Number(e.target.value) })}
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-semibold">{project.powerKwp} kWp</p>
                      )}
                    </div>
                  </div>

                  {editMode && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSaveChanges}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition shadow-lg"
                      >
                        <i className="fas fa-save mr-2"></i>Salvar Alterações
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Notas do Projeto</h3>
                  {editMode ? (
                    <textarea
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                      rows={3}
                      value={editedProject.notes}
                      onChange={e => setEditedProject({ ...editedProject, notes: e.target.value })}
                    />
                  ) : (
                    <p className="text-slate-800 dark:text-slate-300 italic whitespace-pre-wrap">{project.notes || 'Nenhuma observação adicionada.'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {canManageFlow && (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-tasks text-amber-400"></i>
                      Gestão de Fluxo
                    </h3>
                    <p className="text-slate-400 text-xs mb-4">Controle manual do progresso do projeto.</p>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={advanceStatus}
                        disabled={project.status === ProjectStatus.CONCLUIDO || project.status === ProjectStatus.AGUARDANDO_ANALISE}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i className="fas fa-arrow-right"></i>
                        Avançar Fluxo
                      </button>

                      <button
                        onClick={retractStatus}
                        disabled={project.status === ProjectStatus.VISTORIA}
                        className="w-full bg-slate-800 text-slate-300 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i className="fas fa-arrow-left"></i>
                        Retrair Fase
                      </button>

                      <button
                        onClick={resetToSurvey}
                        className="w-full border-2 border-red-500/30 text-red-400 py-2.5 rounded-xl font-bold hover:bg-red-500/10 transition flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-undo"></i>
                        Reiniciar Tudo
                      </button>
                    </div>
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
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold dark:text-white">Arquivos Gerados</h3>
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
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 font-serif whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                    {memorial}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
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
    className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
