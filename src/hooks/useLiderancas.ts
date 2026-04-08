import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiderancaDB {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  setor: string;
  ativo: boolean;
  created_at: string;
}

export function useLiderancas() {
  return useQuery({
    queryKey: ['liderancas'],
    queryFn: async (): Promise<LiderancaDB[]> => {
      const { data, error } = await supabase
        .from('liderancas' as any)
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return (data as any) || [];
    },
  });
}
