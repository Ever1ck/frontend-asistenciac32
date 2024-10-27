"use client"

import { useState } from "react"
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

interface Docente {
    id: number
    nombre: string
    apellido: string
    especialidad: string
}

export default function AdministrarDocentes() {
    const [docentes, setDocentes] = useState<Docente[]>([
        { id: 1, nombre: "Juan", apellido: "Pérez", especialidad: "Matemáticas" },
        { id: 2, nombre: "María", apellido: "González", especialidad: "Historia" },
    ])
    const [docenteActual, setDocenteActual] = useState<Docente | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleAddOrEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const nombre = formData.get("nombre") as string
        const apellido = formData.get("apellido") as string
        const especialidad = formData.get("especialidad") as string

        if (docenteActual) {
            // Editar docente existente
            setDocentes(docentes.map(docente => docente.id === docenteActual.id ? { ...docente, nombre, apellido, especialidad } : docente))
        } else {
            // Agregar nuevo docente
            const newId = Math.max(...docentes.map(d => d.id), 0) + 1
            setDocentes([...docentes, { id: newId, nombre, apellido, especialidad }])
        }
        setIsDialogOpen(false)
        setDocenteActual(null)
    }

    const handleDelete = (id: number) => {
        setDocentes(docentes.filter(docente => docente.id !== id))
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Administrar Docentes</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setDocenteActual(null)}>Agregar Docente</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{docenteActual ? "Editar Docente" : "Agregar Docente"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddOrEdit} className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input id="nombre" name="nombre" defaultValue={docenteActual?.nombre} required />
                        </div>
                        <div>
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input id="apellido" name="apellido" defaultValue={docenteActual?.apellido} required />
                        </div>
                        <div>
                            <Label htmlFor="especialidad">Especialidad</Label>
                            <Input id="especialidad" name="especialidad" defaultValue={docenteActual?.especialidad} required />
                        </div>
                        <Button type="submit">Guardar</Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Apellido</TableHead>
                        <TableHead>Especialidad</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {docentes.map((docente) => (
                        <TableRow key={docente.id}>
                            <TableCell>{docente.nombre}</TableCell>
                            <TableCell>{docente.apellido}</TableCell>
                            <TableCell>{docente.especialidad}</TableCell>
                            <TableCell>
                                <Button variant="outline" className="mr-2" onClick={() => {
                                    setDocenteActual(docente)
                                    setIsDialogOpen(true)
                                }}>
                                    Editar
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(docente.id)}>
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}