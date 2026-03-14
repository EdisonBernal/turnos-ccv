'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { getFestivos, addFestivo, deleteFestivo } from '@/app/actions/festivos-actions'

interface Festivo {
  id: string
  fecha: string
  nombre: string
  created_at: string
}

interface FestivosManagerProps {
  adminNivel: number
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function FestivosManager({ adminNivel }: FestivosManagerProps) {
  const [festivos, setFestivos] = useState<Festivo[]>([])
  const [loading, setLoading] = useState(true)
  const [newFecha, setNewFecha] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const now = new Date()

  // Cargar festivos al montar
  useEffect(() => {
    loadFestivos()
  }, [])

  const loadFestivos = async () => {
    setLoading(true)
    const result = await getFestivos()
    if (result.success) {
      setFestivos(result.festivos)
    }
    setLoading(false)
  }

  const handleAddFestivo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newFecha || !newNombre.trim()) {
      setMessage({ type: 'error', text: 'Fecha y nombre son requeridos' })
      return
    }

    setSubmitting(true)
    const result = await addFestivo(newFecha, newNombre)

    if (result.success) {
      setMessage({ type: 'success', text: 'Festivo agregado correctamente' })
      setNewFecha('')
      setNewNombre('')
      await loadFestivos()
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al agregar festivo' })
    }
    setSubmitting(false)
  }

  const handleDeleteFestivo = async (fecha: string, nombre: string) => {
    if (!confirm(`¿Eliminar el festivo "${nombre}" del ${fecha}?`)) {
      return
    }

    const result = await deleteFestivo(fecha)
    if (result.success) {
      setMessage({ type: 'success', text: 'Festivo eliminado correctamente' })
      await loadFestivos()
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al eliminar festivo' })
    }
  }

  const formatDate = (fecha: string) => {
    const date = new Date(fecha + 'T12:00:00')
    const day = date.getDate()
    const month = MESES[date.getMonth()]
    const year = date.getFullYear()
    return `${day} de ${month} de ${year}`
  }

  const isAdmin1 = adminNivel === 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestión de Festivos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin1
            ? 'Administra los días festivos que se mostrarán en rojo en el calendario'
            : 'Vista de lectura - Solo admins nivel 1 pueden modificar'}
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Formulario para agregar festivo (solo para admin nivel 1) */}
      {isAdmin1 && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-3">Agregar Nuevo Festivo</h3>
          <form onSubmit={handleAddFestivo} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Fecha</label>
                <input
                  type="date"
                  value={newFecha}
                  onChange={(e) => setNewFecha(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre del Festivo</label>
                <input
                  type="text"
                  placeholder="Ej: Navidad, Año Nuevo"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !newFecha || !newNombre.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              <Plus size={16} />
              {submitting ? 'Agregando...' : 'Agregar Festivo'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de festivos */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Festivos Registrados</h3>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando festivos...</div>
        ) : festivos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay festivos registrados
          </div>
        ) : (
          <div className="space-y-2">
            {festivos.map((festivo) => (
              <div
                key={festivo.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/50 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{festivo.nombre}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(festivo.fecha)}</p>
                </div>
                {isAdmin1 && (
                  <button
                    onClick={() => handleDeleteFestivo(festivo.fecha, festivo.nombre)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Eliminar festivo"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
