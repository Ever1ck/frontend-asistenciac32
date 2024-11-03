'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'

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

export default function ClientAuthButton({ isMobile = false }) {
    const { data: session, status } = useSession()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

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

    if (status === 'loading') {
        return <Button variant="ghost" size="sm" disabled>Cargando...</Button>
    }

    if (session && userProfile) {
        const fullName = `${userProfile.persona.nombres} ${userProfile.persona.apellido_paterno}`
        const avatarUrl = `${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${userProfile.avatar}`

        if (isMobile) {
            return null; // El menú móvil manejará la visualización de las opciones de usuario
        }

        return (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label={`Menú de ${fullName}`}
                    >
                        <Avatar>
                            <AvatarImage src={avatarUrl} alt={fullName} />
                            <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Button
            onClick={() => signIn()}
            className={`bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors duration-200 ${isMobile ? 'w-full' : ''
                }`}
        >
            Iniciar Sesión
        </Button>
    )
}