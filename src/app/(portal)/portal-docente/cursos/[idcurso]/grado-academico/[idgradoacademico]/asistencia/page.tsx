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

export default function AttendancePage() {
    const { data: session } = useSession()
    const params = useParams()
    const router = useRouter()
    const [gradoAcademico, setGradoAcademico] = useState<GradoAcademico | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({})
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    useEffect(() => {
        const fetchGradoAcademico = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${params.idgradoacademico}`, {
                    headers: {
                        Authorization: `Bearer ${session?.user?.accessToken}`,
                    },
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch grado academico')
                }
                const data = await response.json()
                // Sort students by last name
                data.Estudiante.sort((a: Student, b: Student) =>
                    a.Persona.apellido_paterno.localeCompare(b.Persona.apellido_paterno)
                )
                setGradoAcademico(data)
                // Initialize attendance state with 'P' as default
                const initialAttendance = data.Estudiante.reduce((acc: Record<number, AttendanceStatus>, student: Student) => {
                    acc[student.id] = 'P'
                    return acc
                }, {})
                setAttendance(initialAttendance)
            } catch (err) {
                setError('Error fetching grado academico')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (session?.user?.accessToken) {
            fetchGradoAcademico()
        }
    }, [session, params.idgradoacademico])

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
    }

    const handleSubmitAttendance = () => {
        // Here you would typically send the attendance data to your backend
        console.log('Attendance data:', attendance)
        console.log('Date:', format(selectedDate, 'yyyy-MM-dd'))
        // Implement the API call to save attendance data
    }

    const getAttendanceButtonStyle = (status: AttendanceStatus) => {
        switch (status) {
            case 'P': return 'bg-green-500 hover:bg-green-600'
            case 'T': return 'bg-orange-500 hover:bg-orange-600'
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
                    <div className="mb-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={`w-[280px] justify-start text-left font-normal`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(selectedDate, "PPP")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
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
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSubmitAttendance}>Guardar Asistencia</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}