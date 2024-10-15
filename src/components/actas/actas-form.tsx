'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  typeActa: z.enum(['REGULAR', 'RECUPERACION']),
  year: z.string().regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  grade: z.enum(['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO']),
  section: z.string().min(1, 'Section is required'),
})

export default function RecordPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    typeActa: '',
    year: '',
    grade: '',
    section: '',
  })
  const [errors, setErrors] = useState<z.ZodIssue[]>([])
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isOpen) {
      setImages([])
      setFormData({
        typeActa: '',
        year: '',
        grade: '',
        section: '',
      })
      setErrors([])
    }
  }, [isOpen])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setImages(prev => [...prev, ...Array.from(files)])
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    try {
      formSchema.parse(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.issues)
        setIsErrorDialogOpen(true)
        return
      }
    }

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })
    
    images.forEach(image => {
      formDataToSend.append('images', image)
    })

    try {
      const response = await fetch('http://localhost:4000/api/actas', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit form')
      }

      toast({
        title: "Success",
        description: "Record created successfully",
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors([{ path: ['server'], message: error instanceof Error ? error.message : 'An unknown error occurred', code: 'custom' }])
      setIsErrorDialogOpen(true)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Acta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Acta</Label>
              <Select onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecciona un Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTA_REGULAR">REGULAR</SelectItem>
                  <SelectItem value="ACTA_RECUPERACION">RECUPERACION</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año de la Acta</Label>
              <Input id="year" name="year" type="number" placeholder="2024" onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grado de la Acta</Label>
              <Select onValueChange={(value) => handleSelectChange('grade', value)}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Selecciona un Grado" />
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
              <Input id="section" name="section" placeholder="A" onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Imagenes</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('images')?.click()}
                >
                  Add Image
                </Button>
              </div>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative w-full h-32">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
            <Button type="submit" className="w-full">Reegistrar Acta</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertTitle>{error.path.join('.')}</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}