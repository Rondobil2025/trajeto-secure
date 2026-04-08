export type UserRole = 'admin' | 'leadership' | 'viewer';
export type VehicleType = 'bicicleta' | 'moto' | 'carro';
export type BlitzStatus = 'conforme' | 'conforme_observacoes' | 'nao_conforme';
export type PlanStatus = 'aberto' | 'em_andamento' | 'vencido' | 'concluido';
export type Priority = 'baixa' | 'media' | 'alta' | 'critica';
export type CheckAnswer = 'sim' | 'nao' | 'na';

export interface Colaborador {
  id: string;
  cpf: string;
  nome: string;
  matricula: string;
  funcao: string;
  setor: string;
  pilar: string;
  admissao: string;
  genero: string;
  email: string;
  contato: string;
  veiculo_utilizado: VehicleType;
  cnh_numero: string;
  cnh_validade: string;
  cnh_categoria: string;
  cnh_status: string;
  data_ultima_blitz: string | null;
  aderencia: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lideranca {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  setor: string;
  ativo: boolean;
  created_at: string;
}

export interface Blitz {
  id: string;
  data: string;
  lideranca_id: string;
  lideranca_nome: string;
  colaborador_id: string;
  colaborador_nome: string;
  colaborador_cpf: string;
  veiculo_tipo: VehicleType;
  status: BlitzStatus;
  observacoes: string;
  created_at: string;
}

export interface BlitzItem {
  id: string;
  blitz_id: string;
  pergunta: string;
  resposta: CheckAnswer;
  observacao: string;
}

export interface PlanoAcao {
  id: string;
  codigo: string;
  blitz_id: string;
  colaborador_nome: string;
  colaborador_cpf: string;
  veiculo_tipo: VehicleType;
  descricao_anomalia: string;
  acao_corretiva: string;
  prazo: string;
  prioridade: Priority;
  status: PlanStatus;
  responsavel: string;
  evidencia_url: string | null;
  data_conclusao: string | null;
  created_at: string;
}

export interface ChecklistQuestion {
  id: string;
  pergunta: string;
  critico: boolean;
}

export const CHECKLIST_BICICLETA: ChecklistQuestion[] = [
  { id: 'bic_1', pergunta: 'Utiliza EPI?', critico: true },
  { id: 'bic_2', pergunta: 'Pneus em boas condições?', critico: true },
  { id: 'bic_3', pergunta: 'Freios funcionando corretamente?', critico: true },
  { id: 'bic_4', pergunta: 'Capacete em boas condições e utilizado corretamente?', critico: true },
  { id: 'bic_5', pergunta: 'Iluminação e sinais reflexivos funcionando?', critico: false },
];

export const CHECKLIST_MOTO: ChecklistQuestion[] = [
  { id: 'mot_1', pergunta: 'Veículo próprio ou da companhia?', critico: false },
  { id: 'mot_2', pergunta: 'Veículo é utilizado como meio de trabalho?', critico: false },
  { id: 'mot_3', pergunta: 'Pneus em boas condições?', critico: true },
  { id: 'mot_4', pergunta: 'Retrovisores presentes e ajustados?', critico: true },
  { id: 'mot_5', pergunta: 'Capacete em boas condições e utilizado corretamente?', critico: true },
  { id: 'mot_6', pergunta: 'Luzes e setas funcionando?', critico: true },
  { id: 'mot_7', pergunta: 'Há vazamento de óleo ou fluidos?', critico: true },
];

export const CHECKLIST_CARRO: ChecklistQuestion[] = [
  { id: 'car_1', pergunta: 'Pneus em boas condições?', critico: true },
  { id: 'car_2', pergunta: 'Faróis e luzes funcionando?', critico: true },
  { id: 'car_3', pergunta: 'Cinto de segurança em boas condições e utilizado corretamente?', critico: true },
  { id: 'car_4', pergunta: 'Freios em boas condições?', critico: true },
  { id: 'car_5', pergunta: 'Há vazamento de óleo ou fluidos?', critico: true },
];

export function getChecklist(tipo: VehicleType): ChecklistQuestion[] {
  switch (tipo) {
    case 'bicicleta': return CHECKLIST_BICICLETA;
    case 'moto': return CHECKLIST_MOTO;
    case 'carro': return CHECKLIST_CARRO;
  }
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function getVehicleLabel(tipo: VehicleType): string {
  switch (tipo) {
    case 'bicicleta': return 'Bicicleta';
    case 'moto': return 'Moto';
    case 'carro': return 'Carro';
  }
}

export function getStatusLabel(status: BlitzStatus): string {
  switch (status) {
    case 'conforme': return 'Conforme';
    case 'conforme_observacoes': return 'Conforme c/ Observações';
    case 'nao_conforme': return 'Não Conforme';
  }
}

export function getPlanStatusLabel(status: PlanStatus): string {
  switch (status) {
    case 'aberto': return 'Aberto';
    case 'em_andamento': return 'Em Andamento';
    case 'vencido': return 'Vencido';
    case 'concluido': return 'Concluído';
  }
}

export function getPriorityLabel(p: Priority): string {
  switch (p) {
    case 'baixa': return 'Baixa';
    case 'media': return 'Média';
    case 'alta': return 'Alta';
    case 'critica': return 'Crítica';
  }
}
