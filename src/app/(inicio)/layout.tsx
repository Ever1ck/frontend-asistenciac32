import Navbar from '@/components/incio/Navbar'
import SocialButtons from '@/components/incio/SocialButtons'

export const metadata = {
  title: 'Comercio 32 MHC',
  description: 'Sitio web oficial de Comercio 32 MHC',
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main>
            <SocialButtons />
            {children}
          </main>
          <footer className="bg-gray-200 p-4 mt-8">
            <div className="container mx-auto text-center">
              <p>&copy; 2024 Comercio 32 MHC. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}