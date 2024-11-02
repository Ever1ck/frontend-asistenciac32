import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { User, Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'
import ClientAuthButton from './ClientAuthButton'

const logoc32 = '/logoc32.png'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

const NavLink = ({ href, children, className = '' }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={`relative font-bold uppercase hover:text-yellow-200 transition-colors duration-200 group ${className} text-sm`}
    >
      {children}
      <span className="absolute left-0 -bottom-3 w-full h-0.5 bg-yellow-300 transition-all duration-300 origin-bottom scale-y-0 group-hover:scale-y-100 hidden md:block"></span>
    </Link>
  )
}

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#2B6BB3] text-white transition-all duration-300 z-10 h-20 md:h-[124px]">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="flex items-center">
          <div className="relative h-16 w-16 md:h-24 md:w-24">
            <Image
              src={logoc32}
              alt="Logo"
              sizes="(max-width: 768px) 64px, 96px"
              fill
              style={{
                objectFit: 'contain',
              }}
            />
          </div>
          <h1 className="font-bold transition-all duration-300 ml-2 text-xl md:text-3xl">
            Comercio 32 MHC
          </h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/noticias">Noticias</NavLink>
          <NavLink href="/nosotros">Nosotros</NavLink>
          <NavLink href="/matricula">Matrícula</NavLink>
          <NavLink href="/contactenos">Contáctenos</NavLink>
          <ClientAuthButton />
        </nav>
        <div className="flex items-center md:hidden">
          <ClientAuthButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}