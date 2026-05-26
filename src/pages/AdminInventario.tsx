import { AdminSidebar } from '@/components/AdminSidebar';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Bike, Car, Bus, Users, AlertTriangle, ShieldCheck, ShieldX, ShieldAlert, Calendar, Filter, Pencil, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useBlitzList } from '@/hooks/useBlitz';
import { useColaboradorMensal } from '@/hooks/useColaboradorMensal';
import { EditInventarioDialog } from '@/components/EditInventarioDialog';
import { NewColaboradorDialog } from '@/components/NewColaboradorDialog';

const MotoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="17" r="3" /><circle cx="19" cy="17" r="3" />
    <path d="M9 17h6" /><path d="M19 17l-2-6h-4l-3 3-3-1" /><path d="M13 11V7l2-2" />
  </svg>
);

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const VEHICLE_TYPES = ['MOTO', 'CARRO', 'BICICLETA', 'ONIBUS', 'CARONA'];
const ABSENCE_TYPES = ['FERIAS', 'AFASTADO', 'N/A'];

function getCnhDaysLeft(validade: string | null): number | null {
  if (!validade) return null;
  return Math.ceil((new Date(validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getCnhStatusLabel(status: string, validade: string | null) {
  const days = getCnhDaysLeft(validade);
  if (status === 'vencida' || (days !== null && days < 0)) return { label: 'Vencida', variant: 'danger' as const };
  if (days !== null && days <= 30) return { label: `Vence ${days}d`, variant: 'warning' as const };
  if (status === 'válida') return { label: 'Em dia', variant: 'ok' as const };
  return { label: 'Sem CNH', variant: 'warning' as const };
}

function getMesCellColor(value: string) {
  if (!value || value === 'N/A') return 'bg-muted/50 text-muted-foreground';
  const v = value.toUpperCase();
  if (v === 'MOTO') return 'bg-orange-100 text-orange-700 font-medium';
  if (v === 'CARRO') return 'bg-blue-100 text-blue-700 font-medium';
  if (v === 'BICICLETA') return 'bg-emerald-100 text-emerald-700 font-medium';
  if (v === 'ONIBUS') return 'bg-purple-100 text-purple-700 font-medium';
  if (v === 'CARONA') return 'bg-teal-100 text-teal-700 font-medium';
  if (v === 'FERIAS' || v === 'FÉRIAS') return 'bg-yellow-100 text-yellow-700 font-medium';
  if (v === 'AFASTADO') return 'bg-red-100 text-red-700 font-medium';
  return 'bg-muted/30 text-muted-foreground';
}

export default function AdminInventario() {
  const [busca, setBusca] = useState('');
  const [tab, setTab] = useState('todos');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroPilar, setFiltroPilar] = useState('todos');
  const [ano] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState<any | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const { data: colaboradores = [], isLoading: loadingColab } = useColaboradores();
  const { data: blitzList = [], isLoading: loadingBlitz } = useBlitzList();
  const { data: mensalData = [], isLoading: loadingMensal } = useColaboradorMensal(ano);

  const isLoading = loadingColab || loadingBlitz || loadingMensal;

  const setores = useMemo(() => [...new Set(colaboradores.map(c => c.setor))].sort(), [colaboradores]);
  const pilares = useMemo(() => [...new Set(colaboradores.map(c => c.pilar).filter(Boolean))].sort(), [colaboradores]);

  const enriched = useMemo(() => {
    return colaboradores.map(c => {
      const veiculo = (c.veiculo_utilizado || '').toUpperCase() || 'N/A';
      const cnhInfo = getCnhStatusLabel(c.cnh_status, c.cnh_validade);
      
      // Build monthly data
      const meses: Record<number, string> = {};
      for (let m = 1; m <= 12; m++) {
        const mensal = mensalData.find(d => d.colaborador_id === c.id && d.mes === m);
        if (mensal) {
          meses[m] = mensal.tipo_transporte.toUpperCase();
        } else {
          // Try to derive from blitz data
          const blitzMes = blitzList.find(b => {
            const d = new Date(b.data);
            return b.colaborador_cpf === c.cpf && d.getMonth() + 1 === m && d.getFullYear() === ano;
          });
          meses[m] = blitzMes ? blitzMes.veiculo_tipo.toUpperCase() : '';
        }
      }

      // First blitz of the year
      const blitzAno = blitzList
        .filter(b => b.colaborador_cpf === c.cpf && new Date(b.data).getFullYear() === ano)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      const primeiraBlitz = blitzAno[0]?.data || '';
      const ultimaBlitz = blitzAno[blitzAno.length - 1]?.data || c.data_ultima_blitz || '';
      
      // Anomalies from last blitz
      const lastBlitz = blitzAno[blitzAno.length - 1];
      const anomalias = lastBlitz?.observacoes || 'Sem anomalias';

      // Aderência calculation
      const mesesComBlitz = Object.values(meses).filter(v => VEHICLE_TYPES.includes(v)).length;
      const mesAtual = new Date().getMonth() + 1;
      const mesesPassados = Math.min(mesAtual, 12);
      const aderencia = mesesPassados > 0 ? Math.round((mesesComBlitz / mesesPassados) * 100) : 0;

      return { ...c, veiculo, cnhInfo, meses, primeiraBlitz, ultimaBlitz, anomalias, aderenciaCalc: aderencia };
    });
  }, [colaboradores, blitzList, mensalData, ano]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (tab !== 'todos') {
      list = list.filter(c => {
        if (tab === 'moto') return c.veiculo.includes('MOTO');
        if (tab === 'carro') return c.veiculo.includes('CARRO') || c.veiculo.includes('TRUCK') || c.veiculo.includes('VAN');
        if (tab === 'bicicleta') return c.veiculo.includes('BICICLETA') || c.veiculo.includes('BIKE');
        if (tab === 'onibus') return c.veiculo.includes('ONIBUS') || c.veiculo.includes('ÔNIBUS');
        if (tab === 'carona') return c.veiculo.includes('CARONA');
        if (tab === 'cnh_vencida') return c.cnhInfo.variant === 'danger';
        return true;
      });
    }
    if (filtroSetor !== 'todos') list = list.filter(c => c.setor === filtroSetor);
    if (filtroPilar !== 'todos') list = list.filter(c => c.pilar === filtroPilar);
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(c =>
        c.nome.toLowerCase().includes(q) || c.cpf.includes(busca.replace(/\D/g, '')) ||
        c.matricula.toLowerCase().includes(q) || c.setor.toLowerCase().includes(q) || c.funcao.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, tab, busca, filtroSetor, filtroPilar]);

  const counts = useMemo(() => {
    const motos = enriched.filter(c => c.veiculo.includes('MOTO')).length;
    const carros = enriched.filter(c => c.veiculo.includes('CARRO') || c.veiculo.includes('TRUCK') || c.veiculo.includes('VAN')).length;
    const bicicletas = enriched.filter(c => c.veiculo.includes('BICICLETA') || c.veiculo.includes('BIKE')).length;
    const onibus = enriched.filter(c => c.veiculo.includes('ONIBUS') || c.veiculo.includes('ÔNIBUS')).length;
    const carona = enriched.filter(c => c.veiculo.includes('CARONA')).length;
    const cnhVencidas = enriched.filter(c => c.cnhInfo.variant === 'danger').length;
    const total = enriched.length;
    return { total, motos, carros, bicicletas, onibus, carona, cnhVencidas };
  }, [enriched]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-[hsl(230,50%,25%)] px-6 py-6 md:px-8">
          <h1 className="text-xl font-bold font-display text-white tracking-tight">
            DASHBOARD ANALÍTICO - BLITZ DE VEÍCULOS
          </h1>
          <p className="text-xs text-white/60 mt-1">Análise de Transporte dos Colaboradores | Atualizado em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Vehicle distribution bar */}
        <div className="px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-0 border rounded-lg overflow-hidden mt-4">
            <VehicleCountCard label="TOTAL GERAL" value={counts.total} pct="100.0%" color="bg-[hsl(230,50%,25%)]" textColor="text-white" />
            <VehicleCountCard label="MOTO" value={counts.motos} pct={pct(counts.motos, counts.total)} color="bg-orange-500" textColor="text-white" />
            <VehicleCountCard label="BICICLETA" value={counts.bicicletas} pct={pct(counts.bicicletas, counts.total)} color="bg-blue-600" textColor="text-white" />
            <VehicleCountCard label="ÔNIBUS" value={counts.onibus} pct={pct(counts.onibus, counts.total)} color="bg-purple-600" textColor="text-white" />
            <VehicleCountCard label="CARONA" value={counts.carona} pct={pct(counts.carona, counts.total)} color="bg-teal-600" textColor="text-white" />
            <VehicleCountCard label="CARRO" value={counts.carros} pct={pct(counts.carros, counts.total)} color="bg-green-600" textColor="text-white" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar nome, CPF, matrícula, setor..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <Select value={filtroSetor} onValueChange={setFiltroSetor}>
              <SelectTrigger className="w-40"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Setor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Setores</SelectItem>
                {setores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroPilar} onValueChange={setFiltroPilar}>
              <SelectTrigger className="w-40"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Pilar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Pilares</SelectItem>
                {pilares.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setNewOpen(true)} className="ml-auto"><Plus className="h-4 w-4 mr-1" />Novo Colaborador</Button>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="todos">Todos ({counts.total})</TabsTrigger>
              <TabsTrigger value="moto" className="text-orange-600">Moto ({counts.motos})</TabsTrigger>
              <TabsTrigger value="carro" className="text-green-600">Carro ({counts.carros})</TabsTrigger>
              <TabsTrigger value="bicicleta" className="text-blue-600">Bicicleta ({counts.bicicletas})</TabsTrigger>
              <TabsTrigger value="onibus" className="text-purple-600">Ônibus ({counts.onibus})</TabsTrigger>
              <TabsTrigger value="carona" className="text-teal-600">Carona ({counts.carona})</TabsTrigger>
              <TabsTrigger value="cnh_vencida" className="text-status-danger">CNH Vencida ({counts.cnhVencidas})</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] whitespace-nowrap">
                      <thead>
                        <tr className="bg-[hsl(230,50%,25%)] text-white">
                          <th className="sticky left-0 bg-[hsl(230,50%,25%)] z-10 px-2 py-2 text-left font-semibold">NOME</th>
                          <th className="px-2 py-2 text-left font-semibold">PILAR</th>
                          <th className="px-2 py-2 text-left font-semibold">VEÍCULO</th>
                          <th className="px-2 py-2 text-left font-semibold">SETOR</th>
                          <th className="px-2 py-2 text-left font-semibold">MAT</th>
                          <th className="px-2 py-2 text-left font-semibold">ADMISSÃO</th>
                          <th className="px-2 py-2 text-left font-semibold">FUNÇÃO</th>
                          <th className="px-2 py-2 text-left font-semibold">NASC.</th>
                          <th className="px-2 py-2 text-left font-semibold">CPF</th>
                          <th className="px-2 py-2 text-center font-semibold">GÊN</th>
                          <th className="px-2 py-2 text-left font-semibold">EMAIL</th>
                          <th className="px-2 py-2 text-left font-semibold">CONTATO</th>
                          <th className="px-2 py-2 text-left font-semibold">CNH Nº</th>
                          <th className="px-2 py-2 text-left font-semibold">VALIDADE</th>
                          <th className="px-2 py-2 text-center font-semibold">CAT</th>
                          <th className="px-2 py-2 text-center font-semibold">STATUS CNH</th>
                          <th className="px-2 py-2 text-center font-semibold">DIR.DEF</th>
                          <th className="px-2 py-2 text-center font-semibold">1ª BLITZ {ano}</th>
                          <th className="px-2 py-2 text-center font-semibold">ÚLT. BLITZ</th>
                          <th className="px-2 py-2 text-left font-semibold">ANOMALIAS</th>
                          {MESES.map(m => (
                            <th key={m} className="px-1 py-2 text-center font-semibold min-w-[50px]">{m}</th>
                          ))}
                          <th className="px-2 py-2 text-center font-semibold">ADERÊNCIA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((c, idx) => (
                          <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}>
                            <td className="sticky left-0 bg-inherit z-10 px-2 py-1.5 font-medium max-w-[200px] truncate">{c.nome}</td>
                            <td className="px-2 py-1.5">{c.pilar || '—'}</td>
                            <td className="px-2 py-1.5"><VeiculoBadge veiculo={c.veiculo} /></td>
                            <td className="px-2 py-1.5">{c.setor}</td>
                            <td className="px-2 py-1.5 font-mono">{c.matricula}</td>
                            <td className="px-2 py-1.5">{formatDate(c.admissao)}</td>
                            <td className="px-2 py-1.5 max-w-[150px] truncate">{c.funcao}</td>
                            <td className="px-2 py-1.5">{formatDate(c.data_nascimento)}</td>
                            <td className="px-2 py-1.5 font-mono">{formatCPF(c.cpf)}</td>
                            <td className="px-2 py-1.5 text-center">{c.genero || '—'}</td>
                            <td className="px-2 py-1.5 max-w-[150px] truncate">{c.email || '—'}</td>
                            <td className="px-2 py-1.5">{c.contato || '—'}</td>
                            <td className="px-2 py-1.5 font-mono">{c.cnh_numero || '—'}</td>
                            <td className="px-2 py-1.5">{formatDate(c.cnh_validade)}</td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold">{c.cnh_categoria || '—'}</span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <StatusBadge variant={c.cnhInfo.variant}>{c.cnhInfo.label}</StatusBadge>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {(c.veiculo.includes('MOTO') || c.veiculo.includes('CARRO')) ? (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(c as any).curso_direcao_defensiva ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {(c as any).curso_direcao_defensiva ? 'SIM' : 'NÃO'}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-2 py-1.5 text-center">{formatDate(c.primeiraBlitz)}</td>
                            <td className="px-2 py-1.5 text-center">{formatDate(c.ultimaBlitz)}</td>
                            <td className="px-2 py-1.5 max-w-[120px] truncate text-[10px]">{c.anomalias}</td>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                              <td key={m} className={`px-1 py-1.5 text-center text-[10px] ${getMesCellColor(c.meses[m])}`}>
                                {c.meses[m] || '—'}
                              </td>
                            ))}
                            <td className="px-2 py-1.5 text-center">
                              <div className="flex items-center gap-1 justify-center">
                                <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${c.aderenciaCalc >= 80 ? 'bg-status-ok' : c.aderenciaCalc >= 50 ? 'bg-status-warning' : 'bg-status-danger'}`}
                                    style={{ width: `${Math.min(c.aderenciaCalc, 100)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-[10px]">{c.aderenciaCalc}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">Nenhum colaborador encontrado.</div>
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

function pct(v: number, total: number) {
  if (total === 0) return '0%';
  return ((v / total) * 100).toFixed(1) + '%';
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return '—'; }
}

function VehicleCountCard({ label, value, pct, color, textColor }: { label: string; value: number; pct: string; color: string; textColor: string }) {
  return (
    <div className={`${color} ${textColor} p-3 text-center`}>
      <p className="text-[10px] font-bold tracking-wider uppercase">{label}</p>
      <p className="text-2xl font-extrabold font-display">{value}</p>
      <p className="text-[10px] opacity-80">{pct}</p>
    </div>
  );
}

function VeiculoBadge({ veiculo }: { veiculo: string }) {
  const v = veiculo.toUpperCase();
  if (v.includes('MOTO')) return <span className="inline-block bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold">MOTO</span>;
  if (v.includes('CARRO') || v.includes('TRUCK') || v.includes('VAN')) return <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">CARRO</span>;
  if (v.includes('BICICLETA') || v.includes('BIKE')) return <span className="inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">BICICLETA</span>;
  if (v.includes('ONIBUS') || v.includes('ÔNIBUS')) return <span className="inline-block bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold">ÔNIBUS</span>;
  if (v.includes('CARONA')) return <span className="inline-block bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px] font-bold">CARONA</span>;
  return <span className="text-[10px] text-muted-foreground">{veiculo || '—'}</span>;
}
