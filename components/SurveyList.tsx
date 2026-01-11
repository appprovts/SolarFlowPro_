
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { STATUS_COLORS, STATUS_ICONS } from '../constants';

interface SurveyListProps {
    projects: Project[];
    onSelectProject: (p: Project) => void;
}

const SurveyList: React.FC<SurveyListProps> = ({ projects, onSelectProject }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
                    onClick={() => onSelectProject(project)}
                >
                    {/* Header Card */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 mb-2">
                                <i className="fas fa-clipboard-list text-xl"></i>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[project.status]}`}>
                                {project.status === ProjectStatus.VISTORIA ? 'Pendente' : 'Concluída'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {project.clientName}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                            <i className="fas fa-map-marker-alt text-slate-400"></i>
                            {project.address}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Potência</p>
                                <p className="text-slate-900 dark:text-white font-bold">{project.powerKwp} kWp</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Data</p>
                                <p className="text-slate-900 dark:text-white font-bold">{new Date(project.startDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <button
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${project.status === ProjectStatus.VISTORIA
                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <i className={`fas ${project.status === ProjectStatus.VISTORIA ? 'fa-play' : 'fa-eye'}`}></i>
                            {project.status === ProjectStatus.VISTORIA ? 'Iniciar Vistoria' : 'Ver Detalhes'}
                        </button>
                    </div>
                </div>
            ))}

            {projects.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                        <i className="fas fa-clipboard-check text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">Nenhuma vistoria pendente</h3>
                    <p className="text-sm">Todos os projetos desta fase foram concluídos.</p>
                </div>
            )}
        </div>
    );
};

export default SurveyList;
