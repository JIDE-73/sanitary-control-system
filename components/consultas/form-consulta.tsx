"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stethoscope, User, Activity, FileText, Save, ArrowLeft, Search } from "lucide-react"
import { afiliados, medicos } from "@/lib/mock-data"
import type { ConsultaClinica, Afiliado } from "@/lib/types"

interface FormConsultaProps {
  onSubmit: (data: Partial<ConsultaClinica>) => void
}

export function FormConsulta({ onSubmit }: FormConsultaProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const afiliadoIdParam = searchParams.get("afiliado")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(
    afiliadoIdParam ? afiliados.find((a) => a.id === afiliadoIdParam) || null : null,
  )
  const [searchResults, setSearchResults] = useState<Afiliado[]>([])
  const [formData, setFormData] = useState<Partial<ConsultaClinica>>({
    afiliadoId: afiliadoIdParam || "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    const term = searchQuery.toLowerCase()
    const results = afiliados.filter(
      (a) =>
        a.curp.toLowerCase().includes(term) ||
        a.id.includes(term) ||
        a.nombres.toLowerCase().includes(term) ||
        a.apellidoPaterno.toLowerCase().includes(term),
    )
    setSearchResults(results)
  }

  const handleSelectAfiliado = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado)
    setFormData((prev) => ({ ...prev, afiliadoId: afiliado.id }))
    setSearchResults([])
    setSearchQuery("")
  }

  const handleChange = (field: keyof ConsultaClinica, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda de Afiliado */}
      {!selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Buscar Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por CURP, número de afiliado o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              />
              <Button type="button" onClick={handleSearch}>
                Buscar
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((afiliado) => (
                  <div
                    key={afiliado.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectAfiliado(afiliado)}
                  >
                    <div>
                      <p className="font-medium">
                        {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">{afiliado.curp}</p>
                    </div>
                    <Button type="button" size="sm">
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Datos del Afiliado Seleccionado */}
      {selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Datos del Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {selectedAfiliado.nombres} {selectedAfiliado.apellidoPaterno} {selectedAfiliado.apellidoMaterno}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CURP</p>
                  <p className="font-mono font-medium">{selectedAfiliado.curp}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium capitalize">{selectedAfiliado.genero}</p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => setSelectedAfiliado(null)}>
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datos de la Consulta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Datos de la Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="medicoId">Médico *</Label>
            <Select value={formData.medicoId || ""} onValueChange={(value) => handleChange("medicoId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar médico" />
              </SelectTrigger>
              <SelectContent>
                {medicos
                  .filter((m) => m.estatus === "activo")
                  .map((medico) => (
                    <SelectItem key={medico.id} value={medico.id}>
                      Dr(a). {medico.nombres} {medico.apellidoPaterno} - {medico.especialidad}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha || ""}
              onChange={(e) => handleChange("fecha", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tensionArterial">Tensión Arterial *</Label>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <Input
                id="tensionArterial"
                value={formData.tensionArterial || ""}
                onChange={(e) => handleChange("tensionArterial", e.target.value)}
                placeholder="120/80"
                required
              />
              <span className="text-sm text-muted-foreground">mmHg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico y Tratamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Diagnóstico y Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea
              id="diagnostico"
              value={formData.diagnostico || ""}
              onChange={(e) => handleChange("diagnostico", e.target.value)}
              placeholder="Describir el diagnóstico del paciente..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tratamiento">Tratamiento *</Label>
            <Textarea
              id="tratamiento"
              value={formData.tratamiento || ""}
              onChange={(e) => handleChange("tratamiento", e.target.value)}
              placeholder="Indicar el tratamiento recomendado..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios Adicionales</Label>
            <Textarea
              id="comentarios"
              value={formData.comentarios || ""}
              onChange={(e) => handleChange("comentarios", e.target.value)}
              placeholder="Observaciones o notas adicionales..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={!selectedAfiliado}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Consulta
        </Button>
      </div>
    </form>
  )
}
