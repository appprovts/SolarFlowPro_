
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { STATUS_COLORS, STATUS_ICONS } from '../constants';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Cliente</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Potência (kWp)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Data Início</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => onSelectProject(project)}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{project.clientName}</p>
                    <p className="text-xs text-slate-500">{project.address}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-700">{project.powerKwp} kWp</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[project.status]}`}>
                    {STATUS_ICONS[project.status]}
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(project.startDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
