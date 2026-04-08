import { StatusBadge } from '@/components/StatusBadge';
import { getPlanStatusLabel, getPriorityLabel, type PlanStatus, type Priority } from '@/lib/types';
import { MobileNav } from '@/components/MobileNav';
import { Loader2 } from 'lucide-react';
import { usePlanosAcao } from '@/hooks/usePlanosAcao';

export default function PlanosAcao() {
  const { data: planos = [], isLoading } = usePlanosAcao();

  const statusVariant = (s: string) => {
    switch (s) {
      case 'concluido': return 'ok' as const;
      case 'em_andamento': return 'info' as const;
      case 'vencido': return 'danger' as const;
      case 'aberto': return 'warning' as const;
      default: return 'muted' as const;
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
    <div className="min-h-screen bg-background pb-20">
      <div className="brand-gradient px-4 pt-8 pb-6">
        <h1 className="text-lg font-bold font-display text-primary-foreground">Planos de Ação</h1>
        <p className="text-xs text-primary-foreground/60 mt-1">{planos.length} planos registrados</p>
      </div>
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && planos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum plano de ação registrado ainda
          </div>
        )}

        {planos.map(p => (
          <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{p.codigo}</p>
                <p className="font-semibold text-sm mt-0.5">{p.colaborador_nome}</p>
              </div>
              <StatusBadge variant={statusVariant(p.status)}>{getPlanStatusLabel(p.status as PlanStatus)}</StatusBadge>
            </div>
            <p className="text-sm">{p.descricao_anomalia}</p>
            <p className="text-xs text-muted-foreground">Ação: {p.acao_corretiva}</p>
            <div className="flex items-center justify-between text-xs">
              <StatusBadge variant={prioVariant(p.prioridade)}>{getPriorityLabel(p.prioridade as Priority)}</StatusBadge>
              <span className="text-muted-foreground">Prazo: {p.prazo}</span>
            </div>
          </div>
        ))}
      </div>
      <MobileNav />
    </div>
  );
}
