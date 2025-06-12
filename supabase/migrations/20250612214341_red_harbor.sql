/*
  # Schema Completo do Sistema de Rifas
  
  1. Tabelas Criadas:
     - users: Usuários com planos e informações de pagamento
     - rifas: Rifas criadas pelos usuários
     - campanhas: Campanhas promocionais
     - bilhetes_rifa: Bilhetes individuais das rifas
     - bilhetes_campanha: Bilhetes das campanhas
     - pagamentos: Controle de pagamentos
  
  2. Storage Buckets:
     - rifas_fotos: Imagens das rifas
     - campanhas_fotos: Imagens das campanhas
  
  3. Políticas de Segurança:
     - RLS habilitado em todas as tabelas
     - Controle de acesso baseado em planos
     - Visitantes podem comprar sem login
  
  4. Relacionamentos:
     - Chaves estrangeiras apropriadas
     - Constraints de integridade
     - Índices para performance
*/

-- Limpar schema existente (cuidadosamente)
DROP TABLE IF EXISTS raffle_numbers CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS raffles CASCADE;
DROP TABLE IF EXISTS campaign_tickets CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- Remover tipos existentes
DROP TYPE IF EXISTS raffle_status CASCADE;
DROP TYPE IF EXISTS number_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS campaign_status CASCADE;
DROP TYPE IF EXISTS campaign_mode CASCADE;
DROP TYPE IF EXISTS campaign_ticket_status CASCADE;

-- Criar novos tipos
CREATE TYPE plano_tipo AS ENUM ('economico', 'padrao', 'premium');
CREATE TYPE status_rifa AS ENUM ('ativa', 'encerrada', 'aguardando_pagamento');
CREATE TYPE status_campanha AS ENUM ('ativa', 'encerrada', 'pausada');
CREATE TYPE modo_campanha AS ENUM ('simples', 'combo');
CREATE TYPE status_bilhete AS ENUM ('reservado', 'confirmado', 'liberado');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'confirmado', 'recusado');
CREATE TYPE tipo_pagamento AS ENUM ('rifa', 'campanha');

-- 1. Tabela users (estende auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text,
  cpf text UNIQUE,
  plano plano_tipo,
  rifas_criadas integer DEFAULT 0,
  campanhas_criadas integer DEFAULT 0,
  chave_pix text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Tabela rifas
CREATE TABLE IF NOT EXISTS rifas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text NOT NULL,
  quantidade_bilhetes integer NOT NULL CHECK (quantidade_bilhetes > 0),
  valor_bilhete numeric NOT NULL CHECK (valor_bilhete > 0),
  imagem_url text,
  chave_pix text NOT NULL,
  status status_rifa DEFAULT 'ativa',
  premiado_bilhete integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Tabela campanhas
CREATE TABLE IF NOT EXISTS campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text NOT NULL,
  modo modo_campanha DEFAULT 'simples',
  preco_por_bilhete numeric NOT NULL CHECK (preco_por_bilhete > 0),
  regra_combo jsonb, -- Ex: {"valor": 5, "bilhetes": 20}
  destaque boolean DEFAULT false,
  quantidade_bilhetes integer NOT NULL CHECK (quantidade_bilhetes > 0),
  imagem_url text,
  chave_pix text NOT NULL,
  status status_campanha DEFAULT 'ativa',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Tabela bilhetes_rifa
CREATE TABLE IF NOT EXISTS bilhetes_rifa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rifa_id uuid NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
  numero integer NOT NULL,
  comprador_nome text,
  comprador_telefone text,
  comprador_cpf text,
  status status_bilhete DEFAULT 'reservado',
  created_at timestamptz DEFAULT now(),
  UNIQUE(rifa_id, numero)
);

-- 5. Tabela bilhetes_campanha
CREATE TABLE IF NOT EXISTS bilhetes_campanha (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id uuid NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  numero integer NOT NULL,
  comprador_nome text,
  comprador_telefone text,
  comprador_cpf text,
  status status_bilhete DEFAULT 'reservado',
  created_at timestamptz DEFAULT now(),
  UNIQUE(campanha_id, numero)
);

