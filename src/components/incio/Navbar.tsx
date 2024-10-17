'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, ChevronDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

const logoc32 = '/logoc.png'

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
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="hover:text-blue-200 transition-colors duration-200">Inicio</Link>
          <Link href="/noticias" className="hover:text-blue-200 transition-colors duration-200">Noticias</Link>
          <Link href="/nosotros" className="hover:text-blue-200 transition-colors duration-200">Nosotros</Link>
          <Link href="/matricula" className="hover:text-blue-200 transition-colors duration-200">Matrícula</Link>
          <Link href="/contactenos" className="hover:text-blue-200 transition-colors duration-200">Contáctenos</Link>
        </nav>
        <Button variant="ghost" className="md:hidden" onClick={handleMobileMenuToggle}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-600 py-2">
          <button onClick={() => handleLinkClick('/')} className="block w-full text-left px-4 py-2 hover:bg-blue-700">Inicio</button>
          <button onClick={() => handleLinkClick('/noticias')} className="block w-full text-left px-4 py-2 hover:bg-blue-700">Noticias</button>
          <div>
            <button
              className="flex items-center justify-between w-full px-4 py-2 hover:bg-blue-700"
              onClick={handleSubMenuToggle}
            >
              Nosotros
              <ChevronDown className="h-4 w-4" />
            </button>
            {isSubMenuOpen && (
              <div className="bg-blue-700 py-2">
                <button onClick={() => handleLinkClick('/nosotros?section=mision-vision')} className="block w-full text-left px-8 py-2 hover:bg-blue-800">Misión y Visión</button>
                <button onClick={() => handleLinkClick('/nosotros?section=lema')} className="block w-full text-left px-8 py-2 hover:bg-blue-800">Lema</button>
                <button onClick={() => handleLinkClick('/nosotros?section=valores')} className="block w-full text-left px-8 py-2 hover:bg-blue-800">Valores</button>
                <button onClick={() => handleLinkClick('/nosotros?section=historia')} className="block w-full text-left px-8 py-2 hover:bg-blue-800">Historia</button>
              </div>
            )}
          </div>
          <button onClick={() => handleLinkClick('/matricula')} className="block w-full text-left px-4 py-2 hover:bg-blue-700">Matrícula</button>
          <button onClick={() => handleLinkClick('/contactenos')} className="block w-full text-left px-4 py-2 hover:bg-blue-700">Contáctenos</button>
        </div>
      )}
    </header>
  )
}