import { createClient } from "@/lib/supabase/server"
import { ClientHome } from "@/components/client-home"
import { ConnectionError } from "@/components/connection-error"

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

interface HorarioMensual {
  id: string
  personal_id: string
  fecha: string
  jornada_manana?: string
  jornada_tarde?: string
}

export default async function Home() {
  const supabase = await createClient()

  const { data: personal, error: personalError } = await supabase
    .from("personal")
    .select("*")
    .order("orden", { ascending: true })
  const { data: horarios, error: horariosError } = await supabase.from("horarios").select("*")
  const { data: horariosMensual, error: horariosMensualError } = await supabase.from("horarios_mensual").select("*")

  if (personalError || horariosError || horariosMensualError || !personal || !horarios || !horariosMensual) {
    return <ConnectionError />
  }

  // Get unique areas
  const areas = Array.from(new Set((personal as Personal[]).map((p) => p.area)))

  return <ClientHome personal={personal as Personal[]} horarios={horarios as Horario[]} horariosMensual={horariosMensual as HorarioMensual[]} areas={areas} />
}
