"use server"

import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"

export interface AdminUser {
  id: string
  email: string
  nombre: string
  nivel: number
  activo: boolean
  created_at: string
}

export async function getAdminUsers(): Promise<{ success: boolean; users?: AdminUser[]; message?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "No autorizado" }
  }

  const adminClient = getAdminClient()

  // Obtener usuarios desde la tabla admin_users que tiene los niveles
  const { data, error } = await adminClient
    .from("admin_users")
    .select("id, email, nombre, nivel, activo, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, users: data as AdminUser[] }
}

export async function addAdminUser(
  email: string,
  password: string,
  nombre: string,
  nivel: number,
): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  const adminClient = getAdminClient()

  try {
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        nombre,
        nivel,
      },
      email_confirm: true, // Marcar email como confirmado
    })

    if (authError) {
      return { success: false, message: authError.message }
    }

    const { data: adminUserData, error: dbError } = await adminClient
      .from("admin_users")
      .insert({
        id: authData.user.id,
        email: authData.user.email || email,
        nombre,
        nivel,
        activo: true,
      })
      .select("id, email, nombre, nivel, activo, created_at")
      .single()

    if (dbError) {
      console.error("Error guardando en admin_users:", dbError)
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        nombre,
        nivel,
        activo: true,
        created_at: authData.user.created_at || new Date().toISOString(),
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return { success: false, message: errorMessage }
  }
}

export async function updateAdminUser(
  id: string,
  email: string,
  nombre: string,
  nivel: number,
  activo: boolean,
): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "No autorizado" }
  }

  const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: {
      nombre,
      nivel,
    },
  })

  if (authError) {
    return { success: false, message: authError.message }
  }

  const adminClient = getAdminClient()
  const { data: adminUserData, error: dbError } = await adminClient
    .from("admin_users")
    .update({
      email,
      nombre,
      nivel,
      activo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, email, nombre, nivel, activo, created_at")
    .single()

  if (dbError) {
    console.error("Error actualizando admin_users:", dbError)
  }

  return {
    success: true,
    user: {
      id: authData.user.id,
      email: authData.user.email || email,
      nombre,
      nivel,
      activo,
      created_at: authData.user.created_at || new Date().toISOString(),
    },
  }
}

export async function deleteAdminUser(id: string): Promise<{ success: boolean; message?: string }> {
  const adminClient = getAdminClient()

  try {
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)

    if (authError) {
      return { success: false, message: authError.message }
    }

    const { error: dbError } = await adminClient.from("admin_users").delete().eq("id", id)

    if (dbError) {
      console.error("Error eliminando de admin_users:", dbError)
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return { success: false, message: errorMessage }
  }
}
