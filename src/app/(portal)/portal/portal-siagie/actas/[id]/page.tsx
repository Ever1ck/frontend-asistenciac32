'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'
import { X } from 'lucide-react'
import { useSession } from 'next-auth/react'

const formSchema = z.object({
  typeActa: z.enum(['ACTA_REGULAR', 'ACTA_RECUPERACION']),
  year: z.number().int().min(1900).max(2100),
  grade: z.enum(['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO']),
  section: z.string().min(1, 'Section is required'),
})

interface ImagenActa {
  id: number;
  url: string;
  actaId: number;
}

export default function EditActa() {
  const [formData, setFormData] = useState({
    typeActa: '',
    year: '',
    grade: '',
    section: '',
  })
  const [images, setImages] = useState<ImagenActa[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = session?.user?.accessToken
        const response = await fetch(`http://localhost:4000/api/actas/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch acta data')
        }
        const data = await response.json()
        setFormData({
          typeActa: data.typeActa || '',
          year: data.year?.toString() || '',
          grade: data.grade || '',
          section: data.section || '',
        })
        setImages(data.imagenActa || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, session])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setNewImages(prev => [...prev, ...Array.from(files)])
    }
  }

  const handleExistingImageDelete = async (imageId: number) => {
    try {
      const token = session?.user?.accessToken
      const response = await fetch(`http://localhost:4000/api/actas/${id}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete image')
      }
      setImages(prev => prev.filter(img => img.id !== imageId))
      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleNewImageDelete = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    try {
      formSchema.parse({
        ...formData,
        year: parseInt(formData.year, 10)
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors.map(e => e.message).join(', '),
          variant: "destructive",
        })
        return
      }
    }

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })
    
    newImages.forEach(image => {
      formDataToSend.append('images', image)
    })

    try {
      const token = session?.user?.accessToken
      const response = await fetch(`http://localhost:4000/api/actas/${id}`, {
        method: 'PUT',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to update record')
      }

      toast({
        title: "Success",
        description: "Record updated successfully",
      })
      router.push('/actas')
    } catch (error) {
      console.error('Error updating record:', error)
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Acta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Acta</Label>
          <Select onValueChange={(value) => handleSelectChange('type', value)} value={formData.typeActa}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTA_REGULAR">REGULAR</SelectItem>
              <SelectItem value="ACTA_RECUPERACION">RECUPERACION</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Año de la Acta</Label>
          <Input id="year" name="year" type="number" value={formData.year} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grado de la Acta</Label>
          <Select onValueChange={(value) => handleSelectChange('grade', value)} value={formData.grade}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIMERO">PRIMERO</SelectItem>
              <SelectItem value="SEGUNDO">SEGUNDO</SelectItem>
              <SelectItem value="TERCERO">TERCERO</SelectItem>
              <SelectItem value="CUARTO">CUARTO</SelectItem>
              <SelectItem value="QUINTO">QUINTO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="section">Seccion de la Acta</Label>
          <Input id="section" name="section" value={formData.section} onChange={handleInputChange} />
        </div>
        {images.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="images">Imagenes Actuales</Label>
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <Image 
                    src={`http://localhost:4000/${image.url}`} 
                    alt={`Current image ${image.id}`} 
                    width={100}
                    height={100}
                    className="object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0"
                    onClick={() => handleExistingImageDelete(image.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Delete image</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="newImages">Agregar Nuevas Imagenes</Label>
          <Input
            id="newImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </div>
        {newImages.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {newImages.map((image, index) => (
              <div key={index} className="relative">
                <Image 
                  src={URL.createObjectURL(image)} 
                  alt={`New image ${index + 1}`} 
                  width={100}
                  height={100}
                  className="object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0"
                  onClick={() => handleNewImageDelete(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Delete image</span>
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button type="submit" className="w-full">Update Record</Button>
      </form>
    </div>
  )
}