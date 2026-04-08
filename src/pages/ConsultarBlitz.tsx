import { useState } from 'react';
import { MOCK_BLITZ } from '@/lib/mock-data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF, getVehicleLabel, getStatusLabel, type BlitzStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';

export default function ConsultarBlitz() {
  const [busca, setBusca] = useState('');

  const filtered = MOCK_BLITZ.filter(b =>
    b.colaborador_nome.toLowerCase().includes(busca.toLowerCase()) ||
    b.colaborador_cpf.includes(busca.replace(/\D/g, ''))
  );

  const statusVariant = (s: BlitzStatus) => s === 'conforme' ? 'ok' as const : s === 'conforme_observacoes' ? 'warning' as const : 'danger' as const;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="brand-gradient px-4 pt-8 pb-6">
        <h1 className="text-lg font-bold font-display text-primary-foreground">Consultar Blitz</h1>
      </div>
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CPF" className="pl-10 h-11" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {filtered.map(b => (
          <div key={b.id} className="rounded-xl border bg-card p-4 space-y-2 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">{b.colaborador_nome}</p>
                <p className="text-xs text-muted-foreground">{formatCPF(b.colaborador_cpf)} · {getVehicleLabel(b.veiculo_tipo)}</p>
              </div>
              <StatusBadge variant={statusVariant(b.status)}>{getStatusLabel(b.status)}</StatusBadge>
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
