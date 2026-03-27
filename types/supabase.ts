export type Database = {
  public: {
    Tables: {
      personal: {
        Row: {
          id: string
          nombre_completo: string
          area: string
          telefono: string | null
          foto_url: string | null
          en_turno: boolean
          orden: number
          created_at: string
        }
        Insert: {
          nombre_completo: string
          area: string
          telefono?: string | null
          foto_url?: string | null
          en_turno: boolean
          orden?: number
        }
        Update: {
          nombre_completo?: string
          area?: string
          telefono?: string | null
          foto_url?: string | null
          en_turno?: boolean
          orden?: number
        }
        Relationships: []
      }
      horarios: {
        Row: {
          id: string
          personal_id: string
          dia: string
          jornada_manana: string | null
          jornada_tarde: string | null
          created_at: string
        }
        Insert: {
          personal_id: string
          dia: string
          jornada_manana?: string | null
          jornada_tarde?: string | null
        }
        Update: {
          jornada_manana?: string | null
          jornada_tarde?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horarios_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_users: {
        Row: {
          id: string
          email: string
          nombre: string
          nivel: number
          activo: boolean
          password_hash: string | null
          area: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre: string
          nivel: number
          activo?: boolean
          password_hash?: string | null
          area?: string[] | null
        }
        Update: {
          email?: string
          nombre?: string
          nivel?: number
          activo?: boolean
          password_hash?: string | null
          area?: string[] | null
        }
        Relationships: []
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
