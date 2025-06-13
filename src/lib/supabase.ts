import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos';
    }
    if (error.message.includes('User already registered')) {
      return 'Este email já está cadastrado';
    }
    if (error.message.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    return error.message;
  }
  
  return 'Erro inesperado. Tente novamente.';
};