'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Pencil, Plus, Trash, Search } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
    codigo_matricula: z.string().min(1, "El código de matrícula es requerido"),
    GradoAcademico_id: z.number().optional(),
    dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
    nombres: z.string().min(1, "El nombre es requerido"),
    apellido_paterno: z.string().min(1, "El apellido paterno es requerido"),
    apellido_materno: z.string().min(1, "El apellido materno es requerido"),
    telefono: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
    direccion: z.string().min(1, "La dirección es requerida"),
    sexo: z.enum(["Masculino", "Femenino"]),
    fecha_nacimiento: z.date()
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

export default function EstudiantesAdmin() {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: keyof Estudiante | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' })

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            codigo_matricula: "",
            GradoAcademico_id: undefined,
            dni: "",
            nombres: "",
            apellido_paterno: "",
            apellido_materno: "",
            telefono: "",
            direccion: "",
            sexo: "Masculino",
            fecha_nacimiento: new Date(),
        },
    })

    useEffect(() => {
        fetchEstudiantes()
    }, [])

    const fetchEstudiantes = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes`)
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
    }

    const onSubmit = async (values: FormValues) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes/estudiantepersona`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    fecha_nacimiento: format(values.fecha_nacimiento, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                }),
            })
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            await fetchEstudiantes()
            setIsDialogOpen(false)
            form.reset()
            toast({
                title: "Éxito",
                description: "Estudiante añadido correctamente.",
            })
        } catch (error) {
            console.error('Error adding estudiante:', error)
            toast({
                title: "Error",
                description: "No se pudo añadir el estudiante.",
                variant: "destructive",
            })
        }
    }

    const handleSort = (key: keyof Estudiante) => {
        let direction: 'ascending' | 'descending' = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    const sortedEstudiantes = [...estudiantes].sort((a, b) => {
        if (sortConfig.key === null) return 0
        const aValue = sortConfig.key.includes('.') ? a.Persona[sortConfig.key.split('.')[1] as keyof Estudiante['Persona']] : a[sortConfig.key]
        const bValue = sortConfig.key.includes('.') ? b.Persona[sortConfig.key.split('.')[1] as keyof Estudiante['Persona']] : b[sortConfig.key]
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

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Administración de Estudiantes</h1>

            <div className="flex justify-between items-center mb-5">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Añadir Estudiante</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Añadir Nuevo Estudiante</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="codigo_matricula"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código de Matrícula</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
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
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    name="fecha_nacimiento"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Seleccionar fecha</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit">Guardar Estudiante</Button>
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead onClick={() => handleSort('codigo_matricula')} className="cursor-pointer">
                            Código {sortConfig.key === 'codigo_matricula' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead onClick={() => handleSort('Persona.nombres' as keyof Estudiante)} className="cursor-pointer">
                            Nombres {sortConfig.key === 'Persona.nombres' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead onClick={() => handleSort('Persona.apellido_paterno' as keyof Estudiante)} className="cursor-pointer">
                            Apellidos {sortConfig.key === 'Persona.apellido_paterno' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead onClick={() => handleSort('Persona.dni' as keyof Estudiante)} className="cursor-pointer">
                            DNI {sortConfig.key === 'Persona.dni' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead onClick={() => handleSort('Persona.telefono' as keyof Estudiante)} className="cursor-pointer">
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
                                <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><Trash className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}