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

    // Delete horarios_mensual (foreign key constraint)
    await supabase.from("horarios_mensual").delete().eq("personal_id", id)

    // Delete employee
    const { error } = await supabase.from("personal").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[v0] deleteEmployee error:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get all monthly schedules for a specific employee, month and year
 */
export async function getMonthlySchedules(personalId: string, mes: number, año: number) {
  try {
    const supabase = getAdminClient()

    // Calculate date range for the month
    const monthStart = new Date(año, mes - 1, 1).toISOString().split("T")[0]
    const monthEnd = new Date(año, mes, 0).toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("horarios_mensual")
      .select("*")
      .eq("personal_id", personalId)
      .gte("fecha", monthStart)
      .lte("fecha", monthEnd)
      .order("fecha", { ascending: true })

    if (error) throw error

    return { success: true, schedules: data || [] }
  } catch (error: any) {
    console.error("[updateMonthlySchedule] getMonthlySchedules error:", error.message)
    return { success: false, error: error.message, schedules: [] }
  }
}

/**
 * Update or insert a monthly schedule for a specific date
 */
export async function updateMonthlySchedule(
  personalId: string,
  fecha: string, // YYYY-MM-DD
  data: {
    jornada_manana: string | null
    jornada_tarde: string | null
  },
) {
  try {
    const supabase = getAdminClient()

    // Check if record already exists
    const { data: existing, error: selectError } = await supabase
      .from("horarios_mensual")
      .select("id")
      .eq("personal_id", personalId)
      .eq("fecha", fecha)
      .maybeSingle()

    if (selectError) throw selectError

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("horarios_mensual")
        .update({
          jornada_manana: data.jornada_manana,
          jornada_tarde: data.jornada_tarde,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (error) throw error
    } else {
      // Insert new
      const { error } = await supabase.from("horarios_mensual").insert([
        {
          personal_id: personalId,
          fecha,
          jornada_manana: data.jornada_manana,
          jornada_tarde: data.jornada_tarde,
        },
      ])

      if (error) throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("[updateMonthlySchedule] error:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a monthly schedule for a specific date
 */
export async function deleteMonthlySchedule(personalId: string, fecha: string) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from("horarios_mensual")
      .delete()
      .eq("personal_id", personalId)
      .eq("fecha", fecha)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[deleteMonthlySchedule] error:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Apply the same schedule to all days of a specific week (Monday to Saturday only)
 * Week number: 1-5, calculated from the first day of the month
 * Sunday (day 0) is excluded
 */
export async function updateWeeklySchedules(
  personalId: string,
  mes: number,
  año: number,
  numeroSemana: number, // 1-5
  data: {
    jornada_manana: string | null
    jornada_tarde: string | null
  },
) {
  try {
    const supabase = getAdminClient()

    // Get all days in this week (excluding Sunday)
    const monthStart = new Date(año, mes - 1, 1)
    const firstDayOfMonth = monthStart.getDay() // 0-6 (Sunday-Saturday)

    // Calculate start and end dates of the week
    const weekStartDate = 1 + (numeroSemana - 1) * 7 - firstDayOfMonth
    const weekEndDate = weekStartDate + 6

    const weekDates: string[] = []
    for (let day = weekStartDate; day <= weekEndDate; day++) {
      if (day >= 1 && day <= new Date(año, mes, 0).getDate()) {
        const date = new Date(año, mes - 1, day)
        const dayOfWeek = date.getDay() // 0 = Sunday, 1-6 = Mon-Sat
        
        // Skip Sunday (dayOfWeek === 0)
        if (dayOfWeek !== 0) {
          weekDates.push(date.toISOString().split("T")[0])
        }
      }
    }

    // Update all dates in the week (excluding Sunday)
    for (const fecha of weekDates) {
      await updateMonthlySchedule(personalId, fecha, data)
    }

    return { success: true }
  } catch (error: any) {
    console.error("[updateWeeklySchedules] error:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Copy schedule from one week to another in the same month (Monday to Saturday only)
 * Sunday is excluded from copying
 */
export async function copyWeekToWeek(
  personalId: string,
  mes: number,
  año: number,
  semanaOrigen: number,
  semanaDestino: number,
) {
  try {
    const supabase = getAdminClient()

    // Get all days in source week
    const monthStart = new Date(año, mes - 1, 1)
    const firstDayOfMonth = monthStart.getDay()

    const getWeekDates = (weekNum: number) => {
      const weekStartDate = 1 + (weekNum - 1) * 7 - firstDayOfMonth
      const weekEndDate = weekStartDate + 6
      const dates: string[] = []
      const lastDayOfMonth = new Date(año, mes, 0).getDate()

      for (let day = weekStartDate; day <= weekEndDate; day++) {
        if (day >= 1 && day <= lastDayOfMonth) {
          const date = new Date(año, mes - 1, day)
          const dayOfWeek = date.getDay() // 0 = Sunday, 1-6 = Mon-Sat
          
          // Skip Sunday (dayOfWeek === 0)
          if (dayOfWeek !== 0) {
            dates.push(date.toISOString().split("T")[0])
          }
        }
      }
      return dates
    }

    const sourceDates = getWeekDates(semanaOrigen)
    const destDates = getWeekDates(semanaDestino)

    // Fetch source schedules
    const { data: sourceSchedules, error: fetchError } = await supabase
      .from("horarios_mensual")
      .select("*")
      .eq("personal_id", personalId)
      .in("fecha", sourceDates)

    if (fetchError) throw fetchError

    // Create/update destination schedules
    for (let i = 0; i < destDates.length && i < sourceDates.length; i++) {
      const sourceSchedule = sourceSchedules?.find((s) => s.fecha === sourceDates[i])
      if (sourceSchedule) {
        await updateMonthlySchedule(personalId, destDates[i], {
          jornada_manana: sourceSchedule.jornada_manana,
          jornada_tarde: sourceSchedule.jornada_tarde,
        })
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("[copyWeekToWeek] error:", error.message)
    return { success: false, error: error.message }
  }
}
