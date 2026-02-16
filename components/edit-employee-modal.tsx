"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateEmployee, updateSchedule } from "@/app/actions/employee-actions"

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

interface EditEmployeeModalProps {
  employee: Personal
  horarios: Horario[]
  areas: string[]
  onUpdate: (employee: Personal) => void
  onClose: () => void
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export function EditEmployeeModal({ employee, horarios, areas, onUpdate, onClose }: EditEmployeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<"info" | "horarios">("info")
  const [formData, setFormData] = useState({
    nombre_completo: employee.nombre_completo,
    area: employee.area,
    telefono: employee.telefono || "",
    foto_url: employee.foto_url || "",
    en_turno: employee.en_turno,
  })
  const [uploading, setUploading] = useState(false)

  const [schedules, setSchedules] = useState<Horario[]>(
    DIAS.map((dia) => {
      const existing = horarios.find((h) => h.dia === dia)
      return existing || { id: "", personal_id: employee.id, dia, jornada_manana: "", jornada_tarde: "" }
    }),
  )

  // Global preset times to apply to multiple days (ej: mes completo)
  const [globalMorningStart, setGlobalMorningStart] = useState("")
  const [globalMorningEnd, setGlobalMorningEnd] = useState("")
  const [globalAfternoonStart, setGlobalAfternoonStart] = useState("")
  const [globalAfternoonEnd, setGlobalAfternoonEnd] = useState("")

  const applyGlobalToAll = (applyMorning: boolean, applyAfternoon: boolean) => {
    const newSchedules = schedules.map((s) => {
      const copy = { ...s }
      if (applyMorning) {
        copy.jornada_manana = globalMorningStart && globalMorningEnd ? `${globalMorningStart}-${globalMorningEnd}` : ""
      }
      if (applyAfternoon) {
        copy.jornada_tarde = globalAfternoonStart && globalAfternoonEnd ? `${globalAfternoonStart}-${globalAfternoonEnd}` : ""
      }
      return copy
    })
    setSchedules(newSchedules)
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.telefono && formData.telefono.replace(/\D/g, "").length !== 10) {
      alert("El teléfono debe tener 10 dígitos.")
      return
    }
    setLoading(true)
    try {
      const result = await updateEmployee(employee.id, formData)
      if (result.success) {
        onUpdate({ ...employee, ...formData })
      } else {
        alert("Error al actualizar: " + result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      for (const schedule of schedules) {
        await updateSchedule(employee.id, schedule.dia, {
          jornada_manana: schedule.jornada_manana || null,
          jornada_tarde: schedule.jornada_tarde || null,
        })
      }
      alert("Horarios actualizados correctamente")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const clearTimeRange = (idx: number, period: 'manana' | 'tarde') => {
    const newSchedules = [...schedules]
    if (period === 'manana') {
      newSchedules[idx].jornada_manana = ""
    } else {
      newSchedules[idx].jornada_tarde = ""
    }
    setSchedules(newSchedules)
  }

  const setMorningDefault = (idx: number) => {
    const newSchedules = [...schedules]
    newSchedules[idx].jornada_manana = "07:00-12:59"
    setSchedules(newSchedules)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Editar Empleado</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              tab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setTab("horarios")}
            className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              tab === "horarios"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Horarios
          </button>
        </div>

        {tab === "info" && (
          <form onSubmit={handleInfoSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Área</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                value={formData.telefono}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10)
                  setFormData({ ...formData, telefono: cleaned })
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="3001234567"
              />
              <p className="text-xs text-muted-foreground mt-1">Ingresa solo el número sin el prefijo +57</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Foto (archivo o URL)</label>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      setUploading(true)
                      const supabase = createClient()
                      const filePath = `employees/${employee.id}_${Date.now()}_${file.name}`
                      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })
                      if (uploadError) throw uploadError
                      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
                      const publicUrl = urlData.publicUrl
                      setFormData({ ...formData, foto_url: publicUrl })
                    } catch (err: any) {
                      console.error("Upload error:", err)
                      alert("Error al subir la imagen: " + (err?.message || String(err)))
                    } finally {
                      setUploading(false)
                    }
                  }}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {formData.foto_url && (
                  <div className="w-20 h-20 rounded-full overflow-hidden relative">
                    <img src={formData.foto_url} alt="preview" className="object-cover w-full h-full" />
                  </div>
                )}
                {uploading && <div className="text-sm text-muted-foreground">Subiendo...</div>}
              </div>

              <div className="mt-2">
                {formData.foto_url ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("¿Eliminar avatar? Esta acción intentará borrar el archivo del bucket.")) return
                        try {
                          setUploading(true)
                          const supabase = createClient()
                          const url = formData.foto_url
                          const marker = "/avatars/"
                          const idx = url.indexOf(marker)
                          if (idx !== -1) {
                            const path = decodeURIComponent(url.slice(idx + marker.length))
                            const { error } = await supabase.storage.from("avatars").remove([path])
                            if (error) throw error
                          }
                          setFormData({ ...formData, foto_url: "" })
                        } catch (err: any) {
                          console.error("Delete avatar error:", err)
                          alert("No se pudo eliminar el avatar: " + (err?.message || String(err)))
                        } finally {
                          setUploading(false)
                        }
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm cursor-pointer"
                    >
                      Eliminar avatar
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Sin avatar</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="en_turno"
                checked={formData.en_turno}
                onChange={(e) => setFormData({ ...formData, en_turno: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="en_turno" className="text-sm font-medium text-foreground">
                En turno
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors cursor-pointer"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {tab === "horarios" && (
          <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 pb-24">
            <div className="space-y-4">
              {/* Presets globales: aplicar horario a todo el mes */}
              <div className="border border-border rounded-lg p-4 bg-background/50">
                <h3 className="font-semibold text-foreground text-base mb-2">Aplicar horario a todos los días</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Mañana Inicio</label>
                    <input
                      type="time"
                      value={globalMorningStart}
                      onChange={(e) => setGlobalMorningStart(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Mañana Fin</label>
                    <input
                      type="time"
                      value={globalMorningEnd}
                      onChange={(e) => setGlobalMorningEnd(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tarde Inicio</label>
                    <input
                      type="time"
                      value={globalAfternoonStart}
                      onChange={(e) => setGlobalAfternoonStart(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tarde Fin</label>
                    <input
                      type="time"
                      value={globalAfternoonEnd}
                      onChange={(e) => setGlobalAfternoonEnd(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => applyGlobalToAll(true, false)}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm cursor-pointer"
                  >
                    Aplicar mañana a todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGlobalToAll(false, true)}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm cursor-pointer"
                  >
                    Aplicar tarde a todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => applyGlobalToAll(true, true)}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm cursor-pointer"
                  >
                    Aplicar ambos a todos los días
                  </button>
                </div>
              </div>
              {schedules.map((schedule, idx) => (
                <div key={schedule.dia} className="border border-border rounded-lg p-4 space-y-3 bg-background/50">
                  <h3 className="font-semibold text-foreground text-base">{schedule.dia}</h3>
                  
                  {/* Jornada Mañana */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Jornada Mañana</label>
                      <div className="flex items-center gap-2">
                        {(schedule.dia === "Domingo" || schedule.dia === "Sábado") && (
                          <button
                            type="button"
                            onClick={() => setMorningDefault(idx)}
                            className="text-xs text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                          >
                            Disponibilidad
                          </button>
                        )}
                        {schedule.jornada_manana && (
                          <button
                            type="button"
                            onClick={() => clearTimeRange(idx, 'manana')}
                            className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                        <input
                          type="time"
                          value={schedule.jornada_manana?.split("-")[0] || ""}
                          onChange={(e) => {
                            const newSchedules = [...schedules]
                            const endTime = newSchedules[idx].jornada_manana?.split("-")[1] || ""
                            const newValue = e.target.value ? `${e.target.value}${endTime ? `-${endTime}` : ""}` : ""
                            newSchedules[idx].jornada_manana = newValue
                            setSchedules(newSchedules)
                          }}
                          className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Fin</label>
                        <input
                          type="time"
                          value={schedule.jornada_manana?.split("-")[1] || ""}
                          onChange={(e) => {
                            const newSchedules = [...schedules]
                            const startTime = newSchedules[idx].jornada_manana?.split("-")[0] || ""
                            const newValue = startTime && e.target.value ? `${startTime}-${e.target.value}` : ""
                            newSchedules[idx].jornada_manana = newValue
                            setSchedules(newSchedules)
                          }}
                          className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>
                    {schedule.jornada_manana && (
                      <p className="text-xs text-muted-foreground">
                        {schedule.jornada_manana}
                      </p>
                    )}
                  </div>

                  {/* Jornada Tarde */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Jornada Tarde</label>
                      {schedule.jornada_tarde && (
                        <button
                          type="button"
                          onClick={() => clearTimeRange(idx, 'tarde')}
                          className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
                        <input
                          type="time"
                          value={schedule.jornada_tarde?.split("-")[0] || ""}
                          onChange={(e) => {
                            const newSchedules = [...schedules]
                            const endTime = newSchedules[idx].jornada_tarde?.split("-")[1] || ""
                            const newValue = e.target.value ? `${e.target.value}${endTime ? `-${endTime}` : ""}` : ""
                            newSchedules[idx].jornada_tarde = newValue
                            setSchedules(newSchedules)
                          }}
                          className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Fin</label>
                        <input
                          type="time"
                          value={schedule.jornada_tarde?.split("-")[1] || ""}
                          onChange={(e) => {
                            const newSchedules = [...schedules]
                            const startTime = newSchedules[idx].jornada_tarde?.split("-")[0] || ""
                            const newValue = startTime && e.target.value ? `${startTime}-${e.target.value}` : ""
                            newSchedules[idx].jornada_tarde = newValue
                            setSchedules(newSchedules)
                          }}
                          className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>
                    {schedule.jornada_tarde && (
                      <p className="text-xs text-muted-foreground">
                        {schedule.jornada_tarde}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex gap-3 shadow-lg">
              <div className="max-w-2xl w-full mx-auto flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors cursor-pointer"
                >
                  {loading ? "Guardando..." : "Guardar Horarios"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted text-foreground font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
