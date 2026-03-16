interface Horario {
  dia: string
  jornada_manana?: string
  jornada_tarde?: string
}

interface HorarioMensual {
  fecha: string // YYYY-MM-DD
  jornada_manana?: string
  jornada_tarde?: string
}

const DIAS_ESPANOL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

/**
 * Format a Date object to YYYY-MM-DD using local date components
 * (avoids toISOString() which converts to UTC and can shift the date)
 */
function formatDateLocal(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

/**
 * Convert current time to Colombia timezone (GMT-5)
 * Used for Bogotá, Lima, Quito
 * Fixed timezone calculation using direct UTC offset method
 */
function getColombiaTime(): Date {
  // Get current UTC time
  const now = new Date()
  // Colombia uses GMT-5 year-round (no DST)
  // Create new date with UTC time adjusted to GMT-5
  const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }))
  return colombiaDate
}

/**
 * Format time as HH:mm from a Date object
 */
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Get today's schedule from monthly or weekly schedules
 * Prioritizes monthly schedules over weekly schedules
 */
function getTodaySchedule(horariosMensual: HorarioMensual[], horariosSemanales: Horario[], fecha: Date): { jornada_manana?: string; jornada_tarde?: string } | null {
  // First, check monthly schedules
  const fechaISO = formatDateLocal(fecha)
  const monthlySchedule = horariosMensual.find((h) => h.fecha === fechaISO)
  
  if (monthlySchedule && (monthlySchedule.jornada_manana || monthlySchedule.jornada_tarde)) {
    return monthlySchedule
  }

  // Fallback to weekly schedules
  const dayIndex = fecha.getDay()
  const dayName = DIAS_ESPANOL[dayIndex]
  const weeklySchedule = horariosSemanales.find((h) => h.dia.toLowerCase() === dayName)
  
  if (weeklySchedule && (weeklySchedule.jornada_manana || weeklySchedule.jornada_tarde)) {
    return weeklySchedule
  }

  return null
}

/**
 * Validates if an employee should be shown as "en turno" (on duty)
 * Combines manual flag with actual schedule validation
 * Uses Colombia timezone (GMT-5): Bogotá, Lima, Quito
 * @param enTurnoFlag - Manual flag
 * @param horarios - Weekly schedules (fallback)
 * @param horariosMensual - Monthly schedules (priority) - optional
 */
export function isEmployeeOnDuty(
  enTurnoFlag: boolean,
  horarios: Horario[],
  horariosMensual: HorarioMensual[] = [],
): { isOnDuty: boolean; reason: string } {
  // If manually marked as out of duty, always show as out of duty
  if (!enTurnoFlag) {
    return { isOnDuty: false, reason: "Marcado manualmente como fuera de turno" }
  }

  // Get current time in Colombia timezone (GMT-5)
  const colombiaTime = getColombiaTime()

  // Get today's schedule (prioritizes monthly over weekly)
  const todaySchedule = getTodaySchedule(horariosMensual, horarios, colombiaTime)

  if (!todaySchedule) {
    return { isOnDuty: false, reason: "Sin horario configurado para hoy" }
  }

  const currentTime = formatTime(colombiaTime)

  // Check morning shift
  if (todaySchedule.jornada_manana) {
    const [startMorning, endMorning] = todaySchedule.jornada_manana.split("-")
    if (isTimeInRange(currentTime, startMorning, endMorning)) {
      return { isOnDuty: true, reason: `En turno: ${todaySchedule.jornada_manana}` }
    }
  }

  // Check afternoon shift
  if (todaySchedule.jornada_tarde) {
    const [startAfternoon, endAfternoon] = todaySchedule.jornada_tarde.split("-")
    if (isTimeInRange(currentTime, startAfternoon, endAfternoon)) {
      return { isOnDuty: true, reason: `En turno: ${todaySchedule.jornada_tarde}` }
    }
  }

  return { isOnDuty: false, reason: "Fuera del horario configurado" }
}

/**
 * Helper function to check if current time is within a time range
 * Handles ranges that don't cross midnight (e.g., "08:00-12:00")
 * Added null/undefined checks and trim() to handle edge cases
 */
