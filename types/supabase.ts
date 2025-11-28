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
      }
      admin_users: {
        Row: {
          id: string
          email: string
          nombre: string
          nivel: number
          activo: boolean
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          nombre: string
          nivel: number
          activo?: boolean
          password_hash?: string | null
        }
        Update: {
          email?: string
          nombre?: string
          nivel?: number
          activo?: boolean
          password_hash?: string | null
        }
      }
    }
  }
}
