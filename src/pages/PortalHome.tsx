import { Link } from 'react-router-dom';
import { ClipboardCheck, Search, AlertTriangle, ClipboardList, ChevronRight, Car } from 'lucide-react';
import logoBlitz from '@/assets/logo-blitz.png';

const MENU_ITEMS = [
  {
    to: '/portal/nova-blitz',
    icon: ClipboardCheck,
    label: 'Iniciar Blitz',
    desc: 'Nova inspeção de veículo',
    color: 'bg-primary/10 text-primary',
  },
  {
    to: '/portal/consultar',
    icon: Search,
    label: 'Consultar Blitz',
    desc: 'Buscar inspeções realizadas',
    color: 'bg-status-info/10 text-status-info',
  },
  {
    to: '/portal/pendencias',
    icon: AlertTriangle,
    label: 'Pendências',
    desc: 'Blitz vencidas e próximas',
    color: 'bg-status-warning/10 text-status-warning',
    badge: 3,
  },
  {
    to: '/portal/planos',
    icon: ClipboardList,
    label: 'Planos de Ação',
    desc: 'Acompanhar ações corretivas',
    color: 'bg-secondary/15 text-secondary-foreground',
    badge: 4,
  },
];

export default function PortalHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header institucional */}
      <div className="relative overflow-hidden">
        {/* Green header */}
        <div className="brand-gradient px-5 pt-8 pb-14">
          <div className="flex items-center gap-3 mb-1">
            <img src={logoBlitz} alt="Logo Blitz de Trajeto" width={44} height={44} className="rounded-lg shadow-md" />
            <div>
              <h1 className="text-xl font-extrabold font-display text-primary-foreground tracking-tight leading-tight">
                Blitz de Trajeto
              </h1>
              <p className="text-[11px] text-primary-foreground/60 uppercase tracking-[0.2em] font-medium">
                Segurança no Trânsito · Rondobier
              </p>
            </div>
          </div>
        </div>
        {/* Yellow accent stripe */}
        <div className="yellow-stripe h-1.5" />
      </div>

      {/* Quick stats */}
      <div className="px-4 -mt-8 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Hoje', value: '12', sub: 'inspeções' },
            { label: 'Pendentes', value: '3', sub: 'atrasadas' },
            { label: 'Conformidade', value: '94%', sub: 'do mês' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border shadow-sm p-3 text-center">
              <p className="text-lg font-bold font-display text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-4 pt-5 pb-24 space-y-2.5 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-1">Menu Principal</p>
        {MENU_ITEMS.map((item) => (
          <Link key={item.to} to={item.to}>
            <div className="flex items-center gap-3.5 rounded-xl bg-card border shadow-sm p-4 active:scale-[0.98] transition-all hover:shadow-md">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold font-display text-sm">{item.label}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-status-danger px-1.5 text-[10px] font-bold text-status-danger-foreground">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer info */}
      <div className="px-4 pb-20 max-w-lg mx-auto w-full">
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5 flex items-start gap-3">
          <Car className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary">Segurança em primeiro lugar</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Realize as inspeções diárias para garantir a segurança dos colaboradores no trânsito.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
