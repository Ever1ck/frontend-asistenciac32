'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from 'lucide-react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}

interface UserProfile {
    id: number;
    email: string;
    rol: string;
    avatar: string;
    persona: {
        id: number;
        dni: string;
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
        telefono: string;
        direccion: string;
        fecha_nacimiento: string;
        sexo: string;
        created_at: string;
        updated_at: string;
    };
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={`block w-full px-4 py-3 hover:bg-blue-700 border-b border-blue-500 ${isActive ? 'bg-blue-700 text-yellow-300 font-bold' : ''
                }`}
            onClick={onClick}
        >
            {children}
        </Link>
    )
}

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const { data: session, status } = useSession()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    useEffect(() => {
        if (session?.user.accessToken) {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${session.user.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
                .then(res => res.json())
                .then(data => setUserProfile(data))
                .catch(error => console.error('Error fetching user profile:', error))
        }
    }, [session])

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => {
        setIsOpen(false)
        setIsUserMenuOpen(false)
    }

    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

    return (
        <>
            <Button
                variant="ghost"
                className="ml-2 p-2"
                onClick={toggleMenu}
                aria-label="Abrir menú"
            >
                {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </Button>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#22558F] py-2">
                    <NavLink href="/" onClick={closeMenu}>Inicio</NavLink>
                    <NavLink href="/noticias" onClick={closeMenu}>Noticias</NavLink>
                    <NavLink href="/nosotros" onClick={closeMenu}>Nosotros</NavLink>
                    <NavLink href="/matricula" onClick={closeMenu}>Matrícula</NavLink>
                    <NavLink href="/contactenos" onClick={closeMenu}>Contáctenos</NavLink>

                    {status === 'loading' ? (
                        <div className="px-4 py-3">
                            <Button variant="ghost" size="sm" disabled>Cargando...</Button>
                        </div>
                    ) : session && userProfile ? (
                        <div className="px-4 py-3">
                            <button
                                onClick={toggleUserMenu}
                                className="flex items-center w-full text-left px-4 py-3 hover:bg-blue-700 border-b border-blue-500"
                            >
                                <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src={`${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${userProfile.avatar}`} alt={`${userProfile.persona.nombres} ${userProfile.persona.apellido_paterno}`} />
                                    <AvatarFallback>{userProfile.persona.nombres[0]}</AvatarFallback>
                                </Avatar>
                                <span>{`${userProfile.persona.nombres} ${userProfile.persona.apellido_paterno}`}</span>
                            </button>
                            {isUserMenuOpen && (
                                <>
                                    <NavLink href="/dashboard" onClick={closeMenu}>
                                        <User className="inline-block mr-2 h-4 w-4" />
                                        Dashboard
                                    </NavLink>
                                    <button
                                        onClick={() => {
                                            signOut()
                                            closeMenu()
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-700 border-b border-blue-500"
                                    >
                                        <LogOut className="inline-block mr-2 h-4 w-4" />
                                        Cerrar sesión
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="px-4 py-3">
                            <Button
                                onClick={() => signIn()}
                                className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors duration-200 w-full"
                            >
                                Iniciar Sesión
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}