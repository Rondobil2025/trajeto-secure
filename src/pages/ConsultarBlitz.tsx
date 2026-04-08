import { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF, getVehicleLabel, getStatusLabel, type BlitzStatus, type VehicleType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { useBlitzList } from '@/hooks/useBlitz';

export default function ConsultarBlitz() {
  const [busca, setBusca] = useState('');
  const { data: blitzList = [], isLoading } = useBlitzList();

  const filtered = blitzList.filter(b =>
    b.colaborador_nome.toLowerCase().includes(busca.toLowerCase()) ||
    b.colaborador_cpf.includes(busca.replace(/\D/g, ''))
  );

  const statusVariant = (s: string) => s === 'conforme' ? 'ok' as const : s === 'conforme_observacoes' ? 'warning' as const : 'danger' as const;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="brand-gradient px-4 pt-8 pb-6">
        <h1 className="text-lg font-bold font-display text-primary-foreground">Consultar Blitz</h1>
        <p className="text-xs text-primary-foreground/60 mt-1">{blitzList.length} blitz registradas</p>
      </div>
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF" className="pl-10 h-11" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {busca ? 'Nenhuma blitz encontrada' : 'Nenhuma blitz registrada ainda'}
          </div>
        )}

        {filtered.map(b => (
          <div key={b.id} className="rounded-xl border bg-card p-4 space-y-2 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{b.colaborador_nome}</p>
                <p className="text-xs text-muted-foreground">{formatCPF(b.colaborador_cpf)} · {getVehicleLabel(b.veiculo_tipo as VehicleType)}</p>
              </div>
              <StatusBadge variant={statusVariant(b.status)}>{getStatusLabel(b.status as BlitzStatus)}</StatusBadge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Liderança: {b.lideranca_nome}</span>
              <span>{b.data}</span>
            </div>
            {b.observacoes && <p className="text-xs bg-muted rounded-lg p-2">{b.observacoes}</p>}
          </div>
        ))}
      </div>
      <MobileNav />
    </div>
  );
}
