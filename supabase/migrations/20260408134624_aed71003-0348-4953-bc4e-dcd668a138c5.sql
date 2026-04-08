
-- Table: liderancas
CREATE TABLE public.liderancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf text NOT NULL UNIQUE,
  email text DEFAULT '',
  setor text NOT NULL DEFAULT '',
  senha_hash text DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.liderancas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read liderancas" ON public.liderancas FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert liderancas" ON public.liderancas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update liderancas" ON public.liderancas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Table: blitz
CREATE TABLE public.blitz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  lideranca_id uuid REFERENCES public.liderancas(id),
  lideranca_nome text NOT NULL DEFAULT '',
  colaborador_id uuid REFERENCES public.colaboradores(id),
  colaborador_nome text NOT NULL DEFAULT '',
  colaborador_cpf text NOT NULL DEFAULT '',
  veiculo_tipo text NOT NULL DEFAULT 'carro',
  status text NOT NULL DEFAULT 'conforme',
  observacoes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blitz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read blitz" ON public.blitz FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert blitz" ON public.blitz FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update blitz" ON public.blitz FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Table: blitz_itens
CREATE TABLE public.blitz_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blitz_id uuid REFERENCES public.blitz(id) ON DELETE CASCADE NOT NULL,
  pergunta text NOT NULL,
  resposta text NOT NULL DEFAULT 'na',
  observacao text DEFAULT '',
  critico boolean NOT NULL DEFAULT false
);

ALTER TABLE public.blitz_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read blitz_itens" ON public.blitz_itens FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert blitz_itens" ON public.blitz_itens FOR INSERT TO authenticated WITH CHECK (true);

-- Table: planos_acao
CREATE TABLE public.planos_acao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  blitz_id uuid REFERENCES public.blitz(id),
  colaborador_nome text NOT NULL DEFAULT '',
  colaborador_cpf text NOT NULL DEFAULT '',
  veiculo_tipo text NOT NULL DEFAULT '',
  descricao_anomalia text NOT NULL DEFAULT '',
  acao_corretiva text NOT NULL DEFAULT '',
  prazo date NOT NULL,
  prioridade text NOT NULL DEFAULT 'media',
  status text NOT NULL DEFAULT 'aberto',
  responsavel text NOT NULL DEFAULT '',
  evidencia_url text,
  data_conclusao date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read planos_acao" ON public.planos_acao FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert planos_acao" ON public.planos_acao FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update planos_acao" ON public.planos_acao FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Table: termos_ciencia
CREATE TABLE public.termos_ciencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blitz_id uuid REFERENCES public.blitz(id),
  plano_acao_id uuid REFERENCES public.planos_acao(id),
  colaborador_nome text NOT NULL DEFAULT '',
  colaborador_cpf text NOT NULL DEFAULT '',
  descricao text NOT NULL DEFAULT '',
  assinatura_url text,
  assinado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.termos_ciencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read termos_ciencia" ON public.termos_ciencia FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert termos_ciencia" ON public.termos_ciencia FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for blitz table
ALTER PUBLICATION supabase_realtime ADD TABLE public.blitz;
ALTER PUBLICATION supabase_realtime ADD TABLE public.planos_acao;
