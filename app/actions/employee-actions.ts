"use server"

import { getAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/supabase"

export async function addEmployee(data: {
  nombre_completo: string
  area: string
  telefono?: string
  foto_url?: string
  en_turno: boolean
}) {
  try {
    const supabase = getAdminClient()

    const { data: personal } = await supabase
      .from("personal")
      .select("orden")
      .order("orden", { ascending: false })
      .limit(1)
      .returns<Database["public"]["Tables"]["personal"]["Row"][]>()

    const nextOrder = (personal?.[0]?.orden ?? 0) + 1

    const { data: newEmployee, error } = await supabase
      .from("personal")
      .insert([
        {
          nombre_completo: data.nombre_completo,
          area: data.area,
          telefono: data.telefono,
          foto_url: data.foto_url,
          en_turno: data.en_turno,
          orden: nextOrder,
        } as Database["public"]["Tables"]["personal"]["Insert"],
      ])
      .select()
      .single()
      .returns<Database["public"]["Tables"]["personal"]["Row"]>()

    if (error) throw error

    return { success: true, employee: newEmployee }
  } catch (error: any) {
    console.error("[v0] addEmployee error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function updateEmployee(
  id: string,
  data: {
    nombre_completo: string
    area: string
    telefono?: string
    foto_url?: string
    en_turno: boolean
  },
) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from("personal")
      .update({
        nombre_completo: data.nombre_completo,
        area: data.area,
        telefono: data.telefono,
        foto_url: data.foto_url,
        en_turno: data.en_turno,
      } as Database["public"]["Tables"]["personal"]["Update"])
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[v0] updateEmployee error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function updateSchedule(
  personalId: string,
  dia: string,
  data: {
    jornada_manana: string | null
    jornada_tarde: string | null
  },
) {
  try {
    const supabase = getAdminClient()

    const { data: existing, error: selectError } = await supabase
      .from("horarios")
      .select("id")
      .eq("personal_id", personalId)
      .eq("dia", dia)
      .maybeSingle()
      .returns<Database["public"]["Tables"]["horarios"]["Row"] | null>()

    if (selectError) throw selectError

    if (existing) {
      const { error } = await supabase
        .from("horarios")
        .update(data as Database["public"]["Tables"]["horarios"]["Update"])
        .eq("id", existing.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("horarios").insert([
        {
          personal_id: personalId,
          dia,
          jornada_manana: data.jornada_manana,
          jornada_tarde: data.jornada_tarde,
        } as Database["public"]["Tables"]["horarios"]["Insert"],
      ])

      if (error) throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] updateSchedule error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function deleteEmployee(id: string) {
  try {
    const supabase = getAdminClient()

    // Delete horarios first (foreign key constraint)
    await supabase.from("horarios").delete().eq("personal_id", id)

    // Delete employee
    const { error } = await supabase.from("personal").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[v0] deleteEmployee error:", error.message)
    return { success: false, error: error.message }
  }
}
