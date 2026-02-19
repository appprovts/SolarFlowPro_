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

    return { user: null, error: new Error('Dados de usuário não encontrados após login.') };
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
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return null;

        // Tentar pegar do profiles, mas sem travar se falhar
        let profile = null;
        try {
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profileError) {
                profile = data;
            }
        } catch (e) {
            console.warn('Tabela profiles inacessível, usando metadados do Auth.');
        }

        return {
            id: user.id,
            name: profile?.full_name || user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuário',
            role: (profile?.role as UserRole) || (user.user_metadata.role as UserRole) || UserRole.INTEGRADOR,
            avatar: profile?.avatar_url || user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
            phone: profile?.phone || user.user_metadata.phone || ''
        };
    } catch (err) {
        console.error('Erro crítico ao buscar usuário atual:', err);
        return null;
    }
};

export const updateUser = async (user: User): Promise<{ user: User | null; error: any }> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { user: null, error: new Error('Sessão expirada. Faça login novamente.') };

        // Atualizar Auth
        const { data: authData, error: authError } = await supabase.auth.updateUser({
            data: {
                full_name: user.name,
                avatar_url: user.avatar,
                phone: user.phone
            }
        });

        if (authError) return { user: null, error: authError };

        // Tentar atualizar tabela profiles
        try {
            await supabase
                .from('profiles')
                .update({
                    full_name: user.name,
                    avatar_url: user.avatar,
                    phone: user.phone,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
        } catch (e) {
            console.warn('Não foi possível atualizar a tabela profiles diretamente.');
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

        return { user: null, error: new Error('Erro ao processar retorno do Supabase.') };
    } catch (err: any) {
        return { user: null, error: err };
    }
};

export const resetPassword = async (email: string): Promise<{ error: any }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    return { error };
};
