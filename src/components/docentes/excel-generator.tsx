'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

interface ExcelGeneratorProps {
    gradoAcademico: {
        grado: string
        seccion: string
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
        Estudiante: Array<{
            id: number
            Persona: {
                apellido_paterno: string
                apellido_materno: string
                nombres: string
            }
        }>
    }
    cursoArea: string
    selectedDate: Date
}

export function ExcelGenerator({ gradoAcademico, cursoArea, selectedDate }: ExcelGeneratorProps) {
    const handleDownloadTemplate = () => {
        const infoSheet = XLSX.utils.aoa_to_sheet([
            ['Información del Grado Académico'],
            ['Grado', gradoAcademico.grado],
            ['Sección', gradoAcademico.seccion],
            ['Tutor', `${gradoAcademico.tutor.Persona.nombres} ${gradoAcademico.tutor.Persona.apellido_paterno} ${gradoAcademico.tutor.Persona.apellido_materno}`],
            ['Aula', `Edificio ${gradoAcademico.aula.edificio}, Piso ${gradoAcademico.aula.piso}, Aula ${gradoAcademico.aula.numeroAula}`],
            ['Curso', cursoArea], // Aseguramos que el curso (nombrearea) se incluya aquí
            ['Fecha', format(selectedDate, 'yyyy-MM-dd')]
        ])

        const studentSheet = XLSX.utils.aoa_to_sheet([
            ['ID', 'Apellido Paterno', 'Apellido Materno', 'Nombres', 'Asistencia (P/T/F)'],
            ...gradoAcademico.Estudiante.map(student => [
                student.id,
                student.Persona.apellido_paterno,
                student.Persona.apellido_materno,
                student.Persona.nombres,
                ''
            ])
        ])

        const dataValidation = {
            type: 'list',
            allowBlank: false,
            formula1: '"P,T,F"',
            showDropDown: true
        }

        const range = XLSX.utils.decode_range(studentSheet['!ref'] || 'A1:E1')
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            const address = XLSX.utils.encode_cell({ r: R, c: 4 })
            studentSheet[address].dataValidation = dataValidation
        }

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, infoSheet, "Información")
        XLSX.utils.book_append_sheet(workbook, studentSheet, "Lista de Estudiantes")

        XLSX.writeFile(workbook, `Plantilla_Asistencia_${gradoAcademico.grado}_${gradoAcademico.seccion}_${cursoArea}_${format(selectedDate, 'yyyy-MM-dd')}.xlsx`)
    }

    return (
        <Button onClick={handleDownloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar Plantilla
        </Button>
    )
}