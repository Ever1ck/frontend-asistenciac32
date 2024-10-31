'use client'

import { useEffect, useState } from 'react'
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
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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

type AttendanceStatus = 'P' | 'T' | 'F';

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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingAttendance, setExistingAttendance] = useState<AttendanceRecord[] | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

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
    }, [session, idgradoacademico, idcurso, selectedDate])

    const fetchExistingAttendance = async (gradoAcademico: GradoAcademico) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias?fecha=${format(selectedDate, 'yyyy-MM-dd')}&curso_id=${idcurso}&gradoAcademico_id=${idgradoacademico}`, {
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            })
            if (!response.ok) {
                throw new Error('Failed to fetch existing attendance')
            }
            const data: AttendanceRecord[] = await response.json()
            setExistingAttendance(data)

            const initialAttendance = gradoAcademico.Estudiante.reduce((acc: Record<number, AttendanceStatus>, student: Student) => {
                const existingRecord = data.find(record => record.estudiante_id === student.id)
                acc[student.id] = existingRecord
                    ? (existingRecord.estadoAsistencia === 'Presente' ? 'P' : existingRecord.estadoAsistencia === 'Tardanza' ? 'T' : 'F')
                    : 'P'
                return acc
            }, {})
            setAttendance(initialAttendance)
            setHasChanges(false)
        } catch (err) {
            console.error('Error fetching existing attendance:', err)
            toast({
                title: "Error",
                description: "No se pudo cargar la asistencia existente.",
                variant: "destructive",
            })
        }
    }

    const handleAttendanceChange = (studentId: number) => {
        setAttendance(prev => {
            const currentStatus = prev[studentId]
            let newStatus: AttendanceStatus
            switch (currentStatus) {
                case 'P': newStatus = 'T'; break;
                case 'T': newStatus = 'F'; break;
                case 'F': newStatus = 'P'; break;
                default: newStatus = 'P';
            }
            return { ...prev, [studentId]: newStatus }
        })
        setHasChanges(true)
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

        console.log('Datos que se enviarán al backend:', attendanceData);

        try {
            for (const data of attendanceData) {
                console.log('Enviando datos para el estudiante:', data.estudiante_id, data);
                const existingRecord = existingAttendance?.find(record => record.estudiante_id === data.estudiante_id)
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

                console.log(`Asistencia ${method === 'PATCH' ? 'actualizada' : 'enviada'} con éxito para el estudiante ${data.estudiante_id}`);
            }

            toast({
                title: "Éxito",
                description: "La asistencia se ha guardado correctamente para todos los estudiantes.",
            });
            router.push('/portal-docente');
        } catch (error) {
            console.error('Error al enviar las asistencias:', error);
            toast({
                title: "Error",
                description: "Hubo un problema al guardar la asistencia. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
            setHasChanges(false);
        }
    };

    const getAttendanceButtonStyle = (status: AttendanceStatus) => {
        switch (status) {
            case 'P': return 'bg-green-500 hover:bg-green-600'
            case 'T': return 'bg-yellow-500 hover:bg-yellow-600'
            case 'F': return 'bg-red-500 hover:bg-red-600'
        }
    }

    const handleGoBack = () => {
        router.back()
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!gradoAcademico) return <div>No data available</div>

    return (
        <div className="container mx-auto p-4">
            <Button onClick={handleGoBack} className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" /> Regresar
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Asistencia - {gradoAcademico.grado} {gradoAcademico.seccion}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p><strong>Tutor:</strong> {`${gradoAcademico.tutor.Persona.nombres} ${gradoAcademico.tutor.Persona.apellido_paterno} ${gradoAcademico.tutor.Persona.apellido_materno}`}</p>
                        <p><strong>Aula:</strong> Edificio {gradoAcademico.aula.edificio}, Piso {gradoAcademico.aula.piso}, Aula {gradoAcademico.aula.numeroAula}</p>
                    </div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={`w-full sm:w-[280px] justify-start text-left font-normal mb-2 sm:mb-0`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(selectedDate, "PPP")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date)
                                            setHasChanges(false)
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {(hasChanges || !existingAttendance) && (
                            <Button onClick={handleSubmitAttendance} disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Asistencia'}
                            </Button>
                        )}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">N°</TableHead>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead className="w-[100px]">Asistencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradoAcademico.Estudiante.map((student, index) => (
                                <TableRow key={student.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{`${student.Persona.apellido_paterno} ${student.Persona.apellido_materno}, ${student.Persona.nombres}`}</TableCell>
                                    <TableCell>
                                        <Button
                                            className={`w-10 h-10 ${getAttendanceButtonStyle(attendance[student.id])}`}
                                            onClick={() => handleAttendanceChange(student.id)}
                                        >
                                            {attendance[student.id]}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}