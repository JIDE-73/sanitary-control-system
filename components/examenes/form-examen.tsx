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
import { TestTube, User, Save, ArrowLeft, Search } from "lucide-react"
import { afiliados, tiposExamen, laboratorios } from "@/lib/mock-data"
import type { ExamenClinico, Afiliado } from "@/lib/types"

interface FormExamenProps {
  onSubmit: (data: Partial<ExamenClinico>) => void
}

export function FormExamen({ onSubmit }: FormExamenProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const afiliadoIdParam = searchParams.get("afiliado")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(
    afiliadoIdParam ? afiliados.find((a) => a.id === afiliadoIdParam) || null : null,
  )
  const [searchResults, setSearchResults] = useState<Afiliado[]>([])
  const [formData, setFormData] = useState<Partial<ExamenClinico>>({
    afiliadoId: afiliadoIdParam || "",
    fechaOrden: new Date().toISOString().split("T")[0],
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

  const handleChange = (field: keyof ExamenClinico, value: string) => {
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

      {/* Datos del Afiliado */}
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

      {/* Datos del Examen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="h-5 w-5 text-primary" />
            Datos del Examen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="tipoExamen">Tipo de Examen *</Label>
            <Select value={formData.tipoExamen || ""} onValueChange={(value) => handleChange("tipoExamen", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposExamen.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.codigo}>
                    {tipo.nombre}
                    {tipo.obligatorio && " (Obligatorio)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaOrden">Fecha de Orden *</Label>
            <Input
              id="fechaOrden"
              type="date"
              value={formData.fechaOrden || ""}
              onChange={(e) => handleChange("fechaOrden", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaProximoExamen">Fecha Próximo Examen</Label>
            <Input
              id="fechaProximoExamen"
              type="date"
              value={formData.fechaProximoExamen || ""}
              onChange={(e) => handleChange("fechaProximoExamen", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="laboratorioId">Laboratorio</Label>
            <Select
              value={formData.laboratorioId || ""}
              onValueChange={(value) => handleChange("laboratorioId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar laboratorio" />
              </SelectTrigger>
              <SelectContent>
                {laboratorios
                  .filter((l) => l.estatus === "activo")
                  .map((lab) => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones || ""}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Indicaciones especiales para el laboratorio..."
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
          Ordenar Examen
        </Button>
      </div>
    </form>
  )
}
