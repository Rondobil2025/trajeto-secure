CREATE POLICY "Allow authenticated update blitz_itens"
ON public.blitz_itens
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);