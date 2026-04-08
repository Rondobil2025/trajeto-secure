import { Link } from 'react-router-dom';
import { Shield, ClipboardCheck, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="brand-gradient px-6 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-6">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground tracking-tight">
          Blitz de Trajeto
        </h1>
        <p className="text-lg text-primary-foreground/70 mt-2 uppercase tracking-[0.2em] font-display">
          Rondobier
        </p>
        <p className="text-sm text-primary-foreground/50 mt-4 max-w-md mx-auto">
          Sistema de gestão de inspeções veiculares, conformidade e auditoria
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to="/portal">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 h-12">
              <ClipboardCheck className="h-5 w-5 mr-2" />
              Portal da Liderança
            </Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <BarChart3 className="h-5 w-5 mr-2" />
              Painel Administrativo
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-status-ok/10 mb-4">
              <ClipboardCheck className="h-6 w-6 text-status-ok" />
            </div>
            <h3 className="font-semibold font-display mb-2">Checklists Inteligentes</h3>
            <p className="text-sm text-muted-foreground">Checklists dinâmicos por tipo de veículo com validações automáticas</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-status-info/10 mb-4">
              <BarChart3 className="h-6 w-6 text-status-info" />
            </div>
            <h3 className="font-semibold font-display mb-2">Dashboard Executivo</h3>
            <p className="text-sm text-muted-foreground">Indicadores, gráficos e relatórios para gestão e auditoria</p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold font-display mb-2">Gestão Completa</h3>
            <p className="text-sm text-muted-foreground">Planos de ação, termos de ciência e rastreabilidade total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
