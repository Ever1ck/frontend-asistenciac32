'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import RecordPopup from '@/components/actas/actas-form'
import ActasTable from '@/components/actas/records-table'

export default function Page() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Administrar Actas</h1>
      <Button onClick={() => setIsPopupOpen(true)}>Registrar Acta</Button>
      <RecordPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        
      <ActasTable />
    </div>
  )
}