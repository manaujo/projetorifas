import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Campanha = Database['public']['Tables']['campanhas']['Row'];
type CampanhaInsert = Database['public']['Tables']['campanhas']['Insert'];
type CampanhaUpdate = Database['public']['Tables']['campanhas']['Update'];
type BilheteCampanha = Database['public']['Tables']['bilhetes_campanha']['Row'];
type BilheteCampanhaInsert = Database['public']['Tables']['bilhetes_campanha']['Insert'];

export class CampanhaService {
  // GET /api/campanhas - Listar todas as campanhas ativas
  static async getAllCampanhas(): Promise<Campanha[]> {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .select(`
          *,
          users!campanhas_criador_id_fkey(nome, email)
        `)
        .eq('status', 'ativa')
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
      throw new Error('Erro ao buscar campanhas');
    }
  }

  // GET /api/campanhas/destaque - Listar campanhas em destaque
  static async getCampanhasDestaque(): Promise<Campanha[]> {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .select(`
          *,
          users!campanhas_criador_id_fkey(nome, email)
        `)
        .eq('status', 'ativa')
        .eq('destaque', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar campanhas em destaque:', error);
      throw new Error('Erro ao buscar campanhas em destaque');
    }
  }

  // GET /api/campanhas/:id - Buscar campanha específica
  static async getCampanhaById(id: string): Promise<Campanha | null> {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .select(`
          *,
          users!campanhas_criador_id_fkey(nome, email, telefone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar campanha:', error);
      throw new Error('Erro ao buscar campanha');
    }
  }

  // GET /api/campanhas/user/:userId - Buscar campanhas do usuário
  static async getUserCampanhas(userId: string): Promise<Campanha[]> {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .select('*')
        .eq('criador_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar campanhas do usuário:', error);
      throw new Error('Erro ao buscar campanhas do usuário');
    }
  }

  // POST /api/campanhas - Criar nova campanha
  static async createCampanha(campanhaData: CampanhaInsert): Promise<Campanha> {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .insert(campanhaData)
        .select()
        .single();

      if (error) throw error;

      // Criar bilhetes para a campanha
      await this.createBilhetes(data.id, data.quantidade_bilhetes);

      return data;
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw new Error('Erro ao criar campanha');
    }
  }

  // PUT /api/campanhas/:id - Atualizar campanha
  static async updateCampanha(id: string, updates: CampanhaUpdate): Promise<Campanha> {
    try {
      const { data, error } = await supabase
        .from('campanhas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      throw new Error('Erro ao atualizar campanha');
    }
  }

  // DELETE /api/campanhas/:id - Deletar campanha
  static async deleteCampanha(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('campanhas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
      throw new Error('Erro ao deletar campanha');
    }
  }

  // GET /api/campanhas/:id/bilhetes - Buscar bilhetes da campanha
  static async getBilhetes(campanhaId: string): Promise<BilheteCampanha[]> {
    try {
      const { data, error } = await supabase
        .from('bilhetes_campanha')
        .select('*')
        .eq('campanha_id', campanhaId)
        .order('numero', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar bilhetes:', error);
      throw new Error('Erro ao buscar bilhetes');
    }
  }

  // POST /api/campanhas/:id/bilhetes - Comprar bilhetes
  static async comprarBilhetes(
    campanhaId: string,
    quantidade: number,
    compradorInfo: {
      nome: string;
      telefone: string;
      cpf: string;
    }
  ): Promise<BilheteCampanha[]> {
    try {
      // Buscar bilhetes disponíveis
      const { data: bilhetesDisponiveis, error: searchError } = await supabase
        .from('bilhetes_campanha')
        .select('numero')
        .eq('campanha_id', campanhaId)
        .is('comprador_nome', null)
        .limit(quantidade);

      if (searchError) throw searchError;

      if (!bilhetesDisponiveis || bilhetesDisponiveis.length < quantidade) {
        throw new Error('Não há bilhetes suficientes disponíveis');
      }

      const numeros = bilhetesDisponiveis.map(b => b.numero);

      // Atualizar bilhetes com informações do comprador
      const { data, error } = await supabase
        .from('bilhetes_campanha')
        .update({
          comprador_nome: compradorInfo.nome,
          comprador_telefone: compradorInfo.telefone,
          comprador_cpf: compradorInfo.cpf,
          status: 'reservado'
        })
        .eq('campanha_id', campanhaId)
        .in('numero', numeros)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao comprar bilhetes:', error);
      throw new Error('Erro ao comprar bilhetes');
    }
  }

  // PUT /api/campanhas/:id/bilhetes/confirmar - Confirmar pagamento dos bilhetes
  static async confirmarPagamento(
    campanhaId: string,
    numeros: number[]
  ): Promise<BilheteCampanha[]> {
    try {
      const { data, error } = await supabase
        .from('bilhetes_campanha')
        .update({ status: 'confirmado' })
        .eq('campanha_id', campanhaId)
        .in('numero', numeros)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      throw new Error('Erro ao confirmar pagamento');
    }
  }

  // Função auxiliar para criar bilhetes
  private static async createBilhetes(campanhaId: string, quantidade: number): Promise<void> {
    try {
      const bilhetes: BilheteCampanhaInsert[] = [];
      
      for (let i = 1; i <= quantidade; i++) {
        bilhetes.push({
          campanha_id: campanhaId,
          numero: i,
          status: 'reservado'
        });
      }

      const { error } = await supabase
        .from('bilhetes_campanha')
        .insert(bilhetes);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao criar bilhetes:', error);
      throw new Error('Erro ao criar bilhetes');
    }
  }

  // Buscar estatísticas da campanha
  static async getCampanhaStats(campanhaId: string): Promise<{
    totalBilhetes: number;
    bilhetesVendidos: number;
    bilhetesReservados: number;
    bilhetesDisponiveis: number;
    percentualVendido: number;
    ranking: Array<{
      nome: string;
      quantidade: number;
      percentual: number;
    }>;
  }> {
    try {
      const { data: campanha } = await supabase
        .from('campanhas')
        .select('quantidade_bilhetes')
        .eq('id', campanhaId)
        .single();

      const { data: bilhetes } = await supabase
        .from('bilhetes_campanha')
        .select('status, comprador_nome')
        .eq('campanha_id', campanhaId);

      if (!campanha || !bilhetes) {
        throw new Error('Campanha não encontrada');
      }

      const totalBilhetes = campanha.quantidade_bilhetes;
      const bilhetesVendidos = bilhetes.filter(b => b.status === 'confirmado').length;
      const bilhetesReservados = bilhetes.filter(b => b.status === 'reservado' && b.comprador_nome).length;
      const bilhetesDisponiveis = totalBilhetes - bilhetesVendidos - bilhetesReservados;
      const percentualVendido = Math.round((bilhetesVendidos / totalBilhetes) * 100);

      // Calcular ranking
      const compradores: { [key: string]: number } = {};
      bilhetes
        .filter(b => b.status === 'confirmado' && b.comprador_nome)
        .forEach(b => {
          if (b.comprador_nome) {
            compradores[b.comprador_nome] = (compradores[b.comprador_nome] || 0) + 1;
          }
        });

      const ranking = Object.entries(compradores)
        .map(([nome, quantidade]) => ({
          nome,
          quantidade,
          percentual: Math.round((quantidade / bilhetesVendidos) * 100)
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      return {
        totalBilhetes,
        bilhetesVendidos,
        bilhetesReservados,
        bilhetesDisponiveis,
        percentualVendido,
        ranking
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas da campanha');
    }
  }
}