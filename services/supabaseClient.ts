import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || (process.env as any).NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('Supabase credentials missing! The app might not function correctly. Please check your .env.local file.');
} else if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('Supabase Anon Key seems invalid! It should start with "eyJ" (JWT format). Current key starts with:', supabaseAnonKey.substring(0, 5));
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
