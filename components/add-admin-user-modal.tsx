"use client"

import type React from "react"

import { useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import { addAdminUser, type AdminUser } from "@/app/actions/admin-user-actions"

interface AddAdminUserModalProps {
  allAreas: string[]
  onAdd: (user: AdminUser) => void
  onClose: () => void
}

export function AddAdminUserModal({ allAreas, onAdd, onClose }: AddAdminUserModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [nivel, setNivel] = useState(2)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email || !password || !nombre) {
      setError("Todos los campos son obligatorios")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    if (nivel === 2 && selectedAreas.length === 0) {
      setError("Debe seleccionar al menos un área para admin nivel 2")
      setLoading(false)
      return
    }

    const result = await addAdminUser(email, password, nombre, nivel, selectedAreas)

    if (result.success && result.user) {
      onAdd(result.user)
    } else {
      setError(result.message || "Error al crear usuario")
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Agregar Usuario Admin</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Nombre del administrador"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="admin@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nivel de acceso</label>
            <select
              value={nivel}
              onChange={(e) => {
                const newNivel = Number(e.target.value)
                setNivel(newNivel)
                if (newNivel === 1) {
                  setSelectedAreas([])
                }
              }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value={1}>Nivel 1 - Admin Principal (acceso total)</option>
              <option value={2}>Nivel 2 - Admin Operativo (solo empleados/horarios)</option>
            </select>
          </div>

          {nivel === 2 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Áreas asignadas</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
                {allAreas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay áreas disponibles</p>
                ) : (
                  allAreas.map((area) => (
                    <div key={area} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={selectedAreas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAreas([...selectedAreas, area])
                          } else {
                            setSelectedAreas(selectedAreas.filter((a) => a !== area))
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor={`area-${area}`} className="text-sm text-foreground cursor-pointer">
                        {area}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
