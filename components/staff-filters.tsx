"use client"

import { Search } from "lucide-react"
import { useState } from "react"

interface StaffFiltersProps {
  areas: string[]
  onFilterChange: (filters: {
    search: string
    area: string
    status: string
  }) => void
}

export function StaffFilters({ areas, onFilterChange }: StaffFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedArea, setSelectedArea] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const handleChange = () => {
    onFilterChange({
      search,
      area: selectedArea,
      status: selectedStatus,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({
      search: value,
      area: selectedArea,
      status: selectedStatus,
    })
  }

  const handleAreaChange = (value: string) => {
    setSelectedArea(value)
    onFilterChange({
      search,
      area: value,
      status: selectedStatus,
    })
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    onFilterChange({
      search,
      area: selectedArea,
      status: value,
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Filtros</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Buscar por nombre</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nombre del empleado..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Area filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Área</label>
          <select
            value={selectedArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos los estados</option>
            <option value="en_turno">En turno</option>
            <option value="fuera_turno">Fuera de turno</option>
          </select>
        </div>
      </div>
    </div>
  )
}
