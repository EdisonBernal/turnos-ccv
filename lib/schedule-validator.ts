interface Horario {
  dia: string
  jornada_manana?: string
  jornada_tarde?: string
}

const DIAS_ESPANOL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

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
 * Validates if an employee should be shown as "en turno" (on duty)
 * Combines manual flag with actual schedule validation
 * Uses Colombia timezone (GMT-5): Bogotá, Lima, Quito
 */
export function isEmployeeOnDuty(enTurnoFlag: boolean, horarios: Horario[]): { isOnDuty: boolean; reason: string } {
  // If manually marked as out of duty, always show as out of duty
  if (!enTurnoFlag) {
    return { isOnDuty: false, reason: "Marcado manualmente como fuera de turno" }
  }

  // Get current time in Colombia timezone (GMT-5)
  const colombiaTime = getColombiaTime()

  // Get current day in Spanish
  const dayIndex = colombiaTime.getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentDay = DIAS_ESPANOL[dayIndex]  

  // Find schedule for today
  const todaySchedule = horarios.find((h) => h.dia.toLowerCase() === currentDay)

  if (!todaySchedule || (!todaySchedule.jornada_manana && !todaySchedule.jornada_tarde)) {
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
 * Get display status for employee
 */
export function getEmployeeStatus(
  enTurnoFlag: boolean,
  horarios: Horario[],
): {
  status: "en_turno" | "fuera_turno"
  statusText: string
  reason: string
} {
  const validation = isEmployeeOnDuty(enTurnoFlag, horarios)

  return {
    status: validation.isOnDuty ? "en_turno" : "fuera_turno",
    statusText: validation.isOnDuty ? "En turno" : "Fuera de turno",
    reason: validation.reason,
  }
}
