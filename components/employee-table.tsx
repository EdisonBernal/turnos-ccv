"use client"

import { useState, useMemo } from "react"
import { deleteEmployee } from "@/app/actions/employee-actions"
import { Pencil, Trash2, Search } from "lucide-react"

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

export function EmployeeTable({ employees, horarios, onEdit, onDelete }: EmployeeTableProps) {
  const [nameFilter, setNameFilter] = useState("")
  const [areaFilter, setAreaFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "turno" | "fuera">("")

  const areas = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.area))).sort()
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (nameFilter && !emp.nombre_completo.toLowerCase().includes(nameFilter.toLowerCase())) return false
      if (areaFilter && emp.area !== areaFilter) return false
      if (statusFilter === "turno" && !emp.en_turno) return false
      if (statusFilter === "fuera" && emp.en_turno) return false
      return true
    })
  }, [employees, nameFilter, areaFilter, statusFilter])

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
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          <option value="">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "turno" | "fuera")}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="turno">En turno</option>
          <option value="fuera">Fuera de turno</option>
        </select>
      </div>

      {(nameFilter || areaFilter || statusFilter) && (
        <div className="text-xs text-muted-foreground">
          {filteredEmployees.length} de {employees.length} empleado{employees.length !== 1 ? "s" : ""}
        </div>
      )}

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
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                No se encontraron empleados con los filtros seleccionados
              </td>
            </tr>
          ) : (
          filteredEmployees.map((employee) => {
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
          })
          )}
        </tbody>
      </table>
    </div>
    </div>
  )
}
