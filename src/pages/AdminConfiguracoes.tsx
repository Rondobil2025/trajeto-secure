import { AdminSidebar } from '@/components/AdminSidebar';
import { Settings, Database, Shield, Bell } from 'lucide-react';

export default function AdminConfiguracoes() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Configurações</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">Ajustes do sistema</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold font-display">Banco de Dados</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className="text-status-ok font-medium">● Conectado</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Sincronização</span>
                <span className="font-medium">Tempo real</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Última atualização</span>
                <span className="font-medium">{new Date().toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold font-display">Notificações</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Alerta CNH vencimento (30 dias)</span>
                <span className="text-status-ok font-medium">Ativo</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Alerta blitz pendente</span>
                <span className="text-status-ok font-medium">Ativo</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Email automático</span>
                <span className="text-status-ok font-medium">Configurado</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold font-display">Segurança</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">RLS (Row Level Security)</span>
                <span className="text-status-ok font-medium">Ativado</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Acesso público leitura</span>
                <span className="font-medium">Habilitado</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