-- 6. Tabela pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo tipo_pagamento NOT NULL,
  referencia_id uuid NOT NULL, -- rifa_id ou campanha_id
  comprador_nome text NOT NULL,
  comprador_cpf text NOT NULL,
  telefone text NOT NULL,
  status status_pagamento DEFAULT 'pendente',
  chave_pix text NOT NULL,
  comprovante_url text,
  valor_total numeric NOT NULL,
  bilhetes_quantidade integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_rifas_criador ON rifas(criador_id);
CREATE INDEX idx_rifas_status ON rifas(status);
CREATE INDEX idx_campanhas_criador ON campanhas(criador_id);
CREATE INDEX idx_campanhas_status ON campanhas(status);
CREATE INDEX idx_campanhas_destaque ON campanhas(destaque);
CREATE INDEX idx_bilhetes_rifa_rifa_id ON bilhetes_rifa(rifa_id);
CREATE INDEX idx_bilhetes_rifa_status ON bilhetes_rifa(status);
CREATE INDEX idx_bilhetes_campanha_campanha_id ON bilhetes_campanha(campanha_id);
CREATE INDEX idx_bilhetes_campanha_status ON bilhetes_campanha(status);
CREATE INDEX idx_pagamentos_tipo_referencia ON pagamentos(tipo, referencia_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilhetes_rifa ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilhetes_campanha ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para rifas
CREATE POLICY "Anyone can view active rifas" ON rifas
  FOR SELECT USING (status = 'ativa' OR auth.uid() = criador_id);

CREATE POLICY "Users with plan can create rifas" ON rifas
  FOR INSERT WITH CHECK (
    auth.uid() = criador_id AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND plano IS NOT NULL
    )
  );

CREATE POLICY "Users can update own rifas" ON rifas
  FOR UPDATE USING (auth.uid() = criador_id);

CREATE POLICY "Users can delete own rifas" ON rifas
  FOR DELETE USING (auth.uid() = criador_id);

-- Políticas para campanhas
CREATE POLICY "Anyone can view active campanhas" ON campanhas
  FOR SELECT USING (status = 'ativa' OR auth.uid() = criador_id);

CREATE POLICY "Users with plan can create campanhas" ON campanhas
  FOR INSERT WITH CHECK (
    auth.uid() = criador_id AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND plano IS NOT NULL
    )
  );

CREATE POLICY "Users can update own campanhas" ON campanhas
  FOR UPDATE USING (auth.uid() = criador_id);

CREATE POLICY "Users can delete own campanhas" ON campanhas
  FOR DELETE USING (auth.uid() = criador_id);

-- Políticas para bilhetes_rifa
CREATE POLICY "Anyone can view bilhetes_rifa" ON bilhetes_rifa
  FOR SELECT USING (true);

CREATE POLICY "Anyone can buy bilhetes_rifa" ON bilhetes_rifa
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Rifa owners can update bilhetes" ON bilhetes_rifa
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rifas 
      WHERE rifas.id = bilhetes_rifa.rifa_id 
      AND rifas.criador_id = auth.uid()
    )
  );

-- Políticas para bilhetes_campanha
CREATE POLICY "Anyone can view bilhetes_campanha" ON bilhetes_campanha
  FOR SELECT USING (true);

CREATE POLICY "Anyone can buy bilhetes_campanha" ON bilhetes_campanha
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Campanha owners can update bilhetes" ON bilhetes_campanha
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campanhas 
      WHERE campanhas.id = bilhetes_campanha.campanha_id 
      AND campanhas.criador_id = auth.uid()
    )
  );

-- Políticas para pagamentos
CREATE POLICY "Anyone can create pagamentos" ON pagamentos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view pagamentos" ON pagamentos
  FOR SELECT USING (
    (tipo = 'rifa' AND EXISTS (
      SELECT 1 FROM rifas 
      WHERE rifas.id = pagamentos.referencia_id 
      AND rifas.criador_id = auth.uid()
    )) OR
    (tipo = 'campanha' AND EXISTS (
      SELECT 1 FROM campanhas 
      WHERE campanhas.id = pagamentos.referencia_id 
      AND campanhas.criador_id = auth.uid()
    ))
  );

