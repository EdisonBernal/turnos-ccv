"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Calendar, Search } from "lucide-react"
import { getScheduleHistory, getEmployeesList } from "@/app/actions/employee-actions"
import * as XLSX from "xlsx"

interface ScheduleRecord {
  id: string
  personal_id: string
  fecha: string
  jornada_manana: string | null
  jornada_tarde: string | null
  created_at: string
  updated_at: string
  personal?: { nombre_completo: string; area: string } | null
}

interface Employee {
  id: string
  nombre_completo: string
  area: string
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const PAGE_SIZE = 15

interface ScheduleHistoryProps {
  adminNivel?: number
  adminAreas?: string[]
}

export function ScheduleHistory({ adminNivel = 1, adminAreas = [] }: ScheduleHistoryProps) {
  const now = new Date()
  // Employee filter
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  // Date range mode
  const [rangeMode, setRangeMode] = useState(false)
  // Single month
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  // Range end
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1)
  const [endYear, setEndYear] = useState(now.getFullYear())

  const [schedules, setSchedules] = useState<ScheduleRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Load employees list on mount
  useEffect(() => {
    const load = async () => {
      setLoadingEmployees(true)
      const result = await getEmployeesList()
      if (result.success) {
        // Filtrar empleados si es nivel 2 (solo su área)
        let filteredEmployees = result.employees as Employee[]
        if (adminNivel === 2 && adminAreas.length > 0) {
          filteredEmployees = (result.employees as Employee[]).filter((emp) => adminAreas.includes(emp.area))
        }
        setEmployees(filteredEmployees)
      }
      setLoadingEmployees(false)
    }
    load()
  }, [adminNivel, adminAreas])

