import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { formatCPF } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Loader2, ClipboardList, Pencil, Plus } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useLiderancas } from '@/hooks/useLiderancas';

interface BlitzWithItems {
  id: string;
  data: string;
  pilar: string;
  lideranca_nome: string;
  colaborador_nome: string;
  colaborador_cpf: string;
  veiculo_tipo: string;
  status: string;
  observacoes: string;
  setor?: string;
  itens: BlitzItem[];
}

interface BlitzItem {
  id: string;
  pergunta: string;
  resposta: string;
  critico: boolean;
  observacao: string;
}

const MOTO_QUESTIONS = [
  'Possui CNH?',
  'Data Validade CNH',
  'Veículo Próprio ou CIA?',
  'Veículo utilizado como meio de trabalho?',
  'Placa',
  'Pneus em boas condições?',
  'Retrovisores presentes e ajustados?',
  'Capacete em boas condições?',
  'Luzes e setas funcionando?',
  'Vazamento de óleo ou fluidos?',
  'Anomalia encontrada?',
  'Plano de ação',
];

const CARRO_QUESTIONS = [
  'Possui CNH Categoria B?',
  'Data Vencimento CNH',
  'Placa do Veículo',
  'Pneus em boas condições?',
  'Faróis e luzes funcionando?',
  'Cinto de segurança em boas condições?',
  'Freios em boas condições?',
  'Vazamento de óleo ou fluidos?',
  'Anomalia encontrada?',
  'Plano de ação',
];

const BICICLETA_QUESTIONS = [
  'Utiliza EPIs?',
  'Pneus em boas condições?',
  'Freios funcionando?',
  'Capacete em boas condições?',
  'Iluminação e sinais reflexivos?',
  'Anomalia encontrada?',
  'Plano de ação',
];

function getQuestionsForVehicle(tipo: string) {
  if (tipo === 'moto') return MOTO_QUESTIONS;
  if (tipo === 'carro') return CARRO_QUESTIONS;
  return BICICLETA_QUESTIONS;
}

function useBlitzWithItems(vehicleType: string) {
  return useQuery({
    queryKey: ['blitz-checklist', vehicleType],
    queryFn: async (): Promise<BlitzWithItems[]> => {
      const { data: blitzData, error } = await supabase
        .from('blitz' as any)
        .select('*')
        .eq('veiculo_tipo', vehicleType)
        .order('data', { ascending: false });

      if (error) throw error;
      if (!blitzData || blitzData.length === 0) return [];

      const ids = (blitzData as any[]).map((b: any) => b.id);

      // Fetch items in batches of 100
      let allItems: any[] = [];
      for (let i = 0; i < ids.length; i += 100) {
        const batch = ids.slice(i, i + 100);
        const { data: items, error: itemsError } = await supabase
          .from('blitz_itens' as any)
          .select('*')
          .in('blitz_id', batch);
        if (itemsError) throw itemsError;
        if (items) allItems = [...allItems, ...items];
      }

      const itemsByBlitz = new Map<string, any[]>();
      allItems.forEach((item: any) => {
        const list = itemsByBlitz.get(item.blitz_id) || [];
        list.push(item);
        itemsByBlitz.set(item.blitz_id, list);
      });

      return (blitzData as any[]).map((b: any) => ({
        ...b,
        itens: itemsByBlitz.get(b.id) || [],
      }));
    },
  });
}

