import PageHeader from "@/components/incio/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Clock } from 'lucide-react'

export default function Contactenos() {
  return (
    <div>
      <PageHeader
        title="Contáctenos"
        imageSrc="/images/noticias-header.jpg"
        imageAlt="Estudiantes de Comercio 32"
      />
      <div className="w-full h-[450px] container m-auto">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3842.8506508258!2d-70.13001492361392!3d-15.504140481127776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9167f3f3f95a213b%3A0x8cae6f830f816115!2sGlorioso%20Comercio%2032%20Mariano%20H.%20Cornejo!5e0!3m2!1ses-419!2spe!4v1697666369295!5m2!1ses-419!2spe"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
      <div className='container mx-auto px-4 py-8'>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Phone className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Teléfono</h2>
              <p className="text-center">(051) 366-130</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <MapPin className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Dirección</h2>
              <p className="text-center">Av. Floral 1151, Puno 21001, Perú</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Clock className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Horario de atención</h2>
              <p className="text-center">Lunes a Viernes, 7:30 AM - 5:30 PM</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}