'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type HoraEnum = 'Primera_Hora' | 'Segunda_Hora' | 'Tercera_Hora' | 'Cuarta_Hora' | 'Quinta_Hora' | 'Sexta_Hora' | 'Septima_Hora';

interface Course {
    id: number;
    area: {
        nombrearea: string;
    }
    DocenteCurso: {
        id: number;
        docente: {
            id: number;
            Persona: {
                nombres: string;
                apellido_paterno: string;
                apellido_materno: string;
            }
        }
    }[];
}

interface GradeInfo {
    id: number;
    grado: string;
    seccion: string;
    turno: string;
    tutor: {
        Persona: {
            nombres: string;
            apellido_paterno: string;
            apellido_materno: string;
        }
    };
    aula: {
        edificio: number;
        piso: number;
        numeroAula: number;
    };
    Estudiante: {
        id: number;
        Persona: {
            nombres: string;
            apellido_paterno: string;
            apellido_materno: string;
        }
    }[];
    Horario: {
        id: number;
        gradoAcademico_id: number;
        curso: {
            id: number;
            area: {
                nombrearea: string;
            }
        };
        turno: string;
        dia: string;
        horaInicio: string;
        horaFin: string;
    }[];
}

export default function CourseScheduleManager({ gradeId = 1 }: { gradeId?: number }) {
    const [courses, setCourses] = useState<Course[]>([])
    const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null)
    const [selectedCourse, setSelectedCourse] = useState('')
    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState<{ [key: string]: HoraEnum[] }>({})

    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
    const horas: HoraEnum[] = [
        'Primera_Hora', 'Segunda_Hora', 'Tercera_Hora', 'Cuarta_Hora',
        'Quinta_Hora', 'Sexta_Hora', 'Septima_Hora'
    ]

    useEffect(() => {
        const fetchGradeInfo = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${gradeId}`)
                if (!response.ok) throw new Error('Failed to fetch grade info')
                const data = await response.json()
                setGradeInfo(data)
            } catch (error) {
                console.error('Error fetching grade info:', error)
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información del grado.",
                    variant: "destructive",
                })
            }
        }

        const fetchCourses = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos`)
                if (!response.ok) throw new Error('Failed to fetch courses')
                const data = await response.json()
                setCourses(data)
            } catch (error) {
                console.error('Error fetching courses:', error)
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los cursos.",
                    variant: "destructive",
                })
            }
        }

        fetchGradeInfo()
        fetchCourses()
    }, [gradeId])

    const toggleSchedule = (dia: string, hora: HoraEnum) => {
        setSelectedSchedule(prev => {
            const newSchedule = { ...prev }
            if (!newSchedule[dia]) {
                newSchedule[dia] = []
            }
            const index = newSchedule[dia].indexOf(hora)
            if (index > -1) {
                newSchedule[dia].splice(index, 1)
            } else {
                newSchedule[dia].push(hora)
            }
            if (newSchedule[dia].length === 0) {
                delete newSchedule[dia]
            }
            return newSchedule
        })
    }

    const handleAddCourse = async () => {
        if (selectedCourse && selectedTeacher && Object.keys(selectedSchedule).length > 0) {
            const scheduleData = Object.entries(selectedSchedule).map(([dia, horas]) => ({
                gradoAcademico_id: gradeId,
                curso_id: parseInt(selectedCourse),
                docente_id: parseInt(selectedTeacher),
                turno: gradeInfo?.turno || "Dia",
                dia,
                horas
            }));

            console.log('Data being sent to the backend:', scheduleData);

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/horarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(scheduleData),
                });

                if (!response.ok) throw new Error('Failed to add course to schedule');

                const result = await response.json();
                console.log('Server response:', result);

                toast({
                    title: "Curso agregado",
                    description: "El curso ha sido agregado al horario exitosamente.",
                });

                setDialogOpen(false);
                setScheduleDialogOpen(false);
                setSelectedCourse('');
                setSelectedTeacher('');
                setSelectedSchedule({});
                fetchGradeInfo();
            } catch (error) {
                console.error('Error adding course to schedule:', error);
                toast({
                    title: "Error",
                    description: "Hubo un problema al agregar el curso al horario.",
                    variant: "destructive",
                });
            }
        }
    };

    const renderCurrentSchedule = () => {
        const horarioMap = new Map()
        gradeInfo?.Horario.forEach(h => {
            const key = `${h.dia}-${h.horaInicio}`
            horarioMap.set(key, h.curso.area.nombrearea)
        })

        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Horario Actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Día</TableHead>
                                    {horas.map((hora) => (
                                        <TableHead key={hora}>{hora.replace('_', ' ')}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {diasSemana.map((dia) => (
                                    <TableRow key={dia}>
                                        <TableCell>{dia}</TableCell>
                                        {horas.map((hora) => (
                                            <TableCell key={`${dia}-${hora}`}>
                                                {horarioMap.get(`${dia}-${hora}`) || ''}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        )
    }

    const fetchGradeInfo = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${gradeId}`)
            if (!response.ok) throw new Error('Failed to fetch grade info')
            const data = await response.json()
            setGradeInfo(data)
        } catch (error) {
            console.error('Error fetching grade info:', error)
            toast({
                title: "Error",
                description: "No se pudo cargar la información del grado.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto p-4">
            <Button variant="outline" className="mb-4" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
            </Button>

            <h1 className="text-3xl font-bold mb-6">Grado Académico: {gradeInfo ? `${gradeInfo.grado} ${gradeInfo.seccion}` : 'Cargando...'}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Sección</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {gradeInfo ? (
                            <>
                                <p><strong>Grado:</strong> {gradeInfo.grado}</p>
                                <p><strong>Sección:</strong> {gradeInfo.seccion}</p>
                                <p><strong>Turno:</strong> {gradeInfo.turno}</p>
                                <p><strong>Tutor:</strong> {`${gradeInfo.tutor.Persona.nombres} ${gradeInfo.tutor.Persona.apellido_paterno} ${gradeInfo.tutor.Persona.apellido_materno}`}</p>
                                <p><strong>Aula:</strong> {`Edificio ${gradeInfo.aula.edificio}, Piso ${gradeInfo.aula.piso}, Aula ${gradeInfo.aula.numeroAula}`}</p>
                            </>
                        ) : (
                            <p>Cargando información...</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Agregar Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setDialogOpen(true)}>Agregar Curso al Horario</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Agregar Curso al Horario</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="course" className="text-right">
                                            Curso
                                        </Label>
                                        <Select value={selectedCourse} onValueChange={(value) => {
                                            setSelectedCourse(value)
                                            setSelectedTeacher('')
                                        }}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Seleccionar curso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>{course.area.nombrearea}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedCourse && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="teacher" className="text-right">
                                                Docente
                                            </Label>
                                            {(courses.find(c => c.id.toString() === selectedCourse)?.DocenteCurso ?? []).length > 0 ? (
                                                <Select value={selectedTeacher} onValueChange={(value) => setSelectedTeacher(value)}>
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Seleccionar docente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses.find(c => c.id.toString() === selectedCourse)?.DocenteCurso.map((dc) => (
                                                            <SelectItem key={dc.id} value={dc.docente.id.toString()}>
                                                                {`${dc.docente.Persona.nombres} ${dc.docente.Persona.apellido_paterno} ${dc.docente.Persona.apellido_materno}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Alert className="col-span-3">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Atención</AlertTitle>
                                                    <AlertDescription>
                                                        No hay docentes registrados para este curso.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setScheduleDialogOpen(true)
                                            setDialogOpen(false)
                                        }}
                                        disabled={!selectedCourse || !selectedTeacher}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={scheduleDialogOpen}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedSchedule({})
                                }
                                setScheduleDialogOpen(open)
                            }}>
                            <DialogContent className="sm:max-w-[700px]">
                                <DialogHeader>
                                    <DialogTitle>Seleccionar Horario</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <ScrollArea className="h-[400px]">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Día</TableHead>
                                                    {horas.map((hora) => (
                                                        <TableHead key={hora} className="text-center">{hora.replace('_', ' ')}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {diasSemana.map((dia) => (
                                                    <TableRow key={dia}>
                                                        <TableCell>{dia}</TableCell>
                                                        {horas.map((hora) => (
                                                            <TableCell key={`${dia}-${hora}`} className="text-center">
                                                                <Checkbox
                                                                    checked={selectedSchedule[dia]?.includes(hora)}
                                                                    onCheckedChange={() => toggleSchedule(dia, hora)}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => {
                                        setScheduleDialogOpen(false)
                                        setDialogOpen(true)
                                        setSelectedSchedule({})
                                    }}>
                                        Regresar
                                    </Button>
                                    <Button onClick={handleAddCourse} disabled={Object.keys(selectedSchedule).length === 0}>
                                        Agregar Curso
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Lista de Alumnos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nº</TableHead>
                                    <TableHead>Nombre del Alumno</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gradeInfo?.Estudiante
                                    .sort((a, b) => a.Persona.apellido_paterno.localeCompare(b.Persona.apellido_paterno))
                                    .map((estudiante, index) => (
                                        <TableRow key={estudiante.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{`${estudiante.Persona.apellido_paterno} ${estudiante.Persona.apellido_materno}, ${estudiante.Persona.nombres}`}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {renderCurrentSchedule()}
        </div>
    )
}