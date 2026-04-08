import { Link, useLocation } from 'react-router-dom';
import { Home, Search, AlertTriangle, ClipboardList, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/portal', icon: Home, label: 'Início' },
  { to: '/portal/consultar', icon: Search, label: 'Consultar' },
  { to: '/portal/pendencias', icon: AlertTriangle, label: 'Pendências' },
  { to: '/portal/planos', icon: ClipboardList, label: 'Planos' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm safe-area-bottom md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', active && 'text-primary')} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
