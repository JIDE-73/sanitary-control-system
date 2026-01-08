"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, Save, ArrowLeft, ShieldCheck } from "lucide-react";
import type { LaboratorioListado, LaboratorioPayload } from "@/lib/types";

interface FormLaboratorioProps {
  laboratorio?: LaboratorioListado;
  onSubmit: (data: LaboratorioPayload) => void;
}

const initialForm: LaboratorioPayload = {
  nombre_comercial: "",
  rfc: "",
  certificado_organismo: false,
  email_contacto: "",
};

export function FormLaboratorio({
  laboratorio,
  onSubmit,
}: FormLaboratorioProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LaboratorioPayload>(() => {
    if (!laboratorio) return initialForm;
    return {
      nombre_comercial: laboratorio.nombre_comercial ?? "",
      rfc: laboratorio.rfc ?? "",
      certificado_organismo: Boolean(laboratorio.certificado_organismo),
      email_contacto: laboratorio.email_contacto ?? "",
    };
  });

  const handleChange = <K extends keyof LaboratorioPayload>(
    field: K,
    value: LaboratorioPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LaboratorioPayload = {
      ...formData,
      nombre_comercial: formData.nombre_comercial.trim(),
      rfc: formData.rfc.trim().toUpperCase(),
      email_contacto: formData.email_contacto.trim(),
      certificado_organismo: Boolean(formData.certificado_organismo),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="h-5 w-5 text-primary" />
            Información del Laboratorio
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="nombre_comercial">Nombre Comercial *</Label>
            <Input
              id="nombre_comercial"
              value={formData.nombre_comercial}
              onChange={(e) =>
                handleChange("nombre_comercial", e.target.value.slice(0, 120))
              }
              placeholder="Laboratorio Central"
              minLength={3}
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rfc">RFC *</Label>
            <Input
              id="rfc"
              value={formData.rfc}
              onChange={(e) =>
                handleChange(
                  "rfc",
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 13)
                )
              }
              placeholder="FVKD097865RS9"
              minLength={12}
              maxLength={13}
              pattern="[A-Z0-9]{12,13}"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificado_organismo">Certificado</Label>
            <Select
              value={formData.certificado_organismo ? "true" : "false"}
              onValueChange={(value) =>
                handleChange("certificado_organismo", value === "true")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí, certificado</SelectItem>
                <SelectItem value="false">No certificado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="email">Email de Contacto *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email_contacto}
              onChange={(e) => handleChange("email_contacto", e.target.value)}
              placeholder="contacto@laboratorio.com"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              La edición y eliminación estarán disponibles próximamente.
            </p>
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
          {laboratorio ? "Guardar Cambios" : "Registrar Laboratorio"}
        </Button>
      </div>
    </form>
  );
}
