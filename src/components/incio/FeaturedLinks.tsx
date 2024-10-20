import Image from 'next/image'
import Link from 'next/link'

interface FeaturedLink {
    name: string;
    url: string;
    imageSrc: string;
}

const featuredLinks: FeaturedLink[] = [
    { name: 'SIAGIE', url: 'https://siagie.minedu.gob.pe/inicio/', imageSrc: '/siagie-logo.jpg' },
    { name: 'PerúEduca', url: 'https://www.perueduca.pe/#/home', imageSrc: '/logo-perueduca.png' },
    { name: 'UGEL San Román', url: 'https://ugelsanroman.gob.pe/', imageSrc: '/logo-san-roman.png' },
    { name: 'Directorio', url: '/directorio', imageSrc: '/coding.png' },
    // Añade más enlaces según sea necesario
]

export default function FeaturedLinks() {
    return (
        <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Enlaces Destacados</h2>
            <div className="grid-flex grid-cols-2 ">
                {featuredLinks.map((link) => (
                    <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                            <div className="w-full h-24 relative">
                                <Image
                                    src={link.imageSrc}
                                    alt={link.name}
                                    layout="fill"
                                    objectFit="contain"
                                    className="p-2"
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}