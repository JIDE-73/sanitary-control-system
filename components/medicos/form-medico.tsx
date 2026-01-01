"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stethoscope, Save, ArrowLeft, Upload } from "lucide-react"
import type { Medico, EstatusMedico } from "@/lib/types"

interface FormMedicoProps {
  medico?: Medico
  onSubmit: (data: Partial<Medico>) => void
}

export function FormMedico({ medico, onSubmit }: FormMedicoProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Medico>>(
    medico || {
      estatus: "activo",
    },
  )

  const handleChange = (field: keyof Medico, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Información del Médico
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cedulaProfesional">Cédula Profesional *</Label>
            <Input
              id="cedulaProfesional"
              value={formData.cedulaProfesional || ""}
              onChange={(e) => handleChange("cedulaProfesional", e.target.value)}
              placeholder="12345678"
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
            <Label htmlFor="nombres">Nombres *</Label>
            <Input
              id="nombres"
              value={formData.nombres || ""}
              onChange={(e) => handleChange("nombres", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad *</Label>
            <Select value={formData.especialidad || ""} onValueChange={(value) => handleChange("especialidad", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medicina General">Medicina General</SelectItem>
                <SelectItem value="Epidemiología">Epidemiología</SelectItem>
                <SelectItem value="Medicina Preventiva">Medicina Preventiva</SelectItem>
                <SelectItem value="Salud Pública">Salud Pública</SelectItem>
                <SelectItem value="Dermatología">Dermatología</SelectItem>
                <SelectItem value="Ginecología">Ginecología</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estatus">Estatus *</Label>
            <Select value={formData.estatus} onValueChange={(value) => handleChange("estatus", value as EstatusMedico)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="email">Email Institucional *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="dr.nombre@salud.gob.mx"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firma">Firma Digital</Label>
            <div className="flex gap-2">
              <Input id="firma" type="file" accept="image/*" className="flex-1" />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Formato: PNG o JPG. Máx: 2MB</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          {medico ? "Guardar Cambios" : "Registrar Médico"}
        </Button>
      </div>
    </form>
  )
}
