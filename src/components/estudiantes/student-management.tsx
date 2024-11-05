'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Edit, UserCheck, UserMinus } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"

type Student = {
    id: number
    codigo_matricula: string
    GradoAcademico_id?: number
    EstadoEstudiante: string
    dni: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    telefono: string
    direccion: string
    sexo: string
    fecha_nacimiento: string
}

type StudentFormData = {
    codigo_matricula: string
    GradoAcademico_id?: number
    includeGradoAcademico: boolean
    dni: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    telefono: string
    direccion: string
    sexo: 'Masculino' | 'Femenino'
    dia: string
    mes: string
    anio: string
}

const dias = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
]
const anios = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

export default function StudentManagement({ initialStudents }: { initialStudents: Student[] }) {
    const [students, setStudents] = useState<Student[]>(initialStudents)
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('personal')

    const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<StudentFormData>({
        defaultValues: {
            includeGradoAcademico: false
        }
    })

    const includeGradoAcademico = watch('includeGradoAcademico')

    const filteredStudents = students.filter(student =>
        student.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.codigo_matricula.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        if (!isDialogOpen) {
            reset({
                includeGradoAcademico: false
            })
            setActiveTab('personal')
        }
    }, [isDialogOpen, reset])

    const onSubmit = async (data: StudentFormData) => {
        const personalFieldsComplete = Object.entries({
            dni: data.dni,
            nombres: data.nombres,
            apellido_paterno: data.apellido_paterno,
            apellido_materno: data.apellido_materno,
            telefono: data.telefono,
            direccion: data.direccion,
            sexo: data.sexo,
            dia: data.dia,
            mes: data.mes,
            anio: data.anio
        }).every(([key, value]) => value !== undefined && value !== '')

        const academicFieldsComplete = data.codigo_matricula !== '' &&
            (!data.includeGradoAcademico || (data.includeGradoAcademico && data.GradoAcademico_id !== undefined))

        if (!personalFieldsComplete) {
            toast({
                title: "Error",
                description: "Faltan campos en la pestaña de Datos Personales",
                variant: "destructive",
            })
            setActiveTab('personal')
            return
        }

        if (!academicFieldsComplete) {
            toast({
                title: "Error",
                description: "Faltan campos en la pestaña de Datos Académicos",
                variant: "destructive",
            })
            setActiveTab('academic')
            return
        }

        const fechaNacimiento = `${data.anio}-${data.mes}-${data.dia}T00:00:00.000Z`
        const studentData = {
            codigo_matricula: data.codigo_matricula,
            ...(data.includeGradoAcademico && { GradoAcademico_id: data.GradoAcademico_id }),
            dni: data.dni,
            nombres: data.nombres,
            apellido_paterno: data.apellido_paterno,
            apellido_materno: data.apellido_materno,
            telefono: data.telefono,
            direccion: data.direccion,
            sexo: data.sexo,
            fecha_nacimiento: fechaNacimiento
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes/estudiantepersona`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            })

            if (!res.ok) throw new Error('Failed to add student')

            const newStudent = await res.json()
            setStudents(prevStudents => [...prevStudents, newStudent])
            setIsDialogOpen(false)
            reset({
                includeGradoAcademico: false
            })
            toast({
                title: "Estudiante añadido",
                description: "El estudiante ha sido añadido exitosamente.",
            })
        } catch (error) {
            console.error('Error adding student:', error)
            toast({
                title: "Error",
                description: "Hubo un problema al añadir el estudiante.",
                variant: "destructive",
            })
        }
    }

    const handleControlChange = (studentId: number, action: 'edit' | 'activate' | 'deactivate') => {
        console.log(`Action ${action} for student ${studentId}`)
        toast({
            title: "Acción realizada",
            description: `Se ha ${action === 'edit' ? 'editado' : action === 'activate' ? 'activado' : 'desactivado'} el estudiante.`,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Buscar estudiantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Estudiante
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Añadir Nuevo Estudiante</DialogTitle>
                        </DialogHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                                <TabsTrigger value="academic">Datos Académicos</TabsTrigger>
                            </TabsList>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                    <TabsContent value="personal">
                                        <Card>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="dni">DNI</Label>
                                                    <Input
                                                        id="dni"
                                                        {...register('dni', {
                                                            required: true,
                                                            maxLength: 8,
                                                            pattern: /^[0-9]{8}$/
                                                        })}
                                                        maxLength={8}
                                                    />
                                                    {errors.dni && errors.dni.type === "required" && (
                                                        <span className="text-sm text-red-500">Este campo es requerido</span>
                                                    )}
                                                    {errors.dni && errors.dni.type === "maxLength" && (
                                                        <span className="text-sm text-red-500">El DNI debe tener 8 dígitos</span>
                                                    )}
                                                    {errors.dni && errors.dni.type === "pattern" && (
                                                        <span className="text-sm text-red-500">El DNI debe contener solo números</span>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="nombres">Nombres</Label>
                                                    <Input id="nombres" {...register('nombres', { required: true })} />
                                                    {errors.nombres && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                                                        <Input id="apellido_paterno" {...register('apellido_paterno', { required: true })} />
                                                        {errors.apellido_paterno && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="apellido_materno">Apellido Materno</Label>
                                                        <Input id="apellido_materno" {...register('apellido_materno', { required: true })} />
                                                        {errors.apellido_materno && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="telefono">Teléfono</Label>
                                                        <Input id="telefono" {...register('telefono', { required: true })} />
                                                        {errors.telefono && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="sexo">Sexo</Label>
                                                        <Controller
                                                            name="sexo"
                                                            control={control}
                                                            rules={{ required: true }}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seleccionar sexo" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.sexo && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="direccion">Dirección</Label>
                                                    <Input id="direccion" {...register('direccion', { required: true })} />
                                                    {errors.direccion && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Fecha de Nacimiento</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Controller
                                                            name="dia"
                                                            control={control}
                                                            rules={{ required: true }}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Día" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {dias.map((dia) => (
                                                                            <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        <Controller
                                                            name="mes"
                                                            control={control}
                                                            rules={{ required: true }}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Mes" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {meses.map((mes) => (
                                                                            <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                                                                        ))}

                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        <Controller
                                                            name="anio"
                                                            control={control}
                                                            rules={{ required: true }}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Año" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {anios.map((anio) => (
                                                                            <SelectItem key={anio} value={anio}>{anio}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                    {(errors.dia || errors.mes || errors.anio) && (
                                                        <span className="text-sm text-red-500">La fecha de nacimiento es requerida</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="academic">
                                        <Card>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="codigo_matricula">Código de Matrícula</Label>
                                                    <Input id="codigo_matricula" {...register('codigo_matricula', { required: true })} />
                                                    {errors.codigo_matricula && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="includeGradoAcademico"
                                                        {...register('includeGradoAcademico')}
                                                    />
                                                    <Label htmlFor="includeGradoAcademico">Agregar Grado Académico</Label>
                                                </div>
                                                {includeGradoAcademico && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="GradoAcademico_id">Grado Académico</Label>
                                                        <Controller
                                                            name="GradoAcademico_id"
                                                            control={control}
                                                            rules={{ required: includeGradoAcademico }}
                                                            render={({ field }) => (
                                                                <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={field.value?.toString()}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seleccionar grado académico" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="1">Grado 1</SelectItem>
                                                                        <SelectItem value="2">Grado 2</SelectItem>
                                                                        <SelectItem value="3">Grado 3</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.GradoAcademico_id && <span className="text-sm text-red-500">Este campo es requerido</span>}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </ScrollArea>
                                <div className="mt-4 flex justify-end">
                                    <Button type="submit">Añadir Estudiante</Button>
                                </div>
                            </form>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código de Matrícula</TableHead>
                        <TableHead>Nombres</TableHead>
                        <TableHead>Apellidos</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                            <TableCell>{student.codigo_matricula}</TableCell>
                            <TableCell>{student.nombres}</TableCell>
                            <TableCell>{`${student.apellido_paterno} ${student.apellido_materno}`}</TableCell>
                            <TableCell>{student.dni}</TableCell>
                            <TableCell>{student.EstadoEstudiante}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => handleControlChange(student.id, 'edit')}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleControlChange(student.id, 'activate')}>
                                        <UserCheck className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleControlChange(student.id, 'deactivate')}>
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}