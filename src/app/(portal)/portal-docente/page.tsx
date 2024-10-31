'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DocenteInfo {
    id: number;
    email: string;
    persona: {
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
        fecha_nacimiento: string;
    };
    docentecurso: Array<{
        id: number;
        docente_id: number;
        curso_id: number;
        created_at: string;
        updated_at: string;
        curso: {
            area: {
                nombrearea: string;
            };
        };
    }>;
    horario: Array<{
        dia: string;
        horas: string[];
        gradoAcademico: {
            grado: string;
            seccion: string;
            turno: string;
            id: number;
            _count: {
                Estudiante: number;
            };
        };
        curso: {
            id: number;
            area: {
                nombrearea: string;
            };
        };
    }>;
}

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const hours = ['1', '2', '3', '4', 'R', '5', '6', '7']
const timeRanges = [
    '7:30 - 8:10', '8:10 - 8:50', '8:50 - 9:30', '9:30 - 10:10',
    '10:10 - 10:20', '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:30'
]

const getHourName = (hour: number): string => {
    const hourNames = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Septima'];
    return `${hourNames[hour - 1]}_Hora`;
}

export default function Component() {
    const { data: session } = useSession()
    const [docenteInfo, setDocenteInfo] = useState<DocenteInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDocenteInfo = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentes/docenteinfo`, {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
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
            } finally {
                setIsLoading(false)
            }
        }

        if (session?.user?.accessToken) {
            fetchDocenteInfo()
        }
    }, [session])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!docenteInfo) {
        return <div>No data available</div>
    }

    const renderSchedule = (turno: string) => (
        <Table className="border-collapse">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px] text-center border-r">
                        <div>Hora</div>
                        <div className="text-xs font-normal">Horario</div>
                    </TableHead>
                    {days.map((day) => (
                        <TableHead key={day} className="text-center border-r last:border-r-0">{day}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {hours.map((hour, hourIndex) => (
                    <TableRow key={hour}>
                        <TableCell className="font-medium text-center border-r">
                            <div>{hour}</div>
                            <div className="text-xs">{timeRanges[hourIndex]}</div>
                        </TableCell>
                        {hour === 'R' ? (
                            <TableCell colSpan={5} className="text-center bg-red-100 dark:bg-red-900">
                                <span className="text-red-600 dark:text-red-100 font-semibold">RECESO</span>
                            </TableCell>
                        ) : (
                            days.map((day) => {
                                const classForThisSlot = docenteInfo.horario.find(
                                    (h) => h.dia === day && h.horas.includes(`${getHourName(hourIndex + 1)}`) && h.gradoAcademico.turno === turno
                                )
                                return (
                                    <TableCell key={day} className="text-center border-r last:border-r-0 p-0">
                                        {classForThisSlot ? (
                                            <Button variant="ghost" className="w-full h-full rounded-none hover:bg-primary/10 flex flex-col items-center justify-center">
                                                <span>{classForThisSlot.curso.area.nombrearea}</span>
                                                <span className="text-xs text-gray-500">{`${classForThisSlot.gradoAcademico.grado} | ${classForThisSlot.gradoAcademico.seccion}`}</span>
                                            </Button>
                                        ) : (
                                            <span className="block py-2">&nbsp;</span>
                                        )}
                                    </TableCell>
                                )
                            })
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 mt-5">
                <div className="w-full lg:w-2/5">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cursos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        {docenteInfo.docentecurso.map((curso) => {
                            return (
                                <Card key={curso.id}>
                                    <CardHeader>
                                        <CardTitle>{curso.curso.area.nombrearea}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {Object.values(docenteInfo.horario
                                                .filter(h => h.curso.area.nombrearea === curso.curso.area.nombrearea)
                                                .reduce((acc, h) => {
                                                    const key = `${h.gradoAcademico.grado} ${h.gradoAcademico.seccion}`;
                                                    if (!acc[key]) {
                                                        acc[key] = h.gradoAcademico;
                                                    }
                                                    return acc;
                                                }, {} as Record<string, typeof docenteInfo.horario[0]['gradoAcademico']>))
                                                .map((grado, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{`${grado.grado} ${grado.seccion}`}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                Estudiantes: {grado._count.Estudiante}
                                                            </p>
                                                        </div>
                                                        <Link href={`/portal-docente/cursos/${curso.curso_id}/grado-academico/${grado.id}/asistencia`}>
                                                            <Button variant="outline" size="sm">
                                                                <Calendar className="h-4 w-4 mr-2" /> Asistencia
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full lg:w-3/5">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Horario</h2>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Turno Día</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {renderSchedule('Dia')}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Turno Tarde</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {renderSchedule('Tarde')}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}