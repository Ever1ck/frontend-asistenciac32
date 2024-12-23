import Image from 'next/image'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { getNoticias } from '@/lib/api'

function stripHtml(html: string) {
    return html.replace(/<[^>]*>?/gm, '');
}

export default async function NewsSection() {
    const noticias = await getNoticias();

    return (
        <section className="w-full">
            <h2 className="text-2xl font-bold mb-4">Últimas Noticias</h2>
            {noticias === null ? (
                <Card className="p-4">
                    <div className="text-center text-destructive">
                        <AlertCircle className="mx-auto h-6 w-6 mb-2" />
                        <h3 className="font-bold mb-2">No se pudieron obtener las noticias</h3>
                        <p className="text-sm">Lo sentimos, no se pudo conectar a la base de datos. Por favor, intente nuevamente más tarde.</p>
                    </div>
                </Card>
            ) : noticias.length > 0 ? (
                <div className="space-y-6">
                    {noticias
                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                        .map((noticia, index) => (
                            <Card key={noticia.id} className="p-4 flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 h-48 relative mb-4 md:mb-0 md:mr-4">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${noticia.portada_url}`}
                                        alt={noticia.titulo}
                                        width={300}
                                        height={192}
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        className="rounded-md"
                                        priority={index === 0}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold mb-2">{noticia.titulo}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {stripHtml(noticia.contenido).substring(0, 150)}...
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">{new Date(noticia.fecha).toLocaleDateString()}</span>
                                        <Button variant="link" asChild>
                                            <Link href={`/noticias/${noticia.id}`}>Leer más</Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    }
                </div>
            ) : (
                <Card className="p-4">
                    <div className="text-center">
                        <h3 className="font-bold mb-2">No hay entradas disponibles</h3>
                        <p className="text-sm text-muted-foreground">En este momento no hay noticias para mostrar. Por favor, vuelva a revisar más tarde.</p>
                    </div>
                </Card>
            )}
        </section>
    )
}