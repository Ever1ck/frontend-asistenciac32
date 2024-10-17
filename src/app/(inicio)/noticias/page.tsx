import PageHeader from '@/components/incio/PageHeader'
import NewsSection from '@/components/incio/NewSection'
import EventsSection from '@/components/incio/EventsSection'

export default function NoticiasPage() {
  return (
    <div>
      <PageHeader
        title="Noticias"
        imageSrc="/images/noticias-header.jpg"
        imageAlt="Estudiantes de Comercio 32"
      />
      <div className="container mx-auto px-4 py-8">
        <NewsSection />
        <EventsSection />
      </div>
    </div>
  )
}