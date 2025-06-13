export interface User {
  id: string;
  email: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  chave_pix?: string;
  plano?: 'economico' | 'padrao' | 'premium';
  plano_ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  max_rifas: number;
  max_campanhas: number;
  max_bilhetes: number;
}

export interface Campanha {
  id: string;
  user_id: string;
  nome: string;
  descricao: string;
  imagem_url?: string;
  destaque: boolean;
  preco_bilhete: number;
  status: 'ativa' | 'finalizada' | 'pausada';
  created_at: string;
  updated_at: string;
  rifas?: Rifa[];
  total_bilhetes?: number;
  bilhetes_vendidos?: number;
  total_arrecadado?: number;
}

export interface Rifa {
  id: string;
  campanha_id?: string;
  user_id: string;
  nome: string;
  descricao: string;
  valor_bilhete: number;
  qtd_bilhetes: number;
  imagem_url?: string;
  bilhete_premiado: number;
  status: 'ativa' | 'finalizada' | 'pausada';
  created_at: string;
  updated_at: string;
  bilhetes?: Bilhete[];
  bilhetes_vendidos?: number;
  total_arrecadado?: number;
}

export interface Bilhete {
  id: string;
  rifa_id: string;
  numero: number;
  comprador_nome?: string;
  cpf?: string;
  telefone?: string;
  status: 'disponivel' | 'pendente' | 'confirmado';
  criado_em: string;
}

export interface Compra {
  id: string;
  bilhete_id: string;
  status_validacao: 'pendente' | 'aprovado' | 'rejeitado';
  comprovante_url?: string;
  data_compra: string;
  bilhete?: Bilhete;
}

export interface Relatorio {
  id: string;
  user_id: string;
  campanha_id?: string;
  total_arrecadado: number;
  total_bilhetes: number;
  criado_em: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}