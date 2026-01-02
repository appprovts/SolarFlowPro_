
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface KanbanBoardProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

const KANBAN_COLUMNS = [
  ProjectStatus.ANALISE,
  ProjectStatus.SUBMISSAO,
  ProjectStatus.INSTALACAO,
  ProjectStatus.COMISSIONAMENTO,
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full min-h-[600px]">
      {KANBAN_COLUMNS.map((status) => {
        const columnProjects = projects.filter((p) => p.status === status);
        
        return (
          <div key={status} className="flex flex-col bg-slate-100/50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{status}</h3>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {columnProjects.length}
              </span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnProjects.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                  <p className="text-xs text-slate-400">Nenhum projeto</p>
                </div>
              ) : (
                columnProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.clientName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{project.address}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <i className="fas fa-bolt text-amber-500"></i>
                        {project.powerKwp} kWp
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {new Date(project.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
