import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';

interface SettingsProps {
    currentUser: User;
    onUpdateUser: (updatedUser: User) => void;
}

// Mock users for Admin management demo
const MOCK_USERS: User[] = [
    { id: '1', name: 'João Técnico', role: UserRole.INTEGRADOR, avatar: 'https://i.pravatar.cc/150?u=1', phone: '11999887766' },
    { id: '2', name: 'Maria Engenheira', role: UserRole.ENGENHARIA, avatar: 'https://i.pravatar.cc/150?u=2', phone: '11988776655' },
    { id: '3', name: 'Carlos Admin', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=3', phone: '11977665544' },
];

interface UserCardProps {
    user: User;
    setEditingUserId: (id: string | null) => void;
    onUpdateUser: (u: User) => void;
    editingUserId: string | null;
}

const UserCard: React.FC<UserCardProps> = ({ user, setEditingUserId, onUpdateUser, editingUserId }) => {
    const isEditing = editingUserId === user.id;
    const [editForm, setEditForm] = useState(user);

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex flex-col gap-3">
                <div className="flex gap-4">
                    <div className="relative w-16 h-16">
                        <img src={editForm.avatar} className="w-16 h-16 rounded-full object-cover" />
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            <i className="fas fa-camera"></i>
                        </button>
                    </div>
                    <div className="flex-1 space-y-2">
                        <input
                            className="w-full text-sm border-slate-200 rounded-lg"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Nome"
                        />
                        <select
                            className="w-full text-sm border-slate-200 rounded-lg"
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                        >
                            <option value={UserRole.INTEGRADOR}>Integrador</option>
                            <option value={UserRole.ENGENHARIA}>Engenharia</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingUserId(null)} className="text-slate-500 text-sm px-3 py-1">Cancelar</button>
                    <button onClick={() => onUpdateUser(editForm)} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg">Salvar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full ring-2 ring-slate-100" />
                <div>
                    <h4 className="font-bold text-slate-800">{user.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === UserRole.ENGENHARIA ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {user.role}
                    </span>
                </div>
            </div>
            <button
                onClick={() => setEditingUserId(user.id)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600"
            >
                <i className="fas fa-edit"></i>
            </button>
        </div>
    );
};

const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');
    const [profileForm, setProfileForm] = useState(currentUser);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const isAdmin = currentUser.role === UserRole.ADMIN;

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser(profileForm);
        alert('Perfil atualizado com sucesso!');
    };

    const handleUpdateOtherUser = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUserId(null);
    };

    // Profile Picture Logic
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setProfileForm({ ...profileForm, avatar: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {isAdmin && (
                <div className="flex bg-white rounded-xl shadow-sm overflow-hidden w-fit border border-slate-200">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-2 text-sm font-bold transition ${activeTab === 'profile' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Meu Perfil
                    </button>
                    <div className="w-px bg-slate-200"></div>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 text-sm font-bold transition ${activeTab === 'users' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Gerenciar Usuários
                    </button>
                </div>
            )}

            {activeTab === 'profile' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Editar Perfil</h2>
                        <span className="text-sm text-slate-500">Mantenha seus dados atualizados</span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                <img src={profileForm.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-50 group-hover:scale-105 transition shadow-lg" />
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <i className="fas fa-camera text-white text-2xl"></i>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="text-xs text-slate-400 text-center">Clique para alterar foto</p>
                        </div>

                        <div className="md:col-span-2 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        value={profileForm.phone || ''}
                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                        value={profileForm.role}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Usuários do Sistema</h2>
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition">
                            <i className="fas fa-plus mr-2"></i>Novo Usuário
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                editingUserId={editingUserId}
                                setEditingUserId={setEditingUserId}
                                onUpdateUser={handleUpdateOtherUser}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
