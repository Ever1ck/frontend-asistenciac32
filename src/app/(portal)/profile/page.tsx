"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, Upload } from "lucide-react"

interface ProfileData {
  id: number
  email: string
  rol: string
  avatar: string
  persona: {
    id: number
    dni: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    telefono: string
    direccion: string
    fecha_nacimiento: string
    sexo: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState<Partial<ProfileData>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const fetchProfileData = useCallback(async () => {
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

        const data: ProfileData = await response.json()
        setProfileData(data)
        setFormData(data)
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError('Error al cargar los datos del perfil')
      } finally {
        setIsLoading(false)
      }
    }
  }, [session])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      if (name.startsWith('persona.')) {
        const personaField = name.split('.')[1]
        return {
          ...prev,
          persona: {
            ...prev.persona,
            [personaField]: value
          } as ProfileData['persona']
        }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)

    const changedFields = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key === 'persona') {
        Object.entries(value as object).forEach(([personaKey, personaValue]) => {
          if (personaValue !== profileData?.persona[personaKey as keyof typeof profileData.persona]) {
            acc[`persona.${personaKey}`] = personaValue
          }
        })
      } else if (value !== profileData?.[key as keyof ProfileData]) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, unknown>)

    if (avatarFile) {
      changedFields.avatar = avatarFile
    }

    console.log('Data being sent to the backend:', changedFields)

    try {
      const formDataToSend = new FormData()
      Object.entries(changedFields).forEach(([key, value]) => {
        if (key === 'avatar' && value instanceof File) {
          formDataToSend.append('avatar', value)
        } else {
          formDataToSend.append(key, value as string)
        }
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser: ProfileData = await response.json()
      setProfileData(updatedUser)
      await update({
        ...session,
        user: {
          ...session?.user,
          email: updatedUser.email,
          name: `${updatedUser.persona.nombres} ${updatedUser.persona.apellido_paterno} ${updatedUser.persona.apellido_materno}`,
          image: updatedUser.avatar,
        },
      })

      setIsEditing(false)
      setAvatarFile(null)
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
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Perfil de Usuario</CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          {profileData && (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : profileData.avatar} alt={`${profileData.persona.nombres} ${profileData.persona.apellido_paterno}`} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{`${profileData.persona.nombres} ${profileData.persona.apellido_paterno} ${profileData.persona.apellido_materno}`}</h2>
                  <p className="text-sm text-gray-500">{profileData.email}</p>
                  <p className="text-sm text-gray-500">{profileData.rol}</p>
                </div>
              </div>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="persona.nombres">Nombres</Label>
                      <Input
                        id="persona.nombres"
                        name="persona.nombres"
                        value={formData.persona?.nombres}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona.apellido_paterno">Apellido Paterno</Label>
                      <Input
                        id="persona.apellido_paterno"
                        name="persona.apellido_paterno"
                        value={formData.persona?.apellido_paterno}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona.apellido_materno">Apellido Materno</Label>
                      <Input
                        id="persona.apellido_materno"
                        name="persona.apellido_materno"
                        value={formData.persona?.apellido_materno}
                        onChange={handleInputChange}
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona.dni">DNI</Label>
                      <Input
                        id="persona.dni"
                        name="persona.dni"
                        value={formData.persona?.dni}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona.telefono">Teléfono</Label>
                      <Input
                        id="persona.telefono"
                        name="persona.telefono"
                        value={formData.persona?.telefono}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="persona.direccion"
                        name="persona.direccion"
                        value={formData.persona?.direccion}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona.fecha_nacimiento">Fecha de Nacimiento</Label>
                      <Input
                        id="persona.fecha_nacimiento"
                        name="persona.fecha_nacimiento"
                        type="date"
                        value={formData.persona?.fecha_nacimiento?.split('T')[0]}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="persona.sexo">Sexo</Label>
                      <Input
                        id="persona.sexo"
                        name="persona.sexo"
                        value={formData.persona?.sexo}
                        onChange={handleInputChange}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombres</Label>
                      <p className="mt-1">{profileData.persona.nombres}</p>
                    </div>
                    <div>
                      <Label>Apellido Paterno</Label>
                      <p className="mt-1">{profileData.persona.apellido_paterno}</p>
                    </div>
                    <div>
                      <Label>Apellido Materno</Label>
                      <p className="mt-1">{profileData.persona.apellido_materno}</p>
                    </div>
                    <div>
                      <Label>Correo electrónico</Label>
                      <p className="mt-1">{profileData.email}</p>
                    </div>
                    <div>
                      <Label>DNI</Label>
                      <p className="mt-1">{profileData.persona.dni}</p>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <p className="mt-1">{profileData.persona.telefono}</p>
                    </div>
                    <div>
                      <Label>Dirección</Label>
                      <p className="mt-1">{profileData.persona.direccion}</p>
                    </div>
                    <div>
                      <Label>Fecha de Nacimiento</Label>
                      <p className="mt-1">{new Date(profileData.persona.fecha_nacimiento).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label>Sexo</Label>
                      <p className="mt-1">{profileData.persona.sexo}</p>
                    </div>
                  </div>
                  <CardFooter className="flex justify-end mt-6 p-0">
                    <Button onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  </CardFooter>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}