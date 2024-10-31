"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, GraduationCap, School, BookOpen, FileText, Layers, Settings, Search } from "lucide-react"

const modules = [
  { name: "Usuarios", icon: Users, description: "Gestionar usuarios del sistema", path: "/portal-administrador/usuarios" },
  { name: "Docentes", icon: GraduationCap, description: "Administrar información de docentes", path: "/portal-administrador/docentes" },
  { name: "Aulas", icon: School, description: "Gestionar aulas y espacios", path: "/portal-administrador/aulas" },
  { name: "Cursos", icon: BookOpen, description: "Administrar cursos y programas", path: "/portal-administrador/cursos" },
  { name: "Grados Académicos", icon: FileText, description: "Gestionar grados y títulos", path: "/portal-administrador/grados" },
  { name: "Módulos", icon: Layers, description: "Configurar módulos del sistema", path: "/portal-administrador/modulos" },
  { name: "Configuración", icon: Settings, description: "Ajustes generales del sistema", path: "/portal-administrador/configuracion" },
]

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar módulos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module) => (
          <Card key={module.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <module.icon className="h-6 w-6" />
                {module.name}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Aquí puedes agregar estadísticas o información relevante */}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={module.path}>Gestionar</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}