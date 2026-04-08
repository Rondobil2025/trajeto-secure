import { AdminSidebar } from '@/components/AdminSidebar';
import { formatCPF } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2, UserCheck } from 'lucide-react';
import { useLiderancas } from '@/hooks/useLiderancas';
import { useState } from 'react';

export default function AdminLiderancas() {
  const { data: liderancas = [], isLoading } = useLiderancas();
  const [busca, setBusca] = useState('');

  const filtered = liderancas.filter(l =>
    l.nome.toLowerCase().includes(busca.toLowerCase()) ||
    l.cpf.includes(busca.replace(/\D/g, '')) ||
    (l.email || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Lideranças</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">{liderancas.length} lideranças cadastradas</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, CPF ou email..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium">Nome</th>
                      <th className="text-left px-4 py-3 font-medium">CPF</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Setor</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(l => (
                      <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{l.nome}</td>
                        <td className="px-4 py-3 font-mono text-xs">{formatCPF(l.cpf)}</td>
                        <td className="px-4 py-3 text-sm">{l.email || '—'}</td>
                        <td className="px-4 py-3">{l.setor}</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={l.ativo ? 'ok' : 'danger'}>
                            {l.ativo ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma liderança encontrada.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
