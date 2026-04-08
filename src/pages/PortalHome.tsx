import { Link } from 'react-router-dom';
import { Shield, ClipboardCheck, Search, AlertTriangle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="brand-gradient px-6 pt-12 pb-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-4">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-display text-primary-foreground tracking-tight">
          Blitz de Trajeto
        </h1>
        <p className="text-sm text-primary-foreground/70 mt-1 uppercase tracking-widest">Rondobier</p>
      </div>

      {/* Action Cards */}
      <div className="flex-1 px-4 -mt-8 pb-24 space-y-3 max-w-lg mx-auto w-full">
        <Link to="/portal/nova-blitz">
          <div className="flex items-center gap-4 rounded-xl bg-card border shadow-sm p-5 active:scale-[0.98] transition-transform">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-ok/10">
              <ClipboardCheck className="h-6 w-6 text-status-ok" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-display">Iniciar Blitz</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Nova inspeção de veículo</p>
            </div>
          </div>
        </Link>

        <Link to="/portal/consultar">
          <div className="flex items-center gap-4 rounded-xl bg-card border shadow-sm p-5 active:scale-[0.98] transition-transform">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-info/10">
              <Search className="h-6 w-6 text-status-info" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-display">Consultar Blitz</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Buscar inspeções realizadas</p>
            </div>
          </div>
        </Link>

        <Link to="/portal/pendencias">
          <div className="flex items-center gap-4 rounded-xl bg-card border shadow-sm p-5 active:scale-[0.98] transition-transform">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-warning/10">
              <AlertTriangle className="h-6 w-6 text-status-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-display">Pendências</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Blitz vencidas e próximas</p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-danger text-[10px] font-bold text-status-danger-foreground">3</span>
          </div>
        </Link>

        <Link to="/portal/planos">
          <div className="flex items-center gap-4 rounded-xl bg-card border shadow-sm p-5 active:scale-[0.98] transition-transform">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-display">Planos de Ação</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Acompanhar ações corretivas</p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-status-warning text-[10px] font-bold text-status-warning-foreground">4</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
