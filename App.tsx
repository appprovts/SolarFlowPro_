
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, User, UserRole, Notification } from './types';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Login from './components/Login';
import NotificationPanel from './components/NotificationPanel';
import KanbanBoard from './components/KanbanBoard';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    clientName: 'João Silva',
    address: 'Rua das Flores, 123 - Campinas, SP',
    status: ProjectStatus.VISTORIA,
    powerKwp: 4.5,
    estimatedProduction: 550,
    startDate: '2023-10-15',
    notes: 'Cliente quer o inversor na garagem.'
  },
  {
    id: '2',
    clientName: 'Fazenda Santa Maria',
    address: 'Estrada Rural KM 12 - Piracicaba, SP',
    status: ProjectStatus.AGUARDANDO_ANALISE,
    powerKwp: 75.0,
    estimatedProduction: 9200,
    startDate: '2023-09-20',
    notes: 'Vistoria realizada ontem por campo.'
  },
  {
    id: '3',
    clientName: 'Padaria do Sol',
    address: 'Av. Brasil, 500 - Americana, SP',
    status: ProjectStatus.INSTALACAO,
    powerKwp: 12.0,
    estimatedProduction: 1450,
    startDate: '2023-10-01',
    notes: 'Requer reforço estrutural no telhado.'
  },
  {
    id: '4',
    clientName: 'Condomínio Alpha',
    address: 'Al. Rio Negro, 200 - Barueri, SP',
    status: ProjectStatus.ANALISE,
    powerKwp: 150.0,
    estimatedProduction: 18500,
    startDate: '2023-11-05',
    notes: 'Análise de viabilidade técnica em andamento.'
  },
  {
    id: '5',
    clientName: 'Mercado Central',
    address: 'Praça da Matriz, 10 - Limeira, SP',
    status: ProjectStatus.SUBMISSAO,
    powerKwp: 22.5,
    estimatedProduction: 2800,
    startDate: '2023-11-10',
    notes: 'Aguardando aprovação da CPFL.'
  }
];

type AppView = 'dashboard' | 'projects' | 'vistorias' | 'engenharia';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const isEngenhariaRole = currentUser.role === UserRole.ENGENHARIA;

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAll = () => setNotifications([]);

  const addNewProject = () => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: 'Novo Cliente Solar',
      address: 'Endereço a definir',
      status: ProjectStatus.VISTORIA,
      powerKwp: 0,
      estimatedProduction: 0,
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    
    addNotification({
      title: 'Novo Projeto Criado',
      message: `O projeto para "Novo Cliente Solar" foi iniciado com sucesso.`,
      type: 'info'
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getFilteredProjects = () => {
    switch (view) {
      case 'vistorias':
        return projects.filter(p => p.status === ProjectStatus.VISTORIA || p.status === ProjectStatus.AGUARDANDO_ANALISE);
      case 'engenharia':
        return projects.filter(p => [
          ProjectStatus.ANALISE, 
          ProjectStatus.SUBMISSAO, 
          ProjectStatus.INSTALACAO, 
          ProjectStatus.COMISSIONAMENTO
        ].includes(p.status));
      default:
        return projects;
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'dashboard': return 'Dashboard Analítico';
      case 'projects': return 'Base de Projetos';
      case 'vistorias': return 'Gestão de Vistorias e Campo';
      case 'engenharia': return 'Pipeline de Engenharia e Obras';
      default: return 'SolarFlow Pro';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20">
              <i className="fas fa-sun text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight">SolarFlow<span className="text-amber-400">Pro</span></span>
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Principal</p>
          <nav className="space-y-1">
            {isEngenhariaRole && (
              <SidebarLink 
                active={view === 'dashboard'} 
                onClick={() => setView('dashboard')} 
                icon="fa-columns" 
                label="Dashboard" 
              />
            )}
            <SidebarLink 
              active={view === 'projects'} 
              onClick={() => setView('projects')} 
              icon="fa-layer-group" 
              label="Todos Projetos" 
            />
            <div className="pt-4 mb-2 border-t border-slate-800"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Operacional</p>
            <SidebarLink 
              active={view === 'vistorias'} 
              onClick={() => setView('vistorias')} 
              icon="fa-hard-hat" 
              label="Vistorias" 
              badge={projects.filter(p => p.status === ProjectStatus.VISTORIA).length}
            />
            <SidebarLink 
              active={view === 'engenharia'} 
              onClick={() => setView('engenharia')} 
              icon="fa-pencil-ruler" 
              label="Engenharia" 
              badge={projects.filter(p => p.status === ProjectStatus.ANALISE || p.status === ProjectStatus.AGUARDANDO_ANALISE).length}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={currentUser.avatar} className="w-10 h-10 rounded-full ring-2 ring-slate-700" alt="Avatar" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition p-2">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {getViewTitle()}
            </h1>
            <p className="text-slate-500 mt-1">
              Olá, {currentUser.name}. Gerencie os fluxos de trabalho do sistema.
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition relative shadow-sm"
            >
              <i className="fas fa-bell text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <NotificationPanel 
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAll}
              />
            )}

            {isEngenhariaRole && (
              <button 
                onClick={addNewProject}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-400/20 transition flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Novo Projeto
              </button>
            )}
          </div>
        </header>

        <div className="animate-in fade-in duration-500">
          {(view === 'dashboard' && isEngenhariaRole) ? (
            <Dashboard projects={projects} />
          ) : view === 'engenharia' ? (
            <KanbanBoard projects={projects} onSelectProject={setSelectedProject} />
          ) : (
            <ProjectList 
              projects={getFilteredProjects()} 
              onSelectProject={setSelectedProject} 
            />
          )}
        </div>

        {selectedProject && (
          <ProjectDetails 
            project={selectedProject} 
            currentUser={currentUser}
            onUpdate={handleUpdateProject} 
            onClose={() => setSelectedProject(null)}
            onNotify={addNotification}
          />
        )}
      </main>
    </div>
  );
};

const SidebarLink = ({ active, onClick, icon, label, badge }: { active?: boolean; onClick?: () => void; icon: string; label: string; badge?: number }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-amber-400 text-slate-900 font-bold shadow-md shadow-amber-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span className="text-sm">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
        {badge}
      </span>
    )}
  </button>
);

export default App;
