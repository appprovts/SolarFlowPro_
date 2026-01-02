
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { STATUS_COLORS, STATUS_ICONS } from '../constants';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (p: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cliente</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Potência (kWp)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Data Início</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr 
                key={project.id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelectProject(project)}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{project.clientName}</p>
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
                <td className="px-6 py-4 text-sm text-slate-600">
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
