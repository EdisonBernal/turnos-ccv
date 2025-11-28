import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminLogoutButton } from "@/components/admin-logout-button"
import { redirect } from "next/navigation"

interface Personal {
  id: string
  nombre_completo: string
  area: string
  foto_url?: string
  telefono?: string
  en_turno: boolean
  orden: number
}

interface Horario {
  id: string
  personal_id: string
  dia: string
  jornada_manana?: string
  jornada_tarde?: string
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const adminNivel = (user.user_metadata?.nivel as number) || 1

  const { data: personal = [] } = await supabase.from("personal").select("*").order("orden", { ascending: true })
  const { data: horarios = [] } = await supabase.from("horarios").select("*")

  const areas = Array.from(new Set((personal as Personal[]).map((p) => p.area)))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Volver</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Panel de Administrador</h1>
              <p className="text-muted-foreground">{user.user_metadata?.nombre || user.email}</p>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <AdminDashboard
          personal={personal as Personal[]}
          horarios={horarios as Horario[]}
          areas={areas}
          adminNivel={adminNivel}
        />
      </main>
    </div>
  )
}
