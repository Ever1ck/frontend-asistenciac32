import Link from "next/link"
import { ChevronRight, DollarSign, BarChart2, Calendar, Mail, FileText, FileSpreadsheet, Users, Settings, Activity, User, School, GraduationCap, BookOpen, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { Role, UserProfile, MenuItem, RoleMenuItem } from "@/types"

const roleMenuItems: Record<Role, RoleMenuItem> = {
  Usuario: {
    label: "Usuario",
    items: [
      { name: "Dashboard", icon: <BarChart2 className="h-4 w-4" />, path: "/portal/dashboard" },
      { name: "Perfil", icon: <User className="h-4 w-4" />, path: "/portal/profile" },
    ],
  },
  Docente: {
    label: "Docente",
    items: [
      { name: "Inicio", icon: <DollarSign className="h-4 w-4" />, path: "/portal-docente" },
      { name: "Reportes", icon: <BarChart2 className="h-4 w-4" />, path: "/portal-docente/reportes" },
    ],
  },
  Auxiliar: {
    label: "Auxiliar",
    items: [
      { name: "Actividades", icon: <Activity className="h-4 w-4" />, path: "/portal/actividades" },
    ],
  },
  Secretaria: {
    label: "Secretaria",
    items: [
      { name: "Calendario", icon: <Calendar className="h-4 w-4" />, path: "/portal/calendario" },
      { name: "Correos", icon: <Mail className="h-4 w-4" />, path: "/portal/correos" },
    ],
  },
  Innovacion: {
    label: "Innovacion",
    items: [
      { name: "Proyectos", icon: <FileText className="h-4 w-4" />, path: "/portal/proyectos" },
    ],
  },
  Subdirector: {
    label: "Subdirector",
    items: [
      { name: "Informes", icon: <FileSpreadsheet className="h-4 w-4" />, path: "/portal/informes" },
    ],
  },
  Administrador: {
    label: "Administrador",
    items: [
      { name: "Usuarios", icon: <Users className="h-4 w-4" />, path: "/portal-administrador/usuarios" },
      { name: "Docentes", icon: <GraduationCap className="h-4 w-4" />, path: "/portal-administrador/docentes" },
      { name: "Aulas", icon: <School className="h-4 w-4" />, path: "/portal-administrador/aulas" },
      { name: "Cursos", icon: <BookOpen className="h-4 w-4" />, path: "/portal-administrador/cursos" },
      { name: "Grados Académicos", icon: <FileText className="h-4 w-4" />, path: "/portal-administrador/grados-academicos" },
      { name: "Módulos", icon: <Layers className="h-4 w-4" />, path: "/portal-administrador/modulos" },
      { name: "Configuración", icon: <Settings className="h-4 w-4" />, path: "/portal-administrador/configuracion" },
    ],
  },
  Director: {
    label: "Director",
    items: [
      { name: "Reuniones", icon: <Calendar className="h-4 w-4" />, path: "/portal/reuniones" },
    ],
  },
}

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  userProfile: UserProfile | null;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, userProfile }: SidebarProps) {
  const userRole = userProfile?.rol || "Usuario"

  const renderMenuItem = (item: MenuItem) => (
    <Link
      key={item.path}
      href={item.path}
      className="flex items-center rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {item.icon}
      <span className="ml-2">{item.name}</span>
    </Link>
  )

  const renderMenuGroup = (role: Role, menuItem: RoleMenuItem) => (
    <Collapsible key={role} className="mb-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-accent">
        <span className="font-medium">{menuItem.label}</span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-4">
        {menuItem.items.map(renderMenuItem)}
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <aside
      className={`fixed top-16 z-40 h-[calc(100vh-4rem)] transform overflow-y-auto bg-background transition-all duration-300 ease-in-out lg:sticky 
        ${isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"}`}
    >
      <nav className={`px-4 py-6 ${isSidebarOpen ? "" : "px-2"}`}>
        {isSidebarOpen ? (
          userRole === "Administrador"
            ? Object.entries(roleMenuItems).map(([role, menuItem]) =>
              renderMenuGroup(role as Role, menuItem)
            )
            : renderMenuGroup(userRole, roleMenuItems[userRole])
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {roleMenuItems[userRole].items.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                asChild
              >
                <Link href={item.path} title={item.name}>
                  {item.icon}
                  <span className="sr-only">{item.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}