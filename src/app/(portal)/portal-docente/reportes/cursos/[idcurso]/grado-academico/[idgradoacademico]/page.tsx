'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ChevronLeft, CalendarIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Asistencia {
    id: number
    fecha: string
    curso_id: number
    gradoAcademico_id: number
    estudiante_id: number
    estadoAsistencia: 'Presente' | 'Tardanza' | 'Falta'
    estudiante_nombre: string
    curso_area: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']
const ESTADO_COLORS = {
    Presente: 'bg-green-500 text-white',
    Tardanza: 'bg-orange-500 text-white',
    Falta: 'bg-red-500 text-white'
}

export default function ReporteGradoAcademico() {
    const { data: session } = useSession()
    const router = useRouter()
    const { idcurso, idgradoacademico } = useParams()
    const [asistencias, setAsistencias] = useState<Asistencia[]>([])
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedCursoId, setSelectedCursoId] = useState<number>(Number(idcurso))
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.accessToken) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias/reportegrado/${idgradoacademico}`, {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }

                const data = await response.json()
                setAsistencias(data)
            } catch (err) {
                setError('Error fetching data')
                console.error(err)
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información de asistencias.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [session, idgradoacademico])

    const handleGoBack = () => {
        router.push('/portal-docente/reportes')
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
        }
    }

    const handleCursoSelect = (cursoId: string) => {
        setSelectedCursoId(Number(cursoId))
    }

    const filteredAsistencias = asistencias.filter(a =>
        a.curso_id === selectedCursoId &&
        format(new Date(a.fecha), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )

    const cursosObj = asistencias.reduce((acc, a) => {
        if (!acc[a.curso_id]) {
            acc[a.curso_id] = { id: a.curso_id, area: a.curso_area };
        }
        return acc;
    }, {} as Record<number, { id: number; area: string }>);

    const cursos = Object.values(cursosObj);

    const asistenciaData = [
        { name: 'Presente', value: filteredAsistencias.filter(a => a.estadoAsistencia === 'Presente').length },
        { name: 'Tardanza', value: filteredAsistencias.filter(a => a.estadoAsistencia === 'Tardanza').length },
        { name: 'Falta', value: filteredAsistencias.filter(a => a.estadoAsistencia === 'Falta').length },
    ]

    const getEstadoLabel = (estado: string) => {
        switch (estado) {
            case 'Presente': return 'P'
            case 'Tardanza': return 'T'
            case 'Falta': return 'F'
            default: return '-'
        }
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
                    <CardTitle className="text-2xl font-bold">
                        Reporte de Asistencias
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Select onValueChange={handleCursoSelect} defaultValue={selectedCursoId.toString()}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Seleccionar curso" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cursos.map((curso) => (
                                        <SelectItem key={curso.id} value={curso.id.toString()}>
                                            {curso.area}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(selectedDate, "PPP", { locale: es })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
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
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Lista de Estudiantes</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombres y Apellidos</TableHead>
                                        <TableHead className="text-right">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAsistencias.map((asistencia) => (
                                        <TableRow key={asistencia.id}>
                                            <TableCell className="font-medium">
                                                {asistencia.estudiante_nombre}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`px-2 py-1 rounded-full ${ESTADO_COLORS[asistencia.estadoAsistencia]}`}
                                                    title={asistencia.estadoAsistencia}
                                                >
                                                    {getEstadoLabel(asistencia.estadoAsistencia)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}