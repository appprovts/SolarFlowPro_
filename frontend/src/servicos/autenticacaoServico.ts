import { supabase } from './supabaseCliente';
import { User, UserRole } from '../tipos/index';

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: any }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { user: null, error };

    if (data.user) {
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
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;

        // Tentar pegar do profiles primeiro para ter o role atualizado
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            name: profile?.full_name || user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
            role: (profile?.role as UserRole) || (user.user_metadata.role as UserRole) || UserRole.INTEGRADOR,
            avatar: profile?.avatar_url || user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
            phone: profile?.phone || user.user_metadata.phone || ''
        };
    } catch (err) {
        console.error('Erro ao buscar usuário atual:', err);
        return null;
    }
};

export const updateUser = async (user: User): Promise<{ user: User | null; error: any }> => {
    try {
        // Verificar sessão antes de tentar atualizar
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.error('Erro de sessão detectado:', sessionError);
            return { user: null, error: new Error('Sessão expirada ou não encontrada. Por favor, faça login novamente.') };
        }

        // 1. Atualizar metadados no Auth
        const { data: authData, error: authError } = await supabase.auth.updateUser({
            data: {
                full_name: user.name,
                avatar_url: user.avatar,
                phone: user.phone
            }
        });

        if (authError) {
            console.error('Erro ao atualizar Auth:', authError);
            // Se o erro for especificamente sobre sessão, damos uma mensagem melhor
            if (authError.message.includes('session')) {
                return { user: null, error: new Error('Sessão inválida. Tente sair e entrar novamente no sistema.') };
            }
            return { user: null, error: authError };
        }

        // 2. Atualizar tabela profiles diretamente para garantir consistência
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: user.name,
                avatar_url: user.avatar,
                phone: user.phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (profileError) {
            console.warn('Aviso: Erro ao atualizar tabela profiles, mas Auth foi atualizado:', profileError);
        }

        if (authData.user) {
            const updatedUser: User = {
                id: authData.user.id,
                name: authData.user.user_metadata.full_name || user.name,
                role: (authData.user.user_metadata.role as UserRole) || user.role,
                avatar: authData.user.user_metadata.avatar_url || user.avatar,
                phone: authData.user.user_metadata.phone || user.phone
            };
            return { user: updatedUser, error: null };
        }

        return { user: null, error: new Error('Erro inesperado ao processar retorno do servidor.') };
    } catch (err: any) {
        console.error('Erro crítico em updateUser:', err);
        return { user: null, error: err };
    }
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
        redirectTo: window.location.origin,
    });
    return { error };
};
