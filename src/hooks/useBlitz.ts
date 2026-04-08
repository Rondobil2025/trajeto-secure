import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlitzDB {
  id: string;
  data: string;
  lideranca_id: string | null;
  lideranca_nome: string;
  colaborador_id: string | null;
  colaborador_nome: string;
  colaborador_cpf: string;
  veiculo_tipo: string;
  status: string;
  observacoes: string;
  created_at: string;
}

export function useBlitzList() {
  return useQuery({
    queryKey: ['blitz'],
    queryFn: async (): Promise<BlitzDB[]> => {
      const { data, error } = await supabase
        .from('blitz' as any)
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
  });
}
