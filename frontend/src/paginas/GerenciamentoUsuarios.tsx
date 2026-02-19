
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../tipos/index';
import { supabase } from '../servicos/supabaseCliente';

const GerenciamentoUsuarios: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Buscando da tabela profiles que criamos via SQL
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

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
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!confirm(`Deseja alterar o perfil deste usuário para ${newRole}?`)) return;

        try {
            // Atualiza na tabela profiles (usando a política de RLS que criamos para Admins)
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            console.error('Erro ao atualizar papel:', err);
            alert('Erro ao atualizar papel: ' + err.message);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Um convite será enviado para ${inviteEmail}. (Funcionalidade vinculada ao template de e-mail do Supabase Auth)`);
        setShowInviteModal(false);
        setInviteEmail('');
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white">Gestão de Equipe</h2>
                    <p className="text-sm text-slate-500">Administre os níveis de acesso e perfis dos usuários</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-400 outline-none transition w-48 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-900 px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition shadow-lg flex items-center gap-2"
                    >
                        <i className="fas fa-user-plus"></i>
                        <span className="hidden sm:inline">Convidar</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Usuário</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Perfil</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Atribuir Novo Nível</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
                                        <p className="text-xs">Carregando base de usuários...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover" alt="" />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{user.id.substring(0, 13)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400' :
                                                    user.role === UserRole.ENGENHARIA ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-400 transition"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            >
                                                <option value={UserRole.ADMIN}>Administrador</option>
                                                <option value={UserRole.ENGENHARIA}>Engenharia</option>
                                                <option value={UserRole.INTEGRADOR}>Integrador</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition">
                                                <i className="fas fa-trash-alt text-xs"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Convite */}
            {showInviteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold dark:text-white">Convidar para a Equipe</h3>
                            <p className="text-xs text-slate-500">O usuário receberá um link para configurar sua senha.</p>
                        </div>
                        <form onSubmit={handleInviteUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail do Usuário</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition"
                                    placeholder="exemplo@vtsengenharia.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-900 shadow-lg transition"
                                >
                                    Enviar Convite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciamentoUsuarios;
