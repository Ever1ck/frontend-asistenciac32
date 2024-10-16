'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Component() {

    const [dialogOpen, setDialogOpen] = useState(false)
    const [cursoSeleccionado, setCursoSeleccionado] = useState('')
    const [docenteSeleccionado, setDocenteSeleccionado] = useState('')
    const [turnoSeleccionado, setTurnoSeleccionado] = useState('')
    const [horarioSeleccionado, setHorarioSeleccionado] = useState<{ [key: string]: boolean }>({})
    const router = useRouter()

    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
    const turnos = ['Mañana', 'Tarde']
    const horasMañana = [
        '1ra', '2da', '3ra', '4ta',
        'Recreo',
        '5ta', '6ta', '7ma'
    ]
    const horasTarde = [
        '8va', '9na', '10ma', '11va',
        'Recreo',
        '12va', '13va', '14va'
    ]

    const horarioDia = {
        Lun: Array(8).fill(''),
        Mar: Array(8).fill(''),
        Mié: Array(8).fill(''),
        Jue: Array(8).fill(''),
        Vie: Array(8).fill('')
    }

    const horarioTarde = {
        Lun: Array(8).fill(''),
        Mar: Array(8).fill(''),
        Mié: Array(8).fill(''),
        Jue: Array(8).fill(''),
        Vie: Array(8).fill('')
    }

    const alumnos = [
        'Ana García', 'Carlos Pérez', 'Elena Rodríguez', 'David Martínez', 'Sofía López',
        'Miguel Sánchez', 'Laura Fernández', 'Pablo Díaz', 'Isabel Torres', 'Javier Ruiz'
    ]

    const cursos = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia', 'Arte', 'Educación Física', 'Inglés', 'Música', 'Computación']
    const docentes = ['Prof. María González', 'Prof. Juan Pérez', 'Prof. Ana Rodríguez', 'Prof. Carlos Sánchez', 'Prof. Laura Martínez']

    const handleAgregarCurso = () => {
        if (cursoSeleccionado && docenteSeleccionado && turnoSeleccionado && Object.keys(horarioSeleccionado).length > 0) {
            console.log('Curso agregado:', cursoSeleccionado, 'Docente:', docenteSeleccionado, 'Turno:', turnoSeleccionado, 'Horario:', horarioSeleccionado)
            // Aquí iría la lógica para agregar el curso al horario
            setDialogOpen(false)
        }
    }

    const resetForm = () => {
        setCursoSeleccionado('')
        setDocenteSeleccionado('')
        setTurnoSeleccionado('')
        setHorarioSeleccionado({})
    }

    const toggleHorario = (dia: string, hora: number) => {
        setHorarioSeleccionado(prev => {
            const newHorario = { ...prev }
            const key = `${dia}-${hora}`
            if (newHorario[key as string]) {
                delete newHorario[key]
            } else {
                newHorario[key] = true
            }
            return newHorario
        })
    }

    const renderHorarioTable = (horas: string[], horario: { [key: string]: string[] }, titulo: string) => (
        <Card className="mt-6">
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
                                    <TableCell>{hora}</TableCell>
                                    {diasSemana.map((dia) => (
                                        <TableCell key={`${dia}-${index}`}>{horario[dia][index]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <Button className="mt-4" onClick={() => console.log('Agregar nuevo turno')}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Turno
                </Button>
            </CardContent>
        </Card>
    )

    const handleReturnToPreviousPage = () => {
        router.back()
    }

    return (
        <div className="container mx-auto p-4">
            <Button variant="outline" className="mb-4" onClick={handleReturnToPreviousPage}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
            </Button>

            <h1 className="text-3xl font-bold mb-6">Grado Académico: QUINTO A</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Sección</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Grado:</strong> Quinto</p>
                        <p><strong>Sección:</strong> A</p>
                        <p><strong>Tutor:</strong> Prof. María González</p>
                        <p><strong>Aula:</strong> 501</p>
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
                                                {cursos.map((curso) => (
                                                    <SelectItem key={curso} value={curso}>{curso}</SelectItem>
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
                                                {docentes.map((docente) => (
                                                    <SelectItem key={docente} value={docente}>{docente}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="turno" className="text-right">
                                            Turno
                                        </Label>
                                        <Select value={turnoSeleccionado} onValueChange={(value) => setTurnoSeleccionado(value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Seleccionar turno" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {turnos.map((turno) => (
                                                    <SelectItem key={turno} value={turno}>{turno}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {turnoSeleccionado && (
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
                                                        {(turnoSeleccionado === 'Mañana' ? horasMañana : horasTarde).map((hora, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{hora}</TableCell>
                                                                {diasSemana.map((dia) => (
                                                                    <TableCell key={`${dia}-${index}`} className="text-center">
                                                                        {hora !== 'Recreo' ? (
                                                                            <Checkbox
                                                                                checked={!!horarioSeleccionado[`${dia}-${index}`]}
                                                                                onCheckedChange={() => toggleHorario(dia, index)}
                                                                            />
                                                                        ) : (
                                                                            <span className="text-muted-foreground">-</span>
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </div>
                                    )}
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

                {renderHorarioTable(horasMañana, horarioDia, "Horario de Clases - Turno Mañana")}
                {renderHorarioTable(horasTarde, horarioTarde, "Horario de Clases - Turno Tarde")}

                <Card className="md:col-span-2">
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
                                    {alumnos.map((alumno, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>{alumno}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}