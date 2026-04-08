
CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  setor TEXT NOT NULL,
  funcao TEXT NOT NULL,
  admissao DATE NOT NULL,
  data_nascimento DATE,
  genero TEXT DEFAULT '',
  email TEXT DEFAULT '',
  contato TEXT DEFAULT '',
  pilar TEXT DEFAULT '',
  veiculo_utilizado TEXT DEFAULT '',
  cnh_numero TEXT DEFAULT '',
  cnh_validade DATE,
  cnh_categoria TEXT DEFAULT '',
  cnh_status TEXT DEFAULT 'sem_cnh',
  data_ultima_blitz DATE,
  aderencia INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to colaboradores"
  ON public.colaboradores FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to colaboradores"
  ON public.colaboradores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to colaboradores"
  ON public.colaboradores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
