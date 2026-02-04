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

const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        console.warn('⚠️ LocalStorage cheio! Tentando limpar sessões antigas...');
        try {
          // Limpa todas as chaves do Supabase exceto a atual
          Object.keys(localStorage).forEach(k => {
            if (k.startsWith('sb-') && k !== key) {
              localStorage.removeItem(k);
            }
          });
          // Tenta gravar novamente
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('❌ Falha crítica no Storage:', retryError);
        }
      }
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) { }
  }
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: safeStorage
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

