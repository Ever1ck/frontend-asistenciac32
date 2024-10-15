import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileImage, FileText } from 'lucide-react'
import { años, grados, secciones } from './utils'

export function AgregarActaDialog({ 
  isOpen, 
  onClose, 
  onFileChange, 
  onDrop, 
  onDragOver,
  isSelectingRegistered,
  setIsSelectingRegistered,
  tipoActa,
  setTipoActa,
  año,
  setAño,
  grado,
  setGrado,
  setSeccion,
  actasDisponibles,
  isActaSelected,
  handleActaSelection,
  handleAddActas,
  handleCancelSelection
}: {
  isOpen: boolean;
  onClose: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  isSelectingRegistered: boolean;
  setIsSelectingRegistered: (value: boolean) => void;
  tipoActa: string | null;
  setTipoActa: (value: string) => void;
  año: string | null;
  setAño: (value: string) => void;
  grado: string | null;
  setGrado: (value: string) => void;
  seccion: string | null;
  setSeccion: (value: string) => void;
  actasDisponibles: string[];
  isActaSelected: (actaId: string) => boolean;
  handleActaSelection: (actaId: string) => void;
  handleAddActas: () => void;
  handleCancelSelection: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Agregar Acta</DialogTitle>
        </DialogHeader>
        {!isSelectingRegistered ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div 
              className="w-full md:w-1/2 h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer dark:border-gray-600"
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Arrastra y suelta un archivo aquí o</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={onFileChange}
                  accept="image/*,.pdf"
                  id="file-upload"
                  multiple
                />
                <label htmlFor="file-upload" className="mt-2 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700">
                  Seleccionar archivo(s)
                </label>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <Button onClick={() => setIsSelectingRegistered(true)} className="w-full">
                Seleccionar Actas Registradas
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 space-y-4">
              <Select onValueChange={setTipoActa}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Tipo de Acta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="recuperacion">Recuperación</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setAño} disabled={!tipoActa}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {años.map(año => (
                    <SelectItem key={año} value={año.toString()}>{año}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setGrado} disabled={!año}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                  {grados.map(grado => (
                    <SelectItem key={grado} value={grado}>{grado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSeccion} disabled={!grado}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Sección" />
                </SelectTrigger>
                <SelectContent>
                  {secciones.map(seccion => (
                    <SelectItem key={seccion} value={seccion}>{seccion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/2 border rounded-lg p-4 dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Actas disponibles</h3>
              {actasDisponibles.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {actasDisponibles.map((i) => (
                    <div 
                      key={i} 
                      className={`cursor-pointer border rounded-lg p-2 ${isActaSelected(i) ? 'border-primary' : ''} dark:border-gray-600`}
                      onClick={() => handleActaSelection(i)}
                    >
                      {Math.random() > 0.5 ? (
                        <FileImage className="h-16 w-16 mx-auto dark:text-gray-300" />
                      ) : (
                        <FileText className="h-16 w-16 mx-auto dark:text-gray-300" />
                      )}
                      <p className="text-center mt-2 dark:text-white">Acta {i}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Selecciona todos los campos para ver las actas disponibles
                </p>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={handleCancelSelection}>
            Cancelar
          </Button>
          <Button onClick={handleAddActas} disabled={actasDisponibles.length === 0}>
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}