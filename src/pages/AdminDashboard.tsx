import { AdminSidebar } from '@/components/AdminSidebar';
import { KpiCard } from '@/components/KpiCard';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useBlitzList } from '@/hooks/useBlitz';
import { usePlanosAcao } from '@/hooks/usePlanosAcao';
import {
  Users, ClipboardCheck, AlertTriangle, TrendingUp, Car, Bike, Truck,
  FileWarning, ShieldAlert, ClipboardList, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const { data: colaboradores = [], isLoading: loadingColab } = useColaboradores();
  const { data: blitzList = [], isLoading: loadingBlitz } = useBlitzList();
  const { data: planos = [], isLoading: loadingPlanos } = usePlanosAcao();

  const isLoading = loadingColab || loadingBlitz || loadingPlanos;

  const stats = useMemo(() => {
    const total = colaboradores.length;
    const cnhVencidas = colaboradores.filter(c => c.cnh_status === 'vencida').length;
    const semCnh = colaboradores.filter(c => c.cnh_status === 'sem_cnh').length;

    const porSetor: Record<string, number> = {};
    colaboradores.forEach(c => {
      porSetor[c.setor] = (porSetor[c.setor] || 0) + 1;
    });

    const motoristas = colaboradores.filter(c =>
      c.funcao.toLowerCase().includes('motorista') || c.funcao.toLowerCase().includes('truck') || c.funcao.toLowerCase().includes('van')
    ).length;

    const pendentes = colaboradores.filter(c => {
      if (!c.data_ultima_blitz) return true;
      const diff = (Date.now() - new Date(c.data_ultima_blitz).getTime()) / (1000 * 60 * 60 * 24);
      return diff > 90;
    }).length;

    const totalAderencia = colaboradores.reduce((sum, c) => sum + c.aderencia, 0);
    const aderenciaGeral = total > 0 ? Math.round(totalAderencia / total) : 0;

    const setorData = Object.entries(porSetor).map(([setor, count]) => ({
      setor,
      total: count,
    }));

    const planosAbertos = planos.filter(p => p.status === 'aberto').length;
    const planosVencidos = planos.filter(p => p.status === 'vencido').length;

    return { total, cnhVencidas, semCnh, motoristas, pendentes, aderenciaGeral, setorData, totalBlitz: blitzList.length, planosAbertos, planosVencidos };
  }, [colaboradores, blitzList, planos]);

  const veiculoData = useMemo(() => {
    const counts = { 'Moto': 0, 'Carro/Truck': 0, 'Bicicleta': 0 };
    blitzList.forEach(b => {
      const v = b.veiculo_tipo?.toLowerCase() || '';
      if (v.includes('moto')) counts['Moto']++;
      else if (v.includes('carro') || v.includes('truck') || v.includes('van')) counts['Carro/Truck']++;
      else if (v.includes('bicicleta') || v.includes('bike')) counts['Bicicleta']++;
    });
    return [
      { name: 'Moto', value: counts['Moto'], fill: 'hsl(152, 72%, 30%)' },
      { name: 'Carro/Truck', value: counts['Carro/Truck'], fill: 'hsl(217, 91%, 60%)' },
      { name: 'Bicicleta', value: counts['Bicicleta'], fill: 'hsl(38, 92%, 50%)' },
    ];
  }, [blitzList]);

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
          <p className="text-sm text-primary-foreground/60 mt-1">Blitz de Trajeto Rondobier — Visão Geral</p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-8 -mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard title="Colaboradores" value={stats.total} icon={Users} />
            <KpiCard title="Motoristas" value={stats.motoristas} icon={Truck} />
            <KpiCard title="Total Blitz" value={stats.totalBlitz} icon={ClipboardCheck} />
            <KpiCard title="Pendentes" value={stats.pendentes} icon={AlertTriangle} variant="warning" />
            <KpiCard title="Aderência" value={`${stats.aderenciaGeral}%`} icon={TrendingUp} variant={stats.aderenciaGeral >= 80 ? 'ok' : 'warning'} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="CNH Vencidas" value={stats.cnhVencidas} icon={ShieldAlert} variant="danger" />
            <KpiCard title="Sem CNH" value={stats.semCnh} icon={FileWarning} variant="danger" />
            <KpiCard title="Planos Abertos" value={stats.planosAbertos} icon={ClipboardList} variant="warning" />
            <KpiCard title="Planos Vencidos" value={stats.planosVencidos} icon={AlertTriangle} variant="danger" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Colaboradores por Setor</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.setorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="setor" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(220, 70%, 25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Blitz por Tipo de Veículo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={veiculoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                    {veiculoData.map((_, i) => (
                      <Cell key={i} fill={veiculoData[i].fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
