
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
import { getCurrentUser, signOut, shouldAutoLogout } from './services/authService';
import { supabase } from './services/supabaseClient';
import { getProjects, createProject, updateProject } from './services/projectService';
import { getNotifications, createNotification, markAsRead as dbMarkAsRead, clearAllNotifications as dbClearAll } from './services/notificationService';

// Initial data will be fetched from Supabase

type AppView = 'dashboard' | 'projects' | 'vistorias' | 'engenharia' | 'equipments' | 'settings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectsRef = React.useRef<Project[]>([]);
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

  // Efeito 1: Verificação Inicial e Listener de Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Erro ao verificar autenticação inicial:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Efeito 2: Carregamento de Dados e Polling (Depende apenas do currentUser)
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setNotifications([]);
      return;
    }

    const loadInitialData = async () => {
      try {
        const [dbProjects, dbNotifications] = await Promise.all([
          getProjects(),
          getNotifications(currentUser.id)
        ]);
        setProjects(dbProjects);
        projectsRef.current = dbProjects;
        setNotifications(dbNotifications);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      }
    };

    loadInitialData();

    // Polling para atualizações e notificações
    const interval = setInterval(async () => {
      // Verificar expiração de sessão (60 minutos)
      const isExpired = await shouldAutoLogout(60);
      if (isExpired) {
        console.warn('⚠️ Sessão expirada (>1h). Realizando logout forçado.');
        alert('Sua sessão excedeu o limite de 1 hora. Para evitar erros de sistema, você será desconectado.');
        await handleLogout();
        return;
      }

      try {
        const [dbProjects, dbNotifications] = await Promise.all([
          getProjects(),
          getNotifications(currentUser.id)
        ]);

        projectsRef.current = dbProjects;
        setProjects(dbProjects);
        setNotifications(dbNotifications);

        // Atualizar o projeto selecionado se ele estiver aberto
        setSelectedProject((current) => {
          if (!current) return null;
          const updated = dbProjects.find(p => p.id === current.id);
          return updated || current;
        });
      } catch (err) {
        console.error('Erro no polling:', err);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [currentUser?.id]); // Usamos id para evitar triggers desnecessários se o objeto mudar mas o ID for o mesmo


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

  const isEngenhariaRole = currentUser.role === UserRole.ENGENHARIA || currentUser.role === UserRole.ADMIN;

  const handleUpdateProject = async (updated: Project) => {
    const result = await updateProject(updated.id, updated);
    if (result) {
      setProjects(prev => prev.map(p => p.id === result.id ? result : p));
      setSelectedProject(result);
    }
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'userId'> & { userId?: string }) => {
    if (!currentUser) return;

    const targetUserId = n.userId || currentUser.id;
    const created = await createNotification({
      ...n,
      userId: targetUserId
    });

    if (created && targetUserId === currentUser.id) {
      setNotifications(prev => [created, ...prev]);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const success = await dbMarkAsRead(id);
    if (success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleClearAll = async () => {
    if (!currentUser) return;
    const success = await dbClearAll(currentUser.id);
    if (success) {
      setNotifications([]);
    }
  };

  const addNewProject = async () => {
    try {
      const newProjectData: Omit<Project, 'id'> = {
        clientName: 'Novo Cliente Solar',
        address: 'Endereço a definir',
        status: ProjectStatus.VISTORIA,
        powerKwp: 0,
        estimatedProduction: 0,
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      };

      const created = await createProject(newProjectData);
      if (created) {
        setProjects(prev => [created, ...prev]);
        setSelectedProject(created);

        addNotification({
          title: 'Novo Projeto Criado',
          message: `O projeto para "${created.clientName}" foi iniciado com sucesso.`,
          type: 'info'
        });
      } else {
        alert('Falha ao gravar no Supabase. Verifique sua conexão.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado: ' + err.message);
    }
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
    // Regra global: Integradores só veem vistorias atribuídas a eles
    let baseProjects = projects;
    if (currentUser && currentUser.role === UserRole.INTEGRADOR) {
      baseProjects = projects.filter(p => p.assignedIntegrator === currentUser.name);
    }

    switch (view) {
      case 'vistorias':
        return baseProjects.filter(p => p.status === ProjectStatus.VISTORIA || p.status === ProjectStatus.AGUARDANDO_ANALISE);
      case 'engenharia':
        if (!isEngenhariaRole) return [];
        return projects.filter(p => [
          ProjectStatus.ANALISE,
          ProjectStatus.SUBMISSAO,
          ProjectStatus.INSTALACAO,
          ProjectStatus.COMISSIONAMENTO,
          ProjectStatus.AGUARDANDO_ANALISE
        ].includes(p.status));
      case 'projects':
      default:
        return baseProjects;
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
              badge={getFilteredProjects().filter(p => p.status === ProjectStatus.VISTORIA).length}
            />
            {isEngenhariaRole && (
              <SidebarLink
                active={view === 'engenharia'}
                onClick={() => handleMenuClick('engenharia')}
                icon="fa-pencil-ruler"
                label="Engenharia"
                badge={projects.filter(p => p.status === ProjectStatus.ANALISE || p.status === ProjectStatus.AGUARDANDO_ANALISE).length}
              />
            )}

            {isEngenhariaRole && (
              <>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-4 px-4">Recursos</p>
                <SidebarLink
                  active={view === 'equipments'}
                  onClick={() => handleMenuClick('equipments')}
                  icon="fa-tools"
                  label="Equipamentos"
                />
              </>
            )}
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
              className="mt-1 md:hidden w-10 h-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
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
              className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition relative shadow-sm"
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
          ) : (view === 'engenharia' && isEngenhariaRole) ? (
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
            key={selectedProject.id}
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
