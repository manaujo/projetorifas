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

      if (error) {
        // Se o perfil não existe, retornar null em vez de erro
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado para usuário:', userId);
          return null;
        }
        console.error('Erro ao buscar perfil:', error);
        return null; // Retornar null em vez de throw para não quebrar o fluxo
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null; // Retornar null em caso de erro para não quebrar o fluxo
    }
  }

  // POST /api/users - Criar perfil do usuário
  static async createProfile(userData: UserInsert): Promise<User> {
    try {
      console.log('Criando perfil para usuário:', userData);
      
      // Verificar se o perfil já existe antes de criar
      const existingProfile = await this.getProfile(userData.id);
      if (existingProfile) {
        console.log('Perfil já existe, retornando perfil existente');
        return existingProfile;
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        
        // Se o erro for de duplicação, tentar buscar o perfil existente
        if (error.code === '23505') { // Unique violation
          console.log('Perfil já existe (violação de unicidade), buscando perfil existente');
          const existingProfile = await this.getProfile(userData.id);
          if (existingProfile) {
            return existingProfile;
          }
        }
        
        throw error;
      }
      
      console.log('Perfil criado com sucesso:', data);
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

  // Verificar se o usuário tem um plano ativo
  static async hasActivePlan(userId: string): Promise<boolean> {
    try {
      const user = await this.getProfile(userId);
      return !!(user && user.plano);
    } catch (error) {
      console.error('Erro ao verificar plano ativo:', error);
      return false;
    }
  }

  // Criar usuário administrador de teste
  static async createTestAdmin(): Promise<void> {
    try {
      const testAdminData: UserInsert = {
        id: '00000000-0000-0000-0000-000000000000', // ID fixo para teste
        nome: 'Administrador',
        email: 'marcio.araujo.m7@gmail.com',
        plano: 'premium',
        rifas_criadas: 0,
        campanhas_criadas: 0,
        chave_pix: 'admin@pix.com',
      };

      // Verificar se já existe
      const existing = await this.getProfile(testAdminData.id);
      if (!existing) {
        await this.createProfile(testAdminData);
        console.log('Usuário administrador de teste criado');
      }
    } catch (error) {
      console.error('Erro ao criar admin de teste:', error);
    }
  }
}