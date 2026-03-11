/**
 * Configuración del tour guiado para el calendario mensual de horarios
 *
 * Define los pasos que se mostrarán al usuario cuando visite el
 * componente de horarios mensuales por primera vez.
 */

interface PopoverConfig {
  title?: string
  description?: string
  align?: 'start' | 'center' | 'end'
}

interface TourStep {
  element: string
  popover: PopoverConfig
}

/**
 * Pasos del tour para la funcionalidad de horarios mensuales
 *
 * Version: 1.0 - Primera versión del tour con cobertura completa de funcionalidades
 *
 * Los selectores usan IDs para mejor compatibilidad con driver.js
 */
export const monthlyScheduleTourSteps: TourStep[] = [
  {
    element: '#tour-horarios-mensual',
    popover: {
      title: '✨ Bienvenido a la Configuración de Horarios Mensuales',
      description:
        'Este tour te guiará a través de todas las funcionalidades para configurar y gestionar los horarios mensuales de los empleados. ¡Haz clic en "Siguiente" para continuar!',
      align: 'center',
    },
  },
  {
    element: '#tour-month-year-selector',
    popover: {
      title: '📅 Selecciona Mes y Año',
      description:
        'Primero, elige el mes y año que deseas configurar. Los selectores están aquí. Esto determinará qué período vas a editar.',
      align: 'start',
    },
  },
  {
    element: '#tour-week-config',
    popover: {
      title: '📊 Panel de Semanas',
      description:
        'Aquí se muestran todas las semanas del mes seleccionado. Cada semana tiene opciones para configurar horarios de forma masiva o copiar configuraciones de otras semanas.',
      align: 'start',
    },
  },
  {
    element: '#tour-week-config-1',
    popover: {
      title: '⚙️ Configurar Semana Completa',
      description:
        'Aquí está la primera semana del mes. En esta sección puedes configurar los horarios de forma masiva para todos los días de la semana. Puedes aplicar mañana, tarde, o ambas jornadas a todos los días a la vez.',
      align: 'start',
    },
  },
  {
    element: '#tour-week-morning-1',
    popover: {
      title: '🕐 Jornada de Mañana - Inputs',
      description:
        'Ingresa la hora de inicio y fin para la jornana de mañana. Por ejemplo: 08:00 a 12:00. Luego presiona el botón "Aplicar mañana" para asignar este horario a todos los días de la semana.',
      align: 'start',
    },
  },
  {
    element: '#tour-week-afternoon-1',
    popover: {
      title: '🌙 Jornada de Tarde - Inputs',
      description:
        'Ingresa la hora de inicio y fin para la jornada de tarde. Por ejemplo: 14:00 a 18:00. Luego presiona el botón "Aplicar tarde" para asignar este horario a todos los días de la semana.',
      align: 'start',
    },
  },
  {
    element: '#tour-week-apply-both-1',
    popover: {
      title: '📌 Botón: Aplicar Mañana y Tarde',
      description:
        'También puedes aplicar AMBAS jornadas (mañana y tarde) a todos los días de esta semana en un solo paso. Útil si el empleado trabaja jornada completa.',
      align: 'start',
    },
  },
  {
    element: '#tour-week-copy-2',
    popover: {
      title: '📋 Copiar Horarios de Otra Semana',
      description:
        'Si ya has configurado una semana (como la semana 1), aquí puedes copiar esa configuración a otras semanas. Solo haz clic en el botón de la semana que quieres copiar y se aplicará a esta semana.',
      align: 'start',
    },
  },
  {
    element: '#tour-calendar-view',
    popover: {
      title: '📆 Vista del Calendario Mensual',
      description:
        'Esta es la vista del mes. Aquí puedes ver todos los horarios asignados de un vistazo. Haz clic en cualquier día para editarlo individualmente.',
      align: 'start',
    },
  },
  {
    element: '#tour-calendar-grid',
    popover: {
      title: '📅 Estructura del Calendario',
      description:
        'El calendario muestra los 7 días de la semana en columnas y las semanas del mes en filas. Cada celda representa un día.',
      align: 'start',
    },
  },
  {
    element: '#tour-schedule-morning',
    popover: {
      title: '🔵 Jornada de Mañana (Azul)',
      description:
        'Los badges AZULES indican horarios de mañana. Por ejemplo: "08:00-12:00" significa que el empleado trabaja de 8 de la mañana a 12 del mediodía.',
      align: 'start',
    },
  },
  {
    element: '#tour-schedule-afternoon',
    popover: {
      title: '🟠 Jornada de Tarde (Naranja)',
      description:
        'Los badges NARANJAS indican horarios de tarde. Por ejemplo: "14:00-18:00" significa que el empleado trabaja de 2 de la tarde a 6 de la tarde.',
      align: 'start',
    },
  },
  {
    element: '#tour-day-with-schedule',
    popover: {
      title: '🟢 Día con Horarios',
      description:
        'Los días resaltados en verde indican que ya tienen horarios asignados (ya sea mañana, tarde o ambos). Los días sin resalte no tienen horarios configurados.',
      align: 'start',
    },
  },
  {
    element: '#tour-edit-day-section',
    popover: {
      title: '✏️ Editar un Día Específico',
      description:
        'Cuando haces clic en un día del calendario, aparece esta sección. Aquí puedes editar exactamente el horario de mañana y/o tarde para ese día en particular.',
      align: 'start',
    },
  },
  {
    element: 'body',
    popover: {
      title: '✅ ¡Tour Completado!',
      description:
        'Ahora ya conoces todas las funcionalidades de configuración de horarios mensuales. Puedes editar de forma masiva o individual, copiar configuraciones previas y visualizar todo el mes de un vistazo. ¡Haz clic en "Ver tour" en cualquier momento si necesitas refrescar tu memoria!',
      align: 'center',
    },
  },
]

/**
 * ID único del tour con versionado
 *
 * Incrementa el número de versión cuando:
 * - Agregas nuevos pasos
 * - Cambias la funcionalidad
 * - Necesitas mostrar el tour de nuevo a todos los usuarios
 *
 * Patrón: {nombre_tour}_v{numero_version}
 * Ejemplo: monthly_schedule_v1, monthly_schedule_v2
 *
 * v3: Soporte para apertura automática de modal de edición de días
 * v4: Índice corregido (paso 16 para "Editar un Día Específico")
 */
export const MONTHLY_SCHEDULE_TOUR_ID = 'monthly_schedule_v1'

