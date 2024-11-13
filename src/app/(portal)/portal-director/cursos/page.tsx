"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Curso {
  id: number
  areaid: number
  created_at: string
  updated_at: string
  area: {
    nombrearea: string
  }
  DocenteCurso: Array<{
    id: number
    docente_id: number
    curso_id: number
    created_at: string
    updated_at: string
    docente: {
      id: number
      Persona: {
        nombres: string
        apellido_paterno: string
        apellido_materno: string
      }
    }
  }>
}

interface Area {
  id: number
  nombrearea: string
}

export default function AdministrarCursos() {
  const router = useRouter()
  const { data: session } = useSession()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  const fetchCursos = useCallback(async () => {
    if (!session) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      })
      if (!response.ok) throw new Error('Error al obtener los cursos')
      const data = await response.json()
      setCursos(data)
    } catch (error) {
      console.error('Error:', error)
      setError('No se pudieron cargar los cursos. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const fetchAreas = useCallback(async () => {
    if (!session) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/areas`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      })
      if (!response.ok) throw new Error('Error al obtener las áreas')
      const data = await response.json()
      setAreas(data)
    } catch (error) {
      console.error('Error:', error)
      setError('No se pudieron cargar las áreas. Por favor, intente de nuevo.')
    }
  }, [session])

  useEffect(() => {
    if (session) {
      fetchCursos()
      fetchAreas()
    }
  }, [session, fetchCursos, fetchAreas])

  const handleAddCurso = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session) return
    const formData = new FormData(e.currentTarget)
    const cursoData = {
      areaid: parseInt(formData.get("areaid") as string, 10),
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(cursoData),
      })

      if (!response.ok) throw new Error('Error al guardar el curso')
      fetchCursos()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error:', error)
      setError('No se pudo agregar el curso. Por favor, intente de nuevo.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!session) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      })
      if (!response.ok) throw new Error('Error al eliminar el curso')
      fetchCursos()
      setCourseToDelete(null)
    } catch (error) {
      console.error('Error:', error)
      setError('No se pudo eliminar el curso. Por favor, intente de nuevo.')
    }
  }

  if (isLoading) return <div>Cargando cursos...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administrar Cursos</h1>
        <Button onClick={() => router.back()}>Regresar</Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Agregar Curso</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCurso} className="space-y-4">
            <div>
              <Label htmlFor="areaid">Área</Label>
              <Select name="areaid" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.nombrearea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {cursos.map((curso) => (
          <Card key={curso.id}>
            <CardHeader>
              <CardTitle>{curso.area.nombrearea}</CardTitle>
              <CardDescription>Área de estudio</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Creado el: {new Date(curso.created_at).toLocaleDateString()}</p>
              <p>Docentes asignados: {curso.DocenteCurso.length}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Eliminar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente el curso y todos los datos asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(curso.id)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Link href={`/portal-administrador/cursos/${curso.id}/docentes`} passHref>
                <Button variant="secondary">Administrar Docentes</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}