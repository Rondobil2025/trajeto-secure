import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useColaboradores, ColaboradorDB } from '@/hooks/useColaboradores';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const VEICULOS = [
  { value: 'none', label: '—' },
  { value: 'moto', label: 'Moto' },
  { value: 'carro', label: 'Carro' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'onibus', label: 'Ônibus' },
  { value: 'carona', label: 'Carona' },
];

const SETORES = ['DISTRIBUIÇÃO', 'VENDAS', 'ARMAZÉM', 'ADMINISTRAÇÃO'];

export default function AdminColaboradores() {
  const [busca, setBusca] = useState('');
  const [editing, setEditing] = useState<ColaboradorDB | null>(null);
  const [form, setForm] = useState<Partial<ColaboradorDB>>({});
  const { data: colaboradores = [], isLoading } = useColaboradores();
  const queryClient = useQueryClient();

  const filtered = colaboradores.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf.includes(busca.replace(/\D/g, ''))
  );

  const handleVeiculoChange = async (colaboradorId: string, veiculo: string) => {
    const updateData: any = { veiculo_utilizado: veiculo === 'none' ? '' : veiculo };
    if (veiculo === 'onibus' || veiculo === 'carona') updateData.aderencia = 100;
    const { error } = await supabase.from('colaboradores').update(updateData).eq('id', colaboradorId);
    if (error) { toast.error('Erro ao atualizar'); return; }
    toast.success('Veículo atualizado');
    queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
  };

  const openEdit = (c: ColaboradorDB) => {
    setForm({ ...c });
    setEditing(c);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from('colaboradores').update({
      nome: form.nome,
      setor: form.setor,
      funcao: form.funcao,
      email: form.email,
      contato: form.contato,
      genero: form.genero,
      pilar: form.pilar,
      veiculo_utilizado: form.veiculo_utilizado,
      cnh_numero: form.cnh_numero,
      cnh_categoria: form.cnh_categoria,
      cnh_status: form.cnh_status,
      aderencia: (form.veiculo_utilizado === 'onibus' || form.veiculo_utilizado === 'carona') ? 100 : form.aderencia,
    } as any).eq('id', editing.id);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Colaborador atualizado');
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-8 py-6">
          <h1 className="text-xl font-bold font-display mb-1">Colaboradores</h1>
          <p className="text-sm text-muted-foreground mb-4">{colaboradores.length} colaboradores cadastrados</p>
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou CPF" className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-3 py-3 font-medium">Mat.</th>
                      <th className="text-left px-3 py-3 font-medium">Nome</th>
                      <th className="text-left px-3 py-3 font-medium">CPF</th>
                      <th className="text-left px-3 py-3 font-medium">Setor</th>
                      <th className="text-left px-3 py-3 font-medium">Função</th>
                      <th className="text-left px-3 py-3 font-medium">Veículo</th>
                      <th className="text-left px-3 py-3 font-medium">CNH</th>
                      <th className="text-left px-3 py-3 font-medium">Aderência</th>
                      <th className="text-left px-3 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs">{c.matricula}</td>
                        <td className="px-3 py-2 font-medium text-xs">{c.nome}</td>
                        <td className="px-3 py-2 font-mono text-xs">{formatCPF(c.cpf)}</td>
                        <td className="px-3 py-2 text-xs">{c.setor}</td>
                        <td className="px-3 py-2 text-xs">{c.funcao}</td>
                        <td className="px-3 py-2">
                          <Select value={c.veiculo_utilizado || 'none'} onValueChange={val => handleVeiculoChange(c.id, val)}>
                            <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{VEICULOS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          {c.cnh_status === 'válida' || c.cnh_status === 'Em dia' ? <StatusBadge variant="ok">Válida</StatusBadge>
                            : c.cnh_status === 'vencida' || c.cnh_status === 'Vencido' ? <StatusBadge variant="danger">Vencida</StatusBadge>
                            : <StatusBadge variant="warning">Sem CNH</StatusBadge>}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-status-ok" style={{ width: `${c.aderencia || 0}%` }} />
                            </div>
                            <span className="text-xs">{c.aderencia || 0}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Nenhum colaborador encontrado.</div>}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Colaborador</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><label className="text-xs font-medium">Nome</label><Input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Setor</label>
                <Select value={form.setor || ''} onValueChange={v => setForm({...form, setor: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Função</label><Input value={form.funcao || ''} onChange={e => setForm({...form, funcao: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Email</label><Input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="text-xs font-medium">Contato</label><Input value={form.contato || ''} onChange={e => setForm({...form, contato: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Veículo</label>
                <Select value={form.veiculo_utilizado || 'none'} onValueChange={v => setForm({...form, veiculo_utilizado: v === 'none' ? '' : v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VEICULOS.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Pilar</label><Input value={form.pilar || ''} onChange={e => setForm({...form, pilar: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs font-medium">CNH Nº</label><Input value={form.cnh_numero || ''} onChange={e => setForm({...form, cnh_numero: e.target.value})} /></div>
              <div><label className="text-xs font-medium">Categoria</label><Input value={form.cnh_categoria || ''} onChange={e => setForm({...form, cnh_categoria: e.target.value})} /></div>
              <div><label className="text-xs font-medium">Status CNH</label>
                <Select value={form.cnh_status || 'sem_cnh'} onValueChange={v => setForm({...form, cnh_status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em dia">Em dia</SelectItem>
                    <SelectItem value="válida">Válida</SelectItem>
                    <SelectItem value="Vencido">Vencida</SelectItem>
                    <SelectItem value="sem_cnh">Sem CNH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Gênero</label><Input value={form.genero || ''} onChange={e => setForm({...form, genero: e.target.value})} /></div>
              <div><label className="text-xs font-medium">Matrícula</label><Input value={form.matricula || ''} disabled /></div>
            </div>
            <Button onClick={saveEdit} className="w-full mt-2">Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
