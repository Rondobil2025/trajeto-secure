ALTER TABLE public.colaboradores
  ADD COLUMN IF NOT EXISTS curso_teorico boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS curso_teorico_data date,
  ADD COLUMN IF NOT EXISTS curso_pratico boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS curso_pratico_data date;