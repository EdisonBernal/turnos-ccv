'use client'

import { useEffect, useState, useCallback } from 'react'

/**
 * Tipos para la configuración del tour
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

interface UseAppTourProps {
  /** Pasos del tour */
  steps: TourStep[]
  /** ID único del tour (ej: "monthly_schedule_v1") */
  tourId: string
  /** Forzar ejecución incluso si ya fue completado (para botón manual) */
  force?: boolean
  /** Función para abrir la modal de edición de día (callback) */
  onOpenDayModal?: (fecha: string) => void
}

interface UseAppTourReturn {
  /** Función para iniciar el tour manualmente */
  startTour: () => void
  /** Boolean indicando si el cliente está montado (para evitar SSR issues) */
  isMounted: boolean
}

/**
 * Hook reutilizable para gestionar tours guiados con driver.js
 *
 * Características:
 * - SSR seguro (solo ejecuta en cliente)
 * - Gestión de localStorage para mostrar tour una sola vez
 * - Soporte para versionado de tours
 * - Auto-importa estilos de driver.js
 * - Compatible con Tailwind CSS
 * - Permite lanzar tours manualmente
 *
 * @param props - Configuración del tour
 * @returns Objeto con función startTour e isMounted
 *
 * @example
 * const steps = [
 *   {
 *     element: "#btnCrear",
 *     popover: {
 *       title: "Crear registro",
 *       description: "Aquí puedes crear un nuevo registro"
 *     }
 *   }
 * ]
 *
 * const { startTour } = useAppTour({ steps, tourId: "dashboard_v1" })
 *
 * // En JSX
 * <button onClick={startTour}>Ver tour</button>
 */
export function useAppTour({ steps, tourId, onOpenDayModal }: UseAppTourProps): UseAppTourReturn {
  const [isMounted, setIsMounted] = useState(false)
  const [driverInstance, setDriverInstance] = useState<any>(null)

  /**
   * Inicializa el driver.js y carga los estilos
   * Se ejecuta solo una vez en el cliente
   */
  useEffect(() => {
    // Guard de SSR: solo ejecutar en cliente
    if (typeof window === 'undefined') return

    // Marcar que el componente está montado
    setIsMounted(true)

    // Función para importar dinámicamente driver.js y sus estilos
    const initializeDriver = async () => {
      try {
        // Importar driver.js dinámicamente
        const { driver } = await import('driver.js')

        // Crear instancia de Driver con configuración base
        const driverInstance = driver({
          showProgress: true,
          showButtons: ['next', 'previous', 'close'],
          allowClose: true,
          overlayOpacity: 0.5,
          stagePadding: 10,
        })

        setDriverInstance(driverInstance)
      } catch (error) {
        console.error('Error al inicializar driver.js:', error)
      }
    }

    initializeDriver()
  }, [])

  /**
   * Inicia el tour manualmente
   * Al finalizar, guarda el tourId en localStorage
   */
  const startTour = useCallback(() => {
    // Guard de SSR
    if (typeof window === 'undefined' || !driverInstance) {
      return
    }

    // Crear key de localStorage para este tour
    const tourKey = `app_tour_${tourId}_completed`

    try {
      // Crear estructura de definición del tour
      const tourDefinition = steps.map((step, index) => {
        return {
          element: step.element,
          popover: {
            title: step.popover.title || '',
            description: step.popover.description || '',
            align: step.popover.align || 'start',
          },
        }
      })

      // Definir comportamiento al iniciar cada highlight (paso)
      driverInstance.setConfig({
        steps: tourDefinition,
        popoverOffset: 10,
        onHighlightStarted: (element: HTMLElement | null, step: any, config: any) => {
          // Obtener el índice actual del tour
          const currentStepIndex = config?.state?.activeIndex ?? -1
          
          if (currentStepIndex === 12 && onOpenDayModal) {
            /// Obtener la fecha actual en formato YYYY-MM-DD
            const today = new Date()
            const currentDate = today.toISOString().split('T')[0]
            
            const todayElement = document.querySelector(`[data-fecha="${currentDate}"]`)

            if (todayElement) {
              onOpenDayModal(currentDate)
              return
            }
          }
        },
        onDestroyed: () => {
          // Guardar en localStorage que el tour fue completado
          localStorage.setItem(tourKey, JSON.stringify({ completedAt: new Date().toISOString() }))
        },
      })

      // Iniciar el tour desde el principio (drive(0))
      driverInstance.drive(0)
    } catch (error) {
      console.error('Error al iniciar el tour:', error)
    }
  }, [driverInstance, steps, tourId, onOpenDayModal])

  return {
    startTour,
    isMounted,
  }
}
