import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { MobileNav } from '@/components/MobileNav';
import { AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useMemo } from 'react';

export default function Pendencias() {
  const { data: colaboradores = [], isLoading } = useColaboradores();

  const { vencidos, proximos } = useMemo(() => {
    const vencidos = colaboradores.filter(c => {
      if (!c.data_ultima_blitz) return true;
      const diff = (Date.now() - new Date(c.data_ultima_blitz).getTime()) / (1000 * 60 * 60 * 24);
      const freq = 90; // simplified - all 90 days for now
      return diff > freq;
    });

    const proximos = colaboradores.filter(c => {
      if (!c.data_ultima_blitz) return false;
      const diff = (Date.now() - new Date(c.data_ultima_blitz).getTime()) / (1000 * 60 * 60 * 24);
      const freq = 90;
      return diff > (freq - 7) && diff <= freq;
    });

    return { vencidos, proximos };
  }, [colaboradores]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="brand-gradient px-4 pt-8 pb-6">
        <h1 className="text-lg font-bold font-display text-primary-foreground">Pendências</h1>
        <p className="text-xs text-primary-foreground/60 mt-1">Blitz vencidas e próximas do vencimento</p>
      </div>

      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-status-danger" />
            <h2 className="font-semibold text-sm">Vencidas ({vencidos.length})</h2>
          </div>
          <div className="space-y-2">
            {vencidos.slice(0, 20).map(c => (
              <div key={c.id} className="rounded-xl border border-status-danger/20 bg-status-danger/5 p-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCPF(c.cpf)} · {c.setor} · {c.funcao}</p>
                  </div>
                  <StatusBadge variant="danger">Vencida</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Última blitz: {c.data_ultima_blitz || 'Nunca realizada'}</p>
              </div>
            ))}
            {vencidos.length > 20 && (
              <p className="text-xs text-muted-foreground text-center">e mais {vencidos.length - 20} colaboradores...</p>
            )}
          </div>
        </div>

        {proximos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-status-warning" />
              <h2 className="font-semibold text-sm">Vence em 7 dias ({proximos.length})</h2>
            </div>
            <div className="space-y-2">
              {proximos.map(c => (
                <div key={c.id} className="rounded-xl border border-status-warning/20 bg-status-warning/5 p-4">
                  <p className="font-semibold text-sm">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatCPF(c.cpf)} · {c.funcao}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <MobileNav />
    </div>
  );
}
