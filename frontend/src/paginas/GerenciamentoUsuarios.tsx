
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../tipos/index';
import { supabase } from '../servicos/supabaseCliente';

const GerenciamentoUsuarios: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // No Supabase, usuários do Auth não são facilmente listados pelo cliente normal sem Edge Functions
            // No entanto, assumindo que temos uma tabela 'profiles' ou similar que espelha os usuários
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            if (data) {
                const mappedUsers: User[] = data.map(u => ({
                    id: u.id,
                    name: u.full_name || 'Usuário sem nome',
                    role: u.role as UserRole,
                    avatar: u.avatar_url || `https://i.pravatar.cc/150?u=${u.id}`,
                    phone: u.phone
                }));
                setUsers(mappedUsers);
            }
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            // Fallback para mock se der erro (apenas para exibição inicial se a tabela não existir)
            setUsers([
                { id: '1', name: 'Admin do Sistema', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=1' },
                { id: '2', name: 'João Integrador', role: UserRole.INTEGRADOR, avatar: 'https://i.pravatar.cc/150?u=2' },
                { id: '3', name: 'Maria Engenharia', role: UserRole.ENGENHARIA, avatar: 'https://i.pravatar.cc/150?u=3' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Erro ao atualizar papel:', err);
            alert('Erro ao atualizar papel do usuário.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Gerenciamento de Acessos</h2>
                    <p className="text-sm text-slate-500">Controle quem pode acessar cada área do sistema</p>
                </div>

                <div className="relative w-full md:w-64">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Perfil Atual</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Alterar Acesso</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                        <i className="fas fa-circle-notch fa-spin mr-2"></i> Carregando usuários...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                                                    user.role === UserRole.ENGENHARIA ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            >
                                                <option value={UserRole.ADMIN}>Admin</option>
                                                <option value={UserRole.ENGENHARIA}>Engenharia</option>
                                                <option value={UserRole.INTEGRADOR}>Integrador</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-slate-400 hover:text-red-500 transition">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GerenciamentoUsuarios;
