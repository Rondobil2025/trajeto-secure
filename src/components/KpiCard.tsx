import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'ok' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'border-border',
  ok: 'border-status-ok/30',
  warning: 'border-status-warning/30',
  danger: 'border-status-danger/30',
};

const iconBgStyles = {
  default: 'bg-primary/10 text-primary',
  ok: 'bg-status-ok/10 text-status-ok',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-danger/10 text-status-danger',
};

export function KpiCard({ title, value, subtitle, icon: Icon, variant = 'default' }: KpiCardProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-sm animate-fade-in', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn('rounded-lg p-2.5', iconBgStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
