import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { modulos } = await request.json()
  
  // Update the assignment in your data store
  // This is a mock implementation
  console.log(`Updating modules for role ${id}:`, modulos)
  
  return NextResponse.json({ message: 'Modules updated successfully' })
}