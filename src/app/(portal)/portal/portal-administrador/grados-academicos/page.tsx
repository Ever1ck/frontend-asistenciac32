'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from 'next/navigation'

interface Persona {
  id: number
  dni: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  sexo: string
}

interface Docente {
  id: number
  email: string
  role: string
  estado: boolean
  Persona_id: number
  Persona: Persona
}

interface Aula {
  id: number
  edificio: number
  piso: number
  numeroAula: number
}

interface GradoAcademico {
  id: number
  grado: string
  seccion: string
  tutor_id: number
  aula_id: number
  turno: string
  created_at: string
  updated_at: string
  tutor: Docente
  aula: Aula
}

const gradoAcademicoSchema = z.object({
  grado: z.enum(["Primero", "Segundo", "Tercero", "Cuarto", "Quinto"]),
  seccion: z.string().min(1, "La sección es requerida"),
  tutor_id: z.number().int().positive("El ID del tutor debe ser un número positivo"),
  aula_id: z.number().int().positive("El ID del aula debe ser un número positivo"),
  turno: z.enum(["Dia", "Tarde"])
})

type GradoAcademicoFormValues = z.infer<typeof gradoAcademicoSchema>

export default function GradoAcademicoView() {
  const [grados, setGrados] = useState<GradoAcademico[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [searchTutor, setSearchTutor] = useState('')
  const [searchAula, setSearchAula] = useState('')
  const [isAssigningTutor, setIsAssigningTutor] = useState(false)
  const [isAssigningAula, setIsAssigningAula] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGrado, setEditingGrado] = useState<GradoAcademico | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [gradoToDelete, setGradoToDelete] = useState<GradoAcademico | null>(null)
  const router = useRouter()

  const form = useForm<GradoAcademicoFormValues>({
    resolver: zodResolver(gradoAcademicoSchema),
    defaultValues: {
      grado: undefined,
      seccion: "",
      tutor_id: 0,
      aula_id: 0,
      turno: undefined
    }
  })

  useEffect(() => {
    fetchGrados()
    fetchDocentes()
    fetchAulas()
  }, [])

  const fetchGrados = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos`)
      if (!response.ok) throw new Error('Error al obtener los grados académicos')
      const data = await response.json()
      setGrados(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los grados académicos",
        variant: "destructive",
      })
    }
  }

  const fetchDocentes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes`)
      if (!response.ok) throw new Error('Error al obtener los docentes')
      const data = await response.json()
      setDocentes(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los docentes",
        variant: "destructive",
      })
    }
  }

  const fetchAulas = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/aulas`)
      if (!response.ok) throw new Error('Error al obtener las aulas')
      const data = await response.json()
      setAulas(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las aulas",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (values: GradoAcademicoFormValues) => {
    try {
      const url = editingGrado
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${editingGrado.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos`
      const method = editingGrado ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      if (!response.ok) throw new Error('Error al guardar el grado académico')
      await fetchGrados()
      toast({
        title: "Éxito",
        description: editingGrado ? "Grado académico actualizado correctamente" : "Grado académico creado correctamente",
      })
      setIsDialogOpen(false)
      resetForm()
      setEditingGrado(null)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el grado académico",
        variant: "destructive",
      })
    }
  }

  const handleAssignTutor = (docente: Docente) => {
    form.setValue('tutor_id', docente.id)
    setIsAssigningTutor(false)
  }

  const handleAssignAula = (aula: Aula) => {
    form.setValue('aula_id', aula.id)
    setIsAssigningAula(false)
  }

  const resetForm = () => {
    form.reset({
      grado: undefined,
      seccion: "",
      tutor_id: 0,
      aula_id: 0,
      turno: undefined
    })
  }

  const handleEdit = (grado: GradoAcademico) => {
    setEditingGrado(grado)
    form.reset({
      grado: grado.grado as "Primero" | "Segundo" | "Tercero" | "Cuarto" | "Quinto",
      seccion: grado.seccion,
      tutor_id: grado.tutor_id,
      aula_id: grado.aula_id,
      turno: grado.turno as "Dia" | "Tarde"
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (grado: GradoAcademico) => {
    setGradoToDelete(grado)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!gradoToDelete) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${gradoToDelete.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error al eliminar el grado académico')
      await fetchGrados()
      toast({
        title: "Éxito",
        description: "Grado académico eliminado correctamente",
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el grado académico",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setGradoToDelete(null)
    }
  }

  const filteredDocentes = docentes.filter(docente => 
    `${docente.Persona.nombres} ${docente.Persona.apellido_paterno} ${docente.Persona.apellido_materno}`
      .toLowerCase()
      .includes(searchTutor.toLowerCase())
  )

  const filteredAulas = aulas.filter(aula => 
    `Edificio ${aula.edificio}, Piso ${aula.piso}, Aula ${aula.numeroAula}`
      .toLowerCase()
      .includes(searchAula.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Grados Académicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              resetForm()
              setEditingGrado(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>Registrar Nuevo Grado Académico</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGrado ? 'Editar' : 'Registrar'} Grado Académico</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="grado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un grado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Primero">Primero</SelectItem>
                            <SelectItem value="Segundo">Segundo</SelectItem>
                            <SelectItem value="Tercero">Tercero</SelectItem>
                            <SelectItem value="Cuarto">Cuarto</SelectItem>
                            <SelectItem value="Quinto">Quinto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sección</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tutor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutor</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              {...field}
                              readOnly
                              value={docentes.find(d => d.id === field.value)?.Persona.nombres || ''}
                            />
                          </FormControl>
                          <Button type="button" onClick={() => setIsAssigningTutor(true)}>Asignar Tutor</Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aula_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aula</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              {...field}
                              readOnly
                              value={aulas.find(a => a.id === field.value) ? 
                                `Edificio ${aulas.find(a => a.id === field.value)?.edificio}, Piso ${aulas.find(a => a.id === field.value)?.piso}, Aula ${aulas.find(a => a.id === field.value)?.numeroAula}` : 
                                ''}
                            />
                          </FormControl>
                          <Button type="button" onClick={() => setIsAssigningAula(true)}>Asignar Aula</Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="turno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turno</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un turno" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Dia">Día</SelectItem>
                            <SelectItem value="Tarde">Tarde</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">{editingGrado ? 'Actualizar' : 'Guardar'}</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Grados Académicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grados.map((grado) => (
                <TableRow key={grado.id}>
                  <TableCell>{grado.id}</TableCell>
                  <TableCell>{grado.grado}</TableCell>
                  <TableCell>{grado.seccion}</TableCell>
                  <TableCell>{`${grado.tutor.Persona.nombres} ${grado.tutor.Persona.apellido_paterno} ${grado.tutor.Persona.apellido_materno}`}</TableCell>
                  <TableCell>{`Edificio ${grado.aula.edificio}, Piso ${grado.aula.piso}, Aula ${grado.aula.numeroAula}`}</TableCell>
                  <TableCell>{grado.turno}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => router.push(`/portal-admin/grados-academicos/${grado.id}`)}>Ver</Button>
                      <Button onClick={() => handleEdit(grado)}>Editar</Button>
                      <Button variant="destructive" onClick={() => handleDelete(grado)}>Eliminar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAssigningTutor} onOpenChange={setIsAssigningTutor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Tutor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Buscar tutor..." 
              value={searchTutor} 
              onChange={(e) => setSearchTutor(e.target.value)} 
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredDocentes.map((docente) => (
                <Button 
                  key={docente.id} 
                  onClick={() => handleAssignTutor(docente)}
                  className="w-full justify-start mb-2"
                >
                  {`${docente.Persona.nombres} ${docente.Persona.apellido_paterno} ${docente.Persona.apellido_materno}`}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssigningAula} onOpenChange={setIsAssigningAula}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Aula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Buscar aula..." 
              value={searchAula} 
              onChange={(e) => setSearchAula(e.target.value)} 
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredAulas.map((aula) => (
                <Button 
                  key={aula.id} 
                  onClick={() => handleAssignAula(aula)}
                  className="w-full justify-start mb-2"
                >
                  {`Edificio ${aula.edificio}, Piso ${aula.piso}, Aula ${aula.numeroAula}`}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Está seguro que desea eliminar este grado académico?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}