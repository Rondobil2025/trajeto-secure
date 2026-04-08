import { AdminSidebar } from '@/components/AdminSidebar';
import { MOCK_LIDERANCAS } from '@/lib/mock-data';
import { formatCPF } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminLiderancas() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold font-display">Lideranças</h1>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Liderança</Button>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
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
                {MOCK_LIDERANCAS.map(l => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.nome}</td>
                    <td className="px-4 py-3 font-mono text-xs">{formatCPF(l.cpf)}</td>
                    <td className="px-4 py-3">{l.email}</td>
                    <td className="px-4 py-3">{l.setor}</td>
                    <td className="px-4 py-3"><StatusBadge variant={l.ativo ? 'ok' : 'danger'}>{l.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
