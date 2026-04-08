import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ColaboradorMensal {
  id: string;
  colaborador_id: string;
  ano: number;
  mes: number;
  tipo_transporte: string;
  observacao: string;
}

export function useColaboradorMensal(ano: number) {
  return useQuery({
    queryKey: ['colaborador_mensal', ano],
    queryFn: async (): Promise<ColaboradorMensal[]> => {
      const { data, error } = await supabase
        .from('colaborador_mensal' as any)
        .select('*')
        .eq('ano', ano);
      if (error) throw error;
      return (data as any) || [];
    },
  });
}
