import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { Acta } from './types'

export function ActaListItem({ acta, onRemove }: { acta: Acta; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-2">
      <span className="dark:text-white">{acta.name}</span>
      <Button variant="ghost" size="icon" onClick={() => onRemove(acta.id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}