'use client'

import React, { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { jsPDF } from "jspdf"
import 'jspdf-autotable'
import { MessageSquare } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface AttendanceRecord {
    id: number
    fecha: string
    estadoAsistencia: string
    estudiante_id: number
    estudiante_nombre: string
    curso_id: number
    curso_area: string
}

interface CourseAttendance {
    curso_id: number
    curso_area: string
    presentes: number
    faltas: number
    tardanzas: number
    justificados: number
    estudiantes: AttendanceRecord[]
}

export default function AttendanceDashboard() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date('2024-10-30'))
    const [attendanceData, setAttendanceData] = useState<CourseAttendance[]>([])

    useEffect(() => {
        fetchAttendanceData()
    }, [selectedDate])

    const fetchAttendanceData = async () => {
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0]
            const response = await fetch(`http://localhost:4000/api/asistencias/reporte/${formattedDate}`)
            const data: AttendanceRecord[] = await response.json()

            const courseAttendance = processCourseAttendance(data)
            setAttendanceData(courseAttendance)
        } catch (error) {
            console.error('Error fetching attendance data:', error)
        }
    }

    const processCourseAttendance = (data: AttendanceRecord[]): CourseAttendance[] => {
        const courseMap = new Map<number, CourseAttendance>()

        data.forEach(record => {
            if (!courseMap.has(record.curso_id)) {
                courseMap.set(record.curso_id, {
                    curso_id: record.curso_id,
                    curso_area: record.curso_area,
                    presentes: 0,
                    faltas: 0,
                    tardanzas: 0,
                    justificados: 0,
                    estudiantes: []
                })
            }

            const course = courseMap.get(record.curso_id)!
            course.estudiantes.push(record)

            switch (record.estadoAsistencia) {
                case 'Presente':
                    course.presentes++
                    break
                case 'Falta':
                    course.faltas++
                    break
                case 'Tardanza':
                    course.tardanzas++
                    break
                case 'Justificado':
                    course.justificados++
                    break
            }
        })

        return Array.from(courseMap.values())
    }

    const generateChartData = (course: CourseAttendance) => {
        return {
            labels: ['Presentes', 'Faltas', 'Tardanzas', 'Justificados'],
            datasets: [
                {
                    data: [course.presentes, course.faltas, course.tardanzas, course.justificados],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        }
    }

    const generatePDF = (course: CourseAttendance) => {
        const doc = new jsPDF()
        doc.setFontSize(18)
        doc.text('Reporte de Asistencia', 14, 22)
        doc.setFontSize(12)
        doc.text(`Fecha: ${selectedDate.toISOString().split('T')[0]}`, 14, 30)

        doc.setFontSize(16)
        doc.text(`Curso: ${course.curso_area}`, 14, 40)

        // Summary table
        doc.autoTable({
            startY: 50,
            head: [['Estado', 'Cantidad']],
            body: [
                ['Presentes', course.presentes],
                ['Faltas', course.faltas],
                ['Tardanzas', course.tardanzas],
                ['Justificados', course.justificados],
            ],
        })

        // Student details table
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Estudiante', 'Estado']],
            body: course.estudiantes.map(student => [
                student.estudiante_nombre,
                student.estadoAsistencia
            ]),
        })

        doc.save(`reporte_asistencia_${course.curso_area}_${selectedDate.toISOString().split('T')[0]}.pdf`)
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Dashboard de Asistencia</h1>
            <div className="mb-4 flex justify-center">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="p-2 border rounded"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceData.map(course => (
                    <div key={course.curso_id} className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2">{course.curso_area}</h2>
                        <div className="mb-4">
                            <Pie data={generateChartData(course)} />
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Resumen</h3>
                            <ul>
                                <li>Presentes: {course.presentes}</li>
                                <li>Faltas: {course.faltas}</li>
                                <li>Tardanzas: {course.tardanzas}</li>
                                <li>Justificados: {course.justificados}</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Detalle de Estudiantes</h3>
                            <div className="max-h-40 overflow-y-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-left">Estudiante</th>
                                            <th className="text-left">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.estudiantes.map(student => (
                                            <tr key={student.id}>
                                                <td>{student.estudiante_nombre}</td>
                                                <td>{student.estadoAsistencia}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => generatePDF(course)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                            >
                                <MessageSquare className="mr-2" />
                                Generar PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
