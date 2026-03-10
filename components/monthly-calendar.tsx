"use client"

import { useState } from "react"

interface MonthlySchedule {
  fecha: string
  jornada_manana?: string
  jornada_tarde?: string
}

interface MonthlyCalendarProps {
  mes: number
  año: number
  schedules: MonthlySchedule[]
  onDayClick: (fecha: string) => void
}

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function MonthlyCalendar({ mes, año, schedules, onDayClick }: MonthlyCalendarProps) {
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const monthStart = new Date(año, mes - 1, 1)
  const firstDay = monthStart.getDay()
  const daysInMonth = new Date(año, mes, 0).getDate()

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {MESES[mes - 1]} {año}
        </h3>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-background">
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
                } ${hasSchedule(day || 0) ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}`}
              >
                {day && (
                  <div className="text-sm">
                    <div className="font-semibold text-foreground mb-1">{day}</div>
                    {getScheduleForDay(day) && (
                      <div className="space-y-1 text-xs">
                        {getScheduleForDay(day)?.jornada_manana && (
                          <div 
                            title={getScheduleForDay(day)!.jornada_manana}
                            className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded truncate cursor-help"
                          >
                            {getScheduleForDay(day)!.jornada_manana}
                          </div>
                        )}
                        {getScheduleForDay(day)?.jornada_tarde && (
                          <div 
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
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 rounded"></div>
          <span>Mañana</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/40 rounded"></div>
          <span>Tarde</span>
        </div>
      </div>
    </div>
  )
}
