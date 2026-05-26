import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const TRANSPORT_OPTIONS = ['', 'MOTO', 'CARRO', 'BICICLETA', 'ONIBUS', 'CARONA', 'FERIAS', 'AFASTADO', 'N/A'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador: any | null;
  ano: number;
  mensalData: any[];
}

export function EditInventarioDialog({ open, onOpenChange, colaborador, ano, mensalData }: Props) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [meses, setMeses] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!colaborador) return;
    setForm({ ...colaborador });
    const m: Record<number, string> = {};
    for (let i = 1; i <= 12; i++) {
      const row = mensalData.find((d) => d.colaborador_id === colaborador.id && d.mes === i && d.ano === ano);
      m[i] = row?.tipo_transporte?.toUpperCase() || '';
    }
    setMeses(m);
  }, [colaborador, mensalData, ano]);

  if (!colaborador) return null;

  const upd = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        matricula: form.matricula,
        cpf: form.cpf,
        setor: form.setor,
        funcao: form.funcao,
        admissao: form.admissao,
        data_nascimento: form.data_nascimento || null,
        genero: form.genero || '',
        email: form.email || '',
        contato: form.contato || '',
        pilar: form.pilar || '',
        veiculo_utilizado: form.veiculo_utilizado || '',
        cnh_numero: form.cnh_numero || '',
        cnh_validade: form.cnh_validade || null,
        cnh_categoria: form.cnh_categoria || '',
        cnh_status: form.cnh_status || 'sem_cnh',
        curso_direcao_defensiva: !!form.curso_direcao_defensiva,
        ativo: form.ativo !== false,
      };
      const { error } = await supabase.from('colaboradores' as any).update(payload).eq('id', colaborador.id);
      if (error) throw error;

      // Save mensal data
      for (let i = 1; i <= 12; i++) {
        const tipo = meses[i] || '';
        const existing = mensalData.find((d) => d.colaborador_id === colaborador.id && d.mes === i && d.ano === ano);
        if (tipo) {
          if (existing) {
            await supabase.from('colaborador_mensal' as any).update({ tipo_transporte: tipo }).eq('id', existing.id);
          } else {
            await supabase.from('colaborador_mensal' as any).insert({
              colaborador_id: colaborador.id,
              ano,
              mes: i,
              tipo_transporte: tipo,
            });
          }
        } else if (existing) {
          await supabase.from('colaborador_mensal' as any).update({ tipo_transporte: 'N/A' }).eq('id', existing.id);
        }
      }

      toast({ title: 'Salvo', description: 'Colaborador atualizado.' });
      qc.invalidateQueries({ queryKey: ['colaboradores'] });
      qc.invalidateQueries({ queryKey: ['colaborador_mensal', ano] });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Colaborador — {colaborador.nome}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Nome"><Input value={form.nome || ''} onChange={(e) => upd('nome', e.target.value)} /></Field>
          <Field label="Matrícula"><Input value={form.matricula || ''} onChange={(e) => upd('matricula', e.target.value)} /></Field>
          <Field label="CPF"><Input value={form.cpf || ''} onChange={(e) => upd('cpf', e.target.value)} /></Field>
          <Field label="Setor"><Input value={form.setor || ''} onChange={(e) => upd('setor', e.target.value)} /></Field>
          <Field label="Função"><Input value={form.funcao || ''} onChange={(e) => upd('funcao', e.target.value)} /></Field>
          <Field label="Pilar">
            <Select value={form.pilar || ''} onValueChange={(v) => upd('pilar', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DPO">DPO</SelectItem>
                <SelectItem value="SPO">SPO</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Admissão"><Input type="date" value={form.admissao || ''} onChange={(e) => upd('admissao', e.target.value)} /></Field>
          <Field label="Data Nascimento"><Input type="date" value={form.data_nascimento || ''} onChange={(e) => upd('data_nascimento', e.target.value)} /></Field>
          <Field label="Gênero">
            <Select value={form.genero || ''} onValueChange={(v) => upd('genero', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="F">F</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Email"><Input value={form.email || ''} onChange={(e) => upd('email', e.target.value)} /></Field>
          <Field label="Contato"><Input value={form.contato || ''} onChange={(e) => upd('contato', e.target.value)} /></Field>
          <Field label="Veículo Utilizado">
            <Select value={form.veiculo_utilizado || ''} onValueChange={(v) => upd('veiculo_utilizado', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {['MOTO', 'CARRO', 'BICICLETA', 'ONIBUS', 'CARONA'].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="CNH Número"><Input value={form.cnh_numero || ''} onChange={(e) => upd('cnh_numero', e.target.value)} /></Field>
          <Field label="CNH Validade"><Input type="date" value={form.cnh_validade || ''} onChange={(e) => upd('cnh_validade', e.target.value)} /></Field>
          <Field label="CNH Categoria"><Input value={form.cnh_categoria || ''} onChange={(e) => upd('cnh_categoria', e.target.value)} /></Field>
          <Field label="Curso Direção Defensiva">
            <div className="flex items-center h-10 gap-2">
              <Checkbox checked={!!form.curso_direcao_defensiva} onCheckedChange={(v) => upd('curso_direcao_defensiva', !!v)} />
              <span className="text-sm">Concluído</span>
            </div>
          </Field>
        </div>

        <div className="border-t pt-4 mt-2">
          <h3 className="font-semibold mb-2 text-sm">Transporte Mensal — {ano}</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {MESES.map((m, idx) => (
              <Field key={m} label={m}>
                <Select value={meses[idx + 1] || ''} onValueChange={(v) => setMeses((p) => ({ ...p, [idx + 1]: v === '__none__' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {TRANSPORT_OPTIONS.filter(Boolean).map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
