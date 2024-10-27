"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Plus } from "lucide-react"

type Role = "Usuario" | "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector" | "Director" | "Administrador"

type Module = {
    id: string;
    name: string;
}

type RoleModuleAssignment = {
    id: string;
    rol: Role;
    modulos: string[];
}

const availableModules: Module[] = [
    { id: "usuario", name: "Usuario" },
    { id: "pagina", name: "Portal de Página" },
    { id: "docente", name: "Docente" },
    { id: "auxiliar", name: "Auxiliar" },
    { id: "secretaria", name: "Secretaria" },
    { id: "innovacion", name: "Innovación" },
    { id: "subdirector", name: "Subdirector" },
    { id: "director", name: "Director" },
]

const initialAssignments: { rol: Role; modulos: string[] }[] = [
    { rol: "Usuario", modulos: ["usuario"] },
    { rol: "Docente", modulos: ["usuario", "docente"] },
    { rol: "Auxiliar", modulos: ["usuario", "auxiliar"] },
    { rol: "Secretaria", modulos: ["usuario", "secretaria"] },
    { rol: "Innovacion", modulos: ["usuario", "innovacion"] },
    { rol: "Subdirector", modulos: ["usuario", "subdirector"] },
    { rol: "Director", modulos: ["usuario", "director"] },
    { rol: "Administrador", modulos: availableModules.map(m => m.id) },
]

export default function ModuleAssignment() {
    const { data: session, status } = useSession()
    const [assignments, setAssignments] = useState<RoleModuleAssignment[]>([])
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (status === "authenticated") {
            fetchAssignments()
        }
    }, [status])

    const fetchAssignments = async () => {
        if (session?.user?.accessToken) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/modulos`, {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch role-module assignments')
                }
                const data = await response.json()
                console.log("Fetched assignments:", data)
                const updatedAssignments = data.map((assignment: RoleModuleAssignment) => ({
                    ...assignment,
                    modulos: assignment.modulos.includes("usuario")
                        ? assignment.modulos
                        : ["usuario", ...assignment.modulos]
                }))
                setAssignments(updatedAssignments)
            } catch (err) {
                console.error(err)
                toast({
                    title: "Error",
                    description: "No se pudieron cargar las asignaciones de módulos",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleModuleToggle = (moduleId: string) => {
        if (!selectedRole) return

        setAssignments(prev => prev.map(assignment => {
            if (assignment.id === selectedRole) {
                if (moduleId === "usuario") {
                    return assignment
                }
                if (assignment.modulos.includes(moduleId)) {
                    return { ...assignment, modulos: assignment.modulos.filter(id => id !== moduleId) }
                } else {
                    return { ...assignment, modulos: [...assignment.modulos, moduleId] }
                }
            }
            return assignment
        }))
    }

    const saveAssignments = async () => {
        if (status !== "authenticated" || !session?.user?.accessToken || !selectedRole) return

        setIsSaving(true)
        try {
            const assignment = assignments.find(a => a.id === selectedRole)
            if (!assignment) throw new Error('Assignment not found')

            const dataToSend = {
                rol: assignment.rol,
                modulos: assignment.modulos
            }

            console.log("Saving assignment:", dataToSend)

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/modulos/${selectedRole}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            })

            if (!response.ok) {
                throw new Error('Failed to save role-module assignments')
            }

            const responseData = await response.json()
            console.log("Save response:", responseData)

            toast({
                title: "Éxito",
                description: "Las asignaciones de módulos se han guardado correctamente",
            })
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "No se pudieron guardar las asignaciones de módulos",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const initializeRolesAndModules = async () => {
        if (status !== "authenticated" || !session?.user?.accessToken) return

        setIsSaving(true)
        let allRolesRegistered = true;

        for (const assignment of initialAssignments) {
            try {
                console.log("Initializing role:", assignment)

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/modulos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                    body: JSON.stringify(assignment),
                })

                const responseData = await response.json()
                console.log("Initialization response:", responseData)

                if (!response.ok) {
                    if (responseData.message !== "El rol ya ha sido registrado anteriormente") {
                        allRolesRegistered = false;
                        toast({
                            title: "Error",
                            description: `No se pudo registrar el rol ${assignment.rol}: ${responseData.message}`,
                            variant: "destructive",
                        })
                    }
                }
            } catch (err) {
                console.error(err)
                allRolesRegistered = false;
                toast({
                    title: "Error",
                    description: `Error al registrar el rol ${assignment.rol}`,
                    variant: "destructive",
                })
            }
        }

        if (allRolesRegistered) {
            toast({
                title: "Información",
                description: "Todos los roles ya han sido registrados anteriormente",
            })
        } else {
            toast({
                title: "Éxito",
                description: "Se han inicializado las asignaciones de roles y módulos",
            })
        }

        setIsSaving(false)
        fetchAssignments()
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Button onClick={initializeRolesAndModules} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inicializando...
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Inicializar Roles y Módulos
                        </>
                    )}
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Asignación de Módulos por Rol</CardTitle>
                    <CardDescription>Seleccione un rol y asigne los módulos correspondientes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Select onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {assignments.map((assignment) => (
                                    <SelectItem key={assignment.id} value={assignment.id}>
                                        {assignment.rol}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedRole && (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {availableModules.map((module) => {
                                        const assignment = assignments.find(a => a.id === selectedRole)
                                        return (
                                            <div key={module.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${selectedRole}-${module.id}`}
                                                    checked={assignment?.modulos.includes(module.id)}
                                                    onCheckedChange={() => handleModuleToggle(module.id)}
                                                    disabled={module.id === "usuario"}
                                                />
                                                <label
                                                    htmlFor={`${selectedRole}-${module.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {module.name}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                                <Button
                                    onClick={saveAssignments}
                                    disabled={isSaving}
                                    className="mt-4"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}