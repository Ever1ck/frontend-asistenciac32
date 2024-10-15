"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

type Role = "USUARIO" | "CAJA" | "DIRECTOR" | "SECRETARIA" | "MESA_PARTES" | "SIAGIE" | "ADMIN"

type Module = {
  id: string
  name: string
  url: string
}

const initialRoleModules: Record<Role, Module[]> = {
  USUARIO: [{ id: "1", name: "Usuario", url: "/portal/portal-usuario" }],
  CAJA: [{ id: "2", name: "Caja", url: "/portal/portal-caja" }],
  DIRECTOR: [{ id: "3", name: "Director", url: "/portal/portal-director" }],
  SECRETARIA: [{ id: "4", name: "Secretaria", url: "/portal/portal-secretaria" }],
  MESA_PARTES: [{ id: "5", name: "Mesa de Partes", url: "/portal/portal-mesa-de-partes" }],
  SIAGIE: [{ id: "6", name: "SIAGIE", url: "/portal/portal-siagie" }],
  ADMIN: [
    { id: "1", name: "Usuario", url: "/portal/portal-usuario" },
    { id: "2", name: "Caja", url: "/portal/portal-caja" },
    { id: "3", name: "Director", url: "/portal/portal-director" },
    { id: "4", name: "Secretaria", url: "/portal/portal-secretaria" },
    { id: "5", name: "Mesa de Partes", url: "/portal/portal-mesa-de-partes" },
    { id: "6", name: "SIAGIE", url: "/portal/portal-siagie" },
    { id: "7", name: "Administración", url: "/portal/portal-administracion" }
  ]
}

export default function RoleBasedModules() {
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingModule, setDeletingModule] = useState<Module | null>(null)

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
          setModules(initialRoleModules[data.rol as Role])
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

  const handleEdit = (module: Module) => {
    setEditingModule(module)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (module: Module) => {
    setDeletingModule(module)
    setIsDeleteDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editingModule) {
      const updatedModules = modules.map(m => 
        m.id === editingModule.id ? editingModule : m
      )
      setModules(updatedModules)
      setIsEditDialogOpen(false)
      toast({
        title: "Módulo actualizado",
        description: `El módulo ${editingModule.name} ha sido actualizado.`,
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (deletingModule) {
      const updatedModules = modules.filter(m => m.id !== deletingModule.id)
      setModules(updatedModules)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Módulo eliminado",
        description: `El módulo ${deletingModule.name} ha sido eliminado.`,
      })
    }
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
            {modules.map((module) => (
              <div key={module.id} className="relative group">
                <Link href={module.url} className="block">
                  <Button 
                    className="w-full h-24 text-lg font-semibold transition-all duration-200 ease-in-out transform group-hover:scale-105 group-hover:shadow-lg"
                  >
                    {module.name}
                  </Button>
                </Link>
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      handleEdit(module)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(module)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={editingModule?.name || ''}
                  onChange={(e) => setEditingModule(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  value={editingModule?.url || ''}
                  onChange={(e) => setEditingModule(prev => prev ? {...prev, url: e.target.value} : null)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que quieres eliminar el módulo {deletingModule?.name}?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}