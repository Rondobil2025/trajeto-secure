import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, ClipboardList, FileText,
  Upload, Shield, Settings, BarChart3, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/colaboradores', icon: Users, label: 'Colaboradores' },
  { to: '/admin/liderancas', icon: UserCheck, label: 'Lideranças' },
  { to: '/admin/blitz', icon: ClipboardList, label: 'Blitz' },
  { to: '/admin/planos', icon: AlertTriangle, label: 'Planos de Ação' },
  { to: '/admin/termos', icon: FileText, label: 'Termos' },
  { to: '/admin/importar', icon: Upload, label: 'Importar QLP' },
  { to: '/admin/auditoria', icon: Shield, label: 'Auditoria' },
  { to: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold font-display tracking-tight">BLITZ</h1>
          <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">Rondobier</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {MENU.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