function isTimeInRange(currentTime: string, startTime: string | undefined, endTime: string | undefined): boolean {
  // Guard against undefined or empty values
  if (!currentTime || !startTime || !endTime) {
    return false
  }

  // Trim whitespace and remove colons for comparison
  const current = currentTime.trim().replace(":", "")
  const start = startTime.trim().replace(":", "")
  const end = endTime.trim().replace(":", "")

  // Validate that we have valid time formats (HHmm)
  if (!current || !start || !end || current.length < 4 || start.length < 4 || end.length < 4) {
    return false
  }

  return current >= start && current <= end
}

/**
 * Get schedule for a specific date, with fallback to weekly schedule
 * First checks horarios_mensual for specific date, then falls back to horarios by weekday
 */
export function getScheduleForDate(
  fecha: Date,
  horariosMensual: HorarioMensual[],
  horariosSemanales: Horario[],
): { jornada_manana?: string; jornada_tarde?: string; isSpecific: boolean } {
  // Format fecha to YYYY-MM-DD
  const fechaISO = formatDateLocal(fecha)

  // Check if there's a specific schedule for this date
  const specificSchedule = horariosMensual.find((h) => h.fecha === fechaISO)
  if (specificSchedule) {
    return {
      jornada_manana: specificSchedule.jornada_manana,
      jornada_tarde: specificSchedule.jornada_tarde,
      isSpecific: true,
    }
  }

  // Fallback to weekly schedule
  const dayIndex = fecha.getDay() // 0 = Sunday, 1 = Monday, etc.
  const dayName = DIAS_ESPANOL[dayIndex]
  const weeklySchedule = horariosSemanales.find((h) => h.dia.toLowerCase() === dayName)

  if (weeklySchedule) {
    return {
      jornada_manana: weeklySchedule.jornada_manana,
      jornada_tarde: weeklySchedule.jornada_tarde,
      isSpecific: false,
    }
  }

  return { isSpecific: false }
}

/**
 * Check if a date string (YYYY-MM-DD) is in the past relative to today in Colombia timezone (GMT-5)
 * Returns true if the date is strictly before today
 */
export function isDateInPast(fecha: string): boolean {
  const colombia = getColombiaTime()
  const todayStr = formatDateLocal(colombia)
  return fecha < todayStr
}

/**
 * Check if an entire week (by week number in a month) is fully in the past
 * Returns true only if ALL days (Mon-Sat) of that week are before today
 */
export function isWeekFullyPast(mes: number, año: number, numeroSemana: number): boolean {
  const monthStart = new Date(año, mes - 1, 1)
  const firstDayOfMonth = monthStart.getDay()
  const weekStartDate = 1 + (numeroSemana - 1) * 7 - firstDayOfMonth
  const weekEndDate = weekStartDate + 6
  const lastDayOfMonth = new Date(año, mes, 0).getDate()

  const validEndDay = Math.min(lastDayOfMonth, weekEndDate)

  // Check the last valid day in the week — if it's past, the whole week is past
  const lastDate = new Date(año, mes - 1, validEndDay)
  const lastDateStr = formatDateLocal(lastDate)
  return isDateInPast(lastDateStr)
}

/**
 * Get today's date string in Colombia timezone (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const colombia = getColombiaTime()
  return formatDateLocal(colombia)
}

/**
 * Get display status for employee
 * @param enTurnoFlag - Manual flag
 * @param horarios - Weekly schedules (fallback)
 * @param horariosMensual - Monthly schedules (priority) - optional
 */
export function getEmployeeStatus(
  enTurnoFlag: boolean,
  horarios: Horario[],
  horariosMensual: HorarioMensual[] = [],
): {
  status: "en_turno" | "fuera_turno"
  statusText: string
  reason: string
} {
  const validation = isEmployeeOnDuty(enTurnoFlag, horarios, horariosMensual)

  return {
    status: validation.isOnDuty ? "en_turno" : "fuera_turno",
    statusText: validation.isOnDuty ? "En turno" : "Fuera de turno",
    reason: validation.reason,
  }
}
