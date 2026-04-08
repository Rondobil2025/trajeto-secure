import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Camera, Bike, Car, Truck, AlertTriangle, Loader2, ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCPF, cleanCPF, getChecklist, getVehicleLabel, type VehicleType, type CheckAnswer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MobileNav } from '@/components/MobileNav';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ColaboradorDB } from '@/hooks/useColaboradores';
import { PhotoCapture, MultiPhotoCapture } from '@/components/PhotoCapture';

const STEPS = ['Identificação', 'Colaborador', 'Veículo & Fotos', 'Checklist', 'Anomalias', 'Revisão'];

export default function NovaBlitz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cpfLider, setCpfLider] = useState('');
  const [senha, setSenha] = useState('');
  const [liderValidada, setLiderValidada] = useState(false);
  const [cpfColab, setCpfColab] = useState('');
  const [colaborador, setColaborador] = useState<ColaboradorDB | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [veiculoTipo, setVeiculoTipo] = useState<VehicleType>('carro');
  const [respostas, setRespostas] = useState<Record<string, CheckAnswer>>({});
  const [temAnomalia, setTemAnomalia] = useState(false);
  const [descAnomalia, setDescAnomalia] = useState('');
  const [fotoVeiculo, setFotoVeiculo] = useState<string | null>(null);
  const [fotoCnh, setFotoCnh] = useState<string | null>(null);
  const [fotoPlaca, setFotoPlaca] = useState<string | null>(null);
  const [fotosAnomalia, setFotosAnomalia] = useState<string[]>([]);
  const validarLider = () => {
    const cpf = cleanCPF(cpfLider);
    // TODO: validate against liderancas table
    if (cpf.length === 11 && senha === '1234') {
      setLiderValidada(true);
      setStep(1);
      toast({ title: 'Bem-vindo!' });
    } else {
      toast({ title: 'Credenciais inválidas', variant: 'destructive' });
    }
  };

  const buscarColab = async () => {
    const cpf = cleanCPF(cpfColab);
    if (cpf.length < 11) {
      toast({ title: 'CPF incompleto', variant: 'destructive' });
      return;
    }
    setBuscando(true);
    try {
      const { data, error } = await supabase
        .from('colaboradores' as any)
        .select('*')
        .eq('cpf', cpf)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const c = data as any as ColaboradorDB;
        setColaborador(c);
        // Try to guess vehicle type from function name
        const f = c.funcao.toLowerCase();
        if (f.includes('truck') || f.includes('carreteiro')) setVeiculoTipo('carro');
        else if (f.includes('van')) setVeiculoTipo('carro');
        else if (f.includes('moto')) setVeiculoTipo('moto');
        else setVeiculoTipo('bicicleta');
      } else {
        toast({ title: 'Colaborador não encontrado', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro ao buscar colaborador', variant: 'destructive' });
    } finally {
      setBuscando(false);
    }
  };

  const checklist = getChecklist(veiculoTipo);

  const canAdvance = () => {
    if (step === 0) return liderValidada;
    if (step === 1) return !!colaborador;
    if (step === 2) return true;
    if (step === 3) return checklist.every(q => respostas[q.id]);
    return true;
  };

  const queryClient = useQueryClient();
  const [salvando, setSalvando] = useState(false);

  const finalizar = useCallback(async () => {
    if (!colaborador) return;
    setSalvando(true);

    try {
      const naoConformes = checklist.filter(q => respostas[q.id] === 'nao');
      const statusFinal = (naoConformes.length > 0 || temAnomalia)
        ? (naoConformes.some(q => q.critico) || temAnomalia ? 'nao_conforme' : 'conforme_observacoes')
        : 'conforme';

      // 1. Insert blitz
      const { data: blitzData, error: blitzErr } = await supabase
        .from('blitz' as any)
        .insert({
          data: new Date().toISOString().slice(0, 10),
          lideranca_nome: 'Liderança',
          colaborador_id: colaborador.id,
          colaborador_nome: colaborador.nome,
          colaborador_cpf: colaborador.cpf,
          veiculo_tipo: veiculoTipo,
          status: statusFinal,
          observacoes: temAnomalia ? descAnomalia : '',
          foto_veiculo_url: fotoVeiculo,
          foto_cnh_url: fotoCnh,
          foto_placa_url: fotoPlaca,
          fotos_anomalia_urls: fotosAnomalia,
        } as any)
        .select('id')
        .single();

      if (blitzErr) throw blitzErr;
      const blitzId = (blitzData as any).id;

      // 2. Insert blitz_itens
      const itens = checklist.map(q => ({
        blitz_id: blitzId,
        pergunta: q.pergunta,
        resposta: respostas[q.id] || 'na',
        observacao: '',
        critico: q.critico,
      }));

      const { error: itensErr } = await supabase
        .from('blitz_itens' as any)
        .insert(itens as any);

      if (itensErr) throw itensErr;

      // 3. Update colaborador data_ultima_blitz
      const { error: updateErr } = await supabase
        .from('colaboradores' as any)
        .update({ data_ultima_blitz: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() } as any)
        .eq('id', colaborador.id);

      if (updateErr) throw updateErr;

      // 4. Auto-generate planos de ação for non-conformities
      const planosToInsert: any[] = [];
      const now = new Date();

      naoConformes.forEach((q, idx) => {
        const codigo = `PA-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(idx + 1).padStart(3, '0')}`;
        const prazo = new Date(now);
        prazo.setDate(prazo.getDate() + (q.critico ? 30 : 60));

        planosToInsert.push({
          codigo,
          blitz_id: blitzId,
          colaborador_nome: colaborador.nome,
          colaborador_cpf: colaborador.cpf,
          veiculo_tipo: veiculoTipo,
          descricao_anomalia: `Não conformidade: ${q.pergunta}`,
          acao_corretiva: `Corrigir: ${q.pergunta}`,
          prazo: prazo.toISOString().slice(0, 10),
          prioridade: q.critico ? 'alta' : 'media',
          status: 'aberto',
          responsavel: colaborador.nome,
        });
      });

      if (temAnomalia && descAnomalia) {
        const codigo = `PA-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(planosToInsert.length + 1).padStart(3, '0')}`;
        const prazo = new Date(now);
        prazo.setDate(prazo.getDate() + 30);

        planosToInsert.push({
          codigo,
          blitz_id: blitzId,
          colaborador_nome: colaborador.nome,
          colaborador_cpf: colaborador.cpf,
          veiculo_tipo: veiculoTipo,
          descricao_anomalia: descAnomalia,
          acao_corretiva: `Ação corretiva para: ${descAnomalia}`,
          prazo: prazo.toISOString().slice(0, 10),
          prioridade: 'critica',
          status: 'aberto',
          responsavel: colaborador.nome,
        });
      }

      if (planosToInsert.length > 0) {
        const { error: planosErr } = await supabase
          .from('planos_acao' as any)
          .insert(planosToInsert as any);

        if (planosErr) throw planosErr;
      }

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['blitz'] });
      queryClient.invalidateQueries({ queryKey: ['planos_acao'] });
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });

      const planosMsg = planosToInsert.length > 0 ? ` · ${planosToInsert.length} plano(s) de ação gerado(s)` : '';
      toast({ title: `Blitz registrada com sucesso!${planosMsg}` });
      navigate('/portal');
    } catch (err: any) {
      console.error('Erro ao salvar blitz:', err);
      toast({ title: 'Erro ao salvar blitz', description: err?.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  }, [colaborador, checklist, respostas, veiculoTipo, temAnomalia, descAnomalia, navigate, queryClient]);

  const vehicleIcons = {
    bicicleta: Bike,
    moto: Truck,
    carro: Car,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Progress */}
      <div className="brand-gradient px-4 pt-6 pb-4">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/portal')} className="text-primary-foreground/70 mb-3 flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-lg font-bold font-display text-primary-foreground">Nova Blitz</h1>
        <p className="text-xs text-primary-foreground/60 mt-1">Passo {step + 1} de {STEPS.length} — {STEPS[step]}</p>
        <div className="flex gap-1 mt-3">
          {STEPS.map((_, i) => (
            <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary-foreground' : 'bg-primary-foreground/20')} />
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Step 0: Login liderança */}
        {step === 0 && !liderValidada && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>CPF da Liderança</Label>
              <Input
                placeholder="000.000.000-00"
                value={formatCPF(cpfLider)}
                onChange={e => setCpfLider(e.target.value)}
                inputMode="numeric"
                className="text-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha / Código</Label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <Button onClick={validarLider} className="w-full h-12 text-base">
              Entrar e Continuar
            </Button>
            <p className="text-xs text-muted-foreground text-center">Digite qualquer CPF válido com 11 dígitos / Senha: 1234</p>
          </div>
        )}

        {/* Step 1: Dados do colaborador */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>CPF do Colaborador</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="000.000.000-00"
                  value={formatCPF(cpfColab)}
                  onChange={e => setCpfColab(e.target.value)}
                  inputMode="numeric"
                  className="text-lg h-12"
                />
                <Button onClick={buscarColab} variant="outline" className="h-12 px-6" disabled={buscando}>
                  {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>
            </div>

            {colaborador && (
              <div className="rounded-xl border bg-card p-4 space-y-3 animate-slide-up">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold font-display">{colaborador.nome}</h3>
                  {colaborador.cnh_status === 'válida' ? (
                    <StatusBadge variant="ok">CNH Válida</StatusBadge>
                  ) : colaborador.cnh_status === 'vencida' ? (
                    <StatusBadge variant="danger">CNH Vencida</StatusBadge>
                  ) : (
                    <StatusBadge variant="warning">Sem CNH</StatusBadge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Matrícula:</span> {colaborador.matricula}</div>
                  <div><span className="text-muted-foreground">Função:</span> {colaborador.funcao}</div>
                  <div><span className="text-muted-foreground">Setor:</span> {colaborador.setor}</div>
                  <div><span className="text-muted-foreground">Admissão:</span> {colaborador.admissao}</div>
                  <div><span className="text-muted-foreground">Última Blitz:</span> {colaborador.data_ultima_blitz || 'Nunca'}</div>
                  <div><span className="text-muted-foreground">Aderência:</span> {colaborador.aderencia}%</div>
                </div>
                {colaborador.cnh_status === 'vencida' && (
                  <div className="flex items-center gap-2 rounded-lg bg-status-danger/10 p-3 text-sm text-status-danger">
                    <AlertTriangle className="h-4 w-4" />
                    CNH vencida em {colaborador.cnh_validade}. É necessário justificativa.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Tipo de veículo */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Label>Selecione o tipo de veículo</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['bicicleta', 'moto', 'carro'] as VehicleType[]).map(tipo => {
                const Icon = vehicleIcons[tipo];
                const active = veiculoTipo === tipo;
                return (
                  <button
                    key={tipo}
                    onClick={() => setVeiculoTipo(tipo)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all',
                      active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    )}
                  >
                    <Icon className={cn('h-8 w-8', active ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                      {getVehicleLabel(tipo)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Checklist */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground">Checklist — {getVehicleLabel(veiculoTipo)}</p>
            {checklist.map(q => (
              <div key={q.id} className="rounded-xl border bg-card p-4">
                <p className="text-sm font-medium mb-3">
                  {q.pergunta}
                  {q.critico && <span className="text-status-danger ml-1">*</span>}
                </p>
                <div className="flex gap-2">
                  {(['sim', 'nao', 'na'] as CheckAnswer[]).map(ans => (
                    <button
                      key={ans}
                      onClick={() => setRespostas(prev => ({ ...prev, [q.id]: ans }))}
                      className={cn(
                        'flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all',
                        respostas[q.id] === ans
                          ? ans === 'sim' ? 'border-status-ok bg-status-ok/10 text-status-ok'
                            : ans === 'nao' ? 'border-status-danger bg-status-danger/10 text-status-danger'
                            : 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {ans === 'sim' ? 'Sim' : ans === 'nao' ? 'Não' : 'N/A'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Anomalias */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <Label>Existe alguma anomalia?</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTemAnomalia(true)}
                  className={cn('rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                    temAnomalia ? 'border-status-danger bg-status-danger/10 text-status-danger' : 'border-border text-muted-foreground'
                  )}
                >Sim</button>
                <button
                  onClick={() => setTemAnomalia(false)}
                  className={cn('rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                    !temAnomalia ? 'border-status-ok bg-status-ok/10 text-status-ok' : 'border-border text-muted-foreground'
                  )}
                >Não</button>
              </div>
            </div>

            {temAnomalia && (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <Label>Descrição da anomalia</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    placeholder="Descreva a anomalia encontrada..."
                    value={descAnomalia}
                    onChange={e => setDescAnomalia(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fotos da anomalia</Label>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-muted-foreground hover:border-primary/30 transition-colors">
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">Tirar foto ou selecionar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Revisão */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h3 className="font-semibold font-display">Resumo da Blitz</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Colaborador</span><span className="font-medium">{colaborador?.nome}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span>{formatCPF(cpfColab)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Veículo</span><span>{getVehicleLabel(veiculoTipo)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Itens checados</span><span>{Object.keys(respostas).length}/{checklist.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Não conformidades</span><span>{Object.values(respostas).filter(r => r === 'nao').length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Anomalia</span><span>{temAnomalia ? 'Sim' : 'Não'}</span></div>
              </div>
            </div>

            {Object.values(respostas).some(r => r === 'nao') || temAnomalia ? (
              <div className="rounded-xl bg-status-danger/10 border border-status-danger/30 p-4 text-center">
                <StatusBadge variant="danger" className="text-sm">Não Conforme</StatusBadge>
              </div>
            ) : (
              <div className="rounded-xl bg-status-ok/10 border border-status-ok/30 p-4 text-center">
                <StatusBadge variant="ok" className="text-sm">Conforme</StatusBadge>
              </div>
            )}

            <Button onClick={finalizar} className="w-full h-12 text-base" disabled={salvando}>
              {salvando ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
              {salvando ? 'Salvando...' : 'Finalizar e Registrar Blitz'}
            </Button>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 0 && step < 5 && (
          <div className="pt-4">
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="w-full h-12 text-base"
            >
              Próximo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
