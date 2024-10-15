'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Noticia, getNoticias } from '@/lib/api'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NewsSection() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const data = await getNoticias()
        setNoticias(data)
        setLoading(false)
      } catch {
        setError('Error al cargar las noticias')
        setLoading(false)
      }
    }
    fetchNoticias()
  }, [])

  if (loading) return <div>Cargando noticias...</div>
  if (error) return <div>{error}</div>

  return (
    <section className="w-full md:w-3/4">
      <h2 className="text-2xl font-bold mb-4">Últimas Noticias</h2>
      <div className="space-y-4">
        {noticias.map((noticia) => (
          <Card key={noticia.id} className="p-4 flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 h-48 relative mb-4 md:mb-0 md:mr-4">
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${noticia.portada_url}`}
                alt={noticia.titulo}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">{noticia.titulo}</h3>
              <p className="text-sm text-gray-600 mb-4">{noticia.contenido.substring(0, 150)}...</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{new Date(noticia.fecha).toLocaleDateString()}</span>
                <Button variant="link" asChild>
                  <Link href={`/noticias/${noticia.id}`}>Leer más</Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}