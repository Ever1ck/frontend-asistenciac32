'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Menu, X } from 'lucide-react'
import ClientAuthButton from './ClientAuthButton'

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => (
    <Link
        href={href}
        className="block w-full px-4 py-3 hover:bg-blue-700 border-b border-blue-500"
        onClick={onClick}
    >
        {children}
    </Link>
)

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <>
            <Button variant="ghost" className="ml-2" onClick={toggleMenu} aria-label="Abrir menú">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#22558F] py-2">
                    <NavLink href="/" onClick={closeMenu}>Inicio</NavLink>
                    <NavLink href="/noticias" onClick={closeMenu}>Noticias</NavLink>
                    <NavLink href="/nosotros" onClick={closeMenu}>Nosotros</NavLink>
                    <NavLink href="/matricula" onClick={closeMenu}>Matrícula</NavLink>
                    <NavLink href="/contactenos" onClick={closeMenu}>Contáctenos</NavLink>
                    <div className="px-4 py-3">
                        <ClientAuthButton />
                    </div>
                </div>
            )}
        </>
    )
}