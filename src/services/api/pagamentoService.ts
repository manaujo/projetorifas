import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';

type Pagamento = Database['public']['Tables']['pagamentos']['Row'];
type PagamentoInsert = Database['public']['Tables']['pagamentos']['Insert'];
type PagamentoUpdate = Database['public']['Tables']['pagamentos']['Update'];

export class PagamentoService {
  // GET /api/pagamentos - Listar pagamentos do usuário
  static async getPagamentosByUser(userId: string): Promise<Pagamento[]> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          rifas!pagamentos_referencia_id_fkey(titulo),
          campanhas!pagamentos_referencia_id_fkey(titulo)
        `)
        .or(`rifas.criador_id.eq.${userId},campanhas.criador_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw new Error('Erro ao buscar pagamentos');
    }
  }

  // GET /api/pagamentos/:id - Buscar pagamento específico
  static async getPagamentoById(id: string): Promise<Pagamento | null> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      throw new Error('Erro ao buscar pagamento');
    }
  }

  // GET /api/pagamentos/rifa/:rifaId - Buscar pagamentos de uma rifa
  static async getPagamentosByRifa(rifaId: string): Promise<Pagamento[]> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('tipo', 'rifa')
        .eq('referencia_id', rifaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos da rifa:', error);
      throw new Error('Erro ao buscar pagamentos da rifa');
    }
  }

  // GET /api/pagamentos/campanha/:campanhaId - Buscar pagamentos de uma campanha
  static async getPagamentosByCampanha(campanhaId: string): Promise<Pagamento[]> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('tipo', 'campanha')
        .eq('referencia_id', campanhaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos da campanha:', error);
      throw new Error('Erro ao buscar pagamentos da campanha');
    }
  }

  // POST /api/pagamentos - Criar novo pagamento
  static async createPagamento(pagamentoData: PagamentoInsert): Promise<Pagamento> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert(pagamentoData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw new Error('Erro ao criar pagamento');
    }
  }

  // PUT /api/pagamentos/:id/status - Atualizar status do pagamento
  static async updateStatus(
    id: string, 
    status: 'pendente' | 'confirmado' | 'recusado',
    comprovanteUrl?: string
  ): Promise<Pagamento> {
    try {
      const updates: PagamentoUpdate = { status };
      if (comprovanteUrl) {
        updates.comprovante_url = comprovanteUrl;
      }

      const { data, error } = await supabase
        .from('pagamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Se confirmado, atualizar status dos bilhetes
      if (status === 'confirmado') {
        await this.confirmarBilhetes(data);
      } else if (status === 'recusado') {
        await this.liberarBilhetes(data);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw new Error('Erro ao atualizar status do pagamento');
    }
  }

  // DELETE /api/pagamentos/:id - Deletar pagamento
  static async deletePagamento(id: string): Promise<void> {
    try {
      // Primeiro liberar os bilhetes
      const pagamento = await this.getPagamentoById(id);
      if (pagamento) {
        await this.liberarBilhetes(pagamento);
      }

      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      throw new Error('Erro ao deletar pagamento');
    }
  }

  // Função auxiliar para confirmar bilhetes
  private static async confirmarBilhetes(pagamento: Pagamento): Promise<void> {
    try {
      if (pagamento.tipo === 'rifa') {
        // Buscar bilhetes reservados para este comprador
        const { data: bilhetes } = await supabase
          .from('bilhetes_rifa')
          .select('numero')
          .eq('rifa_id', pagamento.referencia_id)
          .eq('comprador_cpf', pagamento.comprador_cpf)
          .eq('status', 'reservado');

        if (bilhetes && bilhetes.length > 0) {
          const numeros = bilhetes.map(b => b.numero);
          await supabase
            .from('bilhetes_rifa')
            .update({ status: 'confirmado' })
            .eq('rifa_id', pagamento.referencia_id)
            .in('numero', numeros);
        }
      } else if (pagamento.tipo === 'campanha') {
        // Buscar bilhetes reservados para este comprador
        const { data: bilhetes } = await supabase
          .from('bilhetes_campanha')
          .select('numero')
          .eq('campanha_id', pagamento.referencia_id)
          .eq('comprador_cpf', pagamento.comprador_cpf)
          .eq('status', 'reservado');

        if (bilhetes && bilhetes.length > 0) {
          const numeros = bilhetes.map(b => b.numero);
          await supabase
            .from('bilhetes_campanha')
            .update({ status: 'confirmado' })
            .eq('campanha_id', pagamento.referencia_id)
            .in('numero', numeros);
        }
      }
    } catch (error) {
      console.error('Erro ao confirmar bilhetes:', error);
    }
  }

  // Função auxiliar para liberar bilhetes
  private static async liberarBilhetes(pagamento: Pagamento): Promise<void> {
    try {
      if (pagamento.tipo === 'rifa') {
        await supabase
          .from('bilhetes_rifa')
          .update({
            comprador_nome: null,
            comprador_telefone: null,
            comprador_cpf: null,
            status: 'reservado'
          })
          .eq('rifa_id', pagamento.referencia_id)
          .eq('comprador_cpf', pagamento.comprador_cpf);
      } else if (pagamento.tipo === 'campanha') {
        await supabase
          .from('bilhetes_campanha')
          .update({
            comprador_nome: null,
            comprador_telefone: null,
            comprador_cpf: null,
            status: 'reservado'
          })
          .eq('campanha_id', pagamento.referencia_id)
          .eq('comprador_cpf', pagamento.comprador_cpf);
      }
    } catch (error) {
      console.error('Erro ao liberar bilhetes:', error);
    }
  }

  // Buscar estatísticas de pagamentos
  static async getPaymentStats(userId: string): Promise<{
    totalPagamentos: number;
    pagamentosPendentes: number;
    pagamentosConfirmados: number;
    pagamentosRecusados: number;
    valorTotal: number;
    valorConfirmado: number;
  }> {
    try {
      const pagamentos = await this.getPagamentosByUser(userId);

      const totalPagamentos = pagamentos.length;
      const pagamentosPendentes = pagamentos.filter(p => p.status === 'pendente').length;
      const pagamentosConfirmados = pagamentos.filter(p => p.status === 'confirmado').length;
      const pagamentosRecusados = pagamentos.filter(p => p.status === 'recusado').length;
      const valorTotal = pagamentos.reduce((sum, p) => sum + p.valor_total, 0);
      const valorConfirmado = pagamentos
        .filter(p => p.status === 'confirmado')
        .reduce((sum, p) => sum + p.valor_total, 0);

      return {
        totalPagamentos,
        pagamentosPendentes,
        pagamentosConfirmados,
        pagamentosRecusados,
        valorTotal,
        valorConfirmado
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas de pagamentos');
    }
  }
}