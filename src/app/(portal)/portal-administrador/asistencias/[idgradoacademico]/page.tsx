'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect, useReducer } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Icons
import { CalendarIcon, ChevronLeft, Users, Building2, User, Download, BookOpen, Upload, Check } from 'lucide-react'

// Types
import { Student, Course, GradoAcademico, AttendanceStatus, AttendanceRecord, ExcelInfo } from '@/types/asistencias'

// Reducer for complex state management
type State = {
    gradoAcademico: GradoAcademico | null;
    isLoading: boolean;
    error: string | null;
    attendance: Map<number, AttendanceStatus>;
    selectedDate: Date;
    isSubmitting: boolean;
    selectedCourse: Course | null;
    isUploadDialogOpen: boolean;
    excelInfo: ExcelInfo | null;
    uploadedAttendance: Map<number, AttendanceStatus>;
    isConfirmDialogOpen: boolean;
}

type Action =
    | { type: 'SET_GRADO_ACADEMICO'; payload: GradoAcademico }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_ATTENDANCE'; payload: Map<number, AttendanceStatus> }
    | { type: 'SET_SELECTED_DATE'; payload: Date }
    | { type: 'SET_SUBMITTING'; payload: boolean }
    | { type: 'SET_SELECTED_COURSE'; payload: Course | null }
    | { type: 'SET_UPLOAD_DIALOG_OPEN'; payload: boolean }
    | { type: 'SET_EXCEL_INFO'; payload: ExcelInfo | null }
    | { type: 'SET_UPLOADED_ATTENDANCE'; payload: Map<number, AttendanceStatus> }
    | { type: 'SET_CONFIRM_DIALOG_OPEN'; payload: boolean }
    | { type: 'RESET_UPLOAD_STATE' }

const initialState: State = {
    gradoAcademico: null,
    isLoading: true,
    error: null,
    attendance: new Map(),
    selectedDate: startOfDay(new Date()),
    isSubmitting: false,
    selectedCourse: null,
    isUploadDialogOpen: false,
    excelInfo: null,
    uploadedAttendance: new Map(),
    isConfirmDialogOpen: false,
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_GRADO_ACADEMICO':
            return { ...state, gradoAcademico: action.payload }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_ERROR':
            return { ...state, error: action.payload }
        case 'SET_ATTENDANCE':
            return { ...state, attendance: action.payload }
        case 'SET_SELECTED_DATE':
            return { ...state, selectedDate: action.payload }
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload }
        case 'SET_SELECTED_COURSE':
            return { ...state, selectedCourse: action.payload }
        case 'SET_UPLOAD_DIALOG_OPEN':
            return { ...state, isUploadDialogOpen: action.payload }
        case 'SET_EXCEL_INFO':
            return { ...state, excelInfo: action.payload }
        case 'SET_UPLOADED_ATTENDANCE':
            return { ...state, uploadedAttendance: action.payload }
        case 'SET_CONFIRM_DIALOG_OPEN':
            return { ...state, isConfirmDialogOpen: action.payload }
        case 'RESET_UPLOAD_STATE':
            return {
                ...state,
                excelInfo: null,
                uploadedAttendance: new Map(),
            }
        default:
            return state
    }
}

