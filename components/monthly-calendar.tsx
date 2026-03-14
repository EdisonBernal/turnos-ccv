"use client"

import { useState, useEffect } from "react"
import { useAppTour } from "@/hooks/useAppTour"
import { monthlyScheduleTourSteps, MONTHLY_SCHEDULE_TOUR_ID } from "@/lib/monthly-schedule-tour"
import { isDateInPast, getTodayDateString } from "@/lib/schedule-validator"

interface MonthlySchedule {
  fecha: string
  jornada_manana?: string
  jornada_tarde?: string
}

interface Festivo {
  id?: string
  fecha: string
  nombre: string
}

interface MonthlyCalendarProps {
  mes: number
  año: number
  schedules: MonthlySchedule[]
  festivos?: Festivo[]
  onDayClick: (fecha: string) => void
  onTourInitialized?: (startTour: () => void, isMounted: boolean) => void
}

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function MonthlyCalendar({ mes, año, schedules, festivos = [], onDayClick, onTourInitialized }: MonthlyCalendarProps) {
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const monthStart = new Date(año, mes - 1, 1)
  const firstDay = monthStart.getDay()
  const daysInMonth = new Date(año, mes, 0).getDate()

  // Inicializar el hook del tour guiado
  const { startTour, isMounted } = useAppTour({
    steps: monthlyScheduleTourSteps,
    tourId: MONTHLY_SCHEDULE_TOUR_ID,
    onOpenDayModal: onDayClick,
  })

  // Notificar al padre cuando el tour está listo
  useEffect(() => {
    if (onTourInitialized && isMounted) {
      onTourInitialized(startTour, isMounted)
    }
  }, [isMounted, startTour, onTourInitialized])

  // Auto-trigger del tour solo una vez en la primera carga (si no ha sido completado)
  useEffect(() => {
    if (!isMounted) return

    const tourKey = `app_tour_${MONTHLY_SCHEDULE_TOUR_ID}_completed`
    const tourCompleted = localStorage.getItem(tourKey)

    // Mostrar el tour automáticamente solo si no ha sido completado antes
    if (!tourCompleted) {
      // Pequeño delay para asegurar que el DOM está listo
      const timer = setTimeout(() => {
        startTour()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isMounted, startTour])

  // Create array of days
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  // Group weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const getScheduleForDay = (day: number): MonthlySchedule | undefined => {
    const fecha = new Date(año, mes - 1, day).toISOString().split("T")[0]
    return schedules.find((s) => s.fecha === fecha)
  }

  const hasSchedule = (day: number): boolean => {
    const schedule = getScheduleForDay(day)
    return !!(schedule && (schedule.jornada_manana || schedule.jornada_tarde))
  }

  const isDayPast = (day: number): boolean => {
    const fecha = `${año}-${String(mes).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return isDateInPast(fecha)
  }

  const getFestivoForDay = (day: number): Festivo | undefined => {
    const fecha = `${año}-${String(mes).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return festivos.find((f) => f.fecha === fecha)
  }

  const isFestivo = (day: number): boolean => {
    return !!getFestivoForDay(day)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {MESES[mes - 1]} {año}
        </h3>
      </div>

      {/* Calendar grid */}
      <div id="tour-calendar-grid" className="border border-border rounded-lg overflow-hidden bg-background">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0 bg-muted">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0">
              {dia}
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-0">
            {week.map((day, dayIdx) => (
              <div
                key={`${weekIdx}-${dayIdx}`}
                onClick={() => day && onDayClick(new Date(año, mes - 1, day).toISOString().split("T")[0])}
                className={`min-h-24 p-2 border-r border-b border-border last:border-r-0 ${
                  day ? "cursor-pointer hover:bg-muted/50 transition-colors" : "bg-muted/20"
                } ${hasSchedule(day || 0) ? "bg-emerald-50 dark:bg-emerald-950/30" : ""} ${day && isDayPast(day) ? "opacity-50" : ""}`}
              >
                {day && (
                  <div id="tour-day-with-schedule" data-fecha={new Date(año, mes - 1, day).toISOString().split("T")[0]} className="text-sm">
                    <div 
                      className={`font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isFestivo(day) 
                          ? "bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300" 
                          : "text-foreground"
                      }`}
                      title={isFestivo(day) ? getFestivoForDay(day)?.nombre : undefined}
                    >
                      {day}
                    </div>
                    {getScheduleForDay(day) && (
                      <div className="space-y-1 text-xs">
                        {getScheduleForDay(day)?.jornada_manana && (
                          <div 
                            id="tour-schedule-morning"
                            title={getScheduleForDay(day)!.jornada_manana}
                            className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded truncate cursor-help"
                          >
                            {getScheduleForDay(day)!.jornada_manana}
                          </div>
                        )}
                        {getScheduleForDay(day)?.jornada_tarde && (
                          <div 
                            id="tour-schedule-afternoon"
                            title={getScheduleForDay(day)!.jornada_tarde}
                            className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 px-2 py-1 rounded truncate cursor-help"
                          >
                            {getScheduleForDay(day)!.jornada_tarde}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div id="tour-calendar-legend" className="flex gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 rounded"></div>
          <span>Mañana</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/40 rounded"></div>
          <span>Tarde</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 dark:bg-red-900/40 rounded"></div>
          <span>Día Festivo</span>
        </div>
      </div>
    </div>
  )
}
