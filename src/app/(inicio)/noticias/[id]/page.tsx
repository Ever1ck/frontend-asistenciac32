'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FacebookIcon, TwitterIcon, LinkedinIcon } from 'lucide-react'
import EventsSection from '@/components/incio/EventsSection'

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

export default function NoticiaPage() {
  const params = useParams()
  const [entrada, setEntrada] = useState<Entrada | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEntrada = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/${params.id}`)
        if (response.ok) {
          const data: Entrada = await response.json()
          setEntrada(data)
        } else {
          throw new Error('No se pudo obtener la entrada')
        }
      } catch (error) {
        console.error('Error fetching entrada:', error)
        setError("Hubo un problema al cargar la entrada. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntrada()
  }, [params.id])

  if (isLoading) {
    return <div className="container mx-auto p-4 mt-[124px]">Cargando...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 mt-[124px]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  if (!entrada) {
    return <div className="container mx-auto p-4 mt-[124px]">No se encontró la entrada</div>
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
                layout="fill"
                objectFit="cover"
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
        <EventsSection />
      </div>
    </div>
  )
}