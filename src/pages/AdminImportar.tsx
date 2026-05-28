import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminNavButtons } from '@/components/AdminNavButtons';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ParsedRow {
  nome: string;
  matricula: string;
  cpf: string;
  setor: string;
  funcao: string;
  pilar: string;
  admissao: string;
  data_nascimento: string;
  genero: string;
  email: string;
  contato: string;
  veiculo_utilizado: string;
  cnh_numero: string;
  cnh_validade: string;
  cnh_categoria: string;
  cnh_status: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.trim().toUpperCase().replace(/"/g, ''));

  const idx = (names: string[]) => {
    for (const n of names) {
      const i = headers.findIndex(h => h.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };

  const iNome = idx(['NOME']);
  const iMat = idx(['MATRICULA', 'MATRÍCULA', 'MAT']);
  const iCpf = idx(['CPF']);
  const iSetor = idx(['SETOR']);
  const iFuncao = idx(['FUNÇÃO', 'FUNCAO']);
  const iPilar = idx(['PILAR']);
  const iAdmissao = idx(['ADMISSÃO', 'ADMISSAO']);
  const iNasc = idx(['NASCIMENTO', 'NASC']);
  const iGenero = idx(['GENERO', 'GÊNERO', 'GÊN']);
  const iEmail = idx(['EMAIL', 'E-MAIL']);
  const iContato = idx(['CONTATO', 'TELEFONE', 'TEL']);
  const iVeiculo = idx(['VEICULO', 'VEÍCULO']);
  const iCnhNum = idx(['CNH N', 'CNH_NUMERO']);
  const iCnhVal = idx(['VALIDADE CNH', 'CNH_VALIDADE', 'VALIDADE']);
  const iCnhCat = idx(['CATEGORIA', 'CAT']);
  const iCnhSt = idx(['STATUS CNH', 'CNH_STATUS']);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    const nome = cols[iNome] || '';
    if (!nome) continue;
    const cpf = (cols[iCpf] || '').replace(/\D/g, '');
    if (!cpf) continue;

    rows.push({
      nome,
      matricula: cols[iMat] || '',
      cpf,
      setor: cols[iSetor] || '',
      funcao: cols[iFuncao] || '',
      pilar: iPilar >= 0 ? cols[iPilar] || '' : '',
      admissao: parseDate(cols[iAdmissao]),
      data_nascimento: iNasc >= 0 ? parseDate(cols[iNasc]) : '',
      genero: iGenero >= 0 ? cols[iGenero] || '' : '',
      email: iEmail >= 0 ? cols[iEmail] || '' : '',
      contato: iContato >= 0 ? cols[iContato] || '' : '',
      veiculo_utilizado: iVeiculo >= 0 ? (cols[iVeiculo] || '').toLowerCase() : '',
      cnh_numero: iCnhNum >= 0 ? cols[iCnhNum] || '' : '',
      cnh_validade: iCnhVal >= 0 ? parseDate(cols[iCnhVal]) : '',
      cnh_categoria: iCnhCat >= 0 ? cols[iCnhCat] || '' : '',
      cnh_status: iCnhSt >= 0 ? (cols[iCnhSt] || '').toLowerCase().replace('em dia', 'válida').replace('vencido', 'vencida') : '',
    });
  }
  return rows;
}

function parseDate(d: string | undefined): string {
  if (!d) return '';
  // DD/MM/YYYY
  const m = d.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  return '';
}

export default function AdminImportar() {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setParsed(rows);
      setResult(null);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0;
    let errors = 0;

    for (const row of parsed) {
      const payload: any = {
        nome: row.nome,
        matricula: row.matricula,
        cpf: row.cpf,
        setor: row.setor,
        funcao: row.funcao,
        pilar: row.pilar || null,
        veiculo_utilizado: row.veiculo_utilizado || null,
        email: row.email || null,
        contato: row.contato || null,
        genero: row.genero || null,
        cnh_numero: row.cnh_numero || null,
        cnh_categoria: row.cnh_categoria || null,
        cnh_status: row.cnh_status || 'sem_cnh',
      };
      if (row.admissao) payload.admissao = row.admissao;
      if (row.data_nascimento) payload.data_nascimento = row.data_nascimento;
      if (row.cnh_validade) payload.cnh_validade = row.cnh_validade;

      const { error } = await supabase.from('colaboradores' as any).upsert(payload as any, { onConflict: 'cpf' });
      if (error) {
        console.error('Import error:', row.nome, error.message);
        errors++;
      } else {
        success++;
      }
    }

    setResult({ success, errors });
    setImporting(false);
    queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    toast({ title: 'Importação concluída', description: `${success} importados, ${errors} erros` });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="brand-gradient px-6 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold font-display text-primary-foreground">Importar QLP / CSV</h1>
              <p className="text-xs text-primary-foreground/60 mt-0.5">Importar colaboradores via planilha</p>
            </div>
            <AdminNavButtons className="ml-auto" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6 max-w-4xl">
          {/* Upload area */}
          <div
            className="rounded-xl border-2 border-dashed bg-card p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Arraste ou clique para selecionar arquivo CSV</p>
            <p className="text-xs text-muted-foreground mt-1">Formato: CSV com separador ; ou ,</p>
            <p className="text-xs text-muted-foreground">Colunas: NOME, MATRICULA, CPF, SETOR, FUNÇÃO, ADMISSÃO, etc.</p>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          </div>

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{parsed.length} registros encontrados</p>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Importar Todos
                </Button>
              </div>

              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50 sticky top-0">
                        <th className="text-left px-3 py-2 font-medium">Nome</th>
                        <th className="text-left px-3 py-2 font-medium">Mat</th>
                        <th className="text-left px-3 py-2 font-medium">CPF</th>
                        <th className="text-left px-3 py-2 font-medium">Setor</th>
                        <th className="text-left px-3 py-2 font-medium">Função</th>
                        <th className="text-left px-3 py-2 font-medium">Veículo</th>
                        <th className="text-left px-3 py-2 font-medium">CNH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.slice(0, 50).map((r, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium max-w-[200px] truncate">{r.nome}</td>
                          <td className="px-3 py-2 font-mono">{r.matricula}</td>
                          <td className="px-3 py-2 font-mono">{r.cpf}</td>
                          <td className="px-3 py-2">{r.setor}</td>
                          <td className="px-3 py-2 max-w-[150px] truncate">{r.funcao}</td>
                          <td className="px-3 py-2">{r.veiculo_utilizado || '—'}</td>
                          <td className="px-3 py-2">{r.cnh_numero || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsed.length > 50 && (
                  <div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                    Mostrando 50 de {parsed.length} registros
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-status-ok" />
                <span className="font-medium">Importação Concluída</span>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-status-ok font-medium">{result.success} importados com sucesso</span>
                {result.errors > 0 && (
                  <span className="text-status-danger font-medium">{result.errors} erros</span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
