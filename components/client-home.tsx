"use client"
import { StaffList } from "@/components/staff-list"
import { Calendar, Users, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"
import { getEmployeeStatus } from "@/lib/schedule-validator"
import logoccv from "@/public/crear-vision-logo.webp"

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

export function ClientHome({
  personal,
  horarios,
  areas,
}: {
  personal: Personal[]
  horarios: Horario[]
  areas: string[]
}) {
  const horariosMap = useMemo(() => {
    const map = new Map<string, Horario[]>()
    horarios.forEach((h) => {
      if (!map.has(h.personal_id)) {
        map.set(h.personal_id, [])
      }
      map.get(h.personal_id)!.push(h)
    })
    return map
  }, [horarios])

  const staffInShift = useMemo(() => {
    return personal.filter((person) => {
      const personHorarios = horariosMap.get(person.id) || []
      const { status } = getEmployeeStatus(person.en_turno, personHorarios)
      return status === "en_turno"
    })
  }, [personal, horariosMap])

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/30">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0 rounded-lg bg-linear-to-br from-primary/10 to-accent/10 p-2 flex items-center justify-center border border-border/50">
                <Image
                  src={logoccv}
                  alt="Clínica Crear Visión"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Turnos</h1>
                <p className="text-sm text-muted-foreground font-medium">Clínica Crear Visión S.A.S</p>
              </div>
            </div>

            {/* Admin Button */}
            <Link href="/auth/login">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <Users className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-accent/5 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-6">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Gestión Inteligente de Turnos</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              Consulta la Disponibilidad del Personal
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              Visualiza de forma clara quién está en turno, sus horarios y áreas de servicio en tiempo real
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            <div className="bg-card border border-border/50 rounded-lg p-6 text-center hover:border-border transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{personal.length}</div>
              <p className="text-muted-foreground text-sm mt-2">Personal Total</p>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-6 text-center hover:border-border transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mx-auto mb-4">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">{areas.length}</div>
              <p className="text-muted-foreground text-sm mt-2">Áreas de Servicio</p>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-6 text-center hover:border-border transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10 mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">{staffInShift.length}</div>
              <p className="text-muted-foreground text-sm mt-2">En Turno Ahora</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <StaffList personal={personal} horarios={horarios} areas={areas} />
      </main>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Sistema de Turnos</h3>
              <p className="text-muted-foreground text-sm">Solución integral para gestión de personal y horarios</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Características</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Visualización en tiempo real</li>
                <li>• Filtrado por área y disponibilidad</li>
                <li>• Gestión de horarios</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Información</h3>
              <p className="text-muted-foreground text-sm">Clínica Crear Visión S.A.S</p>
              <p className="text-muted-foreground text-sm">Todos los derechos reservados © 2025</p>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8">
            <p className="text-center text-muted-foreground text-sm">
              © 2025 Clínica Crear Visión S.A.S – Sistema de Turnos
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
