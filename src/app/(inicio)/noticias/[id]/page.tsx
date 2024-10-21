import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FacebookIcon, TwitterIcon, LinkedinIcon } from 'lucide-react'
import EventsSection from '@/components/incio/EventsSection'
import { notFound } from 'next/navigation'

interface Entrada {
  id: number;
  titulo: string;
  portada_url: string;
  contenido: string;
  usuario_id: number;
  tipo_entrada: string;
  fecha: string;
  estado_entrada: boolean;
  created_at: string;
  updated_at: string;
  usuario: {
    rol: string;
  }
}

async function getEntrada(id: string): Promise<Entrada | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error('Failed to fetch entrada')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching entrada:', error)
    return null
  }
}

export default async function NoticiaPage({ params }: { params: { id: string } }) {
  const entrada = await getEntrada(params.id)

  if (!entrada) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 mt-[124px]">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-3/4">
          <h1 className="text-3xl font-bold mb-4">{entrada.titulo}</h1>
          {entrada.portada_url && (
            <div className="mb-4 relative h-[300px]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${entrada.portada_url}`}
                alt={entrada.titulo}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: 'cover',
                }}
                className="rounded-lg"
              />
            </div>
          )}
          <div className="mb-4 text-sm text-gray-600">
            <span>{new Date(entrada.fecha).toLocaleDateString()}</span>
            <span className="mx-2">|</span>
            <span>{entrada.usuario.rol}</span>
            <span className="mx-2">|</span>
            <span>{entrada.tipo_entrada}</span>
          </div>
          <Card className="p-4 mb-4">
            <div
              dangerouslySetInnerHTML={{ __html: entrada.contenido }}
              className="prose max-w-none"
            />
          </Card>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <FacebookIcon className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button size="sm" variant="outline">
              <TwitterIcon className="w-4 h-4 mr-2" />
              Tuitear
            </Button>
            <Button size="sm" variant="outline">
              <LinkedinIcon className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
        <div className='w-full md:w-1/3'>
          <EventsSection />
        </div>
      </div>
    </div>
  )
}