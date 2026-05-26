import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewColaboradorDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    nome: '', matricula: '', cpf: '', setor: '', funcao: '', admissao: '',
    pilar: 'DPO', veiculo_utilizado: '', cnh_status: 'sem_cnh',
  });
  const upd = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.nome || !form.cpf || !form.matricula || !form.setor || !form.funcao || !form.admissao) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha nome, matrícula, CPF, setor, função e admissão.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('colaboradores' as any).insert({ ...form, ativo: true });
      if (error) throw error;
      toast({ title: 'Criado', description: 'Colaborador adicionado.' });
      qc.invalidateQueries({ queryKey: ['colaboradores'] });
      onOpenChange(false);
      setForm({ nome: '', matricula: '', cpf: '', setor: '', funcao: '', admissao: '', pilar: 'DPO', veiculo_utilizado: '', cnh_status: 'sem_cnh' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Novo Colaborador</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <F label="Nome *"><Input value={form.nome} onChange={(e) => upd('nome', e.target.value)} /></F>
          <F label="Matrícula *"><Input value={form.matricula} onChange={(e) => upd('matricula', e.target.value)} /></F>
          <F label="CPF *"><Input value={form.cpf} onChange={(e) => upd('cpf', e.target.value.replace(/\D/g, ''))} /></F>
          <F label="Setor *"><Input value={form.setor} onChange={(e) => upd('setor', e.target.value)} /></F>
          <F label="Função *"><Input value={form.funcao} onChange={(e) => upd('funcao', e.target.value)} /></F>
          <F label="Admissão *"><Input type="date" value={form.admissao} onChange={(e) => upd('admissao', e.target.value)} /></F>
          <F label="Pilar">
            <Select value={form.pilar} onValueChange={(v) => upd('pilar', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DPO">DPO</SelectItem>
                <SelectItem value="SPO">SPO</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Veículo">
            <Select value={form.veiculo_utilizado} onValueChange={(v) => upd('veiculo_utilizado', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {['MOTO', 'CARRO', 'BICICLETA', 'ONIBUS', 'CARONA'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}
