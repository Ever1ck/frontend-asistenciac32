'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Link from 'next/link'

interface GradoAcademico {
    id: number
    grado: string
    seccion: string
    turno: string
}

interface GradoAgrupado {
    grado: string
    secciones: GradoAcademico[]
}

export function GradosAcademicos() {
    const { data: session, status } = useSession()
    const [gradosAgrupados, setGradosAgrupados] = useState<GradoAgrupado[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGradosAcademicos = async () => {
            if (status === 'authenticated' && session?.user) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos`, {
                        headers: {
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    })
                    if (!response.ok) {
                        throw new Error('Failed to fetch grados academicos')
                    }
                    const data: GradoAcademico[] = await response.json()

                    const agrupados = data.reduce((acc, grado) => {
                        const gradoExistente = acc.find(g => g.grado === grado.grado)
                        if (gradoExistente) {
                            gradoExistente.secciones.push(grado)
                        } else {
                            acc.push({ grado: grado.grado, secciones: [grado] })
                        }
                        return acc
                    }, [] as GradoAgrupado[])

                    setGradosAgrupados(agrupados)
                } catch (error) {
                    console.error('Error fetching grados academicos:', error)
                    setError('No se pudieron cargar los grados académicos. Por favor, intente de nuevo más tarde.')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        if (status === 'authenticated') {
            fetchGradosAcademicos()
        } else if (status === 'unauthenticated') {
            setError('Debe iniciar sesión para ver esta información.')
            setIsLoading(false)
        }
    }, [status, session])

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (error) {
        return <ErrorMessage message={error} />
    }

    return (
        <div className="space-y-6">
            {gradosAgrupados.map((gradoAgrupado) => (
                <Card key={gradoAgrupado.grado} className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>{gradoAgrupado.grado} Grado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                            <div className="flex w-max space-x-4 p-4">
                                {gradoAgrupado.secciones.map((seccion) => (
                                    <SeccionCard key={seccion.id} seccion={seccion} />
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function SeccionCard({ seccion }: { seccion: GradoAcademico }) {
    return (
        <Link href={`/portal-administrador/asistencias/${seccion.id}`} passHref>
            <Card className="w-[200px] flex-shrink-0 hover:bg-accent transition-colors duration-200 cursor-pointer">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Sección {seccion.seccion}</span>
                        <Badge variant="secondary">{seccion.turno}</Badge>
                    </CardTitle>
                </CardHeader>
            </Card>
        </Link>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                            <div className="flex w-max space-x-4 p-4">
                                {[...Array(5)].map((_, subIndex) => (
                                    <Card key={subIndex} className="w-[200px] flex-shrink-0">
                                        <CardHeader>
                                            <Skeleton className="h-6 w-3/4" />
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            ))}
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