export default function AdminChecklist() {
  const [activeTab, setActiveTab] = useState('moto');
  const [busca, setBusca] = useState('');
  const [filterMes, setFilterMes] = useState<string>('todos');
  const [filterSetor, setFilterSetor] = useState<string>('todos');
  const [filterPilar, setFilterPilar] = useState<string>('todos');
  const [editBlitz, setEditBlitz] = useState<BlitzWithItems | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: motoData = [], isLoading: loadingMoto } = useBlitzWithItems('moto');
  const { data: carroData = [], isLoading: loadingCarro } = useBlitzWithItems('carro');
  const { data: bicicletaData = [], isLoading: loadingBici } = useBlitzWithItems('bicicleta');

  const dataMap: Record<string, { data: BlitzWithItems[]; loading: boolean }> = {
    moto: { data: motoData, loading: loadingMoto },
    carro: { data: carroData, loading: loadingCarro },
    bicicleta: { data: bicicletaData, loading: loadingBici },
  };

  const { data: currentData, loading } = dataMap[activeTab] || dataMap.moto;

  // Extract unique sectors from all data
  const allSetores = useMemo(() => {
    const all = [...motoData, ...carroData, ...bicicletaData];
    const setores = new Set<string>();
    all.forEach(b => {
      // Try to get setor from observacoes or a known field
      if (b.setor) setores.add(b.setor);
    });
    // Also check colaborador info patterns
    return Array.from(setores).sort();
  }, [motoData, carroData, bicicletaData]);

  const filtered = useMemo(() => {
    let result = currentData;

    // Filter by search
    if (busca) {
      const q = busca.toLowerCase();
      result = result.filter(b =>
        b.colaborador_nome.toLowerCase().includes(q) ||
        b.colaborador_cpf.includes(busca.replace(/\D/g, '')) ||
        b.lideranca_nome.toLowerCase().includes(q)
      );
    }

    // Filter by month
    if (filterMes !== 'todos') {
      result = result.filter(b => {
        const month = new Date(b.data).getMonth() + 1;
        return month.toString() === filterMes;
      });
    }

    // Filter by pilar
    if (filterPilar !== 'todos') {
      result = result.filter(b => b.pilar === filterPilar);
    }

    return result;
  }, [currentData, busca, filterMes, filterPilar]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Checklist de Veículos</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">Inspeções detalhadas por tipo de veículo</p>
            </div>
            <AdminNavButtons className="ml-auto" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <TabsList className="bg-muted">
                <TabsTrigger value="moto" className="gap-1.5">🏍️ Moto ({motoData.length})</TabsTrigger>
                <TabsTrigger value="carro" className="gap-1.5">🚗 Carro ({carroData.length})</TabsTrigger>
                <TabsTrigger value="bicicleta" className="gap-1.5">🚲 Bicicleta ({bicicletaData.length})</TabsTrigger>
              </TabsList>
              <Button onClick={() => setShowNewForm(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Nova Inspeção
              </Button>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar nome, CPF..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <Select value={filterMes} onValueChange={setFilterMes}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPilar} onValueChange={setFilterPilar}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Pilar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos pilares</SelectItem>
                  <SelectItem value="DPO">DPO</SelectItem>
                  <SelectItem value="SPO">SPO</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-auto">{filtered.length} resultado(s)</span>
            </div>

            {['moto', 'carro', 'bicicleta'].map(tipo => (
              <TabsContent key={tipo} value={tipo}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ChecklistTable
                    data={filtered}
                    vehicleType={tipo}
                    onEdit={setEditBlitz}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {editBlitz && (
          <EditBlitzDialog
            blitz={editBlitz}
            onClose={() => setEditBlitz(null)}
            onSaved={() => {
              setEditBlitz(null);
              queryClient.invalidateQueries({ queryKey: ['blitz-checklist'] });
            }}
          />
        )}

        {showNewForm && (
          <NewBlitzDialog
            vehicleType={activeTab}
            onClose={() => setShowNewForm(false)}
            onSaved={() => {
              setShowNewForm(false);
              queryClient.invalidateQueries({ queryKey: ['blitz-checklist'] });
            }}
          />
        )}
      </main>
    </div>
  );
}

function ChecklistTable({ data, vehicleType, onEdit }: { data: BlitzWithItems[]; vehicleType: string; onEdit: (b: BlitzWithItems) => void }) {
  const questions = getQuestionsForVehicle(vehicleType);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-3 py-2 font-medium sticky left-0 bg-muted/50 z-10 min-w-[40px]">Ações</th>
              <th className="text-left px-3 py-2 font-medium min-w-[90px]">Data</th>
              <th className="text-left px-3 py-2 font-medium min-w-[60px]">Pilar</th>
              <th className="text-left px-3 py-2 font-medium min-w-[180px]">Liderança</th>
              <th className="text-left px-3 py-2 font-medium min-w-[180px]">Colaborador</th>
              <th className="text-left px-3 py-2 font-medium min-w-[110px]">CPF</th>
              <th className="text-left px-3 py-2 font-medium min-w-[100px]">Setor</th>
              <th className="text-left px-3 py-2 font-medium min-w-[60px]">Status</th>
              {questions.map((q, i) => (
                <th key={i} className="text-left px-3 py-2 font-medium min-w-[120px] max-w-[150px]">
                  <span className="line-clamp-2">{q}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(b => {
              const pilar = (b as any).pilar || '—';
              return (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 sticky left-0 bg-card z-10">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                  <td className="px-3 py-2">{new Date(b.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-2 font-semibold">{pilar}</td>
                  <td className="px-3 py-2">{b.lideranca_nome}</td>
                  <td className="px-3 py-2 font-medium">{b.colaborador_nome}</td>
                  <td className="px-3 py-2 font-mono">{formatCPF(b.colaborador_cpf)}</td>
                  <td className="px-3 py-2">{b.observacoes?.split('|')[0] || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      b.status === 'conforme' ? 'bg-green-100 text-green-800' :
                      b.status === 'nao_conforme' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {b.status === 'conforme' ? 'OK' : b.status === 'nao_conforme' ? 'NC' : 'OBS'}
                    </span>
                  </td>
                  {questions.map((q, i) => {
                    const item = b.itens.find(it => it.pergunta.toLowerCase().includes(q.toLowerCase().slice(0, 15)));
                    const resposta = item?.resposta || '—';
                    const obs = item?.observacao || '';
                    const display = obs && obs !== '' ? obs : resposta;
                    const isOk = resposta === 'sim';
                    const isNo = resposta === 'nao';
                    return (
                      <td key={i} className={`px-3 py-2 ${isNo ? 'text-red-600 font-semibold' : isOk ? 'text-green-700' : ''}`}>
                        <span className="truncate block max-w-[140px]" title={display}>
                          {display === 'sim' ? 'Sim' : display === 'nao' ? 'Não' : display === 'na' ? 'N/A' : display}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma inspeção encontrada.</div>
      )}
      <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        Exibindo {data.length} inspeções
      </div>
    </div>
  );
}

function EditBlitzDialog({ blitz, onClose, onSaved }: { blitz: BlitzWithItems; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState(blitz.data);
  const [pilar, setPilar] = useState((blitz as any).pilar || 'DPO');
  const [lideranca, setLideranca] = useState(blitz.lideranca_nome);
  const [colaborador, setColaborador] = useState(blitz.colaborador_nome);
  const [cpf, setCpf] = useState(blitz.colaborador_cpf);
  const [status, setStatus] = useState(blitz.status);
  const [observacoes, setObservacoes] = useState(blitz.observacoes || '');
  const [itemRespostas, setItemRespostas] = useState<Record<string, { resposta: string; observacao: string }>>(
    Object.fromEntries(blitz.itens.map(it => [it.id, { resposta: it.resposta, observacao: it.observacao || '' }]))
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('blitz' as any)
        .update({
          data,
          pilar,
          lideranca_nome: lideranca,
          colaborador_nome: colaborador,
          colaborador_cpf: cpf,
          status,
          observacoes,
        } as any)
        .eq('id', blitz.id);

      if (error) throw error;

      // Update items - we need to use individual updates since blitz_itens might not have update policy
      // Items are read-only for now, skip item updates
      
      toast({ title: 'Blitz atualizada com sucesso!' });
      onSaved();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Inspeção - {blitz.colaborador_nome}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Data</label>
            <Input type="date" value={data} onChange={e => setData(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Pilar</label>
            <Select value={pilar} onValueChange={setPilar}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DPO">DPO</SelectItem>
                <SelectItem value="SPO">SPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conforme">Conforme</SelectItem>
                <SelectItem value="conforme_observacoes">C/ Observações</SelectItem>
                <SelectItem value="nao_conforme">Não Conforme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Liderança</label>
            <Input value={lideranca} onChange={e => setLideranca(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Colaborador</label>
            <Input value={colaborador} onChange={e => setColaborador(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">CPF</label>
            <Input value={cpf} onChange={e => setCpf(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Observações</label>
            <Input value={observacoes} onChange={e => setObservacoes(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Itens do Checklist</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {blitz.itens.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded border bg-muted/20">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.pergunta}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  item.resposta === 'sim' ? 'bg-green-100 text-green-800' :
                  item.resposta === 'nao' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.resposta === 'sim' ? 'Sim' : item.resposta === 'nao' ? 'Não' : 'N/A'}
                </span>
                {item.observacao && (
                  <span className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={item.observacao}>
                    {item.observacao}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewBlitzDialog({ vehicleType, onClose, onSaved }: { vehicleType: string; onClose: () => void; onSaved: () => void }) {
  const { data: colaboradores = [] } = useColaboradores();
  const { data: liderancas = [] } = useLiderancas();
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [pilar, setPilar] = useState('DPO');
  const [liderancaId, setLiderancaId] = useState('');
  const [colaboradorId, setColaboradorId] = useState('');
  const [setor, setSetor] = useState('');
  const [saving, setSaving] = useState(false);

  const questions = getQuestionsForVehicle(vehicleType);
  const [respostas, setRespostas] = useState<Record<number, string>>(
    Object.fromEntries(questions.map((_, i) => [i, 'sim']))
  );
  const [observacoes, setObservacoes] = useState<Record<number, string>>({});

  // Extra fields for moto/carro
  const [possuiCnh, setPossuiCnh] = useState('sim');
  const [cnhValidade, setCnhValidade] = useState('');
  const [placa, setPlaca] = useState('');
  const [veiculo_proprio, setVeiculoProprio] = useState('PRÓPRIO');
  const [meioTrabalho, setMeioTrabalho] = useState('SIM');

  const selectedColab = colaboradores.find(c => c.id === colaboradorId);
  const selectedLider = liderancas.find(l => l.id === liderancaId);

  useEffect(() => {
    if (selectedColab) {
      setSetor(selectedColab.setor || '');
    }
  }, [selectedColab]);

  const handleSave = async () => {
    if (!selectedLider || !selectedColab) {
      toast({ title: 'Selecione liderança e colaborador', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // Determine status
      const hasNao = Object.values(respostas).some(r => r === 'nao');
      const status = hasNao ? 'nao_conforme' : 'conforme';

      const { data: newBlitz, error } = await supabase
        .from('blitz' as any)
        .insert({
          data,
          lideranca_id: selectedLider.id,
          lideranca_nome: selectedLider.nome,
          colaborador_id: selectedColab.id,
          colaborador_nome: selectedColab.nome,
          colaborador_cpf: selectedColab.cpf,
          veiculo_tipo: vehicleType,
          pilar,
          status,
          observacoes: setor,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Insert items
      const items = questions.map((q, i) => ({
        blitz_id: (newBlitz as any).id,
        pergunta: q,
        resposta: respostas[i] || 'na',
        critico: i < questions.length - 2,
        observacao: observacoes[i] || '',
      }));

      const { error: itemsError } = await supabase
        .from('blitz_itens' as any)
        .insert(items as any);

      if (itemsError) throw itemsError;

      // Update colaborador
      await supabase
        .from('colaboradores' as any)
        .update({ data_ultima_blitz: data } as any)
        .eq('id', selectedColab.id);

      toast({ title: 'Inspeção criada com sucesso!' });
      onSaved();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Inspeção - {vehicleType === 'moto' ? '🏍️ Moto' : vehicleType === 'carro' ? '🚗 Carro' : '🚲 Bicicleta'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Data da Blitz</label>
            <Input type="date" value={data} onChange={e => setData(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Pilar</label>
            <Select value={pilar} onValueChange={setPilar}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DPO">DPO</SelectItem>
                <SelectItem value="SPO">SPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Liderança</label>
            <Select value={liderancaId} onValueChange={setLiderancaId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {liderancas.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Colaborador</label>
            <Select value={colaboradorId} onValueChange={setColaboradorId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {colaboradores
                  .filter(c => !vehicleType || c.veiculo_utilizado?.toLowerCase() === vehicleType || !c.veiculo_utilizado)
                  .map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome} - {c.cpf}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Setor</label>
            <Input value={setor} onChange={e => setSetor(e.target.value)} />
          </div>

          {(vehicleType === 'moto' || vehicleType === 'carro') && (
            <>
              <div>
                <label className="text-xs font-medium">Placa</label>
                <Input value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="ABC1234" />
              </div>
              {vehicleType === 'moto' && (
                <>
                  <div>
                    <label className="text-xs font-medium">Veículo Próprio/CIA</label>
                    <Select value={veiculo_proprio} onValueChange={setVeiculoProprio}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRÓPRIO">Próprio</SelectItem>
                        <SelectItem value="CIA">CIA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Meio de Trabalho?</label>
                    <Select value={meioTrabalho} onValueChange={setMeioTrabalho}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIM">Sim</SelectItem>
                        <SelectItem value="NÃO">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-3">Checklist</h3>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const isTextQuestion = q.includes('Data') || q.includes('Placa') || q.includes('Anomalia') || q.includes('Plano de ação');
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded border bg-muted/20">
                  <span className="text-xs font-medium flex-1 min-w-0">{q}</span>
                  {isTextQuestion ? (
                    <Input
                      className="w-48 h-8 text-xs"
                      value={observacoes[i] || ''}
                      onChange={e => setObservacoes({ ...observacoes, [i]: e.target.value })}
                      placeholder="Descreva..."
                    />
                  ) : (
                    <Select
                      value={respostas[i] || 'sim'}
                      onValueChange={v => setRespostas({ ...respostas, [i]: v })}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Salvar Inspeção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
