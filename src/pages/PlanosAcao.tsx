import { MOCK_PLANOS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { getPlanStatusLabel, getPriorityLabel, type PlanStatus, type Priority } from '@/lib/types';
import { MobileNav } from '@/components/MobileNav';

export default function PlanosAcao() {
  const statusVariant = (s: PlanStatus) => {
    switch (s) {
      case 'concluido': return 'ok' as const;
      case 'em_andamento': return 'info' as const;
      case 'vencido': return 'danger' as const;
      case 'aberto': return 'warning' as const;
    }
  };

  const prioVariant = (p: Priority) => {
    switch (p) {
      case 'baixa': return 'muted' as const;
      case 'media': return 'info' as const;
      case 'alta': return 'warning' as const;
      case 'critica': return 'danger' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="brand-gradient px-4 pt-8 pb-6">
        <h1 className="text-lg font-bold font-display text-primary-foreground">Planos de Ação</h1>
        <p className="text-xs text-primary-foreground/60 mt-1">{MOCK_PLANOS.length} planos registrados</p>
      </div>
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {MOCK_PLANOS.map(p => (
          <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{p.codigo}</p>
                <p className="font-semibold text-sm mt-0.5">{p.colaborador_nome}</p>
              </div>
              <StatusBadge variant={statusVariant(p.status)}>{getPlanStatusLabel(p.status)}</StatusBadge>
            </div>
            <p className="text-sm">{p.descricao_anomalia}</p>
            <p className="text-xs text-muted-foreground">Ação: {p.acao_corretiva}</p>
            <div className="flex items-center justify-between text-xs">
              <StatusBadge variant={prioVariant(p.prioridade)}>{getPriorityLabel(p.prioridade)}</StatusBadge>
              <span className="text-muted-foreground">Prazo: {p.prazo}</span>
            </div>
          </div>
        ))}
      </div>
      <MobileNav />
    </div>
  );
}
