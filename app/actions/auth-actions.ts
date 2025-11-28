"use server"

import { createClient } from "@/lib/supabase/server"

export async function logoutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}