  // Load schedule history when filters change
  const loadHistory = useCallback(async () => {
    if (!selectedEmployeeId) {
      setSchedules([])
      return
    }
    setLoading(true)
    try {
      const result = rangeMode
        ? await getScheduleHistory(selectedEmployeeId, selectedMonth, selectedYear, endMonth, endYear)
        : await getScheduleHistory(selectedEmployeeId, selectedMonth, selectedYear)
      if (result.success) {
        let schedules = result.schedules as ScheduleRecord[]
        
        // Si es nivel 2 y seleccionó "todos", filtrar por los empleados permitidos
        if (adminNivel === 2 && selectedEmployeeId === "todos" && adminAreas.length > 0) {
          const allowedEmployeeIds = employees.map((emp) => emp.id)
          schedules = schedules.filter((schedule) => allowedEmployeeIds.includes(schedule.personal_id))
        }
        
        setSchedules(schedules)
      }
    } finally {
      setLoading(false)
      setCurrentPage(1)
    }
  }, [selectedEmployeeId, selectedMonth, selectedYear, endMonth, endYear, rangeMode, adminNivel, adminAreas, employees])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Helpers
  const totalPages = Math.max(1, Math.ceil(schedules.length / PAGE_SIZE))
  const paginatedSchedules = schedules.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)
  const isAllEmployees = selectedEmployeeId === "todos"

  const formatDate = (fecha: string) => {
    const date = new Date(fecha + "T12:00:00")
    const dayName = DIAS_SEMANA[date.getDay()]
    const day = date.getDate()
    return `${dayName} ${day}`
  }

  const getEmployeeName = (record: ScheduleRecord): string => {
    if (record.personal?.nombre_completo) return record.personal.nombre_completo
    const emp = employees.find((e) => e.id === record.personal_id)
    return emp?.nombre_completo || "—"
  }

  const getDateRangeLabel = () => {
    if (rangeMode) {
      return `${MESES[selectedMonth - 1]} ${selectedYear} — ${MESES[endMonth - 1]} ${endYear}`
    }
    return `${MESES[selectedMonth - 1]} ${selectedYear}`
  }

  // Export ALL schedules (ignoring pagination, respecting filters)
  const handleExportExcel = () => {
    if (schedules.length === 0) return

    const label = isAllEmployees ? "Todos" : (selectedEmployee?.nombre_completo || "Empleado")
    const dateLabel = getDateRangeLabel().replace(/\s—\s/g, "_a_")

    const exportData = schedules.map((s) => {
      const base: Record<string, string> = {}
      if (isAllEmployees) {
        base["Empleado"] = getEmployeeName(s)
      }
      base["Fecha"] = s.fecha
      base["Día"] = (() => {
        const d = new Date(s.fecha + "T12:00:00")
        return DIAS_SEMANA[d.getDay()]
      })()
      base["Jornada Mañana"] = s.jornada_manana || "-"
      base["Jornada Tarde"] = s.jornada_tarde || "-"
      return base
    })

    const ws = XLSX.utils.json_to_sheet(exportData)

    ws["!cols"] = isAllEmployees
      ? [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 16 }]
      : [{ wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 16 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Historial")

    const safeName = label.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "").replace(/\s+/g, "_")
    const safeDateLabel = dateLabel.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ _]/g, "").replace(/\s+/g, "_")
    XLSX.writeFile(wb, `Historial_Horarios_${safeName}_${safeDateLabel}.xlsx`)
  }

  // Generate year options
  const yearOptions = []
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) {
    yearOptions.push(y)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Historial de Horarios</h2>
      </div>

      {/* Filters */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Empleado</label>
            {loadingEmployees ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Cargando empleados...</div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              >
                <option value="">Seleccionar empleado...</option>
                <option value="todos">📋 Todos los empleados</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre_completo} — {emp.area}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Range mode toggle */}
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rangeMode}
                onChange={(e) => setRangeMode(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-foreground">Rango de meses</span>
            </label>
          </div>
        </div>

        {/* Date selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {rangeMode ? "Mes desde" : "Mes"}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              {MESES.map((mes, idx) => (
                <option key={idx} value={idx + 1}>{mes}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {rangeMode ? "Año desde" : "Año"}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {rangeMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mes hasta</label>
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  {MESES.map((mes, idx) => (
                    <option key={idx} value={idx + 1}>{mes}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Año hasta</label>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export button */}
      {schedules.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar a Excel ({schedules.length} registros)
          </button>
        </div>
      )}

      {/* Content */}
      {!selectedEmployeeId ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Selecciona un empleado o &quot;Todos los empleados&quot; para ver el historial</p>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando historial...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            No hay horarios registrados {isAllEmployees ? "" : `para ${selectedEmployee?.nombre_completo} `}en {getDateRangeLabel()}
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="text-sm text-muted-foreground">
            Mostrando {schedules.length} registro{schedules.length !== 1 ? "s" : ""}{" "}
            {isAllEmployees ? (
              <span>de <span className="font-medium text-foreground">todos los empleados</span></span>
            ) : (
              <span>de <span className="font-medium text-foreground">{selectedEmployee?.nombre_completo}</span></span>
            )}{" "}
            — {getDateRangeLabel()}
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {isAllEmployees && (
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Empleado</th>
                  )}
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Día</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Jornada Mañana</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">Jornada Tarde</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchedules.map((schedule, idx) => (
                  <tr key={schedule.id || `${schedule.fecha}-${idx}`} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    {isAllEmployees && (
                      <td className="px-4 py-3 text-foreground font-medium">{getEmployeeName(schedule)}</td>
                    )}
                    <td className="px-4 py-3 text-foreground">{schedule.fecha}</td>
                    <td className="px-4 py-3 text-foreground">{formatDate(schedule.fecha)}</td>
                    <td className="px-4 py-3">
                      {schedule.jornada_manana ? (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                          {schedule.jornada_manana}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {schedule.jornada_tarde ? (
                        <span className="inline-block bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded text-xs font-medium">
                          {schedule.jornada_tarde}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
