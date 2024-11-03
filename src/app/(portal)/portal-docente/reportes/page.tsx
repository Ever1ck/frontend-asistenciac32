'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/hooks/use-toast'
import { Book, Users, ChevronLeft } from 'lucide-react'

interface Persona {
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    fecha_nacimiento: string
}

interface Curso {
    id: number
    area: {
        nombrearea: string
    }
}

interface GradoAcademico {
    id: number
    grado: string
    seccion: string
    turno: string
    _count: {
        Estudiante: number
    }
}

interface Horario {
    dia: string
    horas: string[]
    gradoAcademico: GradoAcademico
    curso: Curso
}

interface DocenteInfo {
    id: number
    email: string
    persona: Persona
    docentecurso: { curso: Curso }[]
    horario: Horario[]
}

export default function ReportesPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [docenteInfo, setDocenteInfo] = useState<DocenteInfo | null>(null)
    const [selectedCurso, setSelectedCurso] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDocenteInfo = async () => {
            if (!session?.user?.accessToken) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes/docenteinfo`, {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch docente info')
                }
                const data = await response.json()
                setDocenteInfo(data)
            } catch (err) {
                setError('Error fetching docente info')
                console.error(err)
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información del docente.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchDocenteInfo()
    }, [session])

    const cursos = docenteInfo?.docentecurso.map(dc => dc.curso) || []
    const gradosAcademicos = selectedCurso
        ? docenteInfo?.horario
            .filter(h => h.curso.id === selectedCurso)
            .map(h => h.gradoAcademico)
            .filter((grado, index, self) =>
                index === self.findIndex((t) => t.id === grado.id)
            ) || []
        : []

    const handleCursoChange = (value: string) => {
        setSelectedCurso(Number(value))
    }

    const handleGoBack = () => {
        router.back()
    }

    const handleGradoClick = (gradoId: number) => {
        router.push(`/portal-docente/reportes/grado-academico/${gradoId}`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-600 p-4">{error}</div>
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Button onClick={handleGoBack} variant="outline" className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" /> Regresar
            </Button>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Reportes</CardTitle>
                </CardHeader>
                <CardContent>
                    {docenteInfo && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                <div>
                                    <h2 className="text-xl font-semibold">{`${docenteInfo.persona.nombres} ${docenteInfo.persona.apellido_paterno} ${docenteInfo.persona.apellido_materno}`}</h2>
                                    <p className="text-sm text-gray-500">{docenteInfo.email}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="curso-select" className="block text-sm font-medium text-gray-700 mb-1">
                                    Seleccionar Curso
                                </label>
                                <Select onValueChange={handleCursoChange}>
                                    <SelectTrigger id="curso-select">
                                        <SelectValue placeholder="Seleccione un curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cursos.map((curso) => (
                                            <SelectItem key={curso.id} value={String(curso.id || 0)}>
                                                {curso.area.nombrearea}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Grados Académicos</h3>
                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    {gradosAcademicos.map((grado) => (
                                        <Button
                                            key={grado.id}
                                            onClick={() => handleGradoClick(grado.id)}
                                            className="w-full mb-2 justify-start"
                                            variant="outline"
                                        >
                                            <Users className="mr-2 h-4 w-4" />
                                            <span>{`${grado.grado} ${grado.seccion} - ${grado.turno}`}</span>
                                            <span className="ml-auto">{grado._count.Estudiante} estudiantes</span>
                                        </Button>
                                    ))}
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}