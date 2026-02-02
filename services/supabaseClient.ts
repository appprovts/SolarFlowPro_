import { createClient } from '@supabase/supabase-js';

// Função para limpar valores de variáveis de ambiente
const cleanEnvValue = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/^['"]|['"]$/g, '').trim();
};

const supabaseUrl = cleanEnvValue(
  import.meta.env.VITE_SUPABASE_URL || ''
);

const supabaseAnonKey = cleanEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage
    },
  }
);

// Diagnóstico em desenvolvimento
if (import.meta.env.DEV) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase: Credenciais ausentes ou inválidas! Verifique o arquivo .env.local');
  } else {
    console.log('✅ Supabase: Configuração carregada para:', supabaseUrl);

    // Teste de conexão real silencioso
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('🔴 Supabase: Erro na sessão:', error.message);
      } else {
        console.log('🟢 Supabase: Conexão OK. Sessão:', data.session ? 'Ativa' : 'Nenhuma');
      }
    });
  }
}

