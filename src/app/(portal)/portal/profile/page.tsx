"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user?.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch profile data')
          }

          const data = await response.json()
          setProfileData(data)
          setFormData(data)
        } catch (err) {
          console.error('Error fetching profile data:', err)
          setError('Error al cargar los datos del perfil')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchProfileData()
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      setProfileData(updatedUser)
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      })

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError('Error al actualizar el perfil')
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Perfil de Usuario</CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.avatar || ""} alt={profileData.name || "User"} />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{profileData.name}</h2>
              <p className="text-sm text-gray-500">{profileData.email}</p>
            </div>
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 mt-4">{error}</p>}
              <CardFooter className="flex justify-end mt-6 p-0">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <p className="mt-1">{profileData.name}</p>
                </div>
                <div>
                  <Label>Correo electrónico</Label>
                  <p className="mt-1">{profileData.email}</p>
                </div>
              </div>
              <CardFooter className="flex justify-end mt-6 p-0">
                <Button onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              </CardFooter>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}