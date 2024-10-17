'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Evento, getEventos } from '@/lib/api'

export default function EventsSection() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEventos() {
      try {
        const data = await getEventos()
        // Ordenar los eventos por fecha, de más reciente a más antiguo
        const sortedEventos = data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        setEventos(sortedEventos)
        setLoading(false)
      } catch {
        setError('Error al cargar los eventos')
        setLoading(false)
      }
    }
    fetchEventos()
  }, [])

  if (loading) return <div>Cargando eventos...</div>
  if (error) return <div>{error}</div>

  function stripHtml(html: string) {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <aside className="w-full md:w-1/4">
      <h2 className="text-2xl font-bold mb-4">Próximos Eventos</h2>
      <Card className="p-4">
        {eventos.length > 0 ? (
          <ul className="space-y-4">
            {eventos.map((evento) => (
              <li key={evento.id} className="border-b pb-2 last:border-b-0 flex items-center">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${evento.portada_url}`}
                    alt={evento.titulo}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{evento.titulo}</h4>
                  <p className="text-sm text-gray-600">{new Date(evento.fecha).toLocaleDateString()}</p>
                  {evento.contenido && (
                    <p className="text-sm text-gray-600 mt-1">
                      {stripHtml(evento.contenido).substring(0, 50)}...
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <h3 className="font-bold mb-2">No hay eventos próximos</h3>
            <p className="text-sm text-gray-600">En este momento no hay eventos programados. Por favor, revise más tarde.</p>
          </div>
        )}
      </Card>
    </aside>
  )
}