import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Rifa = Database['public']['Tables']['rifas']['Row'];
type RifaInsert = Database['public']['Tables']['rifas']['Insert'];
type RifaUpdate = Database['public']['Tables']['rifas']['Update'];
type BilheteRifa = Database['public']['Tables']['bilhetes_rifa']['Row'];
type BilheteRifaInsert = Database['public']['Tables']['bilhetes_rifa']['Insert'];

export class RifaService {
  // GET /api/rifas - Listar todas as rifas ativas
  static async getAllRifas(): Promise<Rifa[]> {
    try {
      const { data, error } = await supabase
        .from('rifas')
        .select(`
          *,
          users!rifas_criador_id_fkey(nome, email)
        `)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar rifas:', error);
      throw new Error('Erro ao buscar rifas');
    }
  }

  // GET /api/rifas/:id - Buscar rifa específica
  static async getRifaById(id: string): Promise<Rifa | null> {
    try {
      const { data, error } = await supabase
        .from('rifas')
        .select(`
          *,
          users!rifas_criador_id_fkey(nome, email, telefone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar rifa:', error);
      throw new Error('Erro ao buscar rifa');
    }
  }

  // GET /api/rifas/user/:userId - Buscar rifas do usuário
  static async getUserRifas(userId: string): Promise<Rifa[]> {
    try {
      const { data, error } = await supabase
        .from('rifas')
        .select('*')
        .eq('criador_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar rifas do usuário:', error);
      throw new Error('Erro ao buscar rifas do usuário');
    }
  }

  // POST /api/rifas - Criar nova rifa
  static async createRifa(rifaData: RifaInsert): Promise<Rifa> {
    try {
      const { data, error } = await supabase
        .from('rifas')
        .insert(rifaData)
        .select()
        .single();

      if (error) throw error;

      // Criar bilhetes para a rifa
      await this.createBilhetes(data.id, data.quantidade_bilhetes);

      return data;
    } catch (error) {
      console.error('Erro ao criar rifa:', error);
      throw new Error('Erro ao criar rifa');
    }
  }

  // PUT /api/rifas/:id - Atualizar rifa
  static async updateRifa(id: string, updates: RifaUpdate): Promise<Rifa> {
    try {
      const { data, error } = await supabase
        .from('rifas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar rifa:', error);
      throw new Error('Erro ao atualizar rifa');
    }
  }

  // DELETE /api/rifas/:id - Deletar rifa
  static async deleteRifa(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rifas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar rifa:', error);
      throw new Error('Erro ao deletar rifa');
    }
  }

  // GET /api/rifas/:id/bilhetes - Buscar bilhetes da rifa
  static async getBilhetes(rifaId: string): Promise<BilheteRifa[]> {
    try {
      const { data, error } = await supabase
        .from('bilhetes_rifa')
        .select('*')
        .eq('rifa_id', rifaId)
        .order('numero', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar bilhetes:', error);
      throw new Error('Erro ao buscar bilhetes');
    }
  }

  // POST /api/rifas/:id/bilhetes - Comprar bilhetes
  static async comprarBilhetes(
    rifaId: string,
    numeros: number[],
    compradorInfo: {
      nome: string;
      telefone: string;
      cpf: string;
    }
  ): Promise<BilheteRifa[]> {
    try {
      // Verificar se os números estão disponíveis
      const { data: existingBilhetes, error: checkError } = await supabase
        .from('bilhetes_rifa')
        .select('numero')
        .eq('rifa_id', rifaId)
        .in('numero', numeros)
        .not('comprador_nome', 'is', null);

      if (checkError) throw checkError;

      if (existingBilhetes && existingBilhetes.length > 0) {
        const numerosOcupados = existingBilhetes.map(b => b.numero);
        throw new Error(`Números já ocupados: ${numerosOcupados.join(', ')}`);
      }

      // Atualizar bilhetes com informações do comprador
      const { data, error } = await supabase
        .from('bilhetes_rifa')
        .update({
          comprador_nome: compradorInfo.nome,
          comprador_telefone: compradorInfo.telefone,
          comprador_cpf: compradorInfo.cpf,
          status: 'reservado'
        })
        .eq('rifa_id', rifaId)
        .in('numero', numeros)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao comprar bilhetes:', error);
      throw new Error('Erro ao comprar bilhetes');
    }
  }

  // PUT /api/rifas/:id/bilhetes/:numero/autorizar - Autorizar bilhete
  static async autorizarBilhete(rifaId: string, numero: number): Promise<BilheteRifa> {
    try {
      const { data, error } = await supabase
        .from('bilhetes_rifa')
        .update({ status: 'confirmado' })
        .eq('rifa_id', rifaId)
        .eq('numero', numero)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao autorizar bilhete:', error);
      throw new Error('Erro ao autorizar bilhete');
    }
  }

  // DELETE /api/rifas/:id/bilhetes/:numero - Liberar bilhete
  static async liberarBilhete(rifaId: string, numero: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('bilhetes_rifa')
        .update({
          comprador_nome: null,
          comprador_telefone: null,
          comprador_cpf: null,
          status: 'reservado'
        })
        .eq('rifa_id', rifaId)
        .eq('numero', numero);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao liberar bilhete:', error);
      throw new Error('Erro ao liberar bilhete');
    }
  }

  // Função auxiliar para criar bilhetes
  private static async createBilhetes(rifaId: string, quantidade: number): Promise<void> {
    try {
      const bilhetes: BilheteRifaInsert[] = [];
      
      for (let i = 1; i <= quantidade; i++) {
        bilhetes.push({
          rifa_id: rifaId,
          numero: i,
          status: 'reservado'
        });
      }

      const { error } = await supabase
        .from('bilhetes_rifa')
        .insert(bilhetes);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao criar bilhetes:', error);
      throw new Error('Erro ao criar bilhetes');
    }
  }

  // Buscar estatísticas da rifa
  static async getRifaStats(rifaId: string): Promise<{
    totalBilhetes: number;
    bilhetesVendidos: number;
    bilhetesReservados: number;
    bilhetesDisponiveis: number;
    percentualVendido: number;
  }> {
    try {
      const { data: rifa } = await supabase
        .from('rifas')
        .select('quantidade_bilhetes')
        .eq('id', rifaId)
        .single();

      const { data: bilhetes } = await supabase
        .from('bilhetes_rifa')
        .select('status')
        .eq('rifa_id', rifaId);

      if (!rifa || !bilhetes) {
        throw new Error('Rifa não encontrada');
      }

      const totalBilhetes = rifa.quantidade_bilhetes;
      const bilhetesVendidos = bilhetes.filter(b => b.status === 'confirmado').length;
      const bilhetesReservados = bilhetes.filter(b => b.status === 'reservado' && bilhetes.find(bil => bil.status === 'reservado')).length;
      const bilhetesDisponiveis = totalBilhetes - bilhetesVendidos - bilhetesReservados;
      const percentualVendido = Math.round((bilhetesVendidos / totalBilhetes) * 100);

      return {
        totalBilhetes,
        bilhetesVendidos,
        bilhetesReservados,
        bilhetesDisponiveis,
        percentualVendido
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas da rifa');
    }
  }
}