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
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Course {
    id: number;
    area: string;
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
            area: string;
        };
        turno: string;
        dia: string;
        horaInicio: string;
        horaFin: string;
    }[];
}

export default function Component({ gradeId = 1 }: { gradeId?: number }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [cursoSeleccionado, setCursoSeleccionado] = useState('')
    const [docenteSeleccionado, setDocenteSeleccionado] = useState('')
    const [horarioSeleccionado, setHorarioSeleccionado] = useState<{ [key: string]: boolean }>({})
    const [courses, setCourses] = useState<Course[]>([])
    const [gradeInfo, setGradeInfo] = useState<GradeInfo | null>(null)
    const router = useRouter()

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    const horas = [
        'Primera_Hora', 'Segunda_Hora', 'Tercera_Hora', 'Cuarta_Hora',
        'Recreo',
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
            }
        }

        fetchGradeInfo()
        fetchCourses()
    }, [gradeId])

    const handleAgregarCurso = () => {
        if (cursoSeleccionado && docenteSeleccionado && Object.keys(horarioSeleccionado).length > 0) {
            console.log('Curso agregado:', cursoSeleccionado, 'Docente:', docenteSeleccionado, 'Horario:', horarioSeleccionado)
            // Aquí iría la lógica para agregar el curso al horario
            setDialogOpen(false)
        }
    }

    const resetForm = () => {
        setCursoSeleccionado('')
        setDocenteSeleccionado('')
        setHorarioSeleccionado({})
    }

    const toggleHorario = (dia: string, hora: number) => {
        setHorarioSeleccionado(prev => {
            const newHorario = { ...prev }
            const key = `${dia}-${hora}`
            if (newHorario[key]) {
                delete newHorario[key]
            } else {
                newHorario[key] = true
            }
            return newHorario
        })
    }

    const renderHorarioTable = () => {
        const titulo = `Horario de Clases - Turno ${gradeInfo?.turno}`

        const horarioMap = new Map()
        gradeInfo?.Horario.forEach(h => {
            const startKey = `${h.dia}-${h.horaInicio}`
            const endKey = `${h.dia}-${h.horaFin}`
            horarioMap.set(startKey, h.curso.area)
            horarioMap.set(endKey, h.curso.area)
        })

        return (
            <Card className="mt-6 w-full">
                <CardHeader>
                    <CardTitle>{titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Hora</TableHead>
                                    {diasSemana.map((dia) => (
                                        <TableHead key={dia}>{dia}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {horas.map((hora, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{hora.replace('_', ' ')}</TableCell>
                                        {diasSemana.map((dia) => (
                                            <TableCell key={`${dia}-${index}`}>
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

    const handleReturnToPreviousPage = () => {
        router.back()
    }

    return (
        <div className="grid grid-cols-1 gap-6">
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
                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            if (open) {
                                resetForm()
                            }
                            setDialogOpen(open)
                        }}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setDialogOpen(true)}>Agregar Curso al Horario</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Agregar Curso al Horario</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="curso" className="text-right">
                                            Curso
                                        </Label>
                                        <Select value={cursoSeleccionado} onValueChange={(value) => setCursoSeleccionado(value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Seleccionar curso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>{course.area}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="docente" className="text-right">
                                            Docente
                                        </Label>
                                        <Select value={docenteSeleccionado} onValueChange={(value) => setDocenteSeleccionado(value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Seleccionar docente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.find(c => c.id.toString() === cursoSeleccionado)?.DocenteCurso.map((dc) => (
                                                    <SelectItem key={dc.id} value={dc.docente.id.toString()}>
                                                        {`${dc.docente.Persona.nombres} ${dc.docente.Persona.apellido_paterno} ${dc.docente.Persona.apellido_materno}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-4">
                                        <Label className="mb-2 block">Seleccionar horario</Label>
                                        <ScrollArea className="h-[300px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Hora</TableHead>
                                                        {diasSemana.map((dia) => (
                                                            <TableHead key={dia} className="text-center">{dia}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {horas.map((hora, index) => {
                                                        if (hora === 'Recreo') {
                                                            return (
                                                                <TableRow key={hora}>
                                                                    <TableCell colSpan={6} className="text-center bg-gray-100">
                                                                        Recreo
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        }
                                                        return (
                                                            <TableRow key={hora}>
                                                                <TableCell>{hora}</TableCell>
                                                                {diasSemana.map((dia) => (
                                                                    <TableCell key={`${dia}-${index}`} className="text-center">
                                                                        <Checkbox
                                                                            checked={!!horarioSeleccionado[`${dia}-${index}`]}
                                                                            onCheckedChange={() => toggleHorario(dia, index)}
                                                                        />
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleAgregarCurso}>Agregar Curso</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>

            {renderHorarioTable()}

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Alumnos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nº</TableHead>
                                    <TableHead>Nombre del Alumno</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gradeInfo?.Estudiante.map((estudiante, index) => (
                                    <TableRow key={estudiante.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{`${estudiante.Persona.nombres} ${estudiante.Persona.apellido_paterno} ${estudiante.Persona.apellido_materno}`}</TableCell>
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