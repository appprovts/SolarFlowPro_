import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../tipos/index';
import { updateUser } from '../servicos/autenticacaoServico';
import GerenciamentoUsuarios from './GerenciamentoUsuarios';

interface SettingsProps {
    currentUser: User;
    onUpdateUser: (updatedUser: User) => void;
    darkMode: boolean;
    onToggleDarkMode: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');
    const [profileForm, setProfileForm] = useState(currentUser);
    const [isSaving, setIsSaving] = useState(false);

    const isAdmin = currentUser.role === UserRole.ADMIN;

    // Sincronizar formulário quando o usuário atual mudar
    useEffect(() => {
        setProfileForm(currentUser);
    }, [currentUser]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { user, error } = await updateUser(profileForm);
            if (error) throw error;
            if (user) {
                onUpdateUser(user);
                alert('Perfil atualizado com sucesso!');
            }
        } catch (err: any) {
            console.error('Falha ao atualizar perfil:', err);
            alert('Erro ao atualizar perfil: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setIsSaving(false);
        }
    };

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
            <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden w-fit border border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-2 text-sm font-bold transition ${activeTab === 'profile' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Meu Perfil
                </button>
                {isAdmin && (
                    <>
                        <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 text-sm font-bold transition ${activeTab === 'users' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            Gerenciar Usuários
                        </button>
                    </>
                )}
            </div>

            {activeTab === 'profile' ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Editar Perfil</h2>
                        <span className="text-sm text-slate-500">Mantenha seus dados atualizados</span>
                    </div>

                    <form onSubmit={handleSaveProfile} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                <img src={profileForm.avatar || `https://i.pravatar.cc/150?u=${profileForm.id}`} alt="Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-50 group-hover:scale-105 transition shadow-lg" />
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
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 transition"
                                        value={profileForm.phone || ''}
                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Função</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                        value={profileForm.role}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <i className="fas fa-magic"></i>
                                    Aparência do Sistema
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-slate-700 text-amber-400' : 'bg-white text-slate-500'} shadow-sm border border-slate-200 dark:border-slate-700`}>
                                            <i className={`fas ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Modo Escuro</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Alternar entre temas claro e escuro</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onToggleDarkMode(!darkMode)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end text-sm">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-amber-500 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <GerenciamentoUsuarios />
            )}
        </div>
    );
};

export default Settings;
