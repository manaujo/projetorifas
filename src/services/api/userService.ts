import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  // GET /api/users - Buscar perfil do usuário
  static async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw new Error('Erro ao buscar perfil do usuário');
    }
  }

  // POST /api/users - Criar perfil do usuário
  static async createProfile(userData: UserInsert): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw new Error('Erro ao criar perfil do usuário');
    }
  }

  // PUT /api/users - Atualizar perfil do usuário
  static async updateProfile(userId: string, updates: UserUpdate): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil do usuário');
    }
  }

  // PUT /api/users/plan - Atualizar plano do usuário
  static async updatePlan(userId: string, plano: 'economico' | 'padrao' | 'premium'): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ plano })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw new Error('Erro ao atualizar plano do usuário');
    }
  }

  // DELETE /api/users - Remover conta do usuário
  static async deleteAccount(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      throw new Error('Erro ao remover conta do usuário');
    }
  }

  // Verificar limites do plano
  static async checkPlanLimits(userId: string): Promise<{
    canCreateRifa: boolean;
    canCreateCampanha: boolean;
    maxBilhetes: number;
    rifasRestantes: number;
    campanhasRestantes: number;
  }> {
    try {
      const user = await this.getProfile(userId);
      if (!user || !user.plano) {
        return {
          canCreateRifa: false,
          canCreateCampanha: false,
          maxBilhetes: 0,
          rifasRestantes: 0,
          campanhasRestantes: 0,
        };
      }

      const limits = {
        economico: { rifas: 2, campanhas: 2, bilhetes: 100000 },
        padrao: { rifas: 5, campanhas: 5, bilhetes: 500000 },
        premium: { rifas: 10, campanhas: 10, bilhetes: 1000000 },
      };

      const planLimits = limits[user.plano];
      
      return {
        canCreateRifa: user.rifas_criadas < planLimits.rifas,
        canCreateCampanha: user.campanhas_criadas < planLimits.campanhas,
        maxBilhetes: planLimits.bilhetes,
        rifasRestantes: planLimits.rifas - user.rifas_criadas,
        campanhasRestantes: planLimits.campanhas - user.campanhas_criadas,
      };
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
      throw new Error('Erro ao verificar limites do plano');
    }
  }
}