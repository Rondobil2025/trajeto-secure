import { Colaborador, Blitz, PlanoAcao, Lideranca } from './types';

export const MOCK_LIDERANCAS: Lideranca[] = [
  { id: '1', nome: 'Carlos Silva', cpf: '12345678901', email: 'carlos@rondobier.com', setor: 'Logística', ativo: true, created_at: '2024-01-01' },
  { id: '2', nome: 'Ana Oliveira', cpf: '98765432100', email: 'ana@rondobier.com', setor: 'Produção', ativo: true, created_at: '2024-01-01' },
  { id: '3', nome: 'Roberto Santos', cpf: '11122233344', email: 'roberto@rondobier.com', setor: 'Distribuição', ativo: true, created_at: '2024-02-15' },
];

export const MOCK_COLABORADORES: Colaborador[] = [
  {
    id: '1', cpf: '11111111111', nome: 'João Pereira', matricula: 'MAT001', funcao: 'Entregador',
    setor: 'Logística', pilar: 'Operações', admissao: '2022-03-15', genero: 'M',
    email: 'joao@email.com', contato: '11999999999', veiculo_utilizado: 'moto',
    cnh_numero: '12345678900', cnh_validade: '2025-08-15', cnh_categoria: 'A',
    cnh_status: 'válida', data_ultima_blitz: '2024-11-20', aderencia: 85, ativo: true,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  },
  {
    id: '2', cpf: '22222222222', nome: 'Maria Costa', matricula: 'MAT002', funcao: 'Vendedora',
    setor: 'Vendas', pilar: 'Comercial', admissao: '2021-06-01', genero: 'F',
    email: 'maria@email.com', contato: '11988888888', veiculo_utilizado: 'carro',
    cnh_numero: '98765432100', cnh_validade: '2024-02-10', cnh_categoria: 'B',
    cnh_status: 'vencida', data_ultima_blitz: '2024-09-10', aderencia: 60, ativo: true,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  },
  {
    id: '3', cpf: '33333333333', nome: 'Pedro Almeida', matricula: 'MAT003', funcao: 'Auxiliar',
    setor: 'Produção', pilar: 'Operações', admissao: '2023-01-10', genero: 'M',
    email: 'pedro@email.com', contato: '11977777777', veiculo_utilizado: 'bicicleta',
    cnh_numero: '', cnh_validade: '', cnh_categoria: '',
    cnh_status: 'sem_cnh', data_ultima_blitz: null, aderencia: 0, ativo: true,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  },
  {
    id: '4', cpf: '44444444444', nome: 'Luciana Ferreira', matricula: 'MAT004', funcao: 'Supervisora',
    setor: 'Logística', pilar: 'Operações', admissao: '2020-02-20', genero: 'F',
    email: 'luciana@email.com', contato: '11966666666', veiculo_utilizado: 'carro',
    cnh_numero: '55566677788', cnh_validade: '2026-12-01', cnh_categoria: 'AB',
    cnh_status: 'válida', data_ultima_blitz: '2024-12-01', aderencia: 100, ativo: true,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  },
  {
    id: '5', cpf: '55555555555', nome: 'Marcos Souza', matricula: 'MAT005', funcao: 'Motorista',
    setor: 'Distribuição', pilar: 'Logística', admissao: '2019-08-10', genero: 'M',
    email: 'marcos@email.com', contato: '11955555555', veiculo_utilizado: 'moto',
    cnh_numero: '99988877766', cnh_validade: '2025-03-30', cnh_categoria: 'A',
    cnh_status: 'válida', data_ultima_blitz: '2024-10-05', aderencia: 45, ativo: true,
    created_at: '2024-01-01', updated_at: '2024-01-01',
  },
];

