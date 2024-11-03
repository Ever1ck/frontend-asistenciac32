'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ChevronLeft } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface GradoAcademico {
    id: number
    grado: string
    seccion: string
    turno: string
    Estudiante: {
        id: number
        Persona: {
            nombres: string
            apellido_paterno: string
            apellido_materno: string
        }
    }[]
}

interface Asistencia {
    fecha: string
    estadoAsistencia: 'Presente' | 'Tardanza' | 'Falta'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function ReporteGradoAcademico() {
    const { data: session } = useSession()
    const router = useRouter()
    const { id } = useParams()
    const [gradoAcademico, setGradoAcademico] = useState<GradoAcademico | null>(null)
    const [asistencias, setAsistencias] = useState<Asistencia[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.accessToken) return

            try {
                const [gradoResponse, asistenciasResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${id}`, {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias?gradoAcademico_id=${id}`, {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                ])

                if (!gradoResponse.ok || !asistenciasResponse.ok) {
                    throw new Error('Failed to fetch data')
                }

                const gradoData = await gradoResponse.json()
                const asistenciasData = await asistenciasResponse.json()

                setGradoAcademico(gradoData)
                setAsistencias(asistenciasData)
            } catch (err) {
                setError('Error fetching data')
                console.error(err)
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información del grado académico.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [session, id])

    const handleGoBack = () => {
        router.back()
    }

    const asistenciaData = [
        { name: 'Presente', value: asistencias.filter(a => a.estadoAsistencia === 'Presente').length },
        { name: 'Tardanza', value: asistencias.filter(a => a.estadoAsistencia === 'Tardanza').length },
        { name: 'Falta', value: asistencias.filter(a => a.estadoAsistencia === 'Falta').length },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (error || !gradoAcademico) {
        return <div className="text-center text-red-600 p-4">{error || 'No se pudo cargar la información'}</div>
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Button onClick={handleGoBack} variant="outline" className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" /> Regresar
            </Button>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Reporte de {gradoAcademico.grado} {gradoAcademico.seccion} - {gradoAcademico.turno}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Resumen de Asistencias</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={asistenciaData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {asistenciaData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Lista de Estudiantes</h3>
                            <ul className="space-y-2">
                                {gradoAcademico.Estudiante.map((estudiante) => (
                                    <li key={estudiante.id}>
                                        {estudiante.Persona.apellido_paterno} {estudiante.Persona.apellido_materno}, {estudiante.Persona.nombres}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}