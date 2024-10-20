import PageHeader from '@/components/incio/PageHeader'
import NewsSection from '@/components/incio/NuevasEntradas'
import EventsSection from '@/components/incio/EventsSection'

export default function NoticiasPage() {
  return (
    <div>
      <PageHeader
        title="Noticias"
        imageSrc="/images/noticias-header.jpg"
        imageAlt="Estudiantes de Comercio 32"
      />
      <div className='flex-grow container mx-auto px-4 py-8'>
        <div className="flex flex-col md:flex-row gap-8">
          <div className='md:w-3/4'>
            <NewsSection />
            </div>
          <div className='md:w-1/4'>
            <EventsSection />
          </div>
        </div>
      </div>

    </div>
  )
}