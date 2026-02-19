
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, User, UserRole, Notification } from './tipos/index';
import Dashboard from './paginas/Painel';
import ProjectList from './componentes/ListaProjetos';
import ProjectDetails from './componentes/DetalhesProjeto';
import Login from './paginas/Entrar';
import NotificationPanel from './componentes/PainelNotificacoes';
import KanbanBoard from './componentes/QuadroKanban';
import EquipmentList from './componentes/ListaEquipamentos';
import SurveyList from './componentes/ListaVistorias';
import Settings from './paginas/Configuracoes';
import GerenciamentoUsuarios from './paginas/GerenciamentoUsuarios';
import { getCurrentUser, signOut } from './servicos/autenticacaoServico';
import { supabase } from './servicos/supabaseCliente';
import { getProjects, createProject, updateProject } from './servicos/projetoServico';
import { getNotifications, createNotification, markAsRead as dbMarkAsRead, clearAllNotifications as dbClearAll } from './servicos/notificacaoServico';

type AppView = 'dashboard' | 'projects' | 'vistorias' | 'engenharia' | 'equipments' | 'settings' | 'users';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Estado de estatísticas para o dashboard (caso queira carregar por aqui)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, power: 0 });

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user) {
          await preloadData(user).catch(e => console.warn('Erro ao carregar dados iniciais:', e));
        }
      } catch (err) {
        console.error('Falha na verificação de sessão:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listener para mudanças reais no Auth do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de Autenticação:', event);
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') && session) {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user) preloadData(user).catch(() => { });
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setProjects([]);
        setNotifications([]);
        setView('dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const preloadData = async (user: User) => {
    try {
      const [projectsData, notificationsData] = await Promise.all([
        getProjects().catch(() => []), // Não deixa falhar se a tabela não existir
        getNotifications(user.id).catch(() => [])
      ]);

      if (projectsData) setProjects(projectsData);
      if (notificationsData) setNotifications(notificationsData);

      const isEngenhariaRole = user.role === UserRole.ENGENHARIA || user.role === UserRole.ADMIN;
      if (view === 'dashboard' || view === 'engenharia' || view === 'equipments') {
        if (!isEngenhariaRole) setView('projects');
      }
    } catch (err) {
      console.error('Erro no pré-carregamento:', err);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-amber-400">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-circle-notch fa-spin text-4xl"></i>
          <p className="text-sm font-medium animate-pulse">Carregando SolarFlow Pro...</p>
        </div>
      </div>
    );
  }

  // Se não houver usuário, exibe tela de login
  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  const isEngenhariaRole = currentUser.role === UserRole.ENGENHARIA || currentUser.role === UserRole.ADMIN;
  const isAdmin = currentUser.role === UserRole.ADMIN;

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
    if (success) setNotifications([]);
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
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro inesperado: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const handleMenuClick = (targetView: AppView) => {
    setView(targetView);
    setIsSidebarOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getFilteredProjects = () => {
    let baseProjects = projects;
    if (currentUser.role === UserRole.INTEGRADOR) {
      baseProjects = projects.filter(p => p.assignedIntegrator === currentUser.name || !p.assignedIntegrator);
    }

    switch (view) {
      case 'vistorias':
        return baseProjects.filter(p => p.status === ProjectStatus.VISTORIA || p.status === ProjectStatus.AGUARDANDO_ANALISE);
      case 'engenharia':
        if (!isEngenhariaRole) return [];
        return projects.filter(p => [
          ProjectStatus.ANALISE, ProjectStatus.SUBMISSAO, ProjectStatus.INSTALACAO, ProjectStatus.COMISSIONAMENTO, ProjectStatus.AGUARDANDO_ANALISE
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
      case 'users': return 'Gestão de Usuários';
      default: return 'SolarFlow Pro';
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} relative transition-colors duration-300`}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed h-full z-30 shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-400/20">
                <i className="fas fa-sun text-xl"></i>
              </div>
              <span className="text-xl font-bold tracking-tight">SolarFlow<span className="text-amber-400">Pro</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Principal</p>
          <nav className="space-y-1">
            {isEngenhariaRole && <SidebarLink active={view === 'dashboard'} onClick={() => handleMenuClick('dashboard')} icon="fa-columns" label="Dashboard" />}
            <SidebarLink active={view === 'projects'} onClick={() => handleMenuClick('projects')} icon="fa-layer-group" label="Todos Projetos" />

            <div className="pt-4 mb-2 border-t border-slate-800"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Operacional</p>
            <SidebarLink
              active={view === 'vistorias'}
              onClick={() => handleMenuClick('vistorias')}
              icon="fa-hard-hat"
              label="Vistorias"
              badge={getFilteredProjects().filter(p => p.status === ProjectStatus.VISTORIA).length}
            />
            {isEngenhariaRole && <SidebarLink active={view === 'engenharia'} onClick={() => handleMenuClick('engenharia')} icon="fa-pencil-ruler" label="Engenharia" />}

            {isEngenhariaRole && (
              <>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-4 px-4">Recursos</p>
                <SidebarLink active={view === 'equipments'} onClick={() => handleMenuClick('equipments')} icon="fa-tools" label="Equipamentos" />
              </>
            )}

            {isAdmin && <SidebarLink active={view === 'users'} onClick={() => handleMenuClick('users')} icon="fa-users-cog" label="Usuários" />}
            <SidebarLink active={view === 'settings'} onClick={() => handleMenuClick('settings')} icon="fa-cog" label="Configurações" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={currentUser.avatar || `https://i.pravatar.cc/150?u=${currentUser.id}`} className="w-10 h-10 rounded-full ring-2 ring-slate-700 object-cover" alt="Avatar" />
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
            <button onClick={() => setIsSidebarOpen(true)} className="mt-1 md:hidden w-10 h-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{getViewTitle()}</h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">Olá, {currentUser.name}.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 relative self-end md:self-auto">
            <button onClick={() => setShowNotifications(!showNotifications)} className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition relative shadow-sm">
              <i className="fas fa-bell text-lg"></i>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 z-50 w-full md:w-auto">
                <NotificationPanel notifications={notifications} onClose={() => setShowNotifications(false)} onMarkAsRead={handleMarkAsRead} onClearAll={handleClearAll} onAction={() => { }} />
              </div>
            )}

            {isEngenhariaRole && view !== 'equipments' && view !== 'users' && (
              <button onClick={addNewProject} className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold shadow-lg shadow-amber-400/20 transition flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">Novo Projeto</span>
              </button>
            )}
          </div>
        </header>

        <div className="animate-in fade-in duration-500 overflow-x-hidden">
          {view === 'users' && isAdmin ? <GerenciamentoUsuarios /> : view === 'equipments' ? <EquipmentList /> : view === 'dashboard' ? <Dashboard projects={projects} /> : view === 'engenharia' ? <KanbanBoard projects={projects} onSelectProject={setSelectedProject} /> : view === 'vistorias' ? <SurveyList projects={getFilteredProjects()} onSelectProject={setSelectedProject} /> : view === 'settings' ? <Settings currentUser={currentUser} onUpdateUser={setCurrentUser} darkMode={darkMode} onToggleDarkMode={setDarkMode} /> : <ProjectList projects={getFilteredProjects()} onSelectProject={setSelectedProject} />}
        </div>

        {selectedProject && (
          <ProjectDetails key={selectedProject.id} project={selectedProject} currentUser={currentUser} onUpdate={handleUpdateProject} onClose={() => setSelectedProject(null)} onNotify={addNotification} />
        )}
      </main>
    </div>
  );
};

const SidebarLink = ({ active, onClick, icon, label, badge }: { active?: boolean; onClick?: () => void; icon: string; label: string; badge?: number }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-amber-400 text-slate-900 font-bold shadow-md shadow-amber-400/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex items-center gap-3">
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span className="text-sm">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-400'}`}>{badge}</span>}
  </button>
);

export default App;
