import Image from 'next/image'
import { Card } from "@/components/ui/card"

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  fecha_evento: string;
  portada_url: string;
}

async function getEventos(): Promise<Evento[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/eventos`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch eventos');
  }
  return res.json();
}

export default async function EventsSection() {
  const eventos = await getEventos();

  return (
    <aside className="w-full">
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
                  <p className="text-sm text-gray-600">{new Date(evento.fecha_evento).toLocaleDateString()}</p>
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