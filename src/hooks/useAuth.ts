import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserService } from '../services/api/userService';
import { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          throw error;
        }

        if (session?.user) {
          try {
            const profile = await UserService.getProfile(session.user.id);
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
          } catch (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            setAuthState({
              user: session.user,
              profile: null,
              loading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: 'Erro ao verificar sessão',
        });
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          try {
            const profile = await UserService.getProfile(session.user.id);
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            setAuthState({
              user: session.user,
              profile: null,
              loading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: {
    nome: string;
    telefone?: string;
    cpf?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      console.log('Tentando criar conta:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData.nome,
          }
        }
      });

      if (error) {
        console.error('Erro no signup:', error);
        throw error;
      }

      console.log('Signup bem-sucedido:', data.user?.email);

      if (data.user) {
        // Criar perfil do usuário
        try {
          await UserService.createProfile({
            id: data.user.id,
            nome: userData.nome,
            email,
            telefone: userData.telefone,
            cpf: userData.cpf,
          });
        } catch (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não falhar o cadastro se o perfil não for criado
        }
      }

      return data;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      let errorMessage = 'Erro no cadastro';
      
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      console.log('Tentando fazer login com:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro de autenticação:', error);
        throw error;
      }

      console.log('Login bem-sucedido:', data.user?.email);
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro no login';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado');

      const updatedProfile = await UserService.updateProfile(authState.user.id, updates);
      
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile,
      }));

      return updatedProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const updatePlan = async (plano: 'economico' | 'padrao' | 'premium') => {
    try {
      if (!authState.user) throw new Error('Usuário não autenticado');

      const updatedProfile = await UserService.updatePlan(authState.user.id, plano);
      
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile,
      }));

      return updatedProfile;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  };

  // Função de login para compatibilidade
  const login = signIn;

  // Função de register para compatibilidade
  const register = async (name: string, email: string, password: string) => {
    return signUp(email, password, { nome: name });
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePlan,
    login, // Alias para signIn
    register, // Alias para signUp
    isAuthenticated: !!authState.user,
    hasProfile: !!authState.profile,
    hasPlan: !!authState.profile?.plano,
    // Compatibilidade com o código existente
    isLoading: authState.loading,
    user: authState.user,
    error: authState.error,
  };
};