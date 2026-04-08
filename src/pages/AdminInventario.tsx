import { AdminSidebar } from '@/components/AdminSidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Bike, Car, AlertTriangle, ShieldCheck, ShieldX, ShieldAlert, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useBlitzList } from '@/hooks/useBlitz';

const MotoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="17" r="3" />
    <circle cx="19" cy="17" r="3" />
    <path d="M9 17h6" />
    <path d="M19 17l-2-6h-4l-3 3-3-1" />
    <path d="M13 11V7l2-2" />
  </svg>
);

function getCnhDaysLeft(validade: string | null): number | null {
  if (!validade) return null;
  const diff = new Date(validade).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCnhStatusInfo(status: string, validade: string | null) {
  const days = getCnhDaysLeft(validade);
  if (status === 'vencida' || (days !== null && days < 0))
    return { label: 'Vencida', variant: 'danger' as const, icon: ShieldX };
  if (days !== null && days <= 30)
    return { label: `Vence em ${days}d`, variant: 'warning' as const, icon: ShieldAlert };
  if (status === 'válida')
    return { label: 'Válida', variant: 'ok' as const, icon: ShieldCheck };
  return { label: 'Sem CNH', variant: 'warning' as const, icon: AlertTriangle };
}

function getVeiculoFromBlitz(colaboradorCpf: string, blitzList: any[]): string {
  const latest = blitzList.find(b => b.colaborador_cpf === colaboradorCpf);
  return latest?.veiculo_tipo || '';
}

export default function AdminInventario() {
  const [busca, setBusca] = useState('');
  const [tab, setTab] = useState('todos');
  const { data: colaboradores = [], isLoading: loadingColab } = useColaboradores();
  const { data: blitzList = [], isLoading: loadingBlitz } = useBlitzList();

  const isLoading = loadingColab || loadingBlitz;

  const enriched = useMemo(() => {
    return colaboradores.map(c => {
      const veiculo = c.veiculo_utilizado || getVeiculoFromBlitz(c.cpf, blitzList);
      const cnhInfo = getCnhStatusInfo(c.cnh_status, c.cnh_validade);
      const daysLeft = getCnhDaysLeft(c.cnh_validade);
      return { ...c, veiculo, cnhInfo, daysLeft };
    });
  }, [colaboradores, blitzList]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (tab !== 'todos') {
      list = list.filter(c => {
        const v = c.veiculo.toLowerCase();
        if (tab === 'moto') return v.includes('moto');
        if (tab === 'carro') return v.includes('carro') || v.includes('truck') || v.includes('van');
        if (tab === 'bicicleta') return v.includes('bicicleta') || v.includes('bike');
        if (tab === 'cnh_vencida') return c.cnh_status === 'vencida' || (c.daysLeft !== null && c.daysLeft < 0);
        if (tab === 'cnh_vencer') return c.daysLeft !== null && c.daysLeft >= 0 && c.daysLeft <= 30;
        return true;
      });
    }
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        c.cpf.includes(busca.replace(/\D/g, '')) ||
        c.matricula.toLowerCase().includes(q) ||
        c.setor.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, tab, busca]);

  const counts = useMemo(() => {
    const motos = enriched.filter(c => c.veiculo.toLowerCase().includes('moto')).length;
    const carros = enriched.filter(c => {
      const v = c.veiculo.toLowerCase();
      return v.includes('carro') || v.includes('truck') || v.includes('van');
    }).length;
    const bicicletas = enriched.filter(c => {
      const v = c.veiculo.toLowerCase();
      return v.includes('bicicleta') || v.includes('bike');
    }).length;
    const cnhVencidas = enriched.filter(c => c.cnh_status === 'vencida' || (c.daysLeft !== null && c.daysLeft < 0)).length;
    const cnhVencer = enriched.filter(c => c.daysLeft !== null && c.daysLeft >= 0 && c.daysLeft <= 30).length;
    return { motos, carros, bicicletas, cnhVencidas, cnhVencer };
  }, [enriched]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-8 md:px-8">
          <h1 className="text-2xl font-bold font-display text-primary-foreground">Inventário de Veículos</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Controle de veículos, CNH e status dos colaboradores</p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6 -mt-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard icon={<MotoIcon className="h-5 w-5" />} label="Motos" value={counts.motos} color="text-brand-green" />
            <SummaryCard icon={<Car className="h-5 w-5" />} label="Carros/Trucks" value={counts.carros} color="text-blue-600" />
            <SummaryCard icon={<Bike className="h-5 w-5" />} label="Bicicletas" value={counts.bicicletas} color="text-amber-600" />
            <SummaryCard icon={<ShieldX className="h-5 w-5" />} label="CNH Vencidas" value={counts.cnhVencidas} color="text-status-danger" />
            <SummaryCard icon={<ShieldAlert className="h-5 w-5" />} label="CNH a Vencer" value={counts.cnhVencer} color="text-status-warning" />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, CPF, matrícula ou setor..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="todos">Todos ({enriched.length})</TabsTrigger>
              <TabsTrigger value="moto">Motos ({counts.motos})</TabsTrigger>
              <TabsTrigger value="carro">Carros ({counts.carros})</TabsTrigger>
              <TabsTrigger value="bicicleta">Bicicletas ({counts.bicicletas})</TabsTrigger>
              <TabsTrigger value="cnh_vencida" className="text-status-danger">Vencidas ({counts.cnhVencidas})</TabsTrigger>
              <TabsTrigger value="cnh_vencer" className="text-status-warning">A Vencer ({counts.cnhVencer})</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-4">
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
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Matrícula</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Nome</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">CPF</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Setor</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Função</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Veículo</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">CNH Nº</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Categoria</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Validade</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Status CNH</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Última Blitz</th>
                          <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Aderência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(c => {
                          const info = c.cnhInfo;
                          return (
                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs">{c.matricula}</td>
                              <td className="px-4 py-3 font-medium whitespace-nowrap">{c.nome}</td>
                              <td className="px-4 py-3 font-mono text-xs">{formatCPF(c.cpf)}</td>
                              <td className="px-4 py-3 text-xs">{c.setor}</td>
                              <td className="px-4 py-3 text-xs">{c.funcao}</td>
                              <td className="px-4 py-3">
                                <VeiculoBadge veiculo={c.veiculo} />
                              </td>
                              <td className="px-4 py-3 font-mono text-xs">{c.cnh_numero || '—'}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs font-semibold">
                                  {c.cnh_categoria || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs whitespace-nowrap">
                                {c.cnh_validade ? (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    {new Date(c.cnh_validade).toLocaleDateString('pt-BR')}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge variant={info.variant}>{info.label}</StatusBadge>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                {c.data_ultima_blitz ? new Date(c.data_ultima_blitz).toLocaleDateString('pt-BR') : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${c.aderencia >= 80 ? 'bg-status-ok' : c.aderencia >= 50 ? 'bg-status-warning' : 'bg-status-danger'}`}
                                      style={{ width: `${c.aderencia}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">{c.aderencia}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      Nenhum colaborador encontrado nesta categoria.
                    </div>
                  )}
                  <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                    Exibindo {filtered.length} de {enriched.length} colaboradores
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold font-display">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function VeiculoBadge({ veiculo }: { veiculo: string }) {
  const v = veiculo.toLowerCase();
  if (v.includes('moto'))
    return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium"><MotoIcon className="h-3 w-3" /> Moto</span>;
  if (v.includes('carro') || v.includes('truck') || v.includes('van'))
    return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium"><Car className="h-3 w-3" /> Carro</span>;
  if (v.includes('bicicleta') || v.includes('bike'))
    return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium"><Bike className="h-3 w-3" /> Bicicleta</span>;
  return <span className="text-xs text-muted-foreground">{veiculo || '—'}</span>;
}