export default function AttendancePage() {
    const { data: session } = useSession()
    const { idgradoacademico } = useParams()
    const router = useRouter()

    const [state, dispatch] = useReducer(reducer, initialState)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Memoized values
    const hasChanges = useMemo(() => {
        if (!state.gradoAcademico) return false
        return state.gradoAcademico.Estudiante.some(student =>
            state.attendance.get(student.id) !== state.uploadedAttendance.get(student.id)
        )
    }, [state.attendance, state.uploadedAttendance, state.gradoAcademico])

    const attendanceRegistered = useMemo(() => state.attendance.size > 0, [state.attendance])

    // API calls
    const fetchGradoAcademico = useCallback(async () => {
        if (!session?.user?.accessToken) {
            console.error("No hay token de acceso disponible")
            dispatch({ type: 'SET_LOADING', payload: false })
            dispatch({ type: 'SET_ERROR', payload: "No se pudo autenticar. Por favor, inicie sesión nuevamente." })
            return
        }

        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gradosacademicos/${idgradoacademico}`, {
                headers: { Authorization: `Bearer ${session.user.accessToken}` },
            })
            if (!response.ok) throw new Error('Failed to fetch grado academico')
            const data: GradoAcademico = await response.json()
            data.Estudiante.sort((a, b) => a.Persona.apellido_paterno.localeCompare(b.Persona.apellido_paterno))
            dispatch({ type: 'SET_GRADO_ACADEMICO', payload: data })
            if (data.Horario.length > 0) {
                dispatch({ type: 'SET_SELECTED_COURSE', payload: data.Horario[0] })
            }
        } catch (err) {
            console.error('Error en fetchGradoAcademico:', err)
            dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos del grado académico. Por favor, intente nuevamente.' })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [session, idgradoacademico])

    const fetchExistingAttendance = useCallback(async () => {
        if (!session?.user?.accessToken || !state.selectedCourse || !state.gradoAcademico) return

        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias/reportegrado/${idgradoacademico}`, {
                headers: { Authorization: `Bearer ${session.user.accessToken}` },
            })
            if (!response.ok) throw new Error('Failed to fetch existing attendance')
            const data: AttendanceRecord[] = await response.json()

            const selectedDateUTC = startOfDay(state.selectedDate)

            const attendanceForSelectedDate = data.filter(record => {
                const recordDate = startOfDay(parseISO(record.fecha))
                return recordDate.getTime() === selectedDateUTC.getTime() &&
                    record.curso_id === state.selectedCourse!.curso.id
            })

            const newAttendance = new Map<number, AttendanceStatus>()
            attendanceForSelectedDate.forEach(record => {
                newAttendance.set(record.estudiante_id, record.estadoAsistencia === 'Presente' ? 'P' : record.estadoAsistencia === 'Tardanza' ? 'T' : 'F')
            })

            dispatch({ type: 'SET_ATTENDANCE', payload: newAttendance })
            dispatch({ type: 'SET_UPLOADED_ATTENDANCE', payload: new Map(newAttendance) })
        } catch (err) {
            console.error('Error fetching existing attendance:', err)
            dispatch({ type: 'SET_ERROR', payload: 'No se pudo cargar la asistencia existente. Por favor, intente nuevamente.' })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [session, idgradoacademico, state.selectedDate, state.selectedCourse, state.gradoAcademico])

    // Event Handlers
    const handleAttendanceChange = useCallback((studentId: number) => {
        dispatch({ type: 'SET_ATTENDANCE', payload: new Map(state.attendance).set(studentId, getNextStatus(state.attendance.get(studentId))) })
    }, [state.attendance])

    const getNextStatus = (currentStatus: AttendanceStatus | undefined): AttendanceStatus => {
        if (currentStatus === 'P') return 'T'
        if (currentStatus === 'T') return 'F'
        return 'P'
    }

    const handleSubmitAttendance = useCallback(async () => {
        if (!state.gradoAcademico || state.isSubmitting || !state.selectedCourse) return
        dispatch({ type: 'SET_SUBMITTING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })

        const attendanceData = Array.from(state.attendance.entries()).map(([studentId, status]) => ({
            fecha: format(state.selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            curso_id: state.selectedCourse!.curso.id,
            gradoAcademico_id: parseInt(idgradoacademico as string),
            estudiante_id: studentId,
            estadoAsistencia: status === 'P' ? 'Presente' : status === 'T' ? 'Tardanza' : 'Falta'
        }))

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify(attendanceData),
            })

            if (!response.ok) throw new Error('Failed to submit attendance')

            toast({ title: "Éxito", description: "La asistencia se ha guardado correctamente para todos los estudiantes." })
            await fetchExistingAttendance()
        } catch (error) {
            console.error('Error al enviar las asistencias:', error)
            dispatch({ type: 'SET_ERROR', payload: "Hubo un problema al guardar la asistencia. Por favor, inténtelo de nuevo." })
            toast({
                title: "Error",
                description: "Hubo un problema al guardar la asistencia. Por favor, inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false })
        }
    }, [state.gradoAcademico, state.isSubmitting, state.selectedCourse, state.attendance, state.selectedDate, idgradoacademico, session, fetchExistingAttendance])

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })

            const infoSheet = workbook.Sheets['Información']
            const infoData = XLSX.utils.sheet_to_json(infoSheet, { header: 1 }) as string[][]

            const newExcelInfo: ExcelInfo = {
                grado: infoData[1][1],
                seccion: infoData[2][1],
                tutor: infoData[3][1],
                aula: infoData[4][1],
                curso: infoData[5][1],
                fecha: infoData[6][1],
            }
            dispatch({ type: 'SET_EXCEL_INFO', payload: newExcelInfo })

            const studentSheet = workbook.Sheets['Lista de Estudiantes']
            const students = XLSX.utils.sheet_to_json(studentSheet, { header: 1 }) as string[][]

            const newAttendance = new Map<number, AttendanceStatus>()
            students.slice(1).forEach(row => {
                const [id, , , , status] = row
                newAttendance.set(parseInt(id), status as AttendanceStatus)
            })
            dispatch({ type: 'SET_UPLOADED_ATTENDANCE', payload: newAttendance })
        }
        reader.readAsArrayBuffer(file)
    }, [])

    const handleConfirmUpload = useCallback(() => {
        if (!state.excelInfo || !state.gradoAcademico) return
        dispatch({ type: 'SET_CONFIRM_DIALOG_OPEN', payload: true })
    }, [state.excelInfo, state.gradoAcademico])

    const handleFinalConfirmation = useCallback(async () => {
        if (!state.excelInfo || !state.gradoAcademico || !session?.user?.accessToken) return

        const matchingCourse = state.gradoAcademico.Horario.find(course =>
            course.curso.area.nombrearea.toLowerCase() === state.excelInfo!.curso.toLowerCase()
        )
        if (matchingCourse) {
            dispatch({ type: 'SET_SELECTED_COURSE', payload: matchingCourse })
            dispatch({ type: 'SET_ATTENDANCE', payload: state.uploadedAttendance })
            const selectedDate = parseISO(state.excelInfo.fecha)
            dispatch({ type: 'SET_SELECTED_DATE', payload: selectedDate })

            // Prepare attendance data for submission
            const attendanceData = Array.from(state.uploadedAttendance.entries()).map(([studentId, status]) => ({
                fecha: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                curso_id: matchingCourse.curso.id,
                gradoAcademico_id: parseInt(idgradoacademico as string),
                estudiante_id: studentId,
                estadoAsistencia: status === 'P' ? 'Presente' : status === 'T' ? 'Tardanza' : 'Falta'
            }))

            try {
                // Send attendance data one by one
                for (const attendance of attendanceData) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                        body: JSON.stringify(attendance),
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to submit attendance for student ${attendance.estudiante_id}`)
                    }
                }

                dispatch({ type: 'SET_UPLOAD_DIALOG_OPEN', payload: false })
                dispatch({ type: 'SET_CONFIRM_DIALOG_OPEN', payload: false })
                toast({
                    title: "Éxito",
                    description: "La asistencia se ha cargado y registrado correctamente desde el archivo.",
                })
                await fetchExistingAttendance()
            } catch (error) {
                console.error('Error al enviar las asistencias:', error)
                toast({
                    title: "Error",
                    description: "Hubo un problema al registrar la asistencia. Por favor, inténtelo de nuevo.",
                    variant: "destructive",
                })
            }
        } else {
            toast({
                title: "Error",
                description: "No se encontró un curso coincidente en el grado académico.",
                variant: "destructive",
            })
        }
    }, [state.excelInfo, state.gradoAcademico, state.uploadedAttendance, idgradoacademico, session, fetchExistingAttendance])

    const resetUploadState = useCallback(() => {
        dispatch({ type: 'RESET_UPLOAD_STATE' })
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [])

    // Effects
    useEffect(() => {
        fetchGradoAcademico()
    }, [fetchGradoAcademico])

    useEffect(() => {
        if (state.gradoAcademico && state.selectedCourse) {
            fetchExistingAttendance()
        }
    }, [fetchExistingAttendance, state.gradoAcademico, state.selectedCourse])

    // Render
    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                <p className="ml-4">Cargando...</p>
            </div>
        )
    }
    if (!session) {
        return <div className="text-center p-4">No hay sesión activa. Por favor, inicie sesión.</div>
    }
    if (state.error) {
        return <div className="text-center p-4 text-red-500">{state.error}</div>
    }
    if (!state.gradoAcademico) return <div className="text-center p-4">No se encontraron datos del grado académico</div>

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <Card className="mb-8">
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <CardTitle className="text-2xl font-bold mb-2 sm:mb-0">Asistencia - {state.gradoAcademico.grado} {state.gradoAcademico.seccion}</CardTitle>
                        <Button onClick={() => router.back()} variant="outline" size="sm" className="w-full sm:w-auto">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Regresar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center p-2 bg-gray-100 rounded-lg">
                            <User className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tutor</p>
                                <p className="text-sm">{`${state.gradoAcademico.tutor.Persona.nombres} ${state.gradoAcademico.tutor.Persona.apellido_paterno} ${state.gradoAcademico.tutor.Persona.apellido_materno}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-100 rounded-lg">
                            <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Aula</p>
                                <p className="text-sm">Edificio {state.gradoAcademico.aula.edificio}, Piso {state.gradoAcademico.aula.piso}, Aula {state.gradoAcademico.aula.numeroAula}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-100 rounded-lg">
                            <Users className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Estudiantes</p>
                                <p className="text-sm">{state.gradoAcademico.Estudiante.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-100 rounded-lg">
                            <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Curso</p>
                                <p className="text-sm">{state.selectedCourse?.curso.area.nombrearea || 'Seleccione un curso'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={"w-full sm:w-[240px] justify-start text-left font-normal"}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(state.selectedDate, "PPP", { locale: es })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={state.selectedDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                dispatch({ type: 'SET_SELECTED_DATE', payload: startOfDay(date) })
                                            }
                                        }}
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Select
                                value={state.selectedCourse?.id.toString()}
                                onValueChange={(value) => {
                                    const course = state.gradoAcademico!.Horario.find(c => c.id.toString() === value)
                                    if (course) {
                                        dispatch({ type: 'SET_SELECTED_COURSE', payload: course })
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[240px]">
                                    <SelectValue placeholder="Seleccionar curso" />
                                </SelectTrigger>
                                <SelectContent>
                                    {state.gradoAcademico.Horario.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.curso.area.nombrearea || `Curso ${course.curso.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button onClick={() => {
                                const workbook = XLSX.utils.book_new()
                                const infoSheet = XLSX.utils.aoa_to_sheet([
                                    ['Información del Grado Académico'],
                                    ['Grado', state.gradoAcademico!.grado],
                                    ['Sección', state.gradoAcademico!.seccion],
                                    ['Tutor', `${state.gradoAcademico!.tutor.Persona.nombres} ${state.gradoAcademico!.tutor.Persona.apellido_paterno} ${state.gradoAcademico!.tutor.Persona.apellido_materno}`],
                                    ['Aula', `Edificio ${state.gradoAcademico!.aula.edificio}, Piso ${state.gradoAcademico!.aula.piso}, Aula ${state.gradoAcademico!.aula.numeroAula}`],
                                    ['Curso', state.selectedCourse?.curso.area.nombrearea || ''],
                                    ['Fecha', format(state.selectedDate, 'yyyy-MM-dd')]
                                ])
                                XLSX.utils.book_append_sheet(workbook, infoSheet, "Información")

                                const studentSheet = XLSX.utils.aoa_to_sheet([
                                    ['ID', 'Apellido Paterno', 'Apellido Materno', 'Nombres', 'Asistencia (P/T/F)'],
                                    ...state.gradoAcademico!.Estudiante.map(student => [
                                        student.id,
                                        student.Persona.apellido_paterno,
                                        student.Persona.apellido_materno,
                                        student.Persona.nombres,
                                        ''
                                    ])
                                ])
                                XLSX.utils.book_append_sheet(workbook, studentSheet, "Lista de Estudiantes")

                                XLSX.writeFile(workbook, `Plantilla_Asistencia_${state.gradoAcademico!.grado}_${state.gradoAcademico!.seccion}_${format(state.selectedDate, 'yyyy-MM-dd')}.xlsx`)
                            }} variant="outline" className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Plantilla
                            </Button>
                            <Button onClick={() => dispatch({ type: 'SET_UPLOAD_DIALOG_OPEN', payload: true })} variant="outline" className="w-full sm:w-auto">
                                <Upload className="mr-2 h-4 w-4" />
                                Subir Asistencia
                            </Button>
                            {attendanceRegistered ? (
                                <>
                                    <Button onClick={handleSubmitAttendance} disabled={state.isSubmitting || !hasChanges} className="w-full sm:w-auto">
                                        {state.isSubmitting ? 'Guardando...' : 'Guardar Asistencia'}
                                    </Button>
                                    {hasChanges && (
                                        <Button onClick={() => dispatch({ type: 'SET_ATTENDANCE', payload: state.uploadedAttendance })} variant="outline" className="w-full sm:w-auto">
                                            Cancelar
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button onClick={() => {
                                    const newAttendance = new Map<number, AttendanceStatus>()
                                    state.gradoAcademico!.Estudiante.forEach(student => newAttendance.set(student.id, 'P'))
                                    dispatch({ type: 'SET_ATTENDANCE', payload: newAttendance })
                                }} className="w-full sm:w-auto">
                                    Registrar Asistencia
                                </Button>
                            )}
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-24rem)] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">N°</TableHead>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead className="w-[100px] text-right">Asistencia</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {state.gradoAcademico.Estudiante.map((student, index) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{`${student.Persona.apellido_paterno} ${student.Persona.apellido_materno}, ${student.Persona.nombres}`}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                className={`w-10 h-10 ${state.attendance.get(student.id) === 'P'
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : state.attendance.get(student.id) === 'T'
                                                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                        : state.attendance.get(student.id) === 'F'
                                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                                            : 'bg-gray-300 text-gray-600'
                                                    }`}
                                                onClick={() => handleAttendanceChange(student.id)}
                                            >
                                                {state.attendance.get(student.id) || '-'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog open={state.isUploadDialogOpen} onOpenChange={(open) => {
                if (!open) resetUploadState()
                dispatch({ type: 'SET_UPLOAD_DIALOG_OPEN', payload: open })
            }}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Subir Asistencia</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                const file = e.dataTransfer.files[0]
                                if (file && fileInputRef.current) {
                                    const dataTransfer = new DataTransfer()
                                    dataTransfer.items.add(file)
                                    fileInputRef.current.files = dataTransfer.files
                                    handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>)
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".xlsx,.xls"
                                className="hidden"
                            />
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                Haga clic o arrastre y suelte el archivo de asistencia aquí
                            </p>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">Información del archivo</h3>
                            {state.excelInfo ? (
                                <div className="space-y-2">
                                    <p><strong>Grado:</strong> {state.excelInfo.grado}</p>
                                    <p><strong>Sección:</strong> {state.excelInfo.seccion}</p>
                                    <p><strong>Tutor:</strong> {state.excelInfo.tutor}</p>
                                    <p><strong>Aula:</strong> {state.excelInfo.aula}</p>
                                    <p><strong>Curso:</strong> {state.excelInfo.curso}</p>
                                    <p><strong>Fecha:</strong> {state.excelInfo.fecha}</p>
                                    <Button onClick={handleConfirmUpload} className="w-full">
                                        <Check className="mr-2 h-4 w-4" />
                                        Confirmar y Registrar Asistencia
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-gray-500">No se ha cargado ningún archivo aún.</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={state.isConfirmDialogOpen} onOpenChange={(open) => dispatch({ type: 'SET_CONFIRM_DIALOG_OPEN', payload: open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar carga de asistencia</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro de que desea cargar esta asistencia? Esta acción sobrescribirá cualquier dato existente para la fecha y curso seleccionados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalConfirmation}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}