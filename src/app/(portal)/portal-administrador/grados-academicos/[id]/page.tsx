'use client'

import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"


interface Curso {
    id: number;
    area: {
        nombrearea: string;
    };
    DocenteCurso: {
        docente: {
            id: number;
            Persona: {
                nombres: string;
                apellido_paterno: string;
                apellido_materno: string;
            };
        };
    }[];
}

interface DocenteCurso {
    id: number;
    docente: {
        id: number;
        Persona: {
            nombres: string;
            apellido_paterno: string;
            apellido_materno: string;
        };
    };
    curso: {
        id: number;
    };
}

async function getCursos(accessToken: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cursos`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    })
    if (!res.ok) {
        throw new Error('Failed to fetch cursos')
    }
    return res.json()
}

async function getDocenteCursos(accessToken: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/docentecursos`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    })
    if (!res.ok) {
        throw new Error('Failed to fetch docente cursos')
    }
    return res.json()
}


async function getGradoAcademico(id: string, accessToken: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    })
    if (!res.ok) {
        throw new Error('Failed to fetch grado academico')
    }
    return res.json()
}

export default function GradoAcademicoPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [gradoAcademico, setGradoAcademico] = useState<GradoAcademico | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [cursos, setCursos] = useState<Curso[]>([])
    const [docenteCursos, setDocenteCursos] = useState<DocenteCurso[]>([])
    const [selectedCurso, setSelectedCurso] = useState<string>('')
    const [selectedDocente, setSelectedDocente] = useState<string>('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogStep, setDialogStep] = useState(1)
    const [selectedHours, setSelectedHours] = useState<string[]>([])
    const [selectedDay, setSelectedDay] = useState<string>('')

    interface Persona {
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
    }

    interface Estudiante {
        id: string;
        Persona: Persona;
    }

    interface Tutor {
        Persona: Persona;
    }

    interface Aula {
        edificio: string;
        piso: string;
        numeroAula: string;
    }

    interface Horario {
        id: string;
        dia: string;
        curso: {
            area: {
                nombrearea: string;
            };
        };
        horas: string[];
    }

    interface GradoAcademico {
        grado: string;
        seccion: string;
        turno: string;
        tutor: Tutor;
        aula: Aula;
        Estudiante: Estudiante[];
        Horario: Horario[];
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin')
        } else if (status === 'authenticated' && session?.user?.accessToken) {
            const fetchData = async () => {
                try {
                    const gradoData = await getGradoAcademico(params.id, session.user.accessToken)
                    setGradoAcademico(gradoData)

                    // Decodificar el accessToken para obtener el rol
                    const tokenPayload = JSON.parse(atob(session.user.accessToken.split('.')[1]))
                    setIsAdmin(tokenPayload.rol === 'Administrador')

                    const cursosData = await getCursos(session.user.accessToken)
                    setCursos(cursosData)

                    const docenteCursosData = await getDocenteCursos(session.user.accessToken)
                    setDocenteCursos(docenteCursosData)

                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching data:', error)
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [status, session, params.id, router])

    if (status === 'loading' || loading) {
        return <div>Cargando...</div>
    }

    if (!gradoAcademico) {
        return <div>No se pudo cargar la información del grado académico.</div>
    }

    const estudiantesOrdenados = [...gradoAcademico.Estudiante].sort((a, b) => {
        const apellidoA = `${a.Persona.apellido_paterno} ${a.Persona.apellido_materno}`.toLowerCase()
        const apellidoB = `${b.Persona.apellido_paterno} ${b.Persona.apellido_materno}`.toLowerCase()
        return apellidoA.localeCompare(apellidoB)
    })

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    const horas = [
        { id: 'Primera_Hora', label: '1ra' },
        { id: 'Segunda_Hora', label: '2da' },
        { id: 'Tercera_Hora', label: '3ra' },
        { id: 'Cuarta_Hora', label: '4ta' },
        { id: 'Recreo', label: 'Recreo' },
        { id: 'Quinta_Hora', label: '5ta' },
        { id: 'Sexta_Hora', label: '6ta' },
        { id: 'Septima_Hora', label: '7ma' }
    ]

    const horariosMap = gradoAcademico.Horario.reduce((acc, horario) => {
        horario.horas.forEach(hora => {
            acc[`${horario.dia}-${hora}`] = horario.curso.area.nombrearea
        })
        return acc
    }, {} as Record<string, string>)

    // Función para obtener el rowspan de una celda
    const getRowSpan = (dia: string, horaIndex: number) => {
        if (horas[horaIndex].id === 'Recreo') return 1
        let rowSpan = 1
        const currentCourse = horariosMap[`${dia}-${horas[horaIndex].id}`]
        while (
            horaIndex + rowSpan < horas.length &&
            horas[horaIndex + rowSpan].id !== 'Recreo' &&
            horariosMap[`${dia}-${horas[horaIndex + rowSpan].id}`] === currentCourse &&
            currentCourse !== '-' && currentCourse !== undefined
        ) {
            rowSpan++
        }
        return rowSpan
    }

    // Función para verificar si una celda debe renderizarse
    const shouldRenderCell = (dia: string, horaIndex: number) => {
        if (horaIndex === 0 || horas[horaIndex].id === 'Recreo') return true
        const prevCourse = horariosMap[`${dia}-${horas[horaIndex - 1].id}`]
        const currentCourse = horariosMap[`${dia}-${horas[horaIndex].id}`]
        return prevCourse !== currentCourse || currentCourse === '-' || currentCourse === undefined
    }

    const handleGoBack = () => {
        router.back()
    }

    const handleNextStep = () => {
        setDialogStep(2)
    }

    const handlePreviousStep = () => {
        setDialogStep(1)
        setSelectedHours([])
        setSelectedDay('')
    }

    const handleHourSelection = (day: string, hour: string) => {
        const hourKey = `${day}-${hour}`
        setSelectedHours(prev => {
            const newSelection = prev.includes(hourKey)
                ? prev.filter(h => h !== hourKey)
                : [...prev, hourKey]

            // If all selections from the current day are removed, reset selectedDay
            if (newSelection.every(h => !h.startsWith(day))) {
                setSelectedDay('')
            } else {
                setSelectedDay(day)
            }

            return newSelection
        })
    }

    const isHourSelectable = (day: string, hour: string) => {
        const hourKey = `${day}-${hour}`
        return !horariosMap[hourKey] && (selectedDay === '' || selectedDay === day)
    }

    const handleAddCourse = () => {
        // Here you would implement the logic to add the course with the selected hours
        console.log("Agregar curso", { selectedCurso, selectedDocente, selectedHours })
        setIsDialogOpen(false)
        resetDialog()
    }

    const resetDialog = () => {
        setSelectedCurso('')
        setSelectedDocente('')
        setDialogStep(1)
        setSelectedHours([])
        setSelectedDay('')
    }

    const getDocentesForCurso = (cursoId: string) => {
        return docenteCursos.filter(dc => dc.curso.id === parseInt(cursoId))
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Detalles del Grado Académico</h1>
                <Button onClick={handleGoBack} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Grado:</strong> {gradoAcademico.grado}</p>
                        <p><strong>Sección:</strong> {gradoAcademico.seccion}</p>
                        <p><strong>Turno:</strong> {gradoAcademico.turno}</p>
                    </CardContent>
                </Card>

                <Card className="bg-secondary text-secondary-foreground">
                    <CardHeader>
                        <CardTitle>Tutor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{`${gradoAcademico.tutor.Persona.apellido_paterno} ${gradoAcademico.tutor.Persona.apellido_materno}, ${gradoAcademico.tutor.Persona.nombres}`}</p>
                    </CardContent>
                </Card>

                <Card className="bg-accent text-accent-foreground">
                    <CardHeader>
                        <CardTitle>Aula</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Edificio:</strong> {gradoAcademico.aula.edificio}</p>
                        <p><strong>Piso:</strong> {gradoAcademico.aula.piso}</p>
                        <p><strong>Número de Aula:</strong> {gradoAcademico.aula.numeroAula}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Estudiantes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Apellidos</TableHead>
                                    <TableHead>Nombres</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estudiantesOrdenados.map((estudiante) => (
                                    <TableRow key={estudiante.id}>
                                        <TableCell>{`${estudiante.Persona.apellido_paterno} ${estudiante.Persona.apellido_materno}`}</TableCell>
                                        <TableCell>{estudiante.Persona.nombres}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Horario</CardTitle>
                    {isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) resetDialog()
                        }}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Agregar curso
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {dialogStep === 1 ? "Seleccionar Curso y Docente" : "Seleccionar Horario"}
                                    </DialogTitle>
                                </DialogHeader>
                                {dialogStep === 1 ? (
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="curso" className="text-right">
                                                Curso
                                            </Label>
                                            <Select value={selectedCurso} onValueChange={(value) => {
                                                setSelectedCurso(value)
                                                setSelectedDocente('')
                                            }}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Seleccione un curso" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cursos.map((curso) => (
                                                        <SelectItem key={curso.id} value={curso.id.toString()}>
                                                            {curso.area.nombrearea}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {selectedCurso && (
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="docente" className="text-right">
                                                    Docente
                                                </Label>
                                                <Select value={selectedDocente} onValueChange={setSelectedDocente}>
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Seleccione un docente" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getDocentesForCurso(selectedCurso).map((dc) => (
                                                            <SelectItem key={dc.docente.id} value={dc.docente.id.toString()}>
                                                                {`${dc.docente.Persona.apellido_paterno} ${dc.docente.Persona.apellido_materno}, ${dc.docente.Persona.nombres}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="sticky top-0 bg-background">Hora</TableHead>
                                                    {dias.map((dia) => (
                                                        <TableHead key={dia} className="sticky top-0 bg-background">{dia}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {horas.map((hora) => (
                                                    <TableRow key={hora.id}>
                                                        <TableCell className="font-medium">{hora.label}</TableCell>
                                                        {dias.map((dia) => {
                                                            const hourKey = `${dia}-${hora.id}`
                                                            const isSelectable = isHourSelectable(dia, hora.id)
                                                            const isSelected = selectedHours.includes(hourKey)
                                                            return (
                                                                <TableCell
                                                                    key={hourKey}
                                                                    className={`cursor-pointer text-center ${isSelected
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : isSelectable
                                                                                ? 'hover:bg-muted'
                                                                                : 'bg-muted text-muted-foreground'
                                                                        }`}
                                                                    onClick={() => isSelectable && handleHourSelection(dia, hora.id)}
                                                                >
                                                                    {horariosMap[hourKey] || (isSelected ? '✓' : '-')}
                                                                </TableCell>
                                                            )
                                                        })}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                )}
                                <div className="flex justify-end gap-2 mt-4">
                                    {dialogStep === 2 && (
                                        <Button onClick={handlePreviousStep} variant="outline">
                                            Anterior
                                        </Button>
                                    )}
                                    {dialogStep === 1 ? (
                                        <Button onClick={handleNextStep} disabled={!selectedCurso || !selectedDocente}>
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button onClick={handleAddCourse} disabled={selectedHours.length === 0}>
                                            Agregar
                                        </Button>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hora</TableHead>
                                    {dias.map((dia) => (
                                        <TableHead key={dia}>{dia}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {horas.map((hora, horaIndex) => (
                                    <TableRow key={hora.id}>
                                        <TableCell>{hora.label}</TableCell>
                                        {hora.id === 'Recreo' ? (
                                            <TableCell colSpan={5} className="text-center font-bold bg-muted">
                                                Recreo
                                            </TableCell>
                                        ) : (
                                            dias.map((dia) => {
                                                if (shouldRenderCell(dia, horaIndex)) {
                                                    const rowSpan = getRowSpan(dia, horaIndex)
                                                    return (
                                                        <TableCell key={`${dia}-${hora.id}`} rowSpan={rowSpan}>
                                                            {horariosMap[`${dia}-${hora.id}`] || '-'}
                                                        </TableCell>
                                                    )
                                                }
                                                return null
                                            })
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}