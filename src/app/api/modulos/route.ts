import { NextResponse } from 'next/server'

let assignments = [
  { id: '1', rol: 'Usuario', modulos: ['usuario'] },
  { id: '2', rol: 'Administrador', modulos: ['usuario', 'pagina', 'docente', 'auxiliar', 'secretaria', 'innovacion', 'subdirector', 'director'] },
]

export async function GET() {
  return NextResponse.json(assignments)
}

export async function POST(request: Request) {
  const newAssignments = await request.json()
  assignments = newAssignments
  return NextResponse.json({ message: 'Assignments initialized successfully' })
}