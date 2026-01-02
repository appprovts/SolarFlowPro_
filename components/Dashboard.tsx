
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Project, ProjectStatus } from '../types';

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const stats = {
    total: projects.length,
    power: projects.reduce((acc, p) => acc + p.powerKwp, 0),
    pending: projects.filter(p => p.status === ProjectStatus.SUBMISSAO).length,
    completed: projects.filter(p => p.status === ProjectStatus.CONCLUIDO).length,
  };

  const statusData = Object.values(ProjectStatus).map(status => ({
    name: status,
    value: projects.filter(p => p.status === status).length
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Projetos Ativos" value={stats.total} icon="fa-solar-panel" color="text-blue-600" />
        <StatCard title="Potência Total (kWp)" value={stats.power.toFixed(1)} icon="fa-bolt" color="text-amber-600" />
        <StatCard title="Aguardando Concessionária" value={stats.pending} icon="fa-file-signature" color="text-purple-600" />
        <StatCard title="Obras Concluídas" value={stats.completed} icon="fa-check-circle" color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Status dos Projetos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-800">Distribuição de Fases</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
      <i className={`fas ${icon} text-xl`}></i>
    </div>
  </div>
);

export default Dashboard;
