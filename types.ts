export enum UserRole {
  INTEGRADOR = 'Integrador',
  ENGENHARIA = 'Engenharia',
  ADMIN = 'Admin'
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
  action?: 'accept_survey' | 'view_details';
  actionData?: any; // To store whatsapp link or project ID details
}

export interface SurveyData {
  // 1. Dados do Local
  address: string;
  coordinates: { lat: number; lng: number } | null;
  // Fotos obrigatórias do local
  photoFacade?: string;
  photoMeter?: string;
  photoBreaker?: string;
  photoEntrance?: string;
  photoInverterLocation?: string;
  // Distâncias
  distMeterInverter?: number;
  distInverterPanels?: number;
  distInverterInternalPanel?: number;

  // 2. Características do Telhado
  roofType: string;
  roofOrientation: string[]; // Alterado para array
  inclination: number;
  roofCondition: string;
  roofLoadCapacity?: string;

  // 3. Consumo de Energia
  averageConsumption: number;
  consumptionHistory?: string;
  contractedDemand: number;
  invoiceFile?: string; // Foto/Arquivo da fatura

  // 4. Conexão Elétrica
  connectionType: 'Monofásico' | 'Bifásico' | 'Trifásico';
  voltage: '127V' | '220V' | '380V';
  breakerCurrent: number;
  panelLocation: string;

  // 5. Sombreamento
  shadingIssues: string; // Mantido como fallback ou geral
  shadingType?: 'Vegetação' | 'Prédio' | 'Outros' | 'Nenhum';
  shadingDescription?: string;
  shadingAngle?: string;
  shadingPeriod?: string;

  // 7. Documentação
  hasElectricalProject: boolean;
  hasPropertyDeed: boolean;
  documentsNotes?: string;

  // 8. Equipamentos Existentes
  existingEquipmentType?: string;
  existingEquipmentCondition: string;
  structureReusePossible: boolean;

  // 10. Informações Cliente
  clientObjectives?: string; // Vistoria Inicial, Instalação, Comissionamento...
  investmentAvailability?: string;
  clientDocPhoto?: string; // CNH ou documento

  // Geral (Fotos extras)
  photos: string[];

  // Campos legados mantidos para compatibilidade
  azimuth?: number; // pode ser removido no futuro
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
