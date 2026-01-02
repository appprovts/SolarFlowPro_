
export enum UserRole {
  INTEGRADOR = 'Integrador',
  ENGENHARIA = 'Engenharia'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export enum ProjectStatus {
  VISTORIA = 'Vistoria',
  AGUARDANDO_ANALISE = 'Aguardando Análise',
  ANALISE = 'Análise Técnica',
  SUBMISSAO = 'Submissão Concessionária',
  INSTALACAO = 'Instalação',
  COMISSIONAMENTO = 'Comissionamento',
  CONCLUIDO = 'Concluído'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
  isRead: boolean;
  projectId?: string;
}

export interface SurveyData {
  roofType: string;
  azimuth: number;
  inclination: number;
  shadingIssues: string;
  electricalPanelStatus: string;
  transformerDistance: number;
  coordinates: { lat: number; lng: number } | null;
  photos: string[];
}

export interface Project {
  id: string;
  clientName: string;
  address: string;
  status: ProjectStatus;
  powerKwp: number;
  estimatedProduction: number;
  startDate: string;
  surveyData?: SurveyData;
  concessionariaStatus?: 'Pendente' | 'Aprovado' | 'Em Revisão';
  notes: string;
  assignedIntegrator?: string;
}

export interface DashboardStats {
  totalProjects: number;
  activePowerKwp: number;
  pendingSubmissions: number;
  completedThisMonth: number;
}
