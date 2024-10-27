"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Persona {
    nombres: string
    apellido_paterno: string
    apellido_materno: string
}

interface Docente {
    id: number
    Persona: Persona
}

interface DocenteCurso {
    id: number
    docente_id: number
    curso_id: number
    created_at: string
    updated_at: string
    docente: Docente
}

interface Curso {
    id: number
    area: string
    created_at: string
    updated_at: string
    DocenteCurso: DocenteCurso[]
}

export default function AdministrarDocentesCurso() {
    const params = useParams()
    const router = useRouter()
    const cursoId = params.id as string

    const [curso, setCurso] = useState<Curso | null>(null)
    const [docentesDisponibles, setDocentesDisponibles] = useState<Docente[]>([])
    const [docentesFiltrados, setDocentesFiltrados] = useState<Docente[]>([])
    const [selectedDocenteId, setSelectedDocenteId] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchCursoInfo()
        fetchDocentesDisponibles()
    }, [cursoId])

    useEffect(() => {
        const filtered = docentesDisponibles.filter(docente =>
            `${docente.Persona.nombres} ${docente.Persona.apellido_paterno} ${docente.Persona.apellido_materno}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
        setDocentesFiltrados(filtered)
    }, [searchTerm, docentesDisponibles])

    const fetchCursoInfo = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos/${cursoId}`)
            if (!response.ok) throw new Error('Error al obtener la información del curso')
            const data = await response.json()
            setCurso(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const fetchDocentesDisponibles = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes`)
            if (!response.ok) throw new Error('Error al obtener los docentes disponibles')
            const data = await response.json()
            setDocentesDisponibles(data)
            setDocentesFiltrados(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleAddDocente = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentecursos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docente_id: parseInt(selectedDocenteId),
                    curso_id: parseInt(cursoId),
                }),
            })
            if (!response.ok) throw new Error('Error al agregar el docente al curso')
            fetchCursoInfo()
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleRemoveDocente = async (docenteCursoId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentecursos/${docenteCursoId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Error al eliminar el docente del curso')
            fetchCursoInfo()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Docentes del Curso</h1>
                <Button onClick={() => router.back()}>Regresar</Button>
            </div>
            {curso && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Área: {curso.area}</h2>
                </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Agregar Docente al Curso</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Agregar Docente al Curso</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="search-docente">Buscar Docente</Label>
                            <Input
                                id="search-docente"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="docente">Seleccionar Docente</Label>
                            <Select onValueChange={setSelectedDocenteId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione un docente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {docentesFiltrados.map((docente) => (
                                        <SelectItem key={docente.id} value={docente.id.toString()}>
                                            {`${docente.Persona.nombres} ${docente.Persona.apellido_paterno} ${docente.Persona.apellido_materno}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddDocente}>Agregar</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre del Docente</TableHead>
                        <TableHead>Fecha de Asignación</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {curso?.DocenteCurso.map((docenteCurso) => (
                        <TableRow key={docenteCurso.id}>
                            <TableCell>{`${docenteCurso.docente.Persona.nombres} ${docenteCurso.docente.Persona.apellido_paterno} ${docenteCurso.docente.Persona.apellido_materno}`}</TableCell>
                            <TableCell>{new Date(docenteCurso.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button variant="destructive" onClick={() => handleRemoveDocente(docenteCurso.id)}>
                                    Eliminar del Curso
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}