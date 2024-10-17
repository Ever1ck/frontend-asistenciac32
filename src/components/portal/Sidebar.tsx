import Link from "next/link"
import { ChevronRight, DollarSign, BarChart2, Calendar, Mail, FileText, FileSpreadsheet, Users, Settings, Activity, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type Role = "Usuario" | "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector" | "Director" | "Administrador"

const roleMenuItems: Record<Role, { name: string; icon: React.ReactNode }[]> = {
  Usuario: [
    { name: "Dashboard", icon: <BarChart2 className="h-4 w-4" /> },
    { name: "Perfil", icon: <User className="h-4 w-4" /> },
  ],
  Docente: [
    { name: "Pagos", icon: <DollarSign className="h-4 w-4" /> },
    { name: "Reportes", icon: <BarChart2 className="h-4 w-4" /> },
  ],
  Auxiliar: [
    { name: "Estadísticas", icon: <BarChart2 className="h-4 w-4" /> },
    { name: "Informes", icon: <FileText className="h-4 w-4" /> },
  ],
  Secretaria: [
    { name: "Agenda", icon: <Calendar className="h-4 w-4" /> },
    { name: "Correspondencia", icon: <Mail className="h-4 w-4" /> },
  ],
  Innovacion: [
    { name: "Trámites", icon: <FileText className="h-4 w-4" /> },
    { name: "Documentos", icon: <FileSpreadsheet className="h-4 w-4" /> },
  ],
  Subdirector: [
    { name: "Administrar Actas", icon: <FileText className="h-4 w-4" /> },
    { name: "Generar PDF", icon: <FileSpreadsheet className="h-4 w-4" /> },
    { name: "Actas Generadas", icon: <FileSpreadsheet className="h-4 w-4" /> },
  ],
  Director: [
    { name: "Usuarios", icon: <Users className="h-4 w-4" /> },
    { name: "Configuración", icon: <Settings className="h-4 w-4" /> },
    { name: "Logs", icon: <Activity className="h-4 w-4" /> },
  ],
  Administrador: [
    { name: "Usuarios", icon: <Users className="h-4 w-4" /> },
    { name: "Configuración", icon: <Settings className="h-4 w-4" /> },
    { name: "Logs", icon: <Activity className="h-4 w-4" /> },
  ],
}

interface Persona {
  id: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  email: string;
  rol: string;
  persona: Persona;
}

type SidebarProps = {
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  userProfile: UserProfile | null
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, userProfile }: SidebarProps) {
  const userRole = (userProfile?.rol as Role) || "Usuario"

  const renderMenuItems = (role: Role) => {
    return (
      <Collapsible key={role} className="mb-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
          <span className="font-medium">{role}</span>
          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1">
          {roleMenuItems[role].map((item) => (
            <Link
              key={item.name}
              href={`/${role.toLowerCase()}/${item.name.toLowerCase().replace(" ", "-")}`}
              className="flex items-center p-2 text-sm text-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const renderAdminMenu = () => {
    return Object.keys(roleMenuItems).map((role) => renderMenuItems(role as Role))
  }

  return (
    <aside
      className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 transform transition-all duration-300 ease-in-out overflow-y-auto lg:sticky 
        ${isSidebarOpen ? "w-64 translate-x-0" : "w-20 translate-x-0"}`}>
          
      <nav className={`px-4 py-6 ${isSidebarOpen ? "" : "px-2"}`}>
        {isSidebarOpen ? (
          userRole === "Administrador" ? renderAdminMenu() : renderMenuItems(userRole)
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {Object.keys(roleMenuItems).map((role) => (
              <Button
                key={role}
                variant="ghost"
                size="icon"
                className="w-10 h-10"
                onClick={() => setIsSidebarOpen(true)}
                title={role}
              >
                <span className="sr-only">{role}</span>
                {roleMenuItems[role as Role][0].icon}
              </Button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}