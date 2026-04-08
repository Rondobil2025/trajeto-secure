import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlanoAcaoDB {
  id: string;
  codigo: string;
  blitz_id: string | null;
  colaborador_nome: string;
  colaborador_cpf: string;
  veiculo_tipo: string;
  descricao_anomalia: string;
  acao_corretiva: string;
  prazo: string;
  prioridade: string;
  status: string;
  responsavel: string;
  evidencia_url: string | null;
  data_conclusao: string | null;
  created_at: string;
}

export function usePlanosAcao() {
  return useQuery({
    queryKey: ['planos_acao'],
    queryFn: async (): Promise<PlanoAcaoDB[]> => {
      const { data, error } = await supabase
        .from('planos_acao' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
  });
}
