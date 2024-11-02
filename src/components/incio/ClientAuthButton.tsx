'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from 'lucide-react'

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

export default function ClientAuthButton() {
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

    if (status === 'loading') {
        return <Button variant="ghost" size="sm" disabled>Cargando...</Button>
    }

    if (session && userProfile) {
        const fullName = `${userProfile.persona.nombres} ${userProfile.persona.apellido_paterno}`
        const avatarUrl = `${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${userProfile.avatar}`

        return (
            <Button
                onClick={() => signOut()}
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={`Cerrar sesión de ${fullName}`}
            >
                <Avatar>
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Button>
        )
    }

    return (
        <Button
            onClick={() => signIn()}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-[#2B6BB3]"
        >
            Iniciar Sesión
        </Button>
    )
}