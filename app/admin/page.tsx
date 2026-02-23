import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
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

interface AdminUsersRow {
  area: string[] | null
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

  // Obtener áreas del admin si es nivel 2
  let adminAreas: string[] = []
  if (adminNivel === 2) {
    const adminClient = getAdminClient()
    const { data: adminUserData } = await adminClient
      .from("admin_users")
      .select("area")
      .eq("id", user.id)
      .single<AdminUsersRow>()

    adminAreas = adminUserData?.area || []
  }

  // Obtener personal
  let personalQuery = supabase.from("personal").select("*").order("orden", { ascending: true })

  // Si es admin nivel 2, filtrar por sus áreas
  if (adminNivel === 2 && adminAreas.length > 0) {
    personalQuery = personalQuery.in("area", adminAreas)
  }

  const { data: personal = [] } = await personalQuery
  const { data: horarios = [] } = await supabase.from("horarios").select("*")

  // Obtener áreas disponibles (todas si nivel 1, solo las del admin si nivel 2)
  const allAreas = Array.from(new Set((personal as Personal[]).map((p) => p.area)))
  const areas = adminNivel === 2 ? adminAreas : allAreas

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
          adminAreas={adminAreas}
        />
      </main>
    </div>
  )
}
