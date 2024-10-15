import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FUTFormProps {
  onSubmit: (data: Record<string, string | File>) => void;
}

export default function FUTForm({ onSubmit }: FUTFormProps) {
  const [, setTipoSolicitud] = useState("")
  const [documentoAdjunto, setDocumentoAdjunto] = useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(Object.fromEntries(formData))
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Formulario Único de Trámite (FUT)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" name="nombres" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
              <Input id="apellidoPaterno" name="apellidoPaterno" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
              <Input id="apellidoMaterno" name="apellidoMaterno" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" name="dni" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distrito">Distrito</Label>
              <Input id="distrito" name="distrito" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input id="provincia" name="provincia" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Input id="departamento" name="departamento" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solicitud">Solicitud</Label>
            <Textarea id="solicitud" name="solicitud" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoSolicitud">Tipo de Solicitud</Label>
            <Select onValueChange={setTipoSolicitud} name="tipoSolicitud" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de solicitud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CertificadoEstudio">Certificado de Estudio</SelectItem>
                <SelectItem value="ConstanciaEstudio">Constancia de Estudio</SelectItem>
                <SelectItem value="RectificacionNombre">Rectificación de Nombre</SelectItem>
                <SelectItem value="AutorizacionSubsanacion">Autorización de Subsanación</SelectItem>
                <SelectItem value="ConstanciaVacante">Constancia de Vacante</SelectItem>
                <SelectItem value="CertificadoConducta">Certificado de Conducta</SelectItem>
                <SelectItem value="ExonerarArea">Exonerar Área</SelectItem>
                <SelectItem value="LicenciaPermiso">Licencia/Permiso</SelectItem>
                <SelectItem value="TrasladoMatricula">Traslado de Matrícula</SelectItem>
                <SelectItem value="PruebaUbicacion">Prueba de Ubicación</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formulacionCompleta">Formulación Completa</Label>
            <Textarea id="formulacionCompleta" name="formulacionCompleta" required />
          </div>

          <div className="space-y-2">
            <Label>Documento Adjunto (Opcional)</Label>
            <div className="flex items-center space-x-4">
              <Input type="file" id="documentoAdjunto" name="documentoAdjunto" />
              <RadioGroup onValueChange={setDocumentoAdjunto} name="tipoDocumentoAdjunto">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="boleta" id="boleta" />
                  <Label htmlFor="boleta">Boleta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="documento" id="documento" />
                  <Label htmlFor="documento">Documento</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {documentoAdjunto && (
            <div className="space-y-2">
              <Label htmlFor="descripcionDocumento">Descripción del {documentoAdjunto}</Label>
              <Input id="descripcionDocumento" name="descripcionDocumento" />
            </div>
          )}

          <Button type="submit" className="w-full">Enviar FUT</Button>
        </form>
      </CardContent>
    </Card>
  )
}