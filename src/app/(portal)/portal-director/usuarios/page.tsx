'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'

interface User {
  id: number
  email: string
  rol: string
  avatar: string
  estado: boolean
  created_at: string
  updated_at: string
  Persona_id: number
}

interface NewUser {
  email: string
  password: string
  rol: string
  avatar: string
  Persona_id: number
}

export default function UserManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
    rol: 'Usuario',
    avatar: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
    Persona_id: 0,
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [originalUser, setOriginalUser] = useState<User | null>(null)
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      })
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(newUser),
      })
      if (!response.ok) throw new Error('Failed to create user')
      await fetchUsers()
      setIsNewUserDialogOpen(false)
      setNewUser({
        email: '',
        password: '',
        rol: 'Usuario',
        avatar: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
        Persona_id: 0,
      })
      toast({
        title: 'Éxito',
        description: 'Usuario creado correctamente',
      })
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear el usuario',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !originalUser) return

    const changedFields: Partial<User> = {}

    if (editingUser.email !== originalUser.email) changedFields.email = editingUser.email
    if (editingUser.rol !== originalUser.rol) changedFields.rol = editingUser.rol
    if (editingUser.estado !== originalUser.estado) changedFields.estado = editingUser.estado

    if (Object.keys(changedFields).length === 0) {
      setIsEditDialogOpen(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/usuarios/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(changedFields),
      })
      if (!response.ok) throw new Error('Failed to update user')
      await fetchUsers()
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setOriginalUser(null)
      toast({
        title: 'Éxito',
        description: 'Usuario actualizado correctamente',
      })
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el usuario',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Administración de Usuarios</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/portal-director')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <Input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                  <Select
                    value={newUser.rol}
                    onValueChange={(value) => setNewUser({ ...newUser, rol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Usuario">Usuario</SelectItem>
                      <SelectItem value="Docente">Docente</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="ID de Persona"
                    value={newUser.Persona_id.toString()}
                    onChange={(e) => setNewUser({ ...newUser, Persona_id: parseInt(e.target.value) })}
                    required
                  />
                  <Button type="submit">Crear Usuario</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.email} />
                        <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.rol}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingUser({ ...user })
                        setOriginalUser({ ...user })
                        setIsEditDialogOpen(true)
                      }}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
              </DialogHeader>
              {editingUser && (
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <Input
                    placeholder="Email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                  <Select
                    value={editingUser.rol}
                    onValueChange={(value) => setEditingUser({ ...editingUser, rol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Usuario">Usuario</SelectItem>
                      <SelectItem value="Docente">Docente</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={editingUser.estado.toString()}
                    onValueChange={(value) => setEditingUser({ ...editingUser, estado: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">Guardar Cambios</Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}