CREATE POLICY "Owners can update pagamentos" ON pagamentos
  FOR UPDATE USING (
    (tipo = 'rifa' AND EXISTS (
      SELECT 1 FROM rifas 
      WHERE rifas.id = pagamentos.referencia_id 
      AND rifas.criador_id = auth.uid()
    )) OR
    (tipo = 'campanha' AND EXISTS (
      SELECT 1 FROM campanhas 
      WHERE campanhas.id = pagamentos.referencia_id 
      AND campanhas.criador_id = auth.uid()
    ))
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rifas_updated_at
  BEFORE UPDATE ON rifas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campanhas_updated_at
  BEFORE UPDATE ON campanhas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar limites do plano
CREATE OR REPLACE FUNCTION check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_plan plano_tipo;
  current_rifas integer;
  current_campanhas integer;
  max_rifas integer;
  max_campanhas integer;
  max_bilhetes integer;
BEGIN
  -- Buscar plano do usuário
  SELECT plano INTO user_plan FROM public.users WHERE id = NEW.criador_id;
  
  IF user_plan IS NULL THEN
    RAISE EXCEPTION 'Usuário deve ter um plano ativo para criar rifas/campanhas';
  END IF;
  
  -- Definir limites por plano
  CASE user_plan
    WHEN 'economico' THEN
      max_rifas := 2;
      max_campanhas := 2;
      max_bilhetes := 100000;
    WHEN 'padrao' THEN
      max_rifas := 5;
      max_campanhas := 5;
      max_bilhetes := 500000;
    WHEN 'premium' THEN
      max_rifas := 10;
      max_campanhas := 10;
      max_bilhetes := 1000000;
  END CASE;
  
  -- Verificar limites para rifas
  IF TG_TABLE_NAME = 'rifas' THEN
    SELECT COUNT(*) INTO current_rifas FROM rifas WHERE criador_id = NEW.criador_id;
    
    IF current_rifas >= max_rifas THEN
      RAISE EXCEPTION 'Limite de rifas atingido para o plano %', user_plan;
    END IF;
    
    IF NEW.quantidade_bilhetes > max_bilhetes THEN
      RAISE EXCEPTION 'Quantidade de bilhetes excede o limite do plano %', user_plan;
    END IF;
  END IF;
  
  -- Verificar limites para campanhas
  IF TG_TABLE_NAME = 'campanhas' THEN
    SELECT COUNT(*) INTO current_campanhas FROM campanhas WHERE criador_id = NEW.criador_id;
    
    IF current_campanhas >= max_campanhas THEN
      RAISE EXCEPTION 'Limite de campanhas atingido para o plano %', user_plan;
    END IF;
    
    IF NEW.quantidade_bilhetes > max_bilhetes THEN
      RAISE EXCEPTION 'Quantidade de bilhetes excede o limite do plano %', user_plan;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para verificar limites
CREATE TRIGGER check_rifa_limits
  BEFORE INSERT ON rifas
  FOR EACH ROW EXECUTE FUNCTION check_plan_limits();

CREATE TRIGGER check_campanha_limits
  BEFORE INSERT ON campanhas
  FOR EACH ROW EXECUTE FUNCTION check_plan_limits();

-- Função para atualizar contadores
CREATE OR REPLACE FUNCTION update_user_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'rifas' THEN
      UPDATE public.users SET rifas_criadas = rifas_criadas + 1 WHERE id = NEW.criador_id;
    ELSIF TG_TABLE_NAME = 'campanhas' THEN
      UPDATE public.users SET campanhas_criadas = campanhas_criadas + 1 WHERE id = NEW.criador_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'rifas' THEN
      UPDATE public.users SET rifas_criadas = rifas_criadas - 1 WHERE id = OLD.criador_id;
    ELSIF TG_TABLE_NAME = 'campanhas' THEN
      UPDATE public.users SET campanhas_criadas = campanhas_criadas - 1 WHERE id = OLD.criador_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para contadores
CREATE TRIGGER update_rifa_counter
  AFTER INSERT OR DELETE ON rifas
  FOR EACH ROW EXECUTE FUNCTION update_user_counters();

CREATE TRIGGER update_campanha_counter
  AFTER INSERT OR DELETE ON campanhas
  FOR EACH ROW EXECUTE FUNCTION update_user_counters();

-- Criar storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('rifas_fotos', 'rifas_fotos', true),
  ('campanhas_fotos', 'campanhas_fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('rifas_fotos', 'campanhas_fotos'));

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('rifas_fotos', 'campanhas_fotos') AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('rifas_fotos', 'campanhas_fotos') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('rifas_fotos', 'campanhas_fotos') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );