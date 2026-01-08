
export enum UserRole {
  INTEGRADOR = 'Integrador',
  ENGENHARIA = 'Engenharia'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
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
  // 1. Dados do Local
  address: string;
  coordinates: { lat: number; lng: number } | null;

  // 2. Características do Telhado
  roofType: string;
  roofOrientation: string;
  inclination: number;
  roofCondition: string;
  roofLoadCapacity?: string; // Capacidade de Carga

  // 3. Consumo de Energia
  averageConsumption: number;
  consumptionHistory?: string; // Histórico descritivo ou dados dos últimos 12 meses
  contractedDemand: number;

  // 4. Conexão Elétrica
  connectionType: 'Monofásico' | 'Bifásico' | 'Trifásico';
  voltage: '127V' | '220V' | '380V';
  breakerCurrent: number;
  panelLocation: string;

  // 5. Sombreamento
  shadingIssues: string;
  shadingAngle?: string; // Angulo de sombreamento
  shadingPeriod?: string;

  // 6. Acesso e Segurança
  accessEase: string;
  safetyConditions: string;

  // 7. Documentação
  hasElectricalProject: boolean;
  hasPropertyDeed: boolean;
  documentsNotes?: string; // Notas sobre documentos

  // 8. Equipamentos Existentes
  existingEquipmentType?: string;
  existingEquipmentCondition: string;
  structureReusePossible: boolean;

  // 9. Dados Meteorológicos
  averageIrradiation?: number;

  // 10. Informações Cliente
  clientObjectives?: string;
  investmentAvailability?: string;

  // Geral
  photos: string[];

  // Campos legados mantidos para compatibilidade
  azimuth?: number;
  electricalPanelStatus?: string;
  transformerDistance?: number;
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
