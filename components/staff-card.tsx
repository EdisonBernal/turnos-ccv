"use client"

import { MessageCircle } from "lucide-react"
import Image from "next/image"

interface Horario {
  dia: string
  jornada_manana?: string
  jornada_tarde?: string
}

interface StaffCardProps {
  id: string
  nombre_completo: string
  area: string
  foto_url?: string
  telefono?: string
  en_turno: boolean
  statusReason?: string
  horarios: Horario[]
}

const DIAS_ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1] : ""
  return (first.charAt(0) + (last.charAt(0) || "")).toUpperCase()
}

const bgColorFromName = (name: string) => {
  const colors = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-indigo-500",
    "bg-rose-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-violet-500",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function StaffCard({
  nombre_completo,
  area,
  foto_url,
  telefono,
  en_turno,
  statusReason,
  horarios,
}: StaffCardProps) {
  const sortedHorarios = horarios.sort((a, b) => {
    return DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia)
  })

  const horariosConValores = sortedHorarios.filter((h) => h.jornada_manana || h.jornada_tarde)

  const firstName = nombre_completo.split(" ")[0]
  const firstNameCapitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()  
  const whatsappUrl = telefono
    ? `https://wa.me/57${telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(firstNameCapitalized)}`
    : null

  const initials = getInitials(nombre_completo)
  const bgColor = bgColorFromName(nombre_completo)

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow min-w-80">
      {/* Header with photo and status */}
      <div className="flex gap-4 mb-6">
        <div className="flex shrink-0">
          <div className={`relative w-20 h-20 rounded-full overflow-hidden ${foto_url ? "" : bgColor}`}>
            {foto_url ? (
              <Image src={foto_url} alt={nombre_completo} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white text-2xl font-semibold tracking-wider">
                {initials}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground text-balance">{nombre_completo}</h3>
          <p className="text-sm text-muted-foreground mb-2">{area}</p>
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                en_turno
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {en_turno ? "En turno" : "Fuera de turno"}
            </div>
          </div>
          {statusReason && <p className="text-xs text-muted-foreground mt-1">{statusReason}</p>}
        </div>
      </div>

      {/* Schedule table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Día</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Mañana</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Tarde</th>
            </tr>
          </thead>
          <tbody>
            {horariosConValores.map((h) => (
              <tr key={h.dia} className="border-b border-border/50">
                <td className="py-2 px-2 text-foreground">{h.dia}</td>
                <td className="py-2 px-2 text-muted-foreground">{h.jornada_manana || "—"}</td>
                <td className="py-2 px-2 text-muted-foreground">{h.jornada_tarde || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contact button */}
      {whatsappUrl && (
        <a
          href={en_turno ? whatsappUrl : undefined}
          target={en_turno ? "_blank" : undefined}
          rel={en_turno ? "noopener noreferrer" : undefined}
          onClick={(e) => !en_turno && e.preventDefault()}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            en_turno
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
          }`}
          aria-disabled={!en_turno}
        >
          <MessageCircle className="w-4 h-4" />
          {en_turno ? "Contactar por WhatsApp" : "No disponible - Fuera de turno"}
        </a>
      )}
    </div>
  )
}
