import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF, getVehicleLabel, getStatusLabel, type BlitzStatus, type VehicleType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, ClipboardCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useBlitzList } from '@/hooks/useBlitz';

export default function AdminBlitz() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroVeiculo, setFiltroVeiculo] = useState('todos');
  const { data: blitzList = [], isLoading } = useBlitzList();

  const filtered = useMemo(() => {
    let list = blitzList;
    if (filtroStatus !== 'todos') list = list.filter(b => b.status === filtroStatus);
    if (filtroVeiculo !== 'todos') list = list.filter(b => b.veiculo_tipo === filtroVeiculo);
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(b =>
        b.colaborador_nome.toLowerCase().includes(q) ||
        b.colaborador_cpf.includes(busca.replace(/\D/g, '')) ||
        b.lideranca_nome.toLowerCase().includes(q)
      );
    }
    return list;
  }, [blitzList, busca, filtroStatus, filtroVeiculo]);

  const statusVariant = (s: string) => s === 'conforme' ? 'ok' as const : s === 'conforme_observacoes' ? 'warning' as const : 'danger' as const;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Blitz Registradas</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">{blitzList.length} blitz no sistema</p>
            </div>
            <AdminNavButtons className="ml-auto" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, CPF ou liderança..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="conforme">Conforme</SelectItem>
                <SelectItem value="conforme_observacoes">C/ Observações</SelectItem>
                <SelectItem value="nao_conforme">Não Conforme</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroVeiculo} onValueChange={setFiltroVeiculo}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Veículo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Veículos</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="bicicleta">Bicicleta</SelectItem>
                <SelectItem value="onibus">Ônibus</SelectItem>
                <SelectItem value="carona">Carona</SelectItem>
              </SelectContent>
            </Select>
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
                      <th className="text-left px-4 py-3 font-medium">Data</th>
                      <th className="text-left px-4 py-3 font-medium">Colaborador</th>
                      <th className="text-left px-4 py-3 font-medium">CPF</th>
                      <th className="text-left px-4 py-3 font-medium">Veículo</th>
                      <th className="text-left px-4 py-3 font-medium">Liderança</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs">{new Date(b.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 font-medium">{b.colaborador_nome}</td>
                        <td className="px-4 py-3 font-mono text-xs">{formatCPF(b.colaborador_cpf)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                            {getVehicleLabel(b.veiculo_tipo as VehicleType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{b.lideranca_nome}</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={statusVariant(b.status)}>
                            {getStatusLabel(b.status as BlitzStatus)}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{b.observacoes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma blitz encontrada.</div>
              )}
              <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                Exibindo {filtered.length} de {blitzList.length} blitz
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
