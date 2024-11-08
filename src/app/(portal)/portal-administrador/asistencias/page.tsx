import { Suspense } from 'react'
import { GradosAcademicos } from '@/components/asistencias/grado-academico'
import { SessionProvider } from 'next-auth/react'

export default function AsistenciasPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Grados Académicos y Secciones</h1>
            <Suspense fallback={<div>Cargando...</div>}>
                <GradosAcademicos />
            </Suspense>
        </div>
    )
}