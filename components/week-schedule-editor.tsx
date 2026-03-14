"use client"

import { useState } from "react"
import { isWeekFullyPast } from "@/lib/schedule-validator"

interface WeekScheduleEditorProps {
  numeroSemana: number
  mes: number
  año: number
  jornada_manana?: string
  jornada_tarde?: string
  onApply: (data: { jornada_manana: string | null; jornada_tarde: string | null }, onlyField?: "manana" | "tarde" | "both") => Promise<void>
  onCopyFromWeek: (sourceWeek: number) => Promise<void>
  isLoading: boolean
  hasContent: boolean
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function WeekScheduleEditor({
  numeroSemana,
  mes,
  año,
  jornada_manana = "",
  jornada_tarde = "",
  onApply,
  onCopyFromWeek,
  isLoading,
  hasContent,
}: WeekScheduleEditorProps) {
  const [morningStart, setMorningStart] = useState(jornada_manana?.split("-")[0] || "")
  const [morningEnd, setMorningEnd] = useState(jornada_manana?.split("-")[1] || "")
  const [afternoonStart, setAfternoonStart] = useState(jornada_tarde?.split("-")[0] || "")
  const [afternoonEnd, setAfternoonEnd] = useState(jornada_tarde?.split("-")[1] || "")
  const [copyFromWeek, setCopyFromWeek] = useState<number | "">("")

  const handleApplyMorning = async () => {
    const jornada = morningStart && morningEnd ? `${morningStart}-${morningEnd}` : null
    await onApply({
      jornada_manana: jornada,
      jornada_tarde: null,
    }, "manana")
  }

  const handleApplyAfternoon = async () => {
    const jornada = afternoonStart && afternoonEnd ? `${afternoonStart}-${afternoonEnd}` : null
    await onApply({
      jornada_manana: null,
      jornada_tarde: jornada,
    }, "tarde")
  }

  const handleApplyBoth = async () => {
    const morning = morningStart && morningEnd ? `${morningStart}-${morningEnd}` : null
    const afternoon = afternoonStart && afternoonEnd ? `${afternoonStart}-${afternoonEnd}` : null
    await onApply({
      jornada_manana: morning,
      jornada_tarde: afternoon,
    }, "both")
  }

  const handleCopy = async (sourceWeek: number) => {
    await onCopyFromWeek(sourceWeek)
  }

  // Calculate week dates
  const monthStart = new Date(año, mes - 1, 1)
  const firstDay = monthStart.getDay()
  const weekStartDate = 1 + (numeroSemana - 1) * 7 - firstDay
  const weekEndDate = weekStartDate + 6
  const lastDayOfMonth = new Date(año, mes, 0).getDate()
  
  const validStartDay = Math.max(1, weekStartDate)
  const validEndDay = Math.min(lastDayOfMonth, weekEndDate)

  const weekIsPast = isWeekFullyPast(mes, año, numeroSemana)
  const effectiveDisabled = isLoading || weekIsPast

  return (
    <div id={`tour-week-config-${numeroSemana}`} className={`border border-border rounded-lg p-4 bg-background/50 space-y-4 ${weekIsPast ? "opacity-60" : ""}`}>
      {weekIsPast && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded border border-amber-200 dark:border-amber-800">
          Esta semana ya pasó y no se puede modificar
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-foreground text-base mb-1">Semana {numeroSemana}</h3>
          <p className="text-xs text-muted-foreground">
            {validStartDay} - {validEndDay} de {MESES[mes - 1]} (Lunes - Sábado)
          </p>
        </div>
      </div>

      {/* Copy from other weeks */}
      {numeroSemana > 1 && (
        <div id={`tour-week-copy-${numeroSemana}`} className="space-y-2 p-3 bg-secondary/20 rounded border border-secondary/30">
          <label className="block text-xs font-medium text-foreground">Copiar configuración de otra semana (Lunes - Sábado)</label>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: numeroSemana - 1 }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => handleCopy(week)}
                disabled={effectiveDisabled}
                className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "..." : `Copiar de semana ${week}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Morning shift */}
      <div id={`tour-week-morning-${numeroSemana}`} className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Jornada Mañana</label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
            <input
              id={`tour-week-morning-start-${numeroSemana}`}
              type="time"
              value={morningStart}
              onChange={(e) => setMorningStart(e.target.value)}
              disabled={effectiveDisabled}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Fin</label>
            <input
              id={`tour-week-morning-end-${numeroSemana}`}
              type="time"
              value={morningEnd}
              onChange={(e) => setMorningEnd(e.target.value)}
              disabled={effectiveDisabled}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm disabled:opacity-50"
            />
          </div>
        </div>
        <button
          id={`tour-week-apply-morning-${numeroSemana}`}
          type="button"
          onClick={handleApplyMorning}
          disabled={effectiveDisabled || !morningStart || !morningEnd}
          className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
        >
          Aplicar mañana a semana {numeroSemana}
        </button>
      </div>

      {/* Afternoon shift */}
      <div id={`tour-week-afternoon-${numeroSemana}`} className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Jornada Tarde</label>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Inicio</label>
            <input
              id={`tour-week-afternoon-start-${numeroSemana}`}
              type="time"
              value={afternoonStart}
              onChange={(e) => setAfternoonStart(e.target.value)}
              disabled={effectiveDisabled}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Fin</label>
            <input
              id={`tour-week-afternoon-end-${numeroSemana}`}
              type="time"
              value={afternoonEnd}
              onChange={(e) => setAfternoonEnd(e.target.value)}
              disabled={effectiveDisabled}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm disabled:opacity-50"
            />
          </div>
        </div>
        <button
          id={`tour-week-apply-afternoon-${numeroSemana}`}
          type="button"
          onClick={handleApplyAfternoon}
          disabled={effectiveDisabled || !afternoonStart || !afternoonEnd}
          className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
        >
          Aplicar tarde a semana {numeroSemana}
        </button>
      </div>

      {/* Apply both */}
      <button
        id={`tour-week-apply-both-${numeroSemana}`}
        type="button"
        onClick={handleApplyBoth}
        disabled={effectiveDisabled || (!morningStart || !morningEnd) && (!afternoonStart || !afternoonEnd)}
        className="w-full px-3 py-2 text-sm bg-primary/90 text-primary-foreground rounded hover:bg-primary disabled:opacity-50 cursor-pointer font-medium"
      >
        {isLoading ? "Aplicando..." : `Aplicar ambos a semana ${numeroSemana}`}
      </button>
    </div>
  )
}
