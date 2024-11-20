'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface AsistenciaData {
    name: string
    value: number
}

interface PDFExportButtonProps {
    asistencias: Asistencia[]
    filteredAsistencias: Asistencia[]
    asistenciaData: AsistenciaData[]
    selectedDate: Date
    chartRef: React.RefObject<HTMLDivElement>
}

const COLORS = ['#4CAF50', '#FFC107', '#F44336']
const logoc32 = '/public/logo.png'

export default function PDFExportButton({ asistencias, filteredAsistencias, asistenciaData, selectedDate, chartRef }: PDFExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Header
            pdf.setFillColor(0, 112, 243); // Vercel blue
            pdf.rect(0, 0, pageWidth, 40, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(24);
            pdf.text('Reporte de Asistencias', pageWidth / 2, 25, { align: 'center' });

            // Subheader
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text(`Fecha: ${format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}`, 20, 50);
            pdf.text(`Curso: ${asistencias[0]?.curso_area || 'No especificado'}`, pageWidth - 20, 50, { align: 'right' });

            let yPosition = 60;

            // Chart
            if (chartRef.current && filteredAsistencias.length > 0) {
                const canvas = await html2canvas(chartRef.current);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 150;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 20;

                // Legend
                pdf.setFontSize(10);
                asistenciaData.forEach((data, index) => {
                    pdf.setFillColor(parseInt(COLORS[index].slice(1, 3), 16), parseInt(COLORS[index].slice(3, 5), 16), parseInt(COLORS[index].slice(5, 7), 16));
                    pdf.circle((pageWidth / 2) - 40, yPosition + (index * 8), 2, 'F');
                    pdf.text(`${data.name}: ${data.value}`, (pageWidth / 2) - 35, yPosition + 2 + (index * 8));
                });
                yPosition += 30;
            }

            if (filteredAsistencias.length > 0) {
                // Summary Table
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                pdf.text('Resumen de Asistencias', 20, yPosition);
                yPosition += 5;

                const summaryData = [
                    ['Estado', 'Cantidad', 'Porcentaje'],
                    ...asistenciaData.map(data => [
                        data.name,
                        data.value.toString(),
                        `${((data.value / filteredAsistencias.length) * 100).toFixed(2)}%`
                    ])
                ];
                autoTable(pdf, {
                    startY: yPosition,
                    head: [summaryData[0]],
                    body: summaryData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [0, 112, 243], textColor: [255, 255, 255] },
                    styles: { fontSize: 10, cellPadding: 2 },
                    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } }
                });
            } else {
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                pdf.text('No hay asistencias registradas para este día.', 20, yPosition);
            }

            // Footer for first page
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm:ss")}`, 20, pageHeight - 10);
            pdf.text('Página 1 de 2', pageWidth - 40, pageHeight - 10);

            // Add new page for detailed list
            pdf.addPage();

            // Detailed Table
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text('Lista Detallada de Estudiantes', 20, 20);

            if (filteredAsistencias.length > 0) {
                const tableData = filteredAsistencias.map(a => [
                    a.estudiante_nombre,
                    a.estadoAsistencia
                ]);
                autoTable(pdf, {
                    startY: 30,
                    head: [['Nombres y Apellidos', 'Asistencia']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [0, 112, 243], textColor: [255, 255, 255] },
                    styles: { fontSize: 10, cellPadding: 2 },
                    columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 30 } }
                });
            } else {
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "normal");
                pdf.text('No hay asistencias registradas para este día.', 20, 40);
            }

            // Footer for second page
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm:ss")}`, 20, pageHeight - 10);
            pdf.text('Página 2 de 2', pageWidth - 40, pageHeight - 10);

            // Guardar el PDF
            pdf.save(`asistencias_${format(selectedDate, 'yyyy-MM-dd')}.pdf`);

            toast({
                title: "Éxito",
                description: "El archivo de asistencias ha sido exportado a PDF.",
                variant: "default",
            });
        } catch (err) {
            console.error('Error al exportar PDF:', err);
            toast({
                title: "Error",
                description: "No se pudo exportar el archivo de asistencias a PDF.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button onClick={exportToPDF} variant="outline" disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar a PDF'}
        </Button>
    )
}