
-- Create monthly transport tracking table
CREATE TABLE public.colaborador_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL,
  ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  tipo_transporte text NOT NULL DEFAULT 'N/A',
  observacao text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(colaborador_id, ano, mes)
);

ALTER TABLE public.colaborador_mensal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read colaborador_mensal"
ON public.colaborador_mensal FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert colaborador_mensal"
ON public.colaborador_mensal FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update colaborador_mensal"
ON public.colaborador_mensal FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Add curso_direcao_defensiva to colaboradores
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS curso_direcao_defensiva boolean DEFAULT false;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS curso_direcao_defensiva_data date DEFAULT NULL;
