"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"

type Role = "Usuario"| "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector" | "Director" | "Administrador"

type Module = "Usuario" | "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector"| "Director" | "Administración"

const roleModules: Record<Role, Module[]> = {
  Usuario: ["Usuario"],
  Docente: ["Docente"],
  Auxiliar: ["Auxiliar"],
  Secretaria: ["Secretaria"],
  Innovacion: ["Innovacion"],
  Subdirector: ["Subdirector"],
  Director: ["Director"],
  Administrador: ["Usuario", "Docente", "Auxiliar", "Secretaria", "Innovacion", "Subdirector", "Director", "Administración"]
}

export default function RoleBasedModules() {
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setUserRole(data.rol as Role)
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

  if (!userRole) {
    return <div className="text-center p-4">No se pudo determinar el rol del usuario</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Módulos disponibles para {userRole}
        </h1>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {roleModules[userRole].map((module) => (
              <Link key={module} href={`/portal/portal-${module.toLowerCase().replace(/ /g, '-')}`} className="block">
                <Button 
                  className="w-full h-24 text-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg"
                >
                  {module}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}