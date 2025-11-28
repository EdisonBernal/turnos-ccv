"use client"

import { useState, useMemo } from "react"
import { StaffCard } from "@/components/staff-card"
import { StaffFilters } from "@/components/staff-filters"
import { getEmployeeStatus } from "@/lib/schedule-validator"

interface Horario {
  id: string
  personal_id: string
  dia: string
  jornada_manana?: string
  jornada_tarde?: string
}

interface Personal {
  id: string
  nombre_completo: string
  area: string
  foto_url?: string
  telefono?: string
  en_turno: boolean
  orden: number
}

interface StaffListProps {
  personal: Personal[]
  horarios: Horario[]
  areas: string[]
}

export function StaffList({ personal, horarios, areas }: StaffListProps) {
  const [filters, setFilters] = useState({
    search: "",
    area: "",
    status: "",
  })

  // Group horarios by personal_id
  const horariosMap = useMemo(() => {
    const map = new Map<string, Horario[]>()
    horarios.forEach((h) => {
      if (!map.has(h.personal_id)) {
        map.set(h.personal_id, [])
      }
      map.get(h.personal_id)!.push(h)
    })
    return map
  }, [horarios])

  const personalWithValidation = useMemo(() => {
    return personal.map((person) => {
      const personHorarios = horariosMap.get(person.id) || []
      const { status, statusText, reason } = getEmployeeStatus(person.en_turno, personHorarios)
      return {
        ...person,
        actualEnTurno: status === "en_turno",
        statusText,
        statusReason: reason,
      }
    })
  }, [personal, horariosMap])

  // Apply filters using validated status
  const filteredPersonal = useMemo(() => {
    return personalWithValidation.filter((person) => {
      if (filters.search && !person.nombre_completo.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      if (filters.area && person.area !== filters.area) {
        return false
      }

      if (filters.status === "en_turno" && !person.actualEnTurno) {
        return false
      }
      if (filters.status === "fuera_turno" && person.actualEnTurno) {
        return false
      }

      return true
    })
  }, [personalWithValidation, filters])

  // Separate available and unavailable staff from filtered results
  const availableStaff = filteredPersonal.filter((p) => p.actualEnTurno)
  const unavailableStaff = filteredPersonal.filter((p) => !p.actualEnTurno)

  return (
    <>
      {/* Filters */}
      <StaffFilters areas={areas} onFilterChange={setFilters} />

      {/* Available Staff Section */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Personal Disponible</h2>
          <p className="text-muted-foreground">
            {availableStaff.length} empleado{availableStaff.length !== 1 ? "s" : ""} en turno
          </p>
        </div>

        {availableStaff.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableStaff.map((person) => (
              <StaffCard
                key={person.id}
                id={person.id}
                nombre_completo={person.nombre_completo}
                area={person.area}
                foto_url={person.foto_url}
                telefono={person.telefono}
                en_turno={person.actualEnTurno}
                statusReason={person.statusReason}
                horarios={horariosMap.get(person.id) || []}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted p-8 text-center">
            <p className="text-muted-foreground">No hay personal disponible que coincida con los filtros</p>
          </div>
        )}
      </section>

      {/* Unavailable Staff Section */}
      {unavailableStaff.length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Personal No Disponible</h2>
            <p className="text-muted-foreground">
              {unavailableStaff.length} empleado{unavailableStaff.length !== 1 ? "s" : ""} fuera de turno
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unavailableStaff.map((person) => (
              <StaffCard
                key={person.id}
                id={person.id}
                nombre_completo={person.nombre_completo}
                area={person.area}
                foto_url={person.foto_url}
                telefono={person.telefono}
                en_turno={person.actualEnTurno}
                statusReason={person.statusReason}
                horarios={horariosMap.get(person.id) || []}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
