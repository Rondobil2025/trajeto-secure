import { cn } from '@/lib/utils';

type Variant = 'ok' | 'warning' | 'danger' | 'info' | 'muted';

const variantClasses: Record<Variant, string> = {
  ok: 'bg-status-ok/15 text-status-ok border-status-ok/30',
  warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  danger: 'bg-status-danger/15 text-status-danger border-status-danger/30',
  info: 'bg-status-info/15 text-status-info border-status-info/30',
  muted: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ variant, children, className }: { variant: Variant; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', variantClasses[variant], className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-status-ok': variant === 'ok',
        'bg-status-warning': variant === 'warning',
        'bg-status-danger': variant === 'danger',
        'bg-status-info': variant === 'info',
        'bg-muted-foreground': variant === 'muted',
      })} />
      {children}
    </span>
  );
}
