'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PageHeader from '@/components/incio/PageHeader'

export default function Nosotros() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const hash = searchParams.get('section')
        if (hash) {
            const element = document.getElementById(hash)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [searchParams])

    return (
        <div>
            <PageHeader
                title="Sobre Nosotros"
                imageSrc="/images/noticias-header.jpg"
                imageAlt="Estudiantes de Comercio 32"
            />
            <div className='flex-grow container mx-auto px-4 py-8 relative'>
                <section id="mision-vision" className="mb-16 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">Misión y Visión</h2> <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-semibold mb-2 text-gray-800 text-center">Misión</h3>
                            <p className="text-gray-600 text-justify">“Somos una Institución Educativa Pública Secundaria Técnico-comercial, con las especialidades de Secretariado, Contabilidad, Marketing, Computación e Informática y Administración; a su vez Científico - humanista, que tiene como finalidad lograr que nuestros estudiantes culminen su escolaridad en educación secundaria; que desarrollen sus aprendizajes de acuerdo a lo establecido en el Currículo Nacional; que alcance su desarrollo en espacio seguro para la sana convivencia; que garantice el desarrollo de competencias y capacidades mediante la práctica de valores, el respeto a la diversidad, la conservación ambiental para la calidad de vida y cuidado de la salud”</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-2 text-gray-800 text-center">Visión</h3>
                            <p className="text-gray-600 text-justify">“Ser, en el año 2025, una Institución Educativa que forme estudiantes de calidad y compete, con formación técnico-comercial en las especialidades de Secretariado, Contabilidad, Administración, Marketing y Computación e Informática; y de formación Científico - humanista, comprometida con el logro de sus aprendizajes y sean ciudadanos con derechos y responsabilidades, que respeten y valoren la salud y la cultura emprendedora, el cuidado del medio ambiente en un contexto intercultural, en beneficio del desarrollo local, regional y nacional”</p>
                        </div>
                    </div>
                    <div id="lema"></div>
                    <div id="valores" ></div>
                </section>
                <div className='grid md:grid-cols-2 sm:grid-cols-1'>
                    <section className="mb-16 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">Nuestro Lema</h2>
                        <p className="text-2xl italic text-gray-700 text-center">“Cuando un cornejino se decide… <br /> no hay quien lo detenga”</p>
                    </section>

                    <section className="mb-16 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">Nuestros Valores</h2>
                        <ul className="grid lg:grid-cols-2 gap-2 sm:grid-cols-1 list-disc list-inside py-5 text-gray-600">
                            <li>Respeto</li>
                            <li>Responsabilidad</li>
                            <li>Identidad</li>
                            <li>Honestidad</li>
                            <li>Equidad</li>
                            <li>Solidaridad</li>
                            <li>Cultura ambiente</li>
                        </ul>
                        <div id="historia"></div>
                    </section>

                </div>



                <section className="mb-16 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-3xl font-bold mb-6 text-blue-600">Nuestra Historia</h2>
                    <p className="text-gray-600 text-justify">Fundada en 1950, nuestra institución ha sido un pilar en la educación de la comunidad por más de 70 años. A lo largo de nuestra historia, hemos evolucionado constantemente para adaptarnos a las necesidades cambiantes de la educación, manteniendo siempre nuestro compromiso con la excelencia y el desarrollo integral de nuestros estudiantes.</p>
                    <p className="mt-4 text-gray-600 text-justify">Desde nuestros humildes comienzos con un pequeño grupo de estudiantes y profesores dedicados, hemos crecido para convertirnos en una institución reconocida, formando a generaciones de líderes, innovadores y ciudadanos responsables que han dejado su huella en nuestra comunidad y más allá.</p>
                </section>
            </div>
        </div>
    )
}