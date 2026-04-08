import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { useColaboradores } from '@/hooks/useColaboradores';
import { useBlitzList } from '@/hooks/useBlitz';
import { usePlanosAcao } from '@/hooks/usePlanosAcao';
import { BarChart3, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { formatCPF } from '@/lib/types';

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminRelatorios() {
  const { data: colaboradores = [], isLoading: lc } = useColaboradores();
  const { data: blitzList = [], isLoading: lb } = useBlitzList();
  const { data: planos = [], isLoading: lp } = usePlanosAcao();
  const isLoading = lc || lb || lp;

  const exportColaboradores = () => {
    const headers = ['Nome', 'Matrícula', 'CPF', 'Setor', 'Função', 'Pilar', 'Veículo', 'CNH Nº', 'CNH Validade', 'CNH Categoria', 'Status CNH', 'Admissão', 'Email', 'Contato', 'Aderência'];
    const rows = colaboradores.map(c => [
      c.nome, c.matricula, formatCPF(c.cpf), c.setor, c.funcao, c.pilar || '', c.veiculo_utilizado || '',
      c.cnh_numero || '', c.cnh_validade || '', c.cnh_categoria || '', c.cnh_status || '',
      c.admissao, c.email || '', c.contato || '', `${c.aderencia}%`
    ]);
    downloadCSV('colaboradores.csv', headers, rows);
  };

  const exportBlitz = () => {
    const headers = ['Data', 'Colaborador', 'CPF', 'Veículo', 'Liderança', 'Status', 'Observações'];
    const rows = blitzList.map(b => [
      b.data, b.colaborador_nome, formatCPF(b.colaborador_cpf), b.veiculo_tipo,
      b.lideranca_nome, b.status, b.observacoes || ''
    ]);
    downloadCSV('blitz.csv', headers, rows);
  };

  const exportPlanos = () => {
    const headers = ['Código', 'Colaborador', 'CPF', 'Veículo', 'Anomalia', 'Ação Corretiva', 'Prazo', 'Prioridade', 'Status', 'Responsável'];
    const rows = planos.map(p => [
      p.codigo, p.colaborador_nome, formatCPF(p.colaborador_cpf), p.veiculo_tipo,
      p.descricao_anomalia, p.acao_corretiva, p.prazo, p.prioridade, p.status, p.responsavel
    ]);
    downloadCSV('planos_acao.csv', headers, rows);
  };

  const exportCNHVencidas = () => {
    const vencidas = colaboradores.filter(c => {
      if (!c.cnh_validade) return false;
      return new Date(c.cnh_validade) < new Date();
    });
    const headers = ['Nome', 'CPF', 'Setor', 'CNH Nº', 'Validade', 'Categoria'];
    const rows = vencidas.map(c => [c.nome, formatCPF(c.cpf), c.setor, c.cnh_numero || '', c.cnh_validade || '', c.cnh_categoria || '']);
    downloadCSV('cnh_vencidas.csv', headers, rows);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  const reports = [
    { title: 'Colaboradores', desc: `${colaboradores.length} registros — Nome, matrícula, CPF, setor, CNH, aderência`, icon: FileSpreadsheet, action: exportColaboradores },
    { title: 'Blitz Realizadas', desc: `${blitzList.length} registros — Data, colaborador, veículo, status, observações`, icon: FileText, action: exportBlitz },
    { title: 'Planos de Ação', desc: `${planos.length} registros — Código, anomalia, ação corretiva, prazo, status`, icon: FileText, action: exportPlanos },
    { title: 'CNH Vencidas', desc: `${colaboradores.filter(c => c.cnh_validade && new Date(c.cnh_validade) < new Date()).length} CNHs vencidas`, icon: FileSpreadsheet, action: exportCNHVencidas },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Relatórios</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">Exportar dados em CSV</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6">
          <div className="grid md:grid-cols-2 gap-4">
            {reports.map(r => (
              <div key={r.title} className="rounded-xl border bg-card p-5 flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={r.action}>
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Exportar CSV
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
