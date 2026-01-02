
import React from 'react';
import { ProjectStatus } from './types';

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.VISTORIA]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ProjectStatus.AGUARDANDO_ANALISE]: 'bg-rose-100 text-rose-700 border-rose-200',
  [ProjectStatus.ANALISE]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ProjectStatus.SUBMISSAO]: 'bg-purple-100 text-purple-700 border-purple-200',
  [ProjectStatus.INSTALACAO]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [ProjectStatus.COMISSIONAMENTO]: 'bg-orange-100 text-orange-700 border-orange-200',
  [ProjectStatus.CONCLUIDO]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const STATUS_ICONS: Record<ProjectStatus, React.ReactNode> = {
  [ProjectStatus.VISTORIA]: <i className="fas fa-clipboard-check"></i>,
  [ProjectStatus.AGUARDANDO_ANALISE]: <i className="fas fa-clock"></i>,
  [ProjectStatus.ANALISE]: <i className="fas fa-chart-line"></i>,
  [ProjectStatus.SUBMISSAO]: <i className="fas fa-file-export"></i>,
  [ProjectStatus.INSTALACAO]: <i className="fas fa-tools"></i>,
  [ProjectStatus.COMISSIONAMENTO]: <i className="fas fa-vial"></i>,
  [ProjectStatus.CONCLUIDO]: <i className="fas fa-check-double"></i>,
};
