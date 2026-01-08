import { supabase } from './supabaseClient';
import { User, UserRole } from '../types';

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: any }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { user: null, error };

    if (data.user) {
        // In a real app, you'd fetch the role from a profiles table
        // For now, we'll infer it or use metadata
        const user: User = {
            id: data.user.id,
            name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User',
            role: (data.user.user_metadata.role as UserRole) || UserRole.INTEGRADOR,
            avatar: data.user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${data.user.id}`
        };
        return { user, error: null };
    }

    return { user: null, error: new Error('No user data') };
};

export const signUp = async (email: string, password: string, name: string, role: UserRole, phone: string): Promise<{ user: User | null; error: any }> => {
    console.log('Iniciando cadastro para:', email);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: role,
                phone: phone
            }
        }
    });

    if (error) {
        console.error('Erro no cadastro Supabase:', error);
        return { user: null, error };
    }

    if (data.user) {
        console.log('Cadastro realizado com sucesso:', data.user.id);

        // Se a sessão for nula, o Supabase provavelmente requer confirmação de e-mail
        if (!data.session) {
            console.warn('Atenção: E-mail de confirmação enviado. O usuário não terá sessão ativa até confirmar.');
        }

        const user: User = {
            id: data.user.id,
            name: name,
            role: role,
            avatar: `https://i.pravatar.cc/150?u=${data.user.id}`,
            phone: phone
        };
        return { user, error: null };
    }

    return { user: null, error: new Error('Ocorreu um erro desconhecido no cadastro') };
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
        id: user.id,
        name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
        role: (user.user_metadata.role as UserRole) || UserRole.INTEGRADOR,
        avatar: user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`
    };
};
