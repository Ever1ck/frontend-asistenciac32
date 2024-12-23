import PageHeader from '@/components/incio/PageHeader'
import React from 'react'

export default function Matriculas() {
    return (
        <div>
            <PageHeader
                title="Matricula"
                imageSrc="/images/noticias-header.jpg"
                imageAlt="Estudiantes de Comercio 32"
            />
            <div className='flex-grow container mx-auto px-4 relative mt-[80px]'>
                <>
                    <h1 className="text-3xl font-bold mb-6">Matrícula</h1>
                    <p className="mb-4">Para iniciar el proceso de matrícula, por favor siga los siguientes pasos:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Descargue y complete el formulario de inscripción</li>
                        <li>Reúna los documentos necesarios (certificado de nacimiento, boletín de calificaciones, etc.)</li>
                        <li>Agende una cita con nuestra oficina de admisiones</li>
                        <li>Asista a la cita con todos los documentos requeridos</li>
                    </ol>
                </>
            </div>
        </div>
    )
}
