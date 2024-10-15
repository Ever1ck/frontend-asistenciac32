import Image from 'next/image'
import { Card } from "@/components/ui/card"

const events = [
  { id: 1, title: "Evento 1", date: "10 Oct 2024", image: "/placeholder.svg" },
  { id: 2, title: "Evento 2", date: "15 Oct 2024", image: "/placeholder.svg" },
  { id: 3, title: "Evento 3", date: "20 Oct 2024", image: "/placeholder.svg" },
]

export default function EventsSection() {
  return (
    <aside className="w-full md:w-1/4">
      <h2 className="text-2xl font-bold mb-4">Próximos Eventos</h2>
      <Card className="p-4">
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="border-b pb-2 last:border-b-0 flex items-center">
              <div className="relative w-12 h-12 mr-4">
                <Image
                  src={event.image}
                  alt={event.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <div>
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  )
}