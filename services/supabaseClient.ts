import { createClient } from '@supabase/supabase-js';

// Função para limpar valores de variáveis de ambiente (remove espaços, aspas e caracteres invisíveis como BOM)
const cleanEnvValue = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/^['"]|['"]$/g, '').trim();
};

const supabaseUrl = cleanEnvValue(
  import.meta.env.VITE_SUPABASE_URL ||
  (process.env as any).NEXT_PUBLIC_SUPABASE_URL ||
  ''
);

const supabaseAnonKey = cleanEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
);



export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: {
        getItem: (key) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error: any) {
            // Handle QuotaExceededError
            if (error.name === 'QuotaExceededError' ||
              error.message?.includes('exceeded the quota')) {
              console.warn('⚠️ LocalStorage full! Clean up old Supabase sessions...');

              try {
                // Clear old Supabase keys that are not the current one
                Object.keys(localStorage).forEach((k) => {
                  if (k.startsWith('sb-') && k !== key) {
                    localStorage.removeItem(k);
                  }
                });

                // Try setting again
                localStorage.setItem(key, value);
                console.log('✅ Recovered from storage quota error.');
              } catch (retryError) {
                console.error('❌ Failed to recover from storage limit:', retryError);
              }
            } else {
              console.error('Error saving to localStorage:', error);
            }
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        },
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Diagnóstico em desenvolvimento
if (import.meta.env.DEV) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase: Credenciais ausentes ou inválidas! Verifique o arquivo .env.local');
    console.log('URL detectada:', supabaseUrl || 'Nenhuma');
    console.log('Chave detectada:', supabaseAnonKey ? 'Presente (protegida)' : 'Ausente');
  } else {
    console.log('✅ Supabase: Configuração carregada com sucesso.');
    console.log('Projeto:', supabaseUrl.split('//')[1]?.split('.')[0]);

    // Teste de conexão real
    (async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('🟢 Supabase: Conexão estabelecida com sucesso!');
      } catch (err: any) {
        console.error('🔴 Supabase: Falha na conexão:', err.message);
      }
    })();
  }
}
