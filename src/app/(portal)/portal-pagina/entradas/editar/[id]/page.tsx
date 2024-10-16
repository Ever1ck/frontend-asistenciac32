'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { toast } from "@/hooks/use-toast"

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function EditarEntrada() {
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()
    const [userProfile, setUserProfile] = useState(null)
    const [formData, setFormData] = useState({
        titulo: '',
        portada: null as File | null,
        portada_preview: '',
        contenido: '',
        usuario_id: null,
        tipo_entrada: 'Noticia',
        changed: {} as Record<string, boolean>,
    })

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (session?.user?.accessToken) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                    if (response.ok) {
                        const profile = await response.json()
                        setUserProfile(profile)
                        setFormData(prev => ({ ...prev, usuario_id: profile.id }))
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error)
                    toast({
                        title: "Error",
                        description: "No se pudo cargar el perfil del usuario.",
                        variant: "destructive",
                    })
                }
            }
        }

        const fetchEntrada = async () => {
            if (session?.user?.accessToken) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/${params.id}`, {
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                    if (response.ok) {
                        const entrada = await response.json()
                        setFormData(prev => ({
                            ...prev,
                            titulo: entrada.titulo,
                            contenido: entrada.contenido,
                            tipo_entrada: entrada.tipo_entrada,
                            portada_preview: `${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${entrada.portada_url}`,
                            changed: {} // Initialize changed object
                        }))
                    }
                } catch (error) {
                    console.error('Error fetching entrada:', error)
                    toast({
                        title: "Error",
                        description: "No se pudo cargar la entrada.",
                        variant: "destructive",
                    })
                }
            }
        }

        fetchUserProfile()
        fetchEntrada()
    }, [session, params.id])

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'align',
        'link', 'image', 'video'
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ 
            ...prev, 
            [name]: value, 
            changed: { ...prev.changed, [name]: true }
        }))
    }

    const handleContentChange = (value: string) => {
        setFormData(prev => ({ 
            ...prev, 
            contenido: value, 
            changed: { ...prev.changed, contenido: true }
        }))
    }

    const handleTipoEntradaChange = (value: string) => {
        setFormData(prev => ({ 
            ...prev, 
            tipo_entrada: value, 
            changed: { ...prev.changed, tipo_entrada: true }
        }))
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    portada: file,
                    portada_preview: reader.result as string,
                    changed: { ...prev.changed, portada: true }
                }))
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })

    const handleUpdate = async () => {
        if (!session?.user?.accessToken) {
            toast({
                title: "Error",
                description: "No se ha iniciado sesión.",
                variant: "destructive",
            })
            return
        }

        const updatedFields = {}

        Object.keys(formData.changed).forEach(key => {
            if (formData.changed[key]) {
                updatedFields[key] = formData[key]
            }
        })

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.user.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFields),
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const result = await response.json()
            console.log('Entrada actualizada:', result)
            toast({
                title: "Éxito",
                description: "La entrada ha sido actualizada correctamente.",
            })
            router.push('/portal-pagina/entradas')
        } catch (error) {
            console.error('Error al actualizar la entrada:', error)
            toast({
                title: "Error",
                description: "No se pudo actualizar la entrada. Por favor, intente de nuevo más tarde.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Editar entrada</h1>
            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="p-6 flex-1">
                    <Input
                        type="text"
                        placeholder="Título de la entrada"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        className="mb-4"
                    />
                    <div {...getRootProps()} className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                        <input {...getInputProps()} />
                        {
                            isDragActive ?
                                <p>Suelta la imagen aquí ...</p> :
                                <p>Arrastra y suelta una imagen aquí, o haz clic para seleccionar una</p>
                        }
                        {formData.portada && (
                            <p className="mt-2 text-sm text-gray-500">
                                Nueva imagen seleccionada: {formData.portada.name}
                            </p>
                        )}
                    </div>
                    <p className="mb-2">Seleccione el tipo de entrada:</p>
                    <Select onValueChange={handleTipoEntradaChange} value={formData.tipo_entrada}>
                        <SelectTrigger className="mb-4">
                            <SelectValue placeholder="Selecciona el tipo de entrada" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Noticia">Noticia</SelectItem>
                            <SelectItem value="Comunicado">Comunicado</SelectItem>
                            <SelectItem value="Evento">Evento</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="mb-4 h-auto overflow-y-auto">
                        <ReactQuill
                            theme="snow"
                            value={formData.contenido}
                            onChange={handleContentChange}
                            modules={modules}
                            formats={formats}
                            className="h-full"
                        />
                    </div>
                    <div className="flex justify-center">
                        <Button onClick={handleUpdate}>Actualizar Entrada</Button>
                    </div>
                </Card>
                <Card className="p-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold mb-4">Vista previa</h2>
                    <div className="relative mb-4 flex-grow">
                        {formData.portada_preview && (
                            <>
                                <Image
                                    src={formData.portada_preview}
                                    alt="Imagen de portada"
                                    sizes="100vw"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                    }}
                                    width={500}
                                    height={300}
                                    className="max-w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-black opacity-50"></div>
                            </>
                        )}
                        <h3 className="text-xl font-semibold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white p-2 rounded text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                            {formData.titulo}
                        </h3>
                    </div>
                    <div className="flex justify-center items-center mb-4 space-x-4">
                        <p className="text-sm text-gray-500">Fecha de publicación: {new Date().toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Publicado por: {userProfile?.persona?.nombres} {userProfile?.persona?.apellido_paterno}</p>
                    </div>
                    <div className="prose max-w-none flex-grow" dangerouslySetInnerHTML={{ __html: formData.contenido }} />
                    <p className="text-sm text-gray-500 text-center mt-4">{formData.tipo_entrada}</p>
                </Card>
            </div>
        </div>
    )
}