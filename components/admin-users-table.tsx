"use client"

import { useState } from "react"
import { Pencil, Trash2, UserPlus, Shield, ShieldCheck } from "lucide-react"
import { deleteAdminUser, type AdminUser } from "@/app/actions/admin-user-actions"

interface AdminUsersTableProps {
  users: AdminUser[]
  onEdit: (user: AdminUser) => void
  onDelete: (userId: string) => void
  onAdd: () => void
}

export function AdminUsersTable({ users, onEdit, onDelete, onAdd }: AdminUsersTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.nombre}"?`)) return

    setDeleting(user.id)
    const result = await deleteAdminUser(user.id)
    setDeleting(null)

    if (result.success) {
      onDelete(user.id)
    } else {
      alert(result.message || "Error al eliminar usuario")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Usuarios Administradores</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Nivel</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Estado</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{user.nombre}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.nivel === 1 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.nivel === 1 ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      Nivel {user.nivel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        title="Editar usuario" 
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deleting === user.id}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No hay usuarios administradores registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
