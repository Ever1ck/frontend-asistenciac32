"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Eye, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type FUT = {
  id: number
  solicitud: string
  dni: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  direccion: string
  telefono: string
  distrito: string
  provincia: string
  departamento: string
  tipo_solicitud: string
  solicitud_completa: string
  estado_fut: string
  remove: boolean
  created_at: string
  updated_at: string
  observaciones: string | null
}

export default function FUTsAdministration() {
  const { data: session, status } = useSession()
  const [futs, setFuts] = useState<FUT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedFUT, setSelectedFUT] = useState<FUT | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isNewFUTDialogOpen, setIsNewFUTDialogOpen] = useState(false)
  const [newFUT, setNewFUT] = useState<Partial<FUT>>({
    tipo_solicitud: "CERTIFICADO_ESTUDIO",
    estado_fut: "EN_CAJA"
  })

  useEffect(() => {
    const fetchFUTs = async () => {
      if (status === "authenticated" && session?.user?.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/futs`, {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          })
          if (!response.ok) {
            throw new Error('Failed to fetch FUTs')
          }
          const data = await response.json()
          setFuts(data)
        } catch (err) {
          setError('Error al cargar los FUTs')
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
      fetchFUTs()
    }
  }, [status, session])

  const filteredFUTs = futs.filter(fut =>
    (fut.solicitud.toLowerCase().includes(searchTerm.toLowerCase()) ||
     fut.dni.includes(searchTerm) ||
     fut.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
     fut.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
     fut.apellido_materno.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === "all" || fut.tipo_solicitud === filterType) &&
    (filterStatus === "all" || fut.estado_fut === filterStatus)
  )

  const handleViewFUT = (fut: FUT) => {
    setSelectedFUT(fut)
    setIsDetailDialogOpen(true)
  }

  const handleCreateFUT = () => {
    setIsNewFUTDialogOpen(true)
  }

  const handleSubmitNewFUT = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "authenticated" && session?.user?.accessToken) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/futs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify(newFUT),
        })
        if (!response.ok) {
          throw new Error('Failed to create FUT')
        }
        const createdFUT = await response.json()
        setFuts([...futs, createdFUT])
        setIsNewFUTDialogOpen(false)
        setNewFUT({
          tipo_solicitud: "CERTIFICADO_ESTUDIO",
          estado_fut: "EN_CAJA"
        })
        toast({
          title: "FUT creado",
          description: "El nuevo FUT ha sido creado exitosamente.",
        })
      } catch (err) {
        console.error(err)
        toast({
          title: "Error",
          description: "No se pudo crear el FUT. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
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
      <h1 className="text-3xl font-bold mb-5">Administración de FUTs</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar FUTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de trámite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="CERTIFICADO_ESTUDIO">Certificado de Estudio</SelectItem>
              <SelectItem value="CONSTANCIA">Constancia</SelectItem>
              <SelectItem value="TRASLADO">Traslado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="EN_CAJA">En Caja</SelectItem>
              <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
              <SelectItem value="FINALIZADO">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateFUT}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo FUT
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solicitud</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Nombres</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFUTs.map((fut) => (
              <TableRow key={fut.id}>
                <TableCell className="font-medium">{fut.solicitud}</TableCell>
                <TableCell>{fut.dni}</TableCell>
                <TableCell>{`${fut.nombres} ${fut.apellido_paterno} ${fut.apellido_materno}`}</TableCell>
                <TableCell>{fut.tipo_solicitud}</TableCell>
                <TableCell>{fut.estado_fut}</TableCell>
                <TableCell>{new Date(fut.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleViewFUT(fut)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalles</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del FUT</DialogTitle>
          </DialogHeader>
          {selectedFUT && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Solicitud</Label>
                <p>{selectedFUT.solicitud}</p>
              </div>
              <div>
                <Label>DNI</Label>
                <p>{selectedFUT.dni}</p>
              </div>
              <div>
                <Label>Nombres</Label>
                <p>{`${selectedFUT.nombres} ${selectedFUT.apellido_paterno} ${selectedFUT.apellido_materno}`}</p>
              </div>
              <div>
                <Label>Dirección</Label>
                <p>{selectedFUT.direccion}</p>
              </div>
              <div>
                <Label>Teléfono</Label>
                <p>{selectedFUT.telefono}</p>
              </div>
              <div>
                <Label>Ubicación</Label>
                <p>{`${selectedFUT.distrito}, ${selectedFUT.provincia}, ${selectedFUT.departamento}`}</p>
              </div>
              <div className="col-span-2">
                <Label>Solicitud Completa</Label>
                <p>{selectedFUT.solicitud_completa}</p>
              </div>
              <div>
                <Label>Tipo de Solicitud</Label>
                <p>{selectedFUT.tipo_solicitud}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <p>{selectedFUT.estado_fut}</p>
              </div>
              <div>
                <Label>Fecha de Creación</Label>
                <p>{new Date(selectedFUT.created_at).toLocaleString()}</p>
              </div>
              <div>
                <Label>Última Actualización</Label>
                <p>{new Date(selectedFUT.updated_at).toLocaleString()}</p>
              </div>
              {selectedFUT.observaciones && (
                <div className="col-span-2">
                  <Label>Observaciones</Label>
                  <p>{selectedFUT.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isNewFUTDialogOpen} onOpenChange={setIsNewFUTDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo FUT</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNewFUT}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="solicitud">Solicitud</Label>
                <Input
                  id="solicitud"
                  value={newFUT.solicitud || ''}
                  onChange={(e) => setNewFUT({...newFUT, solicitud: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={newFUT.dni || ''}
                  onChange={(e) => setNewFUT({...newFUT, dni: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={newFUT.nombres || ''}
                  onChange={(e) => setNewFUT({...newFUT, nombres: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                <Input
                  id="apellido_paterno"
                  value={newFUT.apellido_paterno || ''}
                  onChange={(e) => setNewFUT({...newFUT, apellido_paterno: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellido_materno">Apellido Materno</Label>
                <Input
                  id="apellido_materno"
                  value={newFUT.apellido_materno || ''}
                  onChange={(e) => setNewFUT({...newFUT, apellido_materno: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={newFUT.direccion || ''}
                  onChange={(e) => setNewFUT({...newFUT, direccion: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={newFUT.telefono || ''}
                  onChange={(e) => setNewFUT({...newFUT, telefono: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="distrito">Distrito</Label>
                <Input
                  id="distrito"
                  
                  value={newFUT.distrito || ''}
                  onChange={(e) => setNewFUT({...newFUT, distrito: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Input
                  id="provincia"
                  value={newFUT.provincia || ''}
                  onChange={(e) => setNewFUT({...newFUT, provincia: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={newFUT.departamento || ''}
                  onChange={(e) => setNewFUT({...newFUT, departamento: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo_solicitud">Tipo de Solicitud</Label>
                <Select
                  value={newFUT.tipo_solicitud}
                  onValueChange={(value) => setNewFUT({...newFUT, tipo_solicitud: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de solicitud" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CERTIFICADO_ESTUDIO">Certificado de Estudio</SelectItem>
                    <SelectItem value="CONSTANCIA">Constancia</SelectItem>
                    <SelectItem value="TRASLADO">Traslado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estado_fut">Estado</Label>
                <Select
                  value={newFUT.estado_fut}
                  onValueChange={(value) => setNewFUT({...newFUT, estado_fut: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN_CAJA">En Caja</SelectItem>
                    <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                    <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="solicitud_completa">Solicitud Completa</Label>
                <Textarea
                  id="solicitud_completa"
                  value={newFUT.solicitud_completa || ''}
                  onChange={(e) => setNewFUT({...newFUT, solicitud_completa: e.target.value})}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">Crear FUT</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}