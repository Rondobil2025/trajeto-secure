import { AdminSidebar } from '@/components/AdminSidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Loader2, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useTermos() {
  return useQuery({
    queryKey: ['termos_ciencia'],
    queryFn: async () => {
      const { data, error } = await supabase.from('termos_ciencia' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });
}

export default function AdminTermos() {
  const { data: termos = [], isLoading } = useTermos();
  const [busca, setBusca] = useState('');

  const filtered = useMemo(() => {
    if (!busca) return termos;
    const q = busca.toLowerCase();
    return termos.filter((t: any) =>
      t.colaborador_nome?.toLowerCase().includes(q) ||
      t.colaborador_cpf?.includes(busca.replace(/\D/g, ''))
    );
  }, [termos, busca]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Termos de Ciência</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">{termos.length} termos registrados</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium">Colaborador</th>
                      <th className="text-left px-4 py-3 font-medium">CPF</th>
                      <th className="text-left px-4 py-3 font-medium">Descrição</th>
                      <th className="text-left px-4 py-3 font-medium">Assinado em</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t: any) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{t.colaborador_nome}</td>
                        <td className="px-4 py-3 font-mono text-xs">{formatCPF(t.colaborador_cpf || '')}</td>
                        <td className="px-4 py-3 text-xs max-w-[250px] truncate">{t.descricao}</td>
                        <td className="px-4 py-3 text-xs">
                          {t.assinado_em ? new Date(t.assinado_em).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={t.assinado_em ? 'ok' : 'warning'}>
                            {t.assinado_em ? 'Assinado' : 'Pendente'}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Nenhum termo encontrado.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
