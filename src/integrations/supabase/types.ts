export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blitz: {
        Row: {
          colaborador_cpf: string
          colaborador_id: string | null
          colaborador_nome: string
          created_at: string
          data: string
          id: string
          lideranca_id: string | null
          lideranca_nome: string
          observacoes: string | null
          status: string
          veiculo_tipo: string
        }
        Insert: {
          colaborador_cpf?: string
          colaborador_id?: string | null
          colaborador_nome?: string
          created_at?: string
          data?: string
          id?: string
          lideranca_id?: string | null
          lideranca_nome?: string
          observacoes?: string | null
          status?: string
          veiculo_tipo?: string
        }
        Update: {
          colaborador_cpf?: string
          colaborador_id?: string | null
          colaborador_nome?: string
          created_at?: string
          data?: string
          id?: string
          lideranca_id?: string | null
          lideranca_nome?: string
          observacoes?: string | null
          status?: string
          veiculo_tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "blitz_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blitz_lideranca_id_fkey"
            columns: ["lideranca_id"]
            isOneToOne: false
            referencedRelation: "liderancas"
            referencedColumns: ["id"]
          },
        ]
      }
      blitz_itens: {
        Row: {
          blitz_id: string
          critico: boolean
          id: string
          observacao: string | null
          pergunta: string
          resposta: string
        }
        Insert: {
          blitz_id: string
          critico?: boolean
          id?: string
          observacao?: string | null
          pergunta: string
          resposta?: string
        }
        Update: {
          blitz_id?: string
          critico?: boolean
          id?: string
          observacao?: string | null
          pergunta?: string
          resposta?: string
        }
        Relationships: [
          {
            foreignKeyName: "blitz_itens_blitz_id_fkey"
            columns: ["blitz_id"]
            isOneToOne: false
            referencedRelation: "blitz"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          aderencia: number | null
          admissao: string
          ativo: boolean
          cnh_categoria: string | null
          cnh_numero: string | null
          cnh_status: string | null
          cnh_validade: string | null
          contato: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          data_ultima_blitz: string | null
          email: string | null
          funcao: string
          genero: string | null
          id: string
          matricula: string
          nome: string
          pilar: string | null
          setor: string
          updated_at: string
          veiculo_utilizado: string | null
        }
        Insert: {
          aderencia?: number | null
          admissao: string
          ativo?: boolean
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_status?: string | null
          cnh_validade?: string | null
          contato?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          data_ultima_blitz?: string | null
          email?: string | null
          funcao: string
          genero?: string | null
          id?: string
          matricula: string
          nome: string
          pilar?: string | null
          setor: string
          updated_at?: string
          veiculo_utilizado?: string | null
        }
        Update: {
          aderencia?: number | null
          admissao?: string
          ativo?: boolean
          cnh_categoria?: string | null
          cnh_numero?: string | null
          cnh_status?: string | null
          cnh_validade?: string | null
          contato?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          data_ultima_blitz?: string | null
          email?: string | null
          funcao?: string
          genero?: string | null
          id?: string
          matricula?: string
          nome?: string
          pilar?: string | null
          setor?: string
          updated_at?: string
          veiculo_utilizado?: string | null
        }
        Relationships: []
      }
      liderancas: {
        Row: {
          ativo: boolean
          cpf: string
          created_at: string
          email: string | null
          id: string
          nome: string
          senha_hash: string | null
          setor: string
        }
        Insert: {
          ativo?: boolean
          cpf: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          senha_hash?: string | null
          setor?: string
        }
        Update: {
          ativo?: boolean
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          senha_hash?: string | null
          setor?: string
        }
        Relationships: []
      }
      planos_acao: {
        Row: {
          acao_corretiva: string
          blitz_id: string | null
          codigo: string
          colaborador_cpf: string
          colaborador_nome: string
          created_at: string
          data_conclusao: string | null
          descricao_anomalia: string
          evidencia_url: string | null
          id: string
          prazo: string
          prioridade: string
          responsavel: string
          status: string
          veiculo_tipo: string
        }
        Insert: {
          acao_corretiva?: string
          blitz_id?: string | null
          codigo: string
          colaborador_cpf?: string
          colaborador_nome?: string
          created_at?: string
          data_conclusao?: string | null
          descricao_anomalia?: string
          evidencia_url?: string | null
          id?: string
          prazo: string
          prioridade?: string
          responsavel?: string
          status?: string
          veiculo_tipo?: string
        }
        Update: {
          acao_corretiva?: string
          blitz_id?: string | null
          codigo?: string
          colaborador_cpf?: string
          colaborador_nome?: string
          created_at?: string
          data_conclusao?: string | null
          descricao_anomalia?: string
          evidencia_url?: string | null
          id?: string
          prazo?: string
          prioridade?: string
          responsavel?: string
          status?: string
          veiculo_tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_blitz_id_fkey"
            columns: ["blitz_id"]
            isOneToOne: false
            referencedRelation: "blitz"
            referencedColumns: ["id"]
          },
        ]
      }
      termos_ciencia: {
        Row: {
          assinado_em: string | null
          assinatura_url: string | null
          blitz_id: string | null
          colaborador_cpf: string
          colaborador_nome: string
          created_at: string
          descricao: string
          id: string
          plano_acao_id: string | null
        }
        Insert: {
          assinado_em?: string | null
          assinatura_url?: string | null
          blitz_id?: string | null
          colaborador_cpf?: string
          colaborador_nome?: string
          created_at?: string
          descricao?: string
          id?: string
          plano_acao_id?: string | null
        }
        Update: {
          assinado_em?: string | null
          assinatura_url?: string | null
          blitz_id?: string | null
          colaborador_cpf?: string
          colaborador_nome?: string
          created_at?: string
          descricao?: string
          id?: string
          plano_acao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "termos_ciencia_blitz_id_fkey"
            columns: ["blitz_id"]
            isOneToOne: false
            referencedRelation: "blitz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "termos_ciencia_plano_acao_id_fkey"
            columns: ["plano_acao_id"]
            isOneToOne: false
            referencedRelation: "planos_acao"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
