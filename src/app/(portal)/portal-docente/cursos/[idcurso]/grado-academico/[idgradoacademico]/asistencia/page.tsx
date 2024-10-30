'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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

export default function AttendancePage() {
    const { data: session } = useSession()
    const params = useParams()
    const [gradoAcademico, setGradoAcademico] = useState<GradoAcademico | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attendance, setAttendance] = useState<Record<number, boolean>>({})

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
                setGradoAcademico(data)
                // Initialize attendance state
                const initialAttendance = data.Estudiante.reduce((acc: Record<number, boolean>, student: Student) => {
                    acc[student.id] = false
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

    const handleAttendanceChange = (studentId: number, isChecked: boolean) => {
        setAttendance(prev => ({ ...prev, [studentId]: isChecked }))
    }

    const handleSubmitAttendance = () => {
        // Here you would typically send the attendance data to your backend
        console.log('Attendance data:', attendance)
        // Implement the API call to save attendance data
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!gradoAcademico) return <div>No data available</div>

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Asistencia - {gradoAcademico.grado} {gradoAcademico.seccion}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p><strong>Tutor:</strong> {`${gradoAcademico.tutor.Persona.nombres} ${gradoAcademico.tutor.Persona.apellido_paterno} ${gradoAcademico.tutor.Persona.apellido_materno}`}</p>
                        <p><strong>Aula:</strong> Edificio {gradoAcademico.aula.edificio}, Piso {gradoAcademico.aula.piso}, Aula {gradoAcademico.aula.numeroAula}</p>
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
                                    <TableCell>{`${student.Persona.nombres} ${student.Persona.apellido_paterno} ${student.Persona.apellido_materno}`}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={attendance[student.id]}
                                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                                        />
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