"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

interface Aula {
    id: number
    edificio: number
    piso: number
    numeroAula: number
    created_at: string
    updated_at: string
}

export default function AdministrarAulas() {
    const router = useRouter()
    const [aulas, setAulas] = useState<Aula[]>([])
    const [aulaActual, setAulaActual] = useState<Aula | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        fetchAulas()
    }, [])

    const fetchAulas = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/aulas`)
            if (!response.ok) throw new Error('Error al obtener las aulas')
            const data = await response.json()
            setAulas(data)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleAddOrEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const aulaData = {
            edificio: parseInt(formData.get("edificio") as string),
            piso: parseInt(formData.get("piso") as string),
            numeroAula: parseInt(formData.get("numeroAula") as string),
        }

        try {
            let response
            if (aulaActual) {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/aulas/${aulaActual.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aulaData),
                })
            } else {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/aulas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aulaData),
                })
            }

            if (!response.ok) throw new Error('Error al guardar el aula')
            fetchAulas()
            setIsDialogOpen(false)
            setAulaActual(null)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/aulas/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Error al eliminar el aula')
            fetchAulas()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Administrar Aulas</h1>
                <Button onClick={() => router.back()}>Regresar</Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setAulaActual(null)}>Agregar Aula</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{aulaActual ? "Editar Aula" : "Agregar Aula"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddOrEdit} className="space-y-4">
                        <div>
                            <Label htmlFor="edificio">Edificio</Label>
                            <Input id="edificio" name="edificio" type="number" defaultValue={aulaActual?.edificio} required />
                        </div>
                        <div>
                            <Label htmlFor="piso">Piso</Label>
                            <Input id="piso" name="piso" type="number" defaultValue={aulaActual?.piso} required />
                        </div>
                        <div>
                            <Label htmlFor="numeroAula">Número de Aula</Label>
                            <Input id="numeroAula" name="numeroAula" type="number" defaultValue={aulaActual?.numeroAula} required />
                        </div>
                        <Button type="submit">Guardar</Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Edificio</TableHead>
                        <TableHead>Piso</TableHead>
                        <TableHead>Número de Aula</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aulas.map((aula) => (
                        <TableRow key={aula.id}>
                            <TableCell>{aula.edificio}</TableCell>
                            <TableCell>{aula.piso}</TableCell>
                            <TableCell>{aula.numeroAula}</TableCell>
                            <TableCell>
                                <Button variant="outline" className="mr-2" onClick={() => {
                                    setAulaActual(aula)
                                    setIsDialogOpen(true)
                                }}>
                                    Editar
                                </Button>
                                <Button variant="destructive" onClick={() => handleDelete(aula.id)}>
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