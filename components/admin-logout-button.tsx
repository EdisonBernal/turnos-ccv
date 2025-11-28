"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logoutAdmin } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AdminLogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutAdmin()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="gap-2 bg-transparent cursor-pointer"
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  )
}
