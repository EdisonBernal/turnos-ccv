'use server'

import { createClient } from '@/lib/supabase/server'

interface Festivo {
  id: string
  fecha: string
  nombre: string
  created_at: string
}

/**
 * Obtener todos los festivos
 * Opcionalmente filtrado por año
 */
export async function getFestivos(año?: number) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('festivos')
      .select('*')
      .order('fecha', { ascending: true })

    if (año) {
      const startDate = `${año}-01-01`
      const endDate = `${año}-12-31`
      query = query
        .gte('fecha', startDate)
        .lte('fecha', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, festivos: data || [] }
  } catch (error: any) {
    console.error('[getFestivos] error:', error.message)
    return { success: false, error: error.message, festivos: [] }
  }
}

/**
 * Agregar un nuevo festivo
 * Solo admin nivel 1 puede hacerlo (controlado por RLS)
 */
export async function addFestivo(fecha: string, nombre: string) {
  try {
    if (!fecha || !nombre.trim()) {
      return { success: false, error: 'Fecha y nombre son requeridos' }
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(fecha)) {
      return { success: false, error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('festivos')
      .insert([
        {
          fecha,
          nombre: nombre.trim(),
        },
      ])
      .select()

    if (error) {
      // Manejar error de fecha duplicada
      if (error.code === '23505') {
        return { success: false, error: 'Ya existe un festivo en esa fecha' }
      }
      throw error
    }

    return { success: true, festivo: data?.[0] }
  } catch (error: any) {
    console.error('[addFestivo] error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Eliminar un festivo por fecha
 * Solo admin nivel 1 puede hacerlo (controlado por RLS)
 */
export async function deleteFestivo(fecha: string) {
  try {
    if (!fecha) {
      return { success: false, error: 'Fecha es requerida' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('festivos')
      .delete()
      .eq('fecha', fecha)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('[deleteFestivo] error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Editar nombre de un festivo
 * Solo admin nivel 1 puede hacerlo (controlado por RLS)
 */
export async function updateFestivo(fecha: string, nombre: string) {
  try {
    if (!fecha || !nombre.trim()) {
      return { success: false, error: 'Fecha y nombre son requeridos' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('festivos')
      .update({
        nombre: nombre.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('fecha', fecha)
      .select()

    if (error) throw error

    return { success: true, festivo: data?.[0] }
  } catch (error: any) {
    console.error('[updateFestivo] error:', error.message)
    return { success: false, error: error.message }
  }
}
