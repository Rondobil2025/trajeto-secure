
-- Create storage bucket for blitz photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('blitz-fotos', 'blitz-fotos', true);

-- Allow public read
CREATE POLICY "Allow public read blitz-fotos" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'blitz-fotos');

-- Allow authenticated upload
CREATE POLICY "Allow authenticated upload blitz-fotos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blitz-fotos');

-- Allow anon upload (for unauthenticated portal users)
CREATE POLICY "Allow anon upload blitz-fotos" ON storage.objects
FOR INSERT TO anon WITH CHECK (bucket_id = 'blitz-fotos');

-- Add photo columns to blitz table
ALTER TABLE public.blitz
ADD COLUMN foto_veiculo_url text,
ADD COLUMN foto_cnh_url text,
ADD COLUMN foto_placa_url text,
ADD COLUMN fotos_anomalia_urls text[] DEFAULT '{}';
