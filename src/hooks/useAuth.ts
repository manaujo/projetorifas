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
        
        if (error) throw error;

        if (session?.user) {
          const profile = await UserService.getProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null,
          });
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
              error: 'Erro ao buscar perfil',
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Criar perfil do usuário
        await UserService.createProfile({
          id: data.user.id,
          nome: userData.nome,
          email,
          telefone: userData.telefone,
          cpf: userData.cpf,
        });
      }

      return data;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro no cadastro',
      }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro no login',
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
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

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePlan,
    isAuthenticated: !!authState.user,
    hasProfile: !!authState.profile,
    hasPlan: !!authState.profile?.plano,
  };
};