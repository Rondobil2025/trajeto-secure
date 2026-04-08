import { AdminSidebar } from '@/components/AdminSidebar';
import { KpiCard } from '@/components/KpiCard';
import { DASHBOARD_STATS, MOCK_PLANOS, MOCK_COLABORADORES, MOCK_BLITZ } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF, getVehicleLabel, getPlanStatusLabel } from '@/lib/types';
import { Shield, AlertTriangle, FileWarning, ClipboardList, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminAuditoria() {
  const cnhVencidas = MOCK_COLABORADORES.filter(c => c.cnh_status === 'vencida');
  const semBlitz = MOCK_COLABORADORES.filter(c => !c.data_ultima_blitz);
  const planosVencidos = MOCK_PLANOS.filter(p => p.status === 'vencido');

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
            <KpiCard title="Conformidade Geral" value={`${DASHBOARD_STATS.aderenciaGeral}%`} icon={CheckCircle2} variant={DASHBOARD_STATS.aderenciaGeral >= 80 ? 'ok' : 'warning'} />
            <KpiCard title="CNH Vencidas" value={cnhVencidas.length} icon={ShieldAlert} variant="danger" />
            <KpiCard title="Sem Blitz" value={semBlitz.length} icon={AlertTriangle} variant="warning" />
            <KpiCard title="Planos Vencidos" value={planosVencidos.length} icon={FileWarning} variant="danger" />
          </div>

          {/* Pendências Críticas */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-danger" /> Pendências Críticas
            </h3>
            <div className="space-y-2">
              {cnhVencidas.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-status-danger/20 bg-status-danger/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCPF(c.cpf)} · {c.setor}</p>
                  </div>
                  <StatusBadge variant="danger">CNH Vencida</StatusBadge>
                </div>
              ))}
              {semBlitz.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-status-warning/20 bg-status-warning/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCPF(c.cpf)} · {c.setor}</p>
                  </div>
                  <StatusBadge variant="warning">Sem Blitz</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          {/* Planos Vencidos */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-status-warning" /> Planos de Ação Vencidos
            </h3>
            <div className="space-y-2">
              {planosVencidos.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{p.codigo}</p>
                    <p className="text-sm font-medium">{p.colaborador_nome}</p>
                    <p className="text-xs text-muted-foreground">{p.descricao_anomalia}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge variant="danger">Vencido</StatusBadge>
                    <p className="text-xs text-muted-foreground mt-1">Prazo: {p.prazo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
