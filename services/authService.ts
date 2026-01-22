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
        avatar: user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
        phone: user.user_metadata.phone || ''
    };
};

export const updateUser = async (user: User): Promise<{ user: User | null; error: any }> => {
    const { data, error } = await supabase.auth.updateUser({
        data: {
            full_name: user.name,
            avatar_url: user.avatar,
            phone: user.phone
        }
    });

    if (error) return { user: null, error };

    if (data.user) {
        const updatedUser: User = {
            id: data.user.id,
            name: data.user.user_metadata.full_name || user.name,
            role: (data.user.user_metadata.role as UserRole) || user.role,
            avatar: data.user.user_metadata.avatar_url || user.avatar,
            phone: data.user.user_metadata.phone || user.phone
        };
        return { user: updatedUser, error: null };
    }


    return { user: null, error: new Error('Ocorreu um erro ao atualizar os dados.') };
};

export const shouldAutoLogout = async (maxDurationMinutes: number = 60): Promise<boolean> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.last_sign_in_at) return false;

        const lastSignInTime = new Date(session.user.last_sign_in_at).getTime();
        const currentTime = Date.now();
        const durationMinutes = (currentTime - lastSignInTime) / (1000 * 60);


        return durationMinutes > maxDurationMinutes;
    } catch (error) {
        console.error('Erro ao verificar tempo de sessão:', error);
        return false;
    }
};

export const resetPassword = async (email: string): Promise<{ error: any }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redireciona para a home após clicar no link
    });
    return { error };
};
