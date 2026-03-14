"use server"

import { getAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/supabase"

/**
 * Server-side check: is a date (YYYY-MM-DD) in the past relative to Colombia timezone?
 */
function isDateInPastServer(fecha: string): boolean {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }))
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  return fecha < todayStr
}

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
    // Reject edits to past dates
    if (isDateInPastServer(fecha)) {
      return { success: false, error: "No se puede modificar horarios de días anteriores" }
    }

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
    // Reject deletes to past dates
    if (isDateInPastServer(fecha)) {
      return { success: false, error: "No se puede eliminar horarios de días anteriores" }
    }

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
  onlyField?: "manana" | "tarde" | "both",
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

    // Filter out past dates — they cannot be modified
    const editableDates = weekDates.filter((fecha) => !isDateInPastServer(fecha))
    const skippedCount = weekDates.length - editableDates.length

    // For partial updates (morning-only or afternoon-only), fetch existing records
    // to preserve the other field's value per day
    let existingByDate: Record<string, { jornada_manana: string | null; jornada_tarde: string | null }> = {}
    if (onlyField && onlyField !== "both" && editableDates.length > 0) {
      const { data: existing } = await supabase
        .from("horarios_mensual")
        .select("fecha, jornada_manana, jornada_tarde")
        .eq("personal_id", personalId)
        .in("fecha", editableDates)

      if (existing) {
        for (const rec of existing) {
          existingByDate[rec.fecha] = {
            jornada_manana: rec.jornada_manana,
            jornada_tarde: rec.jornada_tarde,
          }
        }
      }
    }

    // Update only editable dates (today + future)
    for (const fecha of editableDates) {
      let mergedData = data
      if (onlyField === "manana") {
        mergedData = {
          jornada_manana: data.jornada_manana,
          jornada_tarde: existingByDate[fecha]?.jornada_tarde ?? null,
        }
      } else if (onlyField === "tarde") {
        mergedData = {
          jornada_manana: existingByDate[fecha]?.jornada_manana ?? null,
          jornada_tarde: data.jornada_tarde,
        }
      }
      await updateMonthlySchedule(personalId, fecha, mergedData)
    }

    return { success: true, applied: editableDates.length, skipped: skippedCount }
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

/**
 * Get schedule history for a date range, optionally filtered by employee
 * If personalId is "todos", returns schedules for ALL employees
 * Supports single month or date range queries
 */
export async function getScheduleHistory(
  personalId: string,
  mes: number,
  año: number,
  mesHasta?: number,
  añoHasta?: number,
) {
  try {
    const supabase = getAdminClient()

    const monthStart = new Date(año, mes - 1, 1).toISOString().split("T")[0]
    const endMonth = mesHasta ?? mes
    const endYear = añoHasta ?? año
    const monthEnd = new Date(endYear, endMonth, 0).toISOString().split("T")[0]

    let query = supabase
      .from("horarios_mensual")
      .select("*, personal:personal_id(nombre_completo, area)")
      .gte("fecha", monthStart)
      .lte("fecha", monthEnd)
      .order("fecha", { ascending: true })

    if (personalId !== "todos") {
      query = query.eq("personal_id", personalId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, schedules: data || [] }
  } catch (error: any) {
    console.error("[getScheduleHistory] error:", error.message)
    return { success: false, error: error.message, schedules: [] }
  }
}

/**
 * Get all employees (id and name) for selection dropdowns
 */
export async function getEmployeesList() {
  try {
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from("personal")
      .select("id, nombre_completo, area")
      .order("nombre_completo", { ascending: true })

    if (error) throw error

    return { success: true, employees: data || [] }
  } catch (error: any) {
    console.error("[getEmployeesList] error:", error.message)
    return { success: false, error: error.message, employees: [] }
  }
}