export const MOCK_BLITZ: Blitz[] = [
  { id: '1', data: '2024-12-01', lideranca_id: '1', lideranca_nome: 'Carlos Silva', colaborador_id: '4', colaborador_nome: 'Luciana Ferreira', colaborador_cpf: '44444444444', veiculo_tipo: 'carro', status: 'conforme', observacoes: '', created_at: '2024-12-01' },
  { id: '2', data: '2024-11-20', lideranca_id: '1', lideranca_nome: 'Carlos Silva', colaborador_id: '1', colaborador_nome: 'João Pereira', colaborador_cpf: '11111111111', veiculo_tipo: 'moto', status: 'conforme_observacoes', observacoes: 'Retrovisor esquerdo com folga', created_at: '2024-11-20' },
  { id: '3', data: '2024-10-05', lideranca_id: '3', lideranca_nome: 'Roberto Santos', colaborador_id: '5', colaborador_nome: 'Marcos Souza', colaborador_cpf: '55555555555', veiculo_tipo: 'moto', status: 'nao_conforme', observacoes: 'Pneu traseiro careca, sem capacete adequado', created_at: '2024-10-05' },
  { id: '4', data: '2024-09-10', lideranca_id: '2', lideranca_nome: 'Ana Oliveira', colaborador_id: '2', colaborador_nome: 'Maria Costa', colaborador_cpf: '22222222222', veiculo_tipo: 'carro', status: 'nao_conforme', observacoes: 'CNH vencida, farol esquerdo queimado', created_at: '2024-09-10' },
];

export const MOCK_PLANOS: PlanoAcao[] = [
  { id: '1', codigo: 'PA-2024-001', blitz_id: '3', colaborador_nome: 'Marcos Souza', colaborador_cpf: '55555555555', veiculo_tipo: 'moto', descricao_anomalia: 'Pneu traseiro careca', acao_corretiva: 'Trocar pneu traseiro', prazo: '2025-01-05', prioridade: 'alta', status: 'vencido', responsavel: 'Roberto Santos', evidencia_url: null, data_conclusao: null, created_at: '2024-10-05' },
  { id: '2', codigo: 'PA-2024-002', blitz_id: '3', colaborador_nome: 'Marcos Souza', colaborador_cpf: '55555555555', veiculo_tipo: 'moto', descricao_anomalia: 'Sem capacete adequado', acao_corretiva: 'Adquirir capacete com certificação', prazo: '2024-11-05', prioridade: 'critica', status: 'vencido', responsavel: 'Roberto Santos', evidencia_url: null, data_conclusao: null, created_at: '2024-10-05' },
  { id: '3', codigo: 'PA-2024-003', blitz_id: '4', colaborador_nome: 'Maria Costa', colaborador_cpf: '22222222222', veiculo_tipo: 'carro', descricao_anomalia: 'CNH vencida', acao_corretiva: 'Renovar CNH', prazo: '2024-12-10', prioridade: 'critica', status: 'aberto', responsavel: 'Ana Oliveira', evidencia_url: null, data_conclusao: null, created_at: '2024-09-10' },
  { id: '4', codigo: 'PA-2024-004', blitz_id: '2', colaborador_nome: 'João Pereira', colaborador_cpf: '11111111111', veiculo_tipo: 'moto', descricao_anomalia: 'Retrovisor esquerdo com folga', acao_corretiva: 'Ajustar fixação do retrovisor', prazo: '2025-02-20', prioridade: 'media', status: 'em_andamento', responsavel: 'Carlos Silva', evidencia_url: null, data_conclusao: null, created_at: '2024-11-20' },
];

export const DASHBOARD_STATS = {
  totalColaboradores: MOCK_COLABORADORES.length,
  blitzMes: 2,
  pendentes: 3,
  aderenciaGeral: 58,
  porVeiculo: { carro: 2, moto: 2, bicicleta: 1 },
  cnhVencidas: 1,
  semCnh: 1,
  planosAbertos: 2,
  planosVencidos: 2,
};

export const CHART_BLITZ_MES = [
  { mes: 'Jul', total: 8 },
  { mes: 'Ago', total: 12 },
  { mes: 'Set', total: 10 },
  { mes: 'Out', total: 14 },
  { mes: 'Nov', total: 11 },
  { mes: 'Dez', total: 9 },
];

export const CHART_ADERENCIA_SETOR = [
  { setor: 'Logística', aderencia: 78 },
  { setor: 'Vendas', aderencia: 60 },
  { setor: 'Produção', aderencia: 45 },
  { setor: 'Distribuição', aderencia: 52 },
];

export const CHART_VEICULOS = [
  { name: 'Carro', value: 2, fill: 'hsl(217, 91%, 60%)' },
  { name: 'Moto', value: 2, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Bicicleta', value: 1, fill: 'hsl(142, 71%, 45%)' },
];
