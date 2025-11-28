"use client"

import { useState, useEffect } from "react"
import { Users, UserCog } from "lucide-react"
import { AddEmployeeModal } from "./add-employee-modal"
import { EmployeeTable } from "./employee-table"
import { EditEmployeeModal } from "./edit-employee-modal"
import { AdminUsersTable } from "./admin-users-table"
import { AddAdminUserModal } from "./add-admin-user-modal"
import { EditAdminUserModal } from "./edit-admin-user-modal"
import { getAdminUsers, type AdminUser } from "@/app/actions/admin-user-actions"

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

interface AdminDashboardProps {
  personal: Personal[]
  horarios: Horario[]
  areas: string[]
  adminNivel: number
}

type TabType = "empleados" | "usuarios"

export function AdminDashboard({ personal: initialPersonal, horarios, areas, adminNivel }: AdminDashboardProps) {
  const [personal, setPersonal] = useState<Personal[]>(initialPersonal)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Personal | null>(null)

  const [activeTab, setActiveTab] = useState<TabType>("empleados")
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Cargar usuarios admin cuando se activa la pestaña
  useEffect(() => {
    if (activeTab === "usuarios" && adminNivel === 1) {
      loadAdminUsers()
    }
  }, [activeTab, adminNivel])

  const loadAdminUsers = async () => {
    setLoadingUsers(true)
    const result = await getAdminUsers()
    if (result.success && result.users) {
      setAdminUsers(result.users)
    }
    setLoadingUsers(false)
  }

  const handleAddEmployee = (newEmployee: Personal) => {
    setPersonal([...personal, newEmployee])
    setShowAddModal(false)
  }

  const handleUpdateEmployee = (updatedEmployee: Personal) => {
    setPersonal(personal.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
    setEditingEmployee(null)
  }

  const handleDeleteEmployee = (employeeId: string) => {
    setPersonal(personal.filter((emp) => emp.id !== employeeId))
  }

  const handleAddAdminUser = (newUser: AdminUser) => {
    setAdminUsers([newUser, ...adminUsers])
    setShowAddAdminModal(false)
  }

  const handleUpdateAdminUser = (updatedUser: AdminUser) => {
    setAdminUsers(adminUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setEditingAdminUser(null)
  }

  const handleDeleteAdminUser = (userId: string) => {
    setAdminUsers(adminUsers.filter((user) => user.id !== userId))
  }

  return (
    <div className="space-y-8">
      {adminNivel === 1 && (
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("empleados")}
            className={`inline-flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px cursor-pointer${
              activeTab === "empleados"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground cursor-pointer"
            }`}
          >
            <Users className="w-4 h-4" />
            Empleados
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`inline-flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "usuarios"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground cursor-pointer"
            }`}
          >
            <UserCog className="w-4 h-4" />
            Usuarios Admin
          </button>
        </div>
      )}

      {/* Contenido de empleados */}
      {activeTab === "empleados" && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Empleados</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer"
            >
              + Agregar Empleado
            </button>
          </div>

          <EmployeeTable
            employees={personal}
            horarios={horarios}
            onEdit={setEditingEmployee}
            onDelete={handleDeleteEmployee}
          />

          {showAddModal && (
            <AddEmployeeModal areas={areas} onAdd={handleAddEmployee} onClose={() => setShowAddModal(false)} />
          )}

          {editingEmployee && (
            <EditEmployeeModal
              employee={editingEmployee}
              horarios={horarios.filter((h) => h.personal_id === editingEmployee.id)}
              areas={areas}
              onUpdate={handleUpdateEmployee}
              onClose={() => setEditingEmployee(null)}
            />
          )}
        </>
      )}

      {activeTab === "usuarios" && adminNivel === 1 && (
        <>
          {loadingUsers ? (
            <div className="text-center py-12 text-muted-foreground">Cargando usuarios...</div>
          ) : (
            <AdminUsersTable
              users={adminUsers}
              onEdit={setEditingAdminUser}
              onDelete={handleDeleteAdminUser}
              onAdd={() => setShowAddAdminModal(true)}
            />
          )}

          {showAddAdminModal && (
            <AddAdminUserModal onAdd={handleAddAdminUser} onClose={() => setShowAddAdminModal(false)} />
          )}

          {editingAdminUser && (
            <EditAdminUserModal
              user={editingAdminUser}
              onUpdate={handleUpdateAdminUser}
              onClose={() => setEditingAdminUser(null)}
            />
          )}
        </>
      )}
    </div>
  )
}
