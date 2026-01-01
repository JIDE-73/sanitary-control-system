"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, MapPin, Briefcase, Save, ArrowLeft } from "lucide-react"
import type { Afiliado, LugarTrabajo, Genero, EstatusAfiliado } from "@/lib/types"

interface FormAfiliadoProps {
  afiliado?: Afiliado
  lugaresTrabajo: LugarTrabajo[]
  onSubmit: (data: Partial<Afiliado>) => void
}

export function FormAfiliado({ afiliado, lugaresTrabajo, onSubmit }: FormAfiliadoProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Afiliado>>(
    afiliado || {
      genero: "masculino",
      estatus: "pendiente",
    },
  )

  const handleChange = (field: keyof Afiliado, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="curp">CURP *</Label>
            <Input
              id="curp"
              value={formData.curp || ""}
              onChange={(e) => handleChange("curp", e.target.value.toUpperCase())}
              placeholder="XXXX000000XXXXXX00"
              maxLength={18}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombres">Nombres *</Label>
            <Input
              id="nombres"
              value={formData.nombres || ""}
              onChange={(e) => handleChange("nombres", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
            <Input
              id="apellidoPaterno"
              value={formData.apellidoPaterno || ""}
              onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellidoMaterno">Apellido Materno *</Label>
            <Input
              id="apellidoMaterno"
              value={formData.apellidoMaterno || ""}
              onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento || ""}
              onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genero">Género *</Label>
            <Select value={formData.genero} onValueChange={(value) => handleChange("genero", value as Genero)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="lgbt+">LGBT+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estatus">Estatus *</Label>
            <Select
              value={formData.estatus}
              onValueChange={(value) => handleChange("estatus", value as EstatusAfiliado)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dirección y Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Dirección y Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="calle">Calle y Número *</Label>
            <Input
              id="calle"
              value={formData.calle || ""}
              onChange={(e) => handleChange("calle", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="colonia">Colonia *</Label>
            <Input
              id="colonia"
              value={formData.colonia || ""}
              onChange={(e) => handleChange("colonia", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigoPostal">Código Postal *</Label>
            <Input
              id="codigoPostal"
              value={formData.codigoPostal || ""}
              onChange={(e) => handleChange("codigoPostal", e.target.value)}
              maxLength={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad *</Label>
            <Input
              id="ciudad"
              value={formData.ciudad || ""}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <Input
              id="estado"
              value={formData.estado || ""}
              onChange={(e) => handleChange("estado", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              placeholder="6641234567"
              maxLength={10}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lugarProcedencia">Lugar de Procedencia</Label>
            <Input
              id="lugarProcedencia"
              value={formData.lugarProcedencia || ""}
              onChange={(e) => handleChange("lugarProcedencia", e.target.value)}
              placeholder="Ciudad, Estado"
            />
          </div>
        </CardContent>
      </Card>

      {/* Información Laboral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Información Laboral
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lugarTrabajoId">Lugar de Trabajo</Label>
            <Select
              value={formData.lugarTrabajoId || ""}
              onValueChange={(value) => handleChange("lugarTrabajoId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lugar de trabajo" />
              </SelectTrigger>
              <SelectContent>
                {lugaresTrabajo.map((lugar) => (
                  <SelectItem key={lugar.id} value={lugar.id}>
                    {lugar.codigo} - {lugar.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocupacion">Ocupación</Label>
            <Input
              id="ocupacion"
              value={formData.ocupacion || ""}
              onChange={(e) => handleChange("ocupacion", e.target.value)}
              placeholder="Ej: Mesero, Cocinero, Bartender"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          {afiliado ? "Guardar Cambios" : "Registrar Afiliado"}
        </Button>
      </div>
    </form>
  )
}
