import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { Shield, AlertTriangle, FileWarning, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { usePlanosAcao } from '@/hooks/usePlanosAcao';
import { useMemo } from 'react';

export default function AdminAuditoria() {
  const { data: colaboradores = [], isLoading: loadingColab } = useColaboradores();
  const { data: planos = [], isLoading: loadingPlanos } = usePlanosAcao();

  const isLoading = loadingColab || loadingPlanos;

  const { cnhVencidas, semBlitz, aderenciaGeral, planosVencidos } = useMemo(() => {
    const cnhVencidas = colaboradores.filter(c => c.cnh_status === 'vencida');
    const semBlitz = colaboradores.filter(c => !c.data_ultima_blitz);
    const totalAd = colaboradores.reduce((s, c) => s + c.aderencia, 0);
    const aderenciaGeral = colaboradores.length > 0 ? Math.round(totalAd / colaboradores.length) : 0;
    const planosVencidos = planos.filter(p => p.status === 'vencido');
    return { cnhVencidas, semBlitz, aderenciaGeral, planosVencidos };
  }, [colaboradores, planos]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-8 md:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary-foreground" />
            <div>
              <h1 className="text-2xl font-bold font-display text-primary-foreground">Modo Auditoria</h1>
              <p className="text-sm text-primary-foreground/60">Visão completa de conformidade e rastreabilidade</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6 -mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Conformidade Geral" value={`${aderenciaGeral}%`} icon={CheckCircle2} variant={aderenciaGeral >= 80 ? 'ok' : 'warning'} />
            <KpiCard title="CNH Vencidas" value={cnhVencidas.length} icon={ShieldAlert} variant="danger" />
            <KpiCard title="Sem Blitz" value={semBlitz.length} icon={AlertTriangle} variant="warning" />
            <KpiCard title="Planos Vencidos" value={planosVencidos.length} icon={FileWarning} variant="danger" />
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-danger" /> Pendências Críticas
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cnhVencidas.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-status-danger/20 bg-status-danger/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCPF(c.cpf)} · {c.setor}</p>
                  </div>
                  <StatusBadge variant="danger">CNH Vencida</StatusBadge>
                </div>
              ))}
              {planosVencidos.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-status-danger/20 bg-status-danger/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{p.colaborador_nome}</p>
                    <p className="text-xs text-muted-foreground">{p.codigo} · {p.descricao_anomalia}</p>
                  </div>
                  <StatusBadge variant="danger">Plano Vencido</StatusBadge>
                </div>
              ))}
              {semBlitz.slice(0, 10).map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-status-warning/20 bg-status-warning/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCPF(c.cpf)} · {c.setor}</p>
                  </div>
                  <StatusBadge variant="warning">Sem Blitz</StatusBadge>
                </div>
              ))}
              {semBlitz.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  e mais {semBlitz.length - 10} colaboradores sem blitz...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
