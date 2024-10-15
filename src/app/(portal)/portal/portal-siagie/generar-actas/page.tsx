'use client'

import { useState, useEffect } from 'react'
import { GenerarActaSection } from '@/components/actas/agregar-acta-section'
import { VistaPreviewSection } from '@/components/actas/vista-preview-section'
import { AgregarActaDialog } from '@/components/actas/agregar-acta-dialog'
import { Acta } from '@/components/actas/types'

export default function GeneradorActas() {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [isSelectingRegistered, setIsSelectingRegistered] = useState(false)
    const [selectedActas, setSelectedActas] = useState<Acta[]>([])
    const [tempSelectedActas, setTempSelectedActas] = useState<Acta[]>([])
    const [tipoActa, setTipoActa] = useState<string | null>(null)
    const [año, setAño] = useState<string | null>(null)
    const [grado, setGrado] = useState<string | null>(null)
    const [seccion, setSeccion] = useState<string | null>(null)
    const [actasDisponibles, setActasDisponibles] = useState<string[]>([])

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            const newActas = Array.from(files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: 'file' as const,
                file,
                url: URL.createObjectURL(file)
            }))
            setTempSelectedActas(newActas)
        }
    }

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const files = event.dataTransfer.files
        if (files) {
            const newActas = Array.from(files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: 'file' as const,
                file,
                url: URL.createObjectURL(file)
            }))
            setTempSelectedActas(newActas)
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const handleActaSelection = (actaId: string) => {
        if (tipoActa && año && grado && seccion) {
            setTempSelectedActas(prev => {
                const isSelected = prev.some(acta => acta.id === actaId)
                if (isSelected) {
                    return prev.filter(acta => acta.id !== actaId)
                } else {
                    const newActa: Acta = {
                        id: actaId,
                        name: `Acta ${actaId} - ${tipoActa} ${año} ${grado} ${seccion}`,
                        type: 'registered',
                        tipoActa,
                        año,
                        grado,
                        seccion
                    }
                    return [...prev, newActa]
                }
            })
        }
    }

    const removeActa = (id: string) => {
        setSelectedActas(prev => {
            const actaToRemove = prev.find(acta => acta.id === id)
            if (actaToRemove && actaToRemove.url) {
                URL.revokeObjectURL(actaToRemove.url)
            }
            return prev.filter(acta => acta.id !== id)
        })
    }

    const handleImageLoad = (id: string, naturalWidth: number, naturalHeight: number) => {
        setSelectedActas(prev => prev.map(acta =>
            acta.id === id
                ? {
                    ...acta,
                    orientation: naturalWidth > naturalHeight ? 'landscape' : 'portrait',
                    dimensions: { width: naturalWidth, height: naturalHeight }
                }
                : acta
        ))
    }

    useEffect(() => {
        return () => {
            selectedActas.forEach(acta => {
                if (acta.url) {
                    URL.revokeObjectURL(acta.url)
                }
            })
        }
    }, [selectedActas])

    useEffect(() => {
        if (tipoActa && año && grado && seccion) {
            // Simular la carga de actas disponibles
            setActasDisponibles(['1', '2', '3', '4', '5'])
        } else {
            setActasDisponibles([])
        }
    }, [tipoActa, año, grado, seccion])

    const isActaSelected = (actaId: string) => {
        return tempSelectedActas.some(acta => acta.id === actaId)
    }

    const handleAddActas = () => {
        setSelectedActas(prev => [...prev, ...tempSelectedActas])
        setTempSelectedActas([])
        setIsPopupOpen(false)
        setIsSelectingRegistered(false)
        setTipoActa(null)
        setAño(null)
        setGrado(null)
        setSeccion(null)
    }

    const handleCancelSelection = () => {
        setTempSelectedActas([])
        setIsPopupOpen(false)
        setIsSelectingRegistered(false)
        setTipoActa(null)
        setAño(null)
        setGrado(null)
        setSeccion(null)
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-background dark:bg-gray-900">
            <GenerarActaSection
                selectedActas={selectedActas}
                removeActa={removeActa}
                openPopup={() => setIsPopupOpen(true)}
            />
            <VistaPreviewSection
                selectedActas={selectedActas}
                handleImageLoad={handleImageLoad}
            />
            <AgregarActaDialog
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onFileChange={handleFileChange}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                isSelectingRegistered={isSelectingRegistered}
                setIsSelectingRegistered={setIsSelectingRegistered}
                tipoActa={tipoActa}
                setTipoActa={setTipoActa}
                año={año}
                setAño={setAño}
                grado={grado}
                setGrado={setGrado}
                seccion={seccion}
                setSeccion={setSeccion}
                actasDisponibles={actasDisponibles}
                isActaSelected={isActaSelected}
                handleActaSelection={handleActaSelection}
                handleAddActas={handleAddActas}
                handleCancelSelection={handleCancelSelection}
            />
        </div>
    )
}