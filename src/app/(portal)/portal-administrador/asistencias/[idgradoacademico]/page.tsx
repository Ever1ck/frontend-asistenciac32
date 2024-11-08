'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Curso {
    id: number
    nombre: string
    area: {
        nombrearea: string
    }
}

interface GradoAcademico {
    id: number
    grado: string
    seccion: string
    turno: string
    cursos: Curso[]
}

export default function GradoAcademicoPage() {
    const { idgradoacademico } = useParams()
    const { data: session, status } = useSession()
    const [gradoAcademico, setGradoAcademico] = useState<GradoAcademico | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGradoAcademico = async () => {
            if (status === 'authenticated' && session?.user) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${idgradoacademico}`, {
                        headers: {
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    })
                    if (!response.ok) {
                        throw new Error('Failed to fetch grado academico')
                    }
                    const data: GradoAcademico = await response.json()
                    setGradoAcademico(data)
                } catch (error) {
                    console.error('Error fetching grado academico:', error)
                    setError('No se pudo cargar la información del grado académico. Por favor, intente de nuevo más tarde.')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        if (status === 'authenticated') {
            fetchGradoAcademico()
        } else if (status === 'unauthenticated') {
            setError('Debe iniciar sesión para ver esta información.')
            setIsLoading(false)
        }
    }, [status, session, idgradoacademico])

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (error) {
        return <ErrorMessage message={error} />
    }

    if (!gradoAcademico) {
        return <ErrorMessage message="No se encontró información para este grado académico." />
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                {gradoAcademico.grado} Grado - Sección {gradoAcademico.seccion}
            </h1>
            <p className="mb-4">Turno: {gradoAcademico.turno}</p>
            <h2 className="text-xl font-semibold mb-2">Cursos:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradoAcademico.cursos.map((curso) => (
                    <Card key={curso.id}>
                        <CardHeader>
                            <CardTitle>{curso.nombre}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Área: {curso.area.nombrearea}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="container mx-auto p-4">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center h-32">
            <p className="text-red-500 text-center">{message}</p>
        </div>
    )
}