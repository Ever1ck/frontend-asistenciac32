"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
    email: string
    Persona: {
        nombres: string
        apellido_paterno: string
        apellido_materno: string
    }
    DocenteCurso: Array<{
        curso: {
            area: {
                nombrearea: string
            }
        }
    }>
}

export default function AdministrarDocentes() {
    const [docentes, setDocentes] = useState<Docente[]>([])
    const [docenteActual, setDocenteActual] = useState<Docente | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { data: session } = useSession()

    useEffect(() => {
        const fetchDocentes = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes`, {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                })
                if (!response.ok) {
                    throw new Error('Error al cargar los docentes')
                }
                const data = await response.json()
                setDocentes(data)
            } catch (error) {
                setError('Error al cargar los docentes')
                console.error('Error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (session?.user?.accessToken) {
            fetchDocentes()
        }
    }, [session])

    const handleAddOrEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const nombres = formData.get("nombres") as string
        const apellido_paterno = formData.get("apellido_paterno") as string
        const apellido_materno = formData.get("apellido_materno") as string
        const email = formData.get("email") as string

        try {
            const url = docenteActual
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes/${docenteActual.id}`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes`
            const method = docenteActual ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({
                    email,
                    Persona: { nombres, apellido_paterno, apellido_materno }
                }),
            })

            if (!response.ok) {
                throw new Error('Error al guardar el docente')
            }

            const updatedDocente = await response.json()

            if (docenteActual) {
                setDocentes(docentes.map(d => d.id === updatedDocente.id ? updatedDocente : d))
            } else {
                setDocentes([...docentes, updatedDocente])
            }

            setIsDialogOpen(false)
            setDocenteActual(null)
        } catch (error) {
            console.error('Error:', error)
            setError('Error al guardar el docente')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            })

            if (!response.ok) {
                throw new Error('Error al eliminar el docente')
            }

            setDocentes(docentes.filter(docente => docente.id !== id))
        } catch (error) {
            console.error('Error:', error)
            setError('Error al eliminar el docente')
        }
    }

    if (isLoading) return <div>Cargando...</div>
    if (error) return <div>Error: {error}</div>

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
                            <Label htmlFor="nombres">Nombres</Label>
                            <Input id="nombres" name="nombres" defaultValue={docenteActual?.Persona.nombres} required />
                        </div>
                        <div>
                            <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                            <Input id="apellido_paterno" name="apellido_paterno" defaultValue={docenteActual?.Persona.apellido_paterno} required />
                        </div>
                        <div>
                            <Label htmlFor="apellido_materno">Apellido Materno</Label>
                            <Input id="apellido_materno" name="apellido_materno" defaultValue={docenteActual?.Persona.apellido_materno} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={docenteActual?.email} required />
                        </div>
                        <Button type="submit">Guardar</Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombres</TableHead>
                        <TableHead>Apellidos</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Especialidad</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {docentes.map((docente) => (
                        <TableRow key={docente.id}>
                            <TableCell>{docente.Persona.nombres}</TableCell>
                            <TableCell>{`${docente.Persona.apellido_paterno} ${docente.Persona.apellido_materno}`}</TableCell>
                            <TableCell>{docente.email}</TableCell>
                            <TableCell>{docente.DocenteCurso[0]?.curso.area.nombrearea || 'No asignado'}</TableCell>
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