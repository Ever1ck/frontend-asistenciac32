import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { ActaListItem } from "./acta-list-item"
import { Acta } from './types'

export function GenerarActaSection({ 
  selectedActas, 
  removeActa, 
  openPopup 
}: { 
  selectedActas: Acta[]; 
  removeActa: (id: string) => void; 
  openPopup: () => void;
}) {
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 flex flex-col">
      <div className="flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold dark:text-white">Generar Actas</h1>
          <Button>Generar Acta</Button>
        </div>
        <Button onClick={openPopup} className="w-full lg:w-auto bg-green-500 hover:bg-green-600 mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar acta
        </Button>
        <h2 className="text-xl lg:text-2xl font-bold mb-4 dark:text-white">Actas Agregadas</h2>
        {selectedActas.map(acta => (
          <ActaListItem key={acta.id} acta={acta} onRemove={removeActa} />
        ))}
      </div>
    </div>
  )
}