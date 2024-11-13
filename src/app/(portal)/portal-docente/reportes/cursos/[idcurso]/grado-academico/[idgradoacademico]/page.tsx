'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { ChevronLeft, CalendarIcon, Download, FileText } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'

interface Asistencia {
    id: number
    fecha: string
    curso_id: number
    gradoAcademico_id: number
    estudiante_id: number
    estadoAsistencia: 'Presente' | 'Tardanza' | 'Falta'
    estudiante_nombre: string
    curso_area: string
}

const COLORS = ['#0070f3', '#ff0080', '#00ff00']
const ESTADO_COLORS = {
    Presente: 'bg-blue-500 text-white',
    Tardanza: 'bg-pink-500 text-white',
    Falta: 'bg-green-500 text-white'
}

export default function ReporteGradoAcademico() {
    const { data: session } = useSession()
    const router = useRouter()
    const { idcurso, idgradoacademico } = useParams()
    const [asistencias, setAsistencias] = useState<Asistencia[]>([])
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.accessToken) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/asistencias/reportegrado/${idgradoacademico}`, {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }

                const data = await response.json()
                setAsistencias(data)
            } catch (err) {
                setError('Error fetching data')
                console.error(err)
                toast({
                    title: "Error",
                    description: "No se pudo cargar la información de asistencias.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [session, idgradoacademico])

    const handleGoBack = () => {
        router.push('/portal-docente/reportes')
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
        }
    }

    const filteredAsistencias = asistencias.filter(a =>
        a.curso_id === Number(idcurso) &&
        format(new Date(a.fecha), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )

    const asistenciaData = [
        { name: 'Presente', value: filteredAsistencias.filter(a => a.estadoAsistencia === 'Presente').length },
        { name: 'Tardanza', value: filteredAsistencias.filter(a => a.estadoAsistencia === 'Tardanza').length },
        { name: 'Falta', value: filteredAsistencias.filter(a => a.estadoAsistencia === 'Falta').length },
    ]

    const getEstadoLabel = (estado: string) => {
        switch (estado) {
            case 'Presente': return 'P'
            case 'Tardanza': return 'T'
            case 'Falta': return 'F'
            default: return '-'
        }
    }

    const exportToExcel = () => {
        try {
            const excelData = filteredAsistencias.map(a => ({
                'Fecha': format(new Date(a.fecha), 'dd/MM/yyyy'),
                'Nombre del Estudiante': a.estudiante_nombre,
                'Asistencia': a.estadoAsistencia
            }))

            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(excelData)

            XLSX.utils.book_append_sheet(wb, ws, 'Asistencias')
            XLSX.writeFile(wb, `asistencias_${format(selectedDate, 'yyyy-MM-dd')}.xlsx`)

            toast({
                title: "Éxito",
                description: "El archivo de asistencias ha sido exportado a Excel.",
                variant: "default",
            })
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "No se pudo exportar el archivo de asistencias a Excel.",
                variant: "destructive",
            })
        }
    }

    const exportToPDF = async () => {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()

            // Header
            pdf.setFillColor(0, 112, 243) // Vercel blue
            pdf.rect(0, 0, pageWidth, 40, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(24)
            pdf.text('Reporte de Asistencias', pageWidth / 2, 25, { align: 'center' })

            // Subheader
            pdf.setTextColor(0, 0, 0)
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(12)
            pdf.text(`Fecha: ${format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}`, 20, 50)
            pdf.text(`Curso: ${asistencias[0]?.curso_area}`, 20, 58)

            // Chart
            if (chartRef.current) {
                const canvas = await html2canvas(chartRef.current)
                const imgData = canvas.toDataURL('image/png')
                const imgWidth = 100
                const imgHeight = (canvas.height * imgWidth) / canvas.width
                pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 70, imgWidth, imgHeight)

                // Legend
                pdf.setFontSize(10)
                asistenciaData.forEach((data, index) => {
                    pdf.setFillColor(parseInt(COLORS[index].slice(1, 3), 16), parseInt(COLORS[index].slice(3, 5), 16), parseInt(COLORS[index].slice(5, 7), 16))
                    pdf.circle((pageWidth / 2) - 40, 75 + imgHeight + (index * 8), 2, 'F')
                    pdf.text(`${data.name}: ${data.value}`, (pageWidth / 2) - 35, 77 + imgHeight + (index * 8))
                })
            }

            // Summary Table
            pdf.setFontSize(14)
            pdf.setFont("helvetica", "bold")
            pdf.text('Resumen de Asistencias', 20, 140)

            const summaryData = [
                ['Estado', 'Cantidad', 'Porcentaje'],
                ...asistenciaData.map(data => [
                    data.name,
                    data.value.toString(),
                    `${((data.value / filteredAsistencias.length) * 100).toFixed(2)}%`
                ])
            ]

            // @ts-ignore
            pdf.autoTable({
                startY: 145,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [0, 112, 243], textColor: [255, 255, 255] },
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } }
            })

            // Detailed Table
            pdf.setFontSize(14)
            pdf.setFont("helvetica", "bold")
            pdf.text('Lista Detallada de Estudiantes', 20, pdf.autoTable.previous.finalY + 20)

            const tableData = filteredAsistencias.map(a => [
                a.estudiante_nombre,
                a.estadoAsistencia
            ])

            // @ts-ignore
            pdf.autoTable({
                startY: pdf.autoTable.previous.finalY + 25,
                head: [['Nombres y Apellidos', 'Asistencia']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 112, 243], textColor: [255, 255, 255] },
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 30 } }
            })

            // Footer
            pdf.setFontSize(10)
            pdf.setTextColor(128, 128, 128)
            pdf.text(`Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm:ss")}`, 20, pageHeight - 10)
            pdf.text('Página 1 de 1', pageWidth - 40, pageHeight - 10)

            pdf.save(`asistencias_${format(selectedDate, 'yyyy-MM-dd')}.pdf`)

            toast({
                title: "Éxito",
                description: "El archivo de asistencias ha sido exportado a PDF.",
                variant: "default",
            })
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "No se pudo exportar el archivo de asistencias a PDF.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-600 p-4">{error}</div>
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Button onClick={handleGoBack} variant="outline" className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" /> Regresar
            </Button>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Reporte de Asistencias - {asistencias[0]?.curso_area}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(selectedDate, "PPP", { locale: es })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className="space-x-2">
                                <Button onClick={exportToExcel} variant="outline">
                                    <Download className="mr-2 h-4 w-4" /> Exportar a Excel
                                </Button>
                                <Button onClick={exportToPDF} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" /> Exportar a PDF
                                </Button>
                            </div>
                        </div>
                        <div ref={chartRef}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={asistenciaData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {asistenciaData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Resumen de Asistencias</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Porcentaje</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {asistenciaData.map((data) => (
                                        <TableRow key={data.name}>
                                            <TableCell>{data.name}</TableCell>
                                            <TableCell>{data.value}</TableCell>
                                            <TableCell>{((data.value / filteredAsistencias.length) * 100).toFixed(2)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Lista Detallada de Estudiantes</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombres y Apellidos</TableHead>
                                        <TableHead className="text-right">Asistencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAsistencias.map((asistencia) => (
                                        <TableRow key={asistencia.id}>
                                            <TableCell className="font-medium">
                                                {asistencia.estudiante_nombre}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`px-2 py-1 rounded-full ${ESTADO_COLORS[asistencia.estadoAsistencia]}`}
                                                    title={asistencia.estadoAsistencia}
                                                >
                                                    {getEstadoLabel(asistencia.estadoAsistencia)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}