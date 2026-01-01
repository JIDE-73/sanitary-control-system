"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestTube, Save, ArrowLeft } from "lucide-react"
import type { ExamenClinico, ResultadoVDRL } from "@/lib/types"

interface FormResultadoProps {
  examen: ExamenClinico
  onSubmit: (data: Partial<ExamenClinico>) => void
}

export function FormResultado({ examen, onSubmit }: FormResultadoProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<ExamenClinico>>({
    fechaResultado: new Date().toISOString().split("T")[0],
    resultado: examen.resultado || "",
    resultadoVDRL: examen.resultadoVDRL,
    dilucionVDRL: examen.dilucionVDRL || "",
    observaciones: examen.observaciones || "",
  })

  const handleChange = (field: keyof ExamenClinico, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isVDRL = examen.tipoExamen === "VDRL"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="h-5 w-5 text-primary" />
            Registrar Resultado - {examen.tipoExamen}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fechaResultado">Fecha del Resultado *</Label>
            <Input
              id="fechaResultado"
              type="date"
              value={formData.fechaResultado || ""}
              onChange={(e) => handleChange("fechaResultado", e.target.value)}
              required
            />
          </div>

          {isVDRL ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="resultadoVDRL">Resultado VDRL *</Label>
                <Select
                  value={formData.resultadoVDRL || ""}
                  onValueChange={(value) => handleChange("resultadoVDRL", value as ResultadoVDRL)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negativo">Negativo</SelectItem>
                    <SelectItem value="positivo">Positivo</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dilucionVDRL">Dilución VDRL</Label>
                <Input
                  id="dilucionVDRL"
                  value={formData.dilucionVDRL || ""}
                  onChange={(e) => handleChange("dilucionVDRL", e.target.value)}
                  placeholder="Ej: 1:2, 1:4, 1:8"
                />
                <p className="text-xs text-muted-foreground">Dejar vacío si es negativo</p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="resultado">Resultado *</Label>
              <Input
                id="resultado"
                value={formData.resultado || ""}
                onChange={(e) => handleChange("resultado", e.target.value)}
                placeholder="Ej: Normal, No reactivo, Positivo"
                required
              />
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones || ""}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Notas adicionales sobre el resultado..."
              rows={3}
            />
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
          Guardar Resultado
        </Button>
      </div>
    </form>
  )
}
