"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react"

type Acta = {
  id: number
  typeActa: string
  year: number
  grade: string
  section: string
  imagenurl: string[]
  createdAt: string
  updatedAt: string
}

export default function ActasTable() {
  const { data: session, status } = useSession()
  const [actas, setActas] = useState<Acta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchActas = async () => {
      if (status === "authenticated" && session?.user?.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/actas`, {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          })
          if (!response.ok) {
            throw new Error('Failed to fetch actas')
          }
          const data = await response.json()
          setActas(data)
        } catch (err) {
          setError('Error al cargar las actas')
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      } else if (status === "unauthenticated") {
        setError('Usuario no autenticado')
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      fetchActas()
    }
  }, [status, session])

  const filteredActas = actas.filter(acta =>
    Object.values(acta).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Tabla de Actas</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar actas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Imágenes</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActas.map((acta) => (
              <TableRow key={acta.id}>
                <TableCell className="font-medium">{acta.typeActa}</TableCell>
                <TableCell>{acta.year}</TableCell>
                <TableCell>{acta.grade}</TableCell>
                <TableCell>{acta.section}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {acta.imagenurl.map((url, index) => (
                      <Button key={index} variant="outline" size="icon" className="relative group">
                        <ImageIcon className="h-4 w-4" />
                        <span className="sr-only">Ver imagen {index + 1}</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Ver imagen {index + 1}
                        </div>
                      </Button>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{new Date(acta.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}