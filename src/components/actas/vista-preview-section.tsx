import { ActaPreview } from "./acta-preview";
import { Acta } from './types'

export function VistaPreviewSection({ 
  selectedActas, 
  handleImageLoad 
}: { 
  selectedActas: Acta[]; 
  handleImageLoad: (id: string, naturalWidth: number, naturalHeight: number) => void;
}) {
  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-8 bg-gray-100 dark:bg-gray-800 overflow-y-auto">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 dark:text-white">Vista previa de Actas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedActas.map(acta => (
          <ActaPreview key={acta.id} acta={acta} onImageLoad={handleImageLoad} />
        ))}
      </div>
    </div>
  )
}