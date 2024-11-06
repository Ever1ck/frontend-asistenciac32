'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Pencil, Trash, Search, ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formSchema = z.object({
    codigo_matricula: z.string().regex(/^\d{4}-\d{5}$/, "El código de matrícula debe tener el formato XXXX-XXXXX"),
    dni: z.string().length(8, "El DNI debe tener exactamente 8 dígitos").regex(/^\d+$/, "El DNI solo debe contener números"),
    nombres: z.string().min(1, "El nombre es requerido"),
    apellido_paterno: z.string().min(1, "El apellido paterno es requerido"),
    apellido_materno: z.string().min(1, "El apellido materno es requerido"),
    telefono: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
    direccion: z.string().min(1, "La dirección es requerida"),
    sexo: z.enum(["Masculino", "Femenino"]),
    fecha_nacimiento_dia: z.string(),
    fecha_nacimiento_mes: z.string(),
    fecha_nacimiento_anio: z.string(),
    asignar_grado: z.boolean().default(false),
    grado: z.string().optional(),
    seccion: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface Estudiante {
    id: number
    codigo_matricula: string
    EstadoEstudiante: string
    Persona: {
        nombres: string
        apellido_paterno: string
        apellido_materno: string
        dni: string
        telefono: string
    }
}

interface GradoAcademico {
    id: number
    grado: string
    seccion: string
    turno: string
    tutor: {
        Persona: {
            nombres: string
            apellido_paterno: string
            apellido_materno: string
        }
    }
    aula: {
        edificio: number
        piso: number
        numeroAula: number
    }
}

