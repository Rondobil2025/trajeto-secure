import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ColaboradorDB {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  setor: string;
  funcao: string;
  admissao: string;
  data_nascimento: string | null;
  genero: string;
  email: string;
  contato: string;
  pilar: string;
  veiculo_utilizado: string;
  cnh_numero: string;
  cnh_validade: string | null;
  cnh_categoria: string;
  cnh_status: string;
  data_ultima_blitz: string | null;
  aderencia: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useColaboradores() {
  return useQuery({
    queryKey: ['colaboradores'],
    queryFn: async (): Promise<ColaboradorDB[]> => {
      const { data, error } = await supabase
        .from('colaboradores' as any)
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return (data as any) || [];
    },
  });
}

export function useColaboradorByCpf(cpf: string) {
  return useQuery({
    queryKey: ['colaborador', cpf],
    queryFn: async (): Promise<ColaboradorDB | null> => {
      if (!cpf || cpf.length < 11) return null;
      const { data, error } = await supabase
        .from('colaboradores' as any)
        .select('*')
        .eq('cpf', cpf)
        .maybeSingle();
      
      if (error) throw error;
      return data as any;
    },
    enabled: cpf.length >= 11,
  });
}
