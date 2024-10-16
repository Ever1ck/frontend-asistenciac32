import PageHeader from '@/components/incio/PageHeader'
import React from 'react'

export default function Contactenos() {
  return (
    <div>
      <PageHeader
        title="Contactenos"
        imageSrc="/images/noticias-header.jpg"
        imageAlt="Estudiantes de Comercio 32"
      />
    <div className='flex-grow container mx-auto px-4 py-8 relative mt-[124px]'>
      <>
        <h1 className="text-3xl font-bold mb-6">Contáctenos</h1>
        <div className="space-y-4">
          <p><strong>Dirección:</strong> Av. Principal 123, Ciudad</p>
          <p><strong>Teléfono:</strong> (123) 456-7890</p>
          <p><strong>Email:</strong> info@comercio32mhc.edu</p>
          <p><strong>Horario de atención:</strong> Lunes a Viernes, 8:00 AM - 4:00 PM</p>
        </div>
      </>
    </div>
    </div>
  )
}
