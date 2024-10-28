"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Curso {
  id: number
  area: {
    nombrearea: string;
  }
  created_at: string
  updated_at: string
}

export default function AdministrarCursos() {
  const router = useRouter()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchCursos()
  }, [])

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos`)
      if (!response.ok) throw new Error('Error al obtener los cursos')
      const data = await response.json()
      setCursos(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddCurso = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const cursoData = {
      area: formData.get("area") as string,
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoData),
      })

      if (!response.ok) throw new Error('Error al guardar el curso')
      fetchCursos()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error al eliminar el curso')
      fetchCursos()
    } catch (error) {
      console.error('Error:', error)
    }
  }

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
              <Label htmlFor="area">Área</Label>
              <Input id="area" name="area" required />
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={() => handleDelete(curso.id)}>
                Eliminar
              </Button>
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