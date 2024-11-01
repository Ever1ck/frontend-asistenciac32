'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parseISO } from 'date-fns'
import { CalendarIcon, ChevronLeft, Users, Building2, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ScrollArea } from "@/components/ui/scroll-area"

interface Student {
    id: number;
    Persona: {
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
    };
}

interface GradoAcademico {
    id: number;
    grado: string;
    seccion: string;
    tutor: {
        Persona: {
            nombres: string;
            apellido_paterno: string;
            apellido_materno: string;
        };
    };
    aula: {
        edificio: number;
        piso: number;
        numeroAula: number;
    };
    Estudiante: Student[];
}

type AttendanceStatus = 'P' | 'T' | 'F' | '-';

interface AttendanceRecord {
    id: number;
    fecha: string;
    curso_id: number;
    gradoAcademico_id: number;
    estudiante_id: number;
    estadoAsistencia: 'Presente' | 'Tardanza' | 'Falta';
}

export default function AttendancePage() {
    const { data: session } = useSession()
    const { idcurso, idgradoacademico } = useParams()
    const router = useRouter()
    const [gradoAcademico, setGradoAcademico] = useState<GradoAcademico | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({})
    const [originalAttendance, setOriginalAttendance] = useState<Record<number, AttendanceStatus>>({})
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingAttendance, setExistingAttendance] = useState<AttendanceRecord[] | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [attendanceRegistered, setAttendanceRegistered] = useState(false)

    const fetchExistingAttendance = useCallback(async (gradoAcademico: GradoAcademico) => {
        if (!session?.user?.accessToken) return

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias?curso_id=${idcurso}&gradoAcademico_id=${idgradoacademico}`, {
                headers: {
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            })
            if (!response.ok) {
                throw new Error('Failed to fetch existing attendance')
            }
            const data: AttendanceRecord[] = await response.json()
            setExistingAttendance(data)

            const selectedDateString = format(selectedDate, 'yyyy-MM-dd')
            const attendanceForSelectedDate = data.filter(record =>
                format(parseISO(record.fecha), 'yyyy-MM-dd') === selectedDateString
            )

            const initialAttendance = gradoAcademico.Estudiante.reduce((acc: Record<number, AttendanceStatus>, student: Student) => {
                const existingRecord = attendanceForSelectedDate.find(record => record.estudiante_id === student.id)
                acc[student.id] = existingRecord
                    ? (existingRecord.estadoAsistencia === 'Presente' ? 'P' : existingRecord.estadoAsistencia === 'Tardanza' ? 'T' : 'F')
                    : '-'
                return acc
            }, {})
            setAttendance(initialAttendance)
            setOriginalAttendance(initialAttendance)
            setHasChanges(false)
            setAttendanceRegistered(attendanceForSelectedDate.length > 0)
        } catch (err) {
            console.error('Error fetching existing attendance:', err)
            toast({
                title: "Error",
                description: "No se pudo cargar la asistencia existente.",
                variant: "destructive",
            })
        }
    }, [session, idcurso, idgradoacademico, selectedDate])

    useEffect(() => {
        const fetchGradoAcademico = async () => {
            if (!session?.user?.accessToken) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${idgradoacademico}`, {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch grado academico')
                }
                const data = await response.json()
                data.Estudiante.sort((a: Student, b: Student) =>
                    a.Persona.apellido_paterno.localeCompare(b.Persona.apellido_paterno)
                )
                setGradoAcademico(data)
                await fetchExistingAttendance(data)
            } catch (err) {
                setError('Error fetching grado academico')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGradoAcademico()
    }, [session, idgradoacademico, fetchExistingAttendance])

    const handleAttendanceChange = (studentId: number) => {
        if (!attendanceRegistered) return;
        setAttendance(prev => {
            const currentStatus = prev[studentId]
            let newStatus: AttendanceStatus
            switch (currentStatus) {
                case 'P': newStatus = 'T'; break;
                case 'T': newStatus = 'F'; break;
                case 'F': newStatus = 'P'; break;
                default: newStatus = 'P';
            }
            const newAttendance = { ...prev, [studentId]: newStatus }
            setHasChanges(!Object.entries(newAttendance).every(([id, status]) => originalAttendance[parseInt(id)] === status))
            return newAttendance
        })
    }

    const handleSubmitAttendance = async () => {
        if (!gradoAcademico || isSubmitting) return;

        setIsSubmitting(true);

        const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
            fecha: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            curso_id: parseInt(idcurso as string),
            gradoAcademico_id: parseInt(idgradoacademico as string),
            estudiante_id: parseInt(studentId),
            estadoAsistencia: status === 'P' ? 'Presente' : status === 'T' ? 'Tardanza' : 'Falta'
        }));

        try {
            for (const data of attendanceData) {
                const existingRecord = existingAttendance?.find(record =>
                    record.estudiante_id === data.estudiante_id &&
                    format(parseISO(record.fecha), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                )
                const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias${existingRecord ? `/${existingRecord.id}` : ''}`
                const method = existingRecord ? 'PATCH' : 'POST'

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(`Failed to submit attendance for student ${data.estudiante_id}`);
                }
            }

            toast({
                title: "Éxito",
                description: "La asistencia se ha guardado correctamente para todos los estudiantes.",
            });
            await fetchExistingAttendance(gradoAcademico);
        } catch (error) {
            console.error('Error al enviar las asistencias:', error);
            toast({
                title: "Error",
                description: "Hubo un problema al guardar la asistencia. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterAttendance = () => {
        setAttendance(prev => {
            const newAttendance: Record<number, AttendanceStatus> = {};
            for (const studentId in prev) {
                newAttendance[studentId] = 'P';
            }
            return newAttendance;
        });
        setAttendanceRegistered(true);
        setHasChanges(true);
    };

    const handleCancelAttendance = () => {
        setAttendance(originalAttendance);
        setHasChanges(false);
    };

    const getAttendanceButtonStyle = (status: AttendanceStatus) => {
        switch (status) {
            case 'P': return 'bg-green-500 hover:bg-green-600 text-white'
            case 'T': return 'bg-yellow-500 hover:bg-yellow-600 text-white'
            case 'F': return 'bg-red-500 hover:bg-red-600 text-white'
            default: return 'bg-gray-300 text-gray-600'
        }
    }

    const handleGoBack = () => {
        router.back()
    }

    if (isLoading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    )
    if (error) return <div className="text-center text-red-600 p-4">{error}</div>
    if (!gradoAcademico) return <div className="text-center p-4">No data available</div>

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card className="mb-8">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Asistencia - {gradoAcademico.grado} {gradoAcademico.seccion}</CardTitle>
                    <Button onClick={handleGoBack} variant="outline" size="sm">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Regresar
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tutor</p>
                                <p className="text-sm">{`${gradoAcademico.tutor.Persona.nombres} ${gradoAcademico.tutor.Persona.apellido_paterno} ${gradoAcademico.tutor.Persona.apellido_materno}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Aula</p>
                                <p className="text-sm">Edificio {gradoAcademico.aula.edificio}, Piso {gradoAcademico.aula.piso}, Aula {gradoAcademico.aula.numeroAula}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Estudiantes</p>
                                <p className="text-sm">{gradoAcademico.Estudiante.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={"w-full sm:w-[240px] justify-start text-left font-normal"}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(selectedDate, "PPP")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date)
                                            fetchExistingAttendance(gradoAcademico)
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <div className="flex space-x-2  w-full sm:w-auto">
                            {attendanceRegistered ? (
                                <>
                                    <Button onClick={handleSubmitAttendance} disabled={isSubmitting || !hasChanges} className="flex-1 sm:flex-none">
                                        {isSubmitting ? 'Guardando...' : 'Guardar Asistencia'}
                                    </Button>
                                    {hasChanges && (
                                        <Button onClick={handleCancelAttendance} variant="outline" className="flex-1 sm:flex-none">
                                            Cancelar
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button onClick={handleRegisterAttendance} className="w-full sm:w-auto">
                                    Registrar Asistencia
                                </Button>
                            )}
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-24rem)] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">N°</TableHead>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead className="w-[100px] text-right">Asistencia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gradoAcademico.Estudiante.map((student, index) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{`${student.Persona.apellido_paterno} ${student.Persona.apellido_materno}, ${student.Persona.nombres}`}</TableCell>
                                        <TableCell className="text-right">
                                            {attendance[student.id] === '-' ? (
                                                <span className="inline-block w-10 h-10 leading-10 text-center bg-gray-200 rounded-md">-</span>
                                            ) : (
                                                <Button
                                                    className={`w-10 h-10 ${getAttendanceButtonStyle(attendance[student.id])}`}
                                                    onClick={() => handleAttendanceChange(student.id)}
                                                >
                                                    {attendance[student.id]}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}