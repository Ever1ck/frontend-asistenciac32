import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  portada_url: string;
}

async function getEventos(): Promise<Evento[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/eventos`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch eventos');
  }
  return res.json();
}

export default async function CarouselComponent() {
  const eventos = await getEventos();
  const imagenElegida = '/images/imagen-elegida.jpg'; // Reemplaza esto con la ruta de tu imagen elegida

  const carouselImages = [
    { src: imagenElegida, alt: 'Imagen elegida' },
    ...eventos.slice(0, 3).map(evento => ({
      src: `${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${evento.portada_url}`,
      alt: evento.titulo
    }))
  ];

  // Si no hay suficientes eventos, añade imágenes de respaldo
  while (carouselImages.length < 4) {
    carouselImages.push({ src: `/images/imagen-respaldo-${carouselImages.length}.jpg`, alt: 'Imagen de respaldo' });
  }

  return (
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {carouselImages.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={300}
                    height={300}
                    objectFit="cover"
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}