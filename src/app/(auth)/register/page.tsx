'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const registerSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  dni: z.string().length(8, { message: "El DNI debe tener 8 dígitos" }),
  nombres: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  apellido_paterno: z.string().min(2, { message: "El apellido paterno debe tener al menos 2 caracteres" }),
  apellido_materno: z.string().min(2, { message: "El apellido materno debe tener al menos 2 caracteres" }),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  sexo: z.enum(['Masculino', 'Femenino']).optional(),
  dia: z.string(),
  mes: z.string(),
  anio: z.string(),
}).refine((data) => {
  const { dia, mes, anio } = data;
  const fecha = new Date(`${anio}-${mes}-${dia}`);
  return fecha < new Date() && fecha.toString() !== 'Invalid Date';
}, {
  message: "La fecha de nacimiento no es válida o está en el futuro",
  path: ['dia', 'mes', 'anio'],
});

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [, setErrors] = useState<{ [key: string]: { message: string } }>({});
  const { register, control, handleSubmit, formState: { errors: formErrors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  })
  const router = useRouter();

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setErrors({});

    const formattedData = {
      email: data.email,
      password: data.password,
      dni: data.dni,
      nombres: data.nombres,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      sexo: data.sexo || "Masculino",
      fecha_nacimiento: `${data.anio}-${data.mes}-${data.dia}T00:00:00.000Z`
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      }
    );

    const responseAPI = await res.json();

    if (!res.ok) {
      setErrors(responseAPI.errors);
      setIsLoading(false);
      return;
    }

    const responseNextAuth = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (responseNextAuth?.error) {
      setErrors({ form: { message: responseNextAuth.error } });
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const dias = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ]
  const anios = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" {...register('email')} />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" {...register('password')} />
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" {...register('dni')} />
                  {formErrors.dni && <p className="text-sm text-red-500">{formErrors.dni.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input id="nombres" {...register('nombres')} />
                  {formErrors.nombres && <p className="text-sm text-red-500">{formErrors.nombres.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                  <Input id="apellido_paterno" {...register('apellido_paterno')} />
                  {formErrors.apellido_paterno && <p className="text-sm text-red-500">{formErrors.apellido_paterno.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input id="apellido_materno" {...register('apellido_materno')} />
                  {formErrors.apellido_materno && <p className="text-sm text-red-500">{formErrors.apellido_materno.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input id="telefono" {...register('telefono')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección (opcional)</Label>
                <Input id="direccion" {...register('direccion')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Controller
                  name="sexo"
                  control={control}
                  defaultValue="Masculino"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Controller
                    name="dia"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Día" />
                        </SelectTrigger>
                        <SelectContent>
                          {dias.map((dia) => (
                            <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name="mes"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {meses.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name="anio"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                          {anios.map((anio) => (
                            <SelectItem key={anio} value={anio}>{anio}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {(formErrors.dia || formErrors.mes || formErrors.anio) && (
                  <p className="text-sm text-red-500">La fecha de nacimiento no es válida</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Cargando...' : 'Registrarse'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}