export default function EstudiantesAdmin() {
    const { data: session } = useSession()
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [gradosAcademicos, setGradosAcademicos] = useState<GradoAcademico[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: keyof Estudiante | 'Persona.nombres' | 'Persona.apellido_paterno' | 'Persona.dni' | 'Persona.telefono'; direction: 'ascending' | 'descending' }>({ key: 'codigo_matricula', direction: 'ascending' })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codigo_matricula: "",
            dni: "",
            nombres: "",
            apellido_paterno: "",
            apellido_materno: "",
            telefono: "",
            direccion: "",
            sexo: "Masculino",
            fecha_nacimiento_dia: "",
            fecha_nacimiento_mes: "",
            fecha_nacimiento_anio: "",
            asignar_grado: false,
            grado: "",
            seccion: ""
        },
    })

    const fetchEstudiantes = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes`, {
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data: Estudiante[] = await response.json()
            setEstudiantes(data)
        } catch (error) {
            console.error('Error fetching estudiantes:', error)
            toast({
                title: "Error",
                description: "No se pudo cargar la lista de estudiantes.",
                variant: "destructive",
            })
        }
    }, [session?.user?.accessToken])

    const fetchGradosAcademicos = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos`, {
                headers: {
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                }
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data: GradoAcademico[] = await response.json()
            setGradosAcademicos(data)
        } catch (error) {
            console.error('Error fetching grados académicos:', error)
            toast({
                title: "Error",
                description: "No se pudo cargar la lista de grados académicos.",
                variant: "destructive",
            })
        }
    }, [session?.user?.accessToken])

    useEffect(() => {
        fetchEstudiantes()
        fetchGradosAcademicos()
    }, [fetchEstudiantes, fetchGradosAcademicos])

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const fechaNacimiento = parse(
                `${data.fecha_nacimiento_anio}-${data.fecha_nacimiento_mes}-${data.fecha_nacimiento_dia}`,
                'yyyy-MM-dd',
                new Date()
            )

            const dataToSend: {
                codigo_matricula: string;
                dni: string;
                nombres: string;
                apellido_paterno: string;
                apellido_materno: string;
                telefono: string;
                direccion: string;
                sexo: "Masculino" | "Femenino";
                fecha_nacimiento: string;
                GradoAcademico_id?: number;
            } = {
                codigo_matricula: data.codigo_matricula,
                dni: data.dni,
                nombres: data.nombres,
                apellido_paterno: data.apellido_paterno,
                apellido_materno: data.apellido_materno,
                telefono: data.telefono,
                direccion: data.direccion,
                sexo: data.sexo,
                fecha_nacimiento: format(fechaNacimiento, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            }

            if (data.asignar_grado && data.grado && data.seccion) {
                const gradoAcademico = gradosAcademicos.find(g => g.grado === data.grado && g.seccion === data.seccion)
                if (gradoAcademico) {
                    dataToSend.GradoAcademico_id = gradoAcademico.id
                } else {
                    throw new Error('Grado académico no encontrado')
                }
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes/estudiantepersona`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`
                },
                body: JSON.stringify(dataToSend),
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            await fetchEstudiantes()
            toast({
                title: "Éxito",
                description: "Estudiante añadido correctamente.",
            })
            form.reset()
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error adding estudiante:', error)
            toast({
                title: "Error",
                description: "No se pudo añadir el estudiante.",
                variant: "destructive",
            })
        }
    }

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            form.reset()
        }
    }

    const handleSort = (key: typeof sortConfig.key) => {
        let direction: 'ascending' | 'descending' = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    const sortedEstudiantes = [...estudiantes].sort((a, b) => {
        if (sortConfig.key === null) return 0
        const aValue = sortConfig.key.includes('.') ? a.Persona[sortConfig.key.split('.')[1] as keyof Estudiante['Persona']] : a[sortConfig.key as keyof Estudiante]
        const bValue = sortConfig.key.includes('.') ? b.Persona[sortConfig.key.split('.')[1] as keyof Estudiante['Persona']] : b[sortConfig.key as keyof Estudiante]
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
        return 0
    })

    const filteredEstudiantes = sortedEstudiantes.filter(estudiante =>
        estudiante.codigo_matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudiante.Persona.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudiante.Persona.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudiante.Persona.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudiante.Persona.dni.includes(searchTerm)
    )

    const uniqueGrados = Array.from(new Set(gradosAcademicos.map(g => g.grado)))
    const secciones = (grado: string) => Array.from(new Set(gradosAcademicos.filter(g => g.grado === grado).map(g => g.seccion)))

    return (
        <div className="container mx-auto py-10 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Administración de Estudiantes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-6">
                        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Añadir Estudiante</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Añadir Nuevo Estudiante</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <Tabs defaultValue="personal" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                                <TabsTrigger value="academico">Académico</TabsTrigger>
                                                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="personal" className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="nombres"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nombres</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="apellido_paterno"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Apellido Paterno</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="apellido_materno"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Apellido Materno</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="sexo"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Sexo</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seleccione el sexo" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                                                    <SelectItem value="Femenino">Femenino</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="dni"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>DNI</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} maxLength={8} inputMode="numeric" pattern="[0-9]*" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="fecha_nacimiento_dia"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Día</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Día" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                                                                                {day}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="fecha_nacimiento_mes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Mes</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Mes" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                                            <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                                                                {format(new Date(2000, month - 1, 1), 'MMMM', { locale: es })}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="fecha_nacimiento_anio"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Año</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Año" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                                            <SelectItem key={year} value={year.toString()}>
                                                                                {year}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="academico" className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="codigo_matricula"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Código de Matrícula</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    maxLength={10}
                                                                    onChange={(e) => {
                                                                        let value = e.target.value.replace(/[^0-9]/g, '');
                                                                        if (value.length > 4) {
                                                                            value = value.slice(0, 4) + '-' + value.slice(4);
                                                                        }
                                                                        field.onChange(value);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="asignar_grado"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel>
                                                                    Asignar Grado Académico
                                                                </FormLabel>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="grado"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Grado</FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field.value || undefined}
                                                                    disabled={!form.watch('asignar_grado')}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccione el grado" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {uniqueGrados.map((grado) => (
                                                                            <SelectItem key={grado} value={grado}>
                                                                                {grado}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="seccion"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Sección</FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field.value || undefined}
                                                                    disabled={!form.watch('asignar_grado') || !form.watch('grado')}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Seleccione la sección" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {secciones(form.watch('grado') || '').map((seccion) => (
                                                                            <SelectItem key={seccion} value={seccion}>
                                                                                {seccion}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="contacto" className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="telefono"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Teléfono</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="direccion"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Dirección</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                        <Button type="submit" className="w-full">Guardar Estudiante</Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar estudiantes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => handleSort('codigo_matricula')} className="cursor-pointer">
                                        Código {sortConfig.key === 'codigo_matricula' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('Persona.nombres')} className="cursor-pointer">
                                        Nombres {sortConfig.key === 'Persona.nombres' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('Persona.apellido_paterno')} className="cursor-pointer">
                                        Apellidos {sortConfig.key === 'Persona.apellido_paterno' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('Persona.dni')} className="cursor-pointer">
                                        DNI {sortConfig.key === 'Persona.dni' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('Persona.telefono')} className="cursor-pointer">
                                        Teléfono {sortConfig.key === 'Persona.telefono' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('EstadoEstudiante')} className="cursor-pointer">
                                        Estado {sortConfig.key === 'EstadoEstudiante' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEstudiantes.map((estudiante) => (
                                    <TableRow key={estudiante.id}>
                                        <TableCell>{estudiante.codigo_matricula}</TableCell>
                                        <TableCell>{estudiante.Persona.nombres}</TableCell>
                                        <TableCell>{`${estudiante.Persona.apellido_paterno} ${estudiante.Persona.apellido_materno}`}</TableCell>
                                        <TableCell>{estudiante.Persona.dni}</TableCell>
                                        <TableCell>{estudiante.Persona.telefono}</TableCell>
                                        <TableCell>{estudiante.EstadoEstudiante}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Editar</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        <span>Eliminar</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
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