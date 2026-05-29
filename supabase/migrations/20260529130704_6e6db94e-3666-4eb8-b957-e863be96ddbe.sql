ALTER TABLE public.liderancas ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_liderancas_updated_at
BEFORE UPDATE ON public.liderancas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();