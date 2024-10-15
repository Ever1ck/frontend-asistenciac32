import Image from 'next/image'
import { FileText } from 'lucide-react'
import { Acta } from './types'

export function ActaPreview({ acta, onImageLoad }: { acta: Acta; onImageLoad: (id: string, naturalWidth: number, naturalHeight: number) => void }) {
  return (
    <div className="bg-white dark:bg-gray-700 shadow-lg rounded-lg overflow-hidden" style={{
      aspectRatio: '1 / 1.4142',
      maxWidth: '210mm',
      maxHeight: '297mm',
    }}>
      {acta.type === 'file' && acta.file?.type.startsWith('image/') && acta.url ? (
        <Image 
          src={acta.url}
          alt={`Vista previa de ${acta.name}`}
          layout="responsive"
          width={acta.dimensions?.width || 300}
          height={acta.dimensions?.height || 400}
          className={`object-contain ${acta.orientation === 'landscape' ? 'rotate-90' : ''}`}
          onLoadingComplete={({ naturalWidth, naturalHeight }) => 
            onImageLoad(acta.id, naturalWidth, naturalHeight)
          }
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <FileText className="h-32 w-32 text-gray-400 dark:text-gray-500" />
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-300 text-center">{acta.name}</p>
        </div>
      )}
    </div>
  )
}