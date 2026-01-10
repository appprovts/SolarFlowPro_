
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, User, UserRole, Notification } from './types';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Login from './components/Login';
import NotificationPanel from './components/NotificationPanel';
import KanbanBoard from './components/KanbanBoard';
import EquipmentList from './components/EquipmentList';
import SurveyList from './components/SurveyList';
import Settings from './components/Settings';
import { getCurrentUser, signOut } from './services/authService';

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
  }
];

type AppView = 'dashboard' | 'projects' | 'vistorias' | 'engenharia' | 'equipments' | 'settings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-amber-400">
        <i className="fas fa-circle-notch fa-spin text-4xl"></i>
      </div>
    );
  }

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

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleMenuClick = (targetView: AppView) => {
    setView(targetView);
    setIsSidebarOpen(false);
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
      case 'equipments': return 'Catálogo de Equipamentos';
      case 'settings': return 'Configurações da Conta';
      default: return 'SolarFlow Pro';
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} relative transition-colors duration-300`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed h-full z-30 shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20">
                <i className="fas fa-sun text-xl"></i>
              </div>
              <span className="text-xl font-bold tracking-tight">SolarFlow<span className="text-amber-400">Pro</span></span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Principal</p>
          <nav className="space-y-1">
            {isEngenhariaRole && (
              <SidebarLink
                active={view === 'dashboard'}
                onClick={() => handleMenuClick('dashboard')}
                icon="fa-columns"
                label="Dashboard"
              />
            )}
            <SidebarLink
              active={view === 'projects'}
              onClick={() => handleMenuClick('projects')}
              icon="fa-layer-group"
              label="Todos Projetos"
            />
            <div className="pt-4 mb-2 border-t border-slate-800"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Operacional</p>
            <SidebarLink
              active={view === 'vistorias'}
              onClick={() => handleMenuClick('vistorias')}
              icon="fa-hard-hat"
              label="Vistorias"
              badge={projects.filter(p => p.status === ProjectStatus.VISTORIA).length}
            />
            <SidebarLink
              active={view === 'engenharia'}
              onClick={() => handleMenuClick('engenharia')}
              icon="fa-pencil-ruler"
              label="Engenharia"
              badge={projects.filter(p => p.status === ProjectStatus.ANALISE || p.status === ProjectStatus.AGUARDANDO_ANALISE).length}
            />

            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-4 px-4">Recursos</p>
            <SidebarLink
              active={view === 'equipments'}
              onClick={() => handleMenuClick('equipments')}
              icon="fa-tools"
              label="Equipamentos"
            />
            <SidebarLink
              active={view === 'settings'}
              onClick={() => handleMenuClick('settings')}
              icon="fa-cog"
              label="Configurações"
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={currentUser.avatar} className="w-10 h-10 rounded-full ring-2 ring-slate-700" alt="Avatar" />
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate max-w-[100px]">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition p-2">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full md:ml-64 p-4 md:p-8 transition-all duration-300">
        <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mt-1 md:hidden w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {getViewTitle()}
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                Olá, {currentUser.name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 relative self-end md:self-auto">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition relative shadow-sm"
            >
              <i className="fas fa-bell text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 z-50 w-full md:w-auto">
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkAsRead={handleMarkAsRead}
                  onClearAll={handleClearAll}
                  onAction={(n) => {
                    if (n.action === 'accept_survey') {
                      alert('Vistoria aceita com sucesso!');
                      handleMarkAsRead(n.id);
                    }
                  }}
                />
              </div>
            )}

            {isEngenhariaRole && view !== 'equipments' && (
              <button
                onClick={addNewProject}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-amber-400/20 transition flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
              >
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">Novo Projeto</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}
          </div>
        </header>

        <div className="animate-in fade-in duration-500 overflow-x-hidden">
          {view === 'equipments' ? (
            <EquipmentList />
          ) : (view === 'dashboard' && isEngenhariaRole) ? (
            <Dashboard projects={projects} />
          ) : view === 'engenharia' ? (
            <KanbanBoard projects={projects} onSelectProject={setSelectedProject} />
          ) : view === 'vistorias' ? (
            <SurveyList
              projects={getFilteredProjects()}
              onSelectProject={setSelectedProject}
            />
          ) : view === 'settings' ? (
            <Settings
              currentUser={currentUser}
              onUpdateUser={setCurrentUser}
              darkMode={darkMode}
              onToggleDarkMode={setDarkMode}
            />
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
    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-amber-400 text-slate-900 font-bold shadow-md shadow-amber-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
