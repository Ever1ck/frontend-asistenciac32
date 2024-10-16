'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Entrada {
    id: number;
    titulo: string;
    tipo_entrada: string;
    created_at: string;
}

export default function EntradasAdminPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [entradas, setEntradas] = useState<Entrada[]>([])
    const [filtroFecha, setFiltroFecha] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('all') // Update: Initial state for filtroTipo
    const [isLoading, setIsLoading] = useState(true)

    const fetchEntradas = useCallback(async () => {
        if (!session?.user?.accessToken) return

        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas`, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            })
            if (response.ok) {
                const data: Entrada[] = await response.json()
                setEntradas(data)
            } else {
                throw new Error('Failed to fetch entradas')
            }
        } catch (error) {
            console.error('Error fetching entradas:', error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las entradas. Por favor, intente de nuevo más tarde.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [session?.user?.accessToken])

    useEffect(() => {
        if (session?.user?.accessToken) {
            fetchEntradas()
        }
    }, [session, fetchEntradas]) // Update: Added fetchEntradas to dependencies

    const handleDelete = async (id: number) => {
        if (!session?.user?.accessToken) return

        if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })
                if (response.ok) {
                    setEntradas(entradas.filter(entrada => entrada.id !== id))
                    toast({
                        title: "Éxito",
                        description: "La entrada ha sido eliminada correctamente.",
                    })
                } else {
                    throw new Error('Failed to delete entrada')
                }
            } catch (error) {
                console.error('Error deleting entrada:', error)
                toast({
                    title: "Error",
                    description: "No se pudo eliminar la entrada. Por favor, intente de nuevo más tarde.",
                    variant: "destructive",
                })
            }
        }
    }

    const filteredEntradas = entradas.filter(entrada => {
        const entradaDate = new Date(entrada.created_at).toISOString().split('T')[0]
        return (
            (filtroFecha === '' || entradaDate === filtroFecha) &&
            (filtroTipo === 'all' || entrada.tipo_entrada === filtroTipo) // Update: Handle 'all' filter value
        )
    })

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Administración de Entradas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <Button onClick={() => router.push('/portal-pagina/entradas/nueva')}>
                            <PlusIcon className="mr-2 h-4 w-4" /> Nueva Entrada
                        </Button>
                        <div className="flex gap-4">
                            <Input
                                type="date"
                                placeholder="Filtrar por fecha"
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                                className="w-40"
                            />
                            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Tipo de entrada" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem> {/* Update: Changed empty value to "all" */}
                                    <SelectItem value="Noticia">Noticia</SelectItem>
                                    <SelectItem value="Comunicado">Comunicado</SelectItem>
                                    <SelectItem value="Evento">Evento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-4">Cargando entradas...</div>
                    ) : filteredEntradas.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEntradas.map((entrada) => (
                                    <TableRow key={entrada.id}>
                                        <TableCell>{entrada.titulo}</TableCell>
                                        <TableCell>{entrada.tipo_entrada}</TableCell>
                                        <TableCell>{new Date(entrada.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => router.push(`/noticias/${entrada.id}`)}>
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => router.push(`/portal-pagina/entradas/editar/${entrada.id}`)}>
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(entrada.id)}>
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-4">No se encontraron entradas.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}