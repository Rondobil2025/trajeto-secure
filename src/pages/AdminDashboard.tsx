import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { KpiCard } from '@/components/KpiCard';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useBlitzList } from '@/hooks/useBlitz';
import { usePlanosAcao } from '@/hooks/usePlanosAcao';
import { useLiderancas } from '@/hooks/useLiderancas';
import {
  Users, ClipboardCheck, AlertTriangle, TrendingUp, Truck,
  FileWarning, ShieldAlert, ClipboardList, Loader2, UserCheck, Bike, Car, Bus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { useMemo } from 'react';

const MESES_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AdminDashboard() {
  const { data: colaboradores = [], isLoading: loadingColab } = useColaboradores();
  const { data: blitzList = [], isLoading: loadingBlitz } = useBlitzList();
  const { data: planos = [], isLoading: loadingPlanos } = usePlanosAcao();
  const { data: liderancas = [] } = useLiderancas();

  const isLoading = loadingColab || loadingBlitz || loadingPlanos;

  const stats = useMemo(() => {
    const total = colaboradores.length;
    const cnhVencidas = colaboradores.filter(c => {
      if (!c.cnh_validade) return false;
      return new Date(c.cnh_validade) < new Date();
    }).length;
    const semCnh = colaboradores.filter(c => c.cnh_status === 'sem_cnh' || !c.cnh_numero).length;

    const porSetor: Record<string, number> = {};
    colaboradores.forEach(c => {
      porSetor[c.setor] = (porSetor[c.setor] || 0) + 1;
    });

    const pendentes = colaboradores.filter(c => {
      if (!c.data_ultima_blitz) return true;
      const diff = (Date.now() - new Date(c.data_ultima_blitz).getTime()) / (1000 * 60 * 60 * 24);
      return diff > 90;
    }).length;

    const totalAderencia = colaboradores.reduce((sum, c) => sum + (c.aderencia || 0), 0);
    const aderenciaGeral = total > 0 ? Math.round(totalAderencia / total) : 0;

    const setorData = Object.entries(porSetor).map(([setor, count]) => ({ setor, total: count }));

    const planosAbertos = planos.filter(p => p.status === 'aberto').length;
    const planosVencidos = planos.filter(p => {
      if (p.status === 'vencido') return true;
      if (p.status !== 'concluido' && p.prazo) return new Date(p.prazo) < new Date();
      return false;
    }).length;
    const planosAndamento = planos.filter(p => p.status === 'em_andamento').length;

    return { total, cnhVencidas, semCnh, pendentes, aderenciaGeral, setorData, totalBlitz: blitzList.length, planosAbertos, planosVencidos, planosAndamento, totalLiderancas: liderancas.length };
  }, [colaboradores, blitzList, planos, liderancas]);

  const veiculoData = useMemo(() => {
    const counts: Record<string, number> = { 'Moto': 0, 'Carro': 0, 'Bicicleta': 0, 'Ônibus': 0, 'Carona': 0 };
    colaboradores.forEach(c => {
      const v = (c.veiculo_utilizado || '').toUpperCase();
      if (v.includes('MOTO')) counts['Moto']++;
      else if (v.includes('CARRO') || v.includes('TRUCK') || v.includes('VAN')) counts['Carro']++;
      else if (v.includes('BICICLETA') || v.includes('BIKE')) counts['Bicicleta']++;
      else if (v.includes('ONIBUS') || v.includes('ÔNIBUS')) counts['Ônibus']++;
      else if (v.includes('CARONA')) counts['Carona']++;
    });
    return [
      { name: 'Moto', value: counts['Moto'], fill: 'hsl(25, 95%, 53%)' },
      { name: 'Carro', value: counts['Carro'], fill: 'hsl(142, 71%, 45%)' },
      { name: 'Bicicleta', value: counts['Bicicleta'], fill: 'hsl(217, 91%, 60%)' },
      { name: 'Ônibus', value: counts['Ônibus'], fill: 'hsl(271, 91%, 65%)' },
      { name: 'Carona', value: counts['Carona'], fill: 'hsl(174, 72%, 40%)' },
    ].filter(d => d.value > 0);
  }, [colaboradores]);

  const blitzPorMes = useMemo(() => {
    const ano = new Date().getFullYear();
    const meses = Array.from({ length: 12 }, (_, i) => ({ mes: MESES_LABEL[i], total: 0 }));
    blitzList.forEach(b => {
      const d = new Date(b.data);
      if (d.getFullYear() === ano) {
        meses[d.getMonth()].total++;
      }
    });
    return meses;
  }, [blitzList]);

  const cnhProxVencer = useMemo(() => {
    return colaboradores.filter(c => {
      if (!c.cnh_validade) return false;
      const days = (new Date(c.cnh_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 30;
    }).length;
  }, [colaboradores]);

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
          <h1 className="text-2xl font-bold font-display text-primary-foreground">Dashboard Executivo</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Blitz de Trajeto Rondobier — Visão Geral {new Date().getFullYear()}</p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6 -mt-4">
          {/* KPIs Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard title="Colaboradores" value={stats.total} icon={Users} />
            <KpiCard title="Lideranças" value={stats.totalLiderancas} icon={UserCheck} />
            <KpiCard title="Total Blitz" value={stats.totalBlitz} icon={ClipboardCheck} />
            <KpiCard title="Pendentes" value={stats.pendentes} icon={AlertTriangle} variant="warning" />
            <KpiCard title="Aderência" value={`${stats.aderenciaGeral}%`} icon={TrendingUp} variant={stats.aderenciaGeral >= 80 ? 'ok' : 'warning'} />
            <KpiCard title="Planos Ação" value={planos.length} icon={ClipboardList} />
          </div>

          {/* KPIs Row 2 - Alerts */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard title="CNH Vencidas" value={stats.cnhVencidas} icon={ShieldAlert} variant="danger" />
            <KpiCard title="CNH Vence 30d" value={cnhProxVencer} icon={ShieldAlert} variant="warning" />
            <KpiCard title="Sem CNH" value={stats.semCnh} icon={FileWarning} variant="danger" />
            <KpiCard title="Planos Abertos" value={stats.planosAbertos} icon={ClipboardList} variant="warning" />
            <KpiCard title="Planos Vencidos" value={stats.planosVencidos} icon={AlertTriangle} variant="danger" />
          </div>

          {/* Vehicle Distribution Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {veiculoData.map(v => (
              <div key={v.name} className="rounded-xl border bg-card p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {v.name === 'Moto' && <Truck className="h-4 w-4" style={{ color: v.fill }} />}
                  {v.name === 'Carro' && <Car className="h-4 w-4" style={{ color: v.fill }} />}
                  {v.name === 'Bicicleta' && <Bike className="h-4 w-4" style={{ color: v.fill }} />}
                  {v.name === 'Ônibus' && <Bus className="h-4 w-4" style={{ color: v.fill }} />}
                  {v.name === 'Carona' && <Users className="h-4 w-4" style={{ color: v.fill }} />}
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{v.name}</span>
                </div>
                <p className="text-2xl font-bold font-display" style={{ color: v.fill }}>{v.value}</p>
                <p className="text-[10px] text-muted-foreground">{stats.total > 0 ? ((v.value / stats.total) * 100).toFixed(1) : 0}%</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Blitz por Mês ({new Date().getFullYear()})</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={blitzPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(152, 72%, 22%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Distribuição por Veículo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={veiculoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                    {veiculoData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Colaboradores por Setor</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.setorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="setor" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(220, 70%, 25%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Planos de Ação</h3>
              <div className="space-y-4 pt-2">
                {[
                  { label: 'Abertos', value: stats.planosAbertos, color: 'bg-status-warning' },
                  { label: 'Em Andamento', value: stats.planosAndamento, color: 'bg-status-info' },
                  { label: 'Vencidos', value: stats.planosVencidos, color: 'bg-status-danger' },
                  { label: 'Concluídos', value: planos.filter(p => p.status === 'concluido').length, color: 'bg-status-ok' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-lg font-bold font-display">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
