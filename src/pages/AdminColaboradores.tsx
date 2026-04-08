import { AdminSidebar } from '@/components/AdminSidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const VEICULOS = [
  { value: '', label: '—' },
  { value: 'moto', label: 'Moto' },
  { value: 'carro', label: 'Carro' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'onibus', label: 'Ônibus' },
  { value: 'carona', label: 'Carona' },
];

export default function AdminColaboradores() {
  const [busca, setBusca] = useState('');
  const { data: colaboradores = [], isLoading } = useColaboradores();
  const queryClient = useQueryClient();

  const filtered = colaboradores.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf.includes(busca.replace(/\D/g, ''))
  );

  const handleVeiculoChange = async (colaboradorId: string, veiculo: string) => {
    const aderencia = (veiculo === 'onibus' || veiculo === 'carona') ? 100 : undefined;
    
    const updateData: any = { veiculo_utilizado: veiculo };
    if (aderencia !== undefined) {
      updateData.aderencia = aderencia;
    }

    const { error } = await supabase
      .from('colaboradores')
      .update(updateData)
      .eq('id', colaboradorId);

    if (error) {
      toast.error('Erro ao atualizar veículo');
      return;
    }

    toast.success('Veículo atualizado');
    queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-8 py-6">
          <h1 className="text-xl font-bold font-display mb-1">Colaboradores</h1>
          <p className="text-sm text-muted-foreground mb-4">{colaboradores.length} colaboradores cadastrados</p>
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF" className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
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
                      <th className="text-left px-4 py-3 font-medium">Matrícula</th>
                      <th className="text-left px-4 py-3 font-medium">Nome</th>
                      <th className="text-left px-4 py-3 font-medium">CPF</th>
                      <th className="text-left px-4 py-3 font-medium">Setor</th>
                      <th className="text-left px-4 py-3 font-medium">Função</th>
                      <th className="text-left px-4 py-3 font-medium">Veículo</th>
                      <th className="text-left px-4 py-3 font-medium">CNH</th>
                      <th className="text-left px-4 py-3 font-medium">Aderência</th>
                      <th className="text-left px-4 py-3 font-medium">Última Blitz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{c.matricula}</td>
                        <td className="px-4 py-3 font-medium">{c.nome}</td>
                        <td className="px-4 py-3 font-mono text-xs">{formatCPF(c.cpf)}</td>
                        <td className="px-4 py-3">{c.setor}</td>
                        <td className="px-4 py-3 text-xs">{c.funcao}</td>
                        <td className="px-4 py-2">
                          <Select
                            value={c.veiculo_utilizado || ''}
                            onValueChange={(val) => handleVeiculoChange(c.id, val)}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {VEICULOS.map(v => (
                                <SelectItem key={v.value || 'empty'} value={v.value || 'none'}>
                                  {v.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          {c.cnh_status === 'válida' || c.cnh_status === 'Em dia' ? <StatusBadge variant="ok">Válida</StatusBadge>
                            : c.cnh_status === 'vencida' || c.cnh_status === 'Vencido' ? <StatusBadge variant="danger">Vencida</StatusBadge>
                            : <StatusBadge variant="warning">Sem CNH</StatusBadge>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-status-ok" style={{ width: `${c.aderencia || 0}%` }} />
                            </div>
                            <span className="text-xs">{c.aderencia || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.data_ultima_blitz || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum colaborador encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
