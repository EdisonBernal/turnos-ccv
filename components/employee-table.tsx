"use client"

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

interface EmployeeTableProps {
  employees: Personal[]
  horarios: Horario[]
  onEdit: (employee: Personal) => void
  onDelete: (employeeId: string) => void
}

import { deleteEmployee } from "@/app/actions/employee-actions"
import { Pencil, Trash2 } from "lucide-react"

export function EmployeeTable({ employees, horarios, onEdit, onDelete }: EmployeeTableProps) {
  const handleDelete = async (employee: Personal) => {
    if (!confirm(`¿Eliminar a ${employee.nombre_completo}?`)) return

    const result = await deleteEmployee(employee.id)
    if (result.success) {
      onDelete(employee.id)
    } else {
      alert("Error al eliminar: " + result.error)
    }
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-card">
      <table className="w-full">
        <thead className="bg-muted border-b border-border">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Área</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Teléfono</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((employee) => {
            const employeeHorarios = horarios.filter((h) => h.personal_id === employee.id)
            return (
              <tr key={employee.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm text-foreground font-medium">{employee.nombre_completo}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{employee.area}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{employee.telefono || "-"}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.en_turno
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {employee.en_turno ? "En turno" : "Fuera de turno"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button
                    onClick={() => onEdit(employee)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    title="Editar empleado" 
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee)}
                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    title="Eliminar empleado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
