"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut, User, Book, Home, Briefcase, PenTool, Building2, Building, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"

const logo = "/logoc32.png"

type Role = "Usuario"| "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector" | "Director" | "Administrador"

type Module = "Usuario" | "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector"| "Director" | "Administrador"

type UserProfile = {
  id: number;
  email: string;
  rol: Role;
  avatar: string | null;
  persona: {
    id: number;
    dni: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    telefono: string;
    direccion: string;
    fecha_nacimiento: string;
    sexo: string;
  };
}

const roleModules: Record<Role, Module[]> = {
  Usuario: ["Usuario"],
  Docente: ["Docente"],
  Auxiliar: ["Auxiliar"],
  Secretaria: ["Secretaria"],
  Innovacion: ["Innovacion"],
  Subdirector: ["Subdirector"],
  Director: ["Director"],
  Administrador: ["Usuario", "Docente", "Auxiliar", "Secretaria", "Innovacion", "Subdirector", "Director", "Administrador"]
}

const moduleIcons: Record<Module, React.ReactNode> = {
  Usuario: <User />,
  Docente: <Book />,
  Auxiliar: <Home />,
  Secretaria: <Briefcase />,
  Innovacion: <PenTool />,
  Subdirector: <Building2 />,
  Director: <Building />,
  Administrador: <Settings />
}

export default function RoleBasedModules() {
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated" && session?.user?.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          })
          if (!response.ok) {
            throw new Error('Failed to fetch user profile')
          }
          const data = await response.json()
          setUserProfile(data)
        } catch (err) {
          setError('Error al cargar el perfil del usuario')
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      } else if (status === "unauthenticated") {
        setError('Usuario no autenticado')
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      fetchUserProfile()
    }
  }, [status, session])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, sidebarOpen])

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  if (!userProfile) {
    return <div className="text-center p-4">No se pudo determinar el perfil del usuario</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className={`flex-grow py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarOpen ? 'lg:mr-64' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Módulos disponibles
            </h1>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {roleModules[userProfile.rol].map((module) => (
                <Link key={module} href={`/portal/portal-${module.toLowerCase().replace(/ /g, '-')}`} className="block">
                  <Button 
                    className="w-full h-24 text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center"
                  >
                    {moduleIcons[module]}
                    <span className="mt-2">{module}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div 
        ref={sidebarRef}
        className={`fixed top-0 right-0 w-64 bg-blue-900 text-white h-full transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}
      >
        <div className="p-6 flex flex-col items-center justify-between h-full">
          <div className="w-full flex flex-col items-center space-y-2">
            <div className="mb-4">
              <Image
                src={logo}
                alt="Logo de la institución"
                width={100}
                height={100}
              />
            </div>
            <div className="mb-4">
              <Image
                src={userProfile.avatar || "/placeholder.svg?height=100&width=100"}
                alt="Foto de perfil"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
            <h2 className="text-xl font-bold text-center">
              {userProfile.persona.nombres} {userProfile.persona.apellido_paterno} {userProfile.persona.apellido_materno}
            </h2>
            <p className="text-sm text-center">{userProfile.email}</p>
            <p className="text-sm text-center">Rol: {userProfile.rol}</p>
            <p className="text-sm text-center">DNI: {userProfile.persona.dni}</p>
            <p className="text-sm text-center">Teléfono: {userProfile.persona.telefono}</p>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center mt-auto bg-white text-blue-900 hover:bg-blue-100"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        className={`fixed top-12 z-50 bg-blue-900 text-white  hover:text-blue-900 transition-all duration-300 ${
          sidebarOpen 
            ? 'right-60 border-none' 
            : 'right-0 rounded-r-none rounded-l-full'
        }`}
      >
        {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}