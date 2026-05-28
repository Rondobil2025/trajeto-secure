import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF, getPlanStatusLabel, getPriorityLabel, type PlanStatus, type Priority } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePlanosAcao } from '@/hooks/usePlanosAcao';

export default function AdminPlanosAcao() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
  const { data: planos = [], isLoading } = usePlanosAcao();

  const filtered = useMemo(() => {
    let list = planos;
    if (filtroStatus !== 'todos') list = list.filter(p => p.status === filtroStatus);
    if (filtroPrioridade !== 'todos') list = list.filter(p => p.prioridade === filtroPrioridade);
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(p =>
        p.colaborador_nome.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.descricao_anomalia.toLowerCase().includes(q)
      );
    }
    return list;
  }, [planos, busca, filtroStatus, filtroPrioridade]);

  const statusVariant = (s: string) => {
    switch (s) {
      case 'concluido': return 'ok' as const;
      case 'em_andamento': return 'info' as const;
      case 'vencido': return 'danger' as const;
      default: return 'warning' as const;
    }
  };

  const prioVariant = (p: string) => {
    switch (p) {
      case 'baixa': return 'muted' as const;
      case 'media': return 'info' as const;
      case 'alta': return 'warning' as const;
      case 'critica': return 'danger' as const;
      default: return 'muted' as const;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Planos de Ação</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">{planos.length} planos registrados</p>
            </div>
            <AdminNavButtons className="ml-auto" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, código ou anomalia..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
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
                      <th className="text-left px-4 py-3 font-medium">Código</th>
                      <th className="text-left px-4 py-3 font-medium">Colaborador</th>
                      <th className="text-left px-4 py-3 font-medium">Veículo</th>
                      <th className="text-left px-4 py-3 font-medium">Anomalia</th>
                      <th className="text-left px-4 py-3 font-medium">Ação Corretiva</th>
                      <th className="text-left px-4 py-3 font-medium">Prazo</th>
                      <th className="text-left px-4 py-3 font-medium">Prioridade</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{p.codigo}</td>
                        <td className="px-4 py-3 font-medium">{p.colaborador_nome}</td>
                        <td className="px-4 py-3 text-xs">{p.veiculo_tipo}</td>
                        <td className="px-4 py-3 text-xs max-w-[180px] truncate">{p.descricao_anomalia}</td>
                        <td className="px-4 py-3 text-xs max-w-[180px] truncate">{p.acao_corretiva}</td>
                        <td className="px-4 py-3 text-xs">{new Date(p.prazo).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={prioVariant(p.prioridade)}>
                            {getPriorityLabel(p.prioridade as Priority)}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={statusVariant(p.status)}>
                            {getPlanStatusLabel(p.status as PlanStatus)}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-sm">{p.responsavel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Nenhum plano encontrado.</div>
              )}
              <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                Exibindo {filtered.length} de {planos.length} planos
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
