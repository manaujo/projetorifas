export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          cpf: string | null;
          plano: 'economico' | 'padrao' | 'premium' | null;
          rifas_criadas: number;
          campanhas_criadas: number;
          chave_pix: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          telefone?: string | null;
          cpf?: string | null;
          plano?: 'economico' | 'padrao' | 'premium' | null;
          rifas_criadas?: number;
          campanhas_criadas?: number;
          chave_pix?: string | null;
        };
        Update: {
          nome?: string;
          email?: string;
          telefone?: string | null;
          cpf?: string | null;
          plano?: 'economico' | 'padrao' | 'premium' | null;
          rifas_criadas?: number;
          campanhas_criadas?: number;
          chave_pix?: string | null;
        };
      };
      rifas: {
        Row: {
          id: string;
          criador_id: string;
          titulo: string;
          descricao: string;
          quantidade_bilhetes: number;
          valor_bilhete: number;
          imagem_url: string | null;
          chave_pix: string;
          status: 'ativa' | 'encerrada' | 'aguardando_pagamento';
          premiado_bilhete: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          criador_id: string;
          titulo: string;
          descricao: string;
          quantidade_bilhetes: number;
          valor_bilhete: number;
          imagem_url?: string | null;
          chave_pix: string;
          status?: 'ativa' | 'encerrada' | 'aguardando_pagamento';
          premiado_bilhete?: number | null;
        };
        Update: {
          titulo?: string;
          descricao?: string;
          quantidade_bilhetes?: number;
          valor_bilhete?: number;
          imagem_url?: string | null;
          chave_pix?: string;
          status?: 'ativa' | 'encerrada' | 'aguardando_pagamento';
          premiado_bilhete?: number | null;
        };
      };
      campanhas: {
        Row: {
          id: string;
          criador_id: string;
          titulo: string;
          descricao: string;
          modo: 'simples' | 'combo';
          preco_por_bilhete: number;
          regra_combo: any | null;
          destaque: boolean;
          quantidade_bilhetes: number;
          imagem_url: string | null;
          chave_pix: string;
          status: 'ativa' | 'encerrada' | 'pausada';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          criador_id: string;
          titulo: string;
          descricao: string;
          modo?: 'simples' | 'combo';
          preco_por_bilhete: number;
          regra_combo?: any | null;
          destaque?: boolean;
          quantidade_bilhetes: number;
          imagem_url?: string | null;
          chave_pix: string;
          status?: 'ativa' | 'encerrada' | 'pausada';
        };
        Update: {
          titulo?: string;
          descricao?: string;
          modo?: 'simples' | 'combo';
          preco_por_bilhete?: number;
          regra_combo?: any | null;
          destaque?: boolean;
          quantidade_bilhetes?: number;
          imagem_url?: string | null;
          chave_pix?: string;
          status?: 'ativa' | 'encerrada' | 'pausada';
        };
      };
      bilhetes_rifa: {
        Row: {
          id: string;
          rifa_id: string;
          numero: number;
          comprador_nome: string | null;
          comprador_telefone: string | null;
          comprador_cpf: string | null;
          status: 'reservado' | 'confirmado' | 'liberado';
          created_at: string;
        };
        Insert: {
          rifa_id: string;
          numero: number;
          comprador_nome?: string | null;
          comprador_telefone?: string | null;
          comprador_cpf?: string | null;
          status?: 'reservado' | 'confirmado' | 'liberado';
        };
        Update: {
          comprador_nome?: string | null;
          comprador_telefone?: string | null;
          comprador_cpf?: string | null;
          status?: 'reservado' | 'confirmado' | 'liberado';
        };
      };
      bilhetes_campanha: {
        Row: {
          id: string;
          campanha_id: string;
          numero: number;
          comprador_nome: string | null;
          comprador_telefone: string | null;
          comprador_cpf: string | null;
          status: 'reservado' | 'confirmado' | 'liberado';
          created_at: string;
        };
        Insert: {
          campanha_id: string;
          numero: number;
          comprador_nome?: string | null;
          comprador_telefone?: string | null;
          comprador_cpf?: string | null;
          status?: 'reservado' | 'confirmado' | 'liberado';
        };
        Update: {
          comprador_nome?: string | null;
          comprador_telefone?: string | null;
          comprador_cpf?: string | null;
          status?: 'reservado' | 'confirmado' | 'liberado';
        };
      };
      pagamentos: {
        Row: {
          id: string;
          tipo: 'rifa' | 'campanha';
          referencia_id: string;
          comprador_nome: string;
          comprador_cpf: string;
          telefone: string;
          status: 'pendente' | 'confirmado' | 'recusado';
          chave_pix: string;
          comprovante_url: string | null;
          valor_total: number;
          bilhetes_quantidade: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tipo: 'rifa' | 'campanha';
          referencia_id: string;
          comprador_nome: string;
          comprador_cpf: string;
          telefone: string;
          status?: 'pendente' | 'confirmado' | 'recusado';
          chave_pix: string;
          comprovante_url?: string | null;
          valor_total: number;
          bilhetes_quantidade: number;
        };
        Update: {
          status?: 'pendente' | 'confirmado' | 'recusado';
          comprovante_url?: string | null;
        };
      };
    };
  };
}