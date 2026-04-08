import { AdminSidebar } from '@/components/AdminSidebar';
import { KpiCard } from '@/components/KpiCard';
import { DASHBOARD_STATS, CHART_BLITZ_MES, CHART_ADERENCIA_SETOR, CHART_VEICULOS } from '@/lib/mock-data';
import {
  Users, ClipboardCheck, AlertTriangle, TrendingUp, Car, Bike, Truck,
  FileWarning, ShieldAlert, ClipboardList
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminDashboard() {
  const s = DASHBOARD_STATS;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-8 md:px-8">
          <h1 className="text-2xl font-bold font-display text-primary-foreground">Dashboard Executivo</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Blitz de Trajeto Rondobier — Visão Geral</p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-8 -mt-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard title="Colaboradores" value={s.totalColaboradores} icon={Users} />
            <KpiCard title="Blitz no Mês" value={s.blitzMes} icon={ClipboardCheck} />
            <KpiCard title="Pendentes" value={s.pendentes} icon={AlertTriangle} variant="warning" />
            <KpiCard title="Aderência" value={`${s.aderenciaGeral}%`} icon={TrendingUp} variant={s.aderenciaGeral >= 80 ? 'ok' : 'warning'} />
            <KpiCard title="CNH Vencidas" value={s.cnhVencidas} icon={ShieldAlert} variant="danger" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard title="Carros" value={s.porVeiculo.carro} icon={Car} />
            <KpiCard title="Motos" value={s.porVeiculo.moto} icon={Truck} />
            <KpiCard title="Bicicletas" value={s.porVeiculo.bicicleta} icon={Bike} />
            <KpiCard title="Sem CNH" value={s.semCnh} icon={FileWarning} variant="danger" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <KpiCard title="Planos Abertos" value={s.planosAbertos} icon={ClipboardList} variant="warning" />
            <KpiCard title="Planos Vencidos" value={s.planosVencidos} icon={AlertTriangle} variant="danger" />
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Blitz por Mês</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={CHART_BLITZ_MES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(220, 70%, 25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Aderência por Setor</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={CHART_ADERENCIA_SETOR} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="setor" type="category" width={90} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="aderencia" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold font-display mb-4">Distribuição por Veículo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={CHART_VEICULOS} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label>
                    {CHART_VEICULOS.map((_, i) => (
                      <Cell key={i} fill={CHART_VEICULOS[i].fill} />
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
