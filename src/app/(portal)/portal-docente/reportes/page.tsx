'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Docente {
    id: number
    email: string
    persona: {
        nombres: string
        apellido_paterno: string
        apellido_materno: string
    }
    docentecurso: {
        id: number
        curso_id: number
        curso: {
            area: {
                nombrearea: string
            }
        }
    }[]
    horario: {
        dia: string
        horas: string[]
        gradoAcademico: {
            id: number
            grado: string
            seccion: string
            turno: string
            _count: {
                Estudiante: number
            }
        }
        curso: {
            id: number
            area: {
                nombrearea: string
            }
        }
    }[]
}

export default function Reportes() {
    const { data: session, status } = useSession()
    const [docente, setDocente] = useState<Docente | null>(null)
    const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDocenteInfo = async () => {
            if (status === 'authenticated' && session?.user?.accessToken) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes/docenteinfo`, {
                        headers: {
                            'Authorization': `Bearer ${session.user?.accessToken}`,
                        },
                    })
                    if (!response.ok) {
                        throw new Error('Failed to fetch docente info')
                    }
                    const data = await response.json()
                    setDocente(data)
                } catch (error) {
                    console.error('Error fetching docente info:', error)
                    setError('Error al obtener la información del docente. Por favor, intente de nuevo más tarde.')
                }
            }
        }

        fetchDocenteInfo()
    }, [status, session])

    const handleCursoChange = (cursoId: string) => {
        setSelectedCursoId(Number(cursoId))
    }

    const filteredGradosAcademicos = docente?.horario.filter(
        (h) => h.curso.id === selectedCursoId
    ) || []

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>
    }

    if (status === 'unauthenticated') {
        return <div className="flex justify-center items-center h-screen">Por favor, inicie sesión para ver esta página.</div>
    }

    return (
        <Card className="w-full max-w-4xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Reportes de Grados Académicos por Docente</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {docente && (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold mb-2">
                                Docente: {docente.persona.nombres} {docente.persona.apellido_paterno} {docente.persona.apellido_materno}
                            </h2>
                            <p>Email: {docente.email}</p>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="curso-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Curso
                            </label>
                            <Select onValueChange={handleCursoChange}>
                                <SelectTrigger id="curso-select" className="w-full">
                                    <SelectValue placeholder="Seleccione un curso" />
                                </SelectTrigger>
                                <SelectContent>
                                    {docente.docentecurso.map((dc) => (
                                        <SelectItem key={dc.id} value={dc.curso_id.toString()}>
                                            {dc.curso.area.nombrearea}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedCursoId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredGradosAcademicos.map((horario, index) => (
                                    <Link href={`/portal-docente/reportes/cursos/${horario.curso.id}/grado-academico/${horario.gradoAcademico.id}`} key={index} className="block">
                                        <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                                            <CardHeader>
                                                <CardTitle>{horario.gradoAcademico.grado} {horario.gradoAcademico.seccion}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p><strong>Turno:</strong> {horario.gradoAcademico.turno}</p>
                                                <p><strong>Día:</strong> {horario.dia}</p>
                                                <p><strong>Horas:</strong> {horario.horas.join(', ')}</p>
                                                <p><strong>Estudiantes:</strong> {horario.gradoAcademico._count.Estudiante}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}