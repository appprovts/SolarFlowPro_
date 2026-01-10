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

// Diagnóstico em desenvolvimento
if (import.meta.env.DEV) {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase: Credenciais ausentes ou inválidas! Verifique o arquivo .env.local');
    console.log('URL detectada:', supabaseUrl || 'Nenhuma');
    console.log('Chave detectada:', supabaseAnonKey ? 'Presente (protegida)' : 'Ausente');
  } else {
    console.log('✅ Supabase: Configuração carregada com sucesso.');
    console.log('Projeto:', supabaseUrl.split('//')[1]?.split('.')[0]);
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
