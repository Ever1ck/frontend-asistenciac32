'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, ChevronDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

const logoc32 = '/logoc32.png'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const NavLink = ({ href, children, className = '', onClick }: NavLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`relative font-bold uppercase hover:text-yellow-200 transition-colors duration-200 group ${className} ${
        isActive ? 'text-yellow-300' : 'text-white'
      } text-sm`}
      onClick={onClick}
    >
      {children}
      <span className={`absolute left-0 -bottom-3 w-full h-0.5 bg-yellow-300 transition-all duration-300 origin-bottom ${
        isActive ? 'scale-y-100' : 'scale-y-0'
      } group-hover:scale-y-100 hidden md:block`}></span>
    </Link>
  )
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)
  const router = useRouter()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsSubMenuOpen(false)
  }

  const handleSubMenuToggle = () => {
    setIsSubMenuOpen(!isSubMenuOpen)
  }

  const handleLinkClick = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
    setIsSubMenuOpen(false)
  }

  return (
    <header ref={headerRef} className={`fixed top-0 left-0 right-0 bg-[#2B6BB3] text-white transition-all duration-300 z-10 ${isScrolled ? 'h-16 md:h-20' : 'h-20 md:h-[124px]'}`}>
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="flex items-center">
          <div className={`relative transition-all duration-300 ${isScrolled ? 'h-10 w-10 md:h-16 md:w-16' : 'h-16 w-16 md:h-24 md:w-24'}`}>
            <Image
              src={logoc32}
              alt="Logo"
              sizes="(max-width: 768px) 40px, 96px"
              fill
              style={{
                objectFit: 'contain',
              }}
            />
          </div>
          <h1 className={`font-bold transition-all duration-300 ml-2 ${isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-3xl'}`}>
            Comercio 32 MHC
          </h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/noticias">Noticias</NavLink>
          <NavLink href="/nosotros">Nosotros</NavLink>
          <NavLink href="/matricula">Matrícula</NavLink>
          <NavLink href="/contactenos">Contáctenos</NavLink>
        </nav>
        <Button variant="ghost" className="md:hidden" onClick={handleMobileMenuToggle}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#22558F] py-2">
          <NavLink href="/" className="block w-full px-4 py-3 hover:bg-blue-700 border-b border-blue-500" onClick={() => handleLinkClick('/')}>Inicio</NavLink>
          <NavLink href="/noticias" className="block w-full px-4 py-3 hover:bg-blue-700 border-b border-blue-500" onClick={() => handleLinkClick('/noticias')}>Noticias</NavLink>
          <NavLink href="/nosotros" className="block w-full px-4 py-3 hover:bg-blue-700 border-b border-blue-500" onClick={() => handleLinkClick('/nosotros')}>Nosotros</NavLink>
          <NavLink href="/matricula" className="block w-full px-4 py-3 hover:bg-blue-700 border-b border-blue-500" onClick={() => handleLinkClick('/matricula')}>Matrícula</NavLink>
          <NavLink href="/contactenos" className="block w-full px-4 py-3 hover:bg-blue-700" onClick={() => handleLinkClick('/contactenos')}>Contáctenos</NavLink>
        </div>
      )}
    </header>
  )
}