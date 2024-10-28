import React, { useState, useCallback } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Upload, ZoomIn, ZoomOut } from "lucide-react"

interface ImageEditorProps {
    isOpen: boolean
    onClose: () => void
    onSave: (croppedImage: Blob) => void
    initialImage: string | null
}

export function ImageEditor({ isOpen, onClose, onSave, initialImage }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(initialImage)

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', error => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return null
        }

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                resolve(blob)
            }, 'image/jpeg')
        })
    }

    const handleSave = useCallback(async () => {
        if (croppedAreaPixels && selectedImage) {
            const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels)
            if (croppedImage) {
                onSave(croppedImage)
            }
        }
        handleClose()
    }, [croppedAreaPixels, selectedImage, onSave])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        let file: File | null = null
        if ('dataTransfer' in e) {
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                file = e.dataTransfer.files[0]
            }
        } else if (e.target.files && e.target.files[0]) {
            file = e.target.files[0]
        }

        if (file) {
            setSelectedImage(URL.createObjectURL(file))
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleClose = () => {
        setSelectedImage(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editar imagen de perfil</DialogTitle>
                </DialogHeader>
                <div className="flex-grow flex flex-col items-center justify-center">
                    {selectedImage ? (
                        <div className="relative w-full h-[400px]">
                            <Cropper
                                image={selectedImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                    ) : (
                        <div
                            className="w-full h-[400px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer"
                            onDrop={handleImageSelect}
                            onDragOver={handleDragOver}
                        >
                            <Upload className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600 mb-2">Arrastra y suelta una imagen aquí</p>
                            <p className="text-sm text-gray-600">o</p>
                            <label htmlFor="file-upload" className="mt-2 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Seleccionar archivo
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                    )}
                </div>
                {selectedImage && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <ZoomOut className="h-4 w-4 text-gray-500 mr-2" />
                            <Slider
                                className="w-[200px]"
                                min={1}
                                max={3}
                                step={0.1}
                                value={[zoom]}
                                onValueChange={(value) => setZoom(value[0])}
                            />
                            <ZoomIn className="h-4 w-4 text-gray-500 ml-2" />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave}>Guardar</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}