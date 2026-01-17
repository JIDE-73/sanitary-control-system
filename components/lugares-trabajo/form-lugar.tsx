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
import { Building2, MapPin, Save, ArrowLeft } from "lucide-react";
import type { LugarTrabajo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface FormLugarProps {
  lugar?: LugarTrabajo;
  onSubmit: (data: Partial<LugarTrabajo>) => void;
}

export function FormLugar({ lugar, onSubmit }: FormLugarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<LugarTrabajo>>(
    lugar || {
      estatus: "activo",
    },
  );

  const handleChange = (field: keyof LugarTrabajo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalize = (value?: string) => (value ? value.trim() : "");
    const digitsOnly = (value?: string) =>
      value ? value.replace(/\D/g, "") : "";

    type RequiredLugarField =
      | "codigo"
      | "nombre"
      | "zonaTrabajo"
      | "calle"
      | "colonia"
      | "codigoPostal"
      | "ciudad"
      | "estado"
      | "telefono";

    const sanitized: Partial<LugarTrabajo> = {
      ...formData,
      codigo: normalize(formData.codigo).toUpperCase(),
      nombre: normalize(formData.nombre),
      zonaTrabajo: normalize(formData.zonaTrabajo),
      calle: normalize(formData.calle),
      colonia: normalize(formData.colonia),
      codigoPostal: digitsOnly(formData.codigoPostal),
      ciudad: normalize(formData.ciudad),
      estado: normalize(formData.estado),
      telefono: digitsOnly(formData.telefono),
    };

    const requiredFields: Array<{ key: RequiredLugarField; label: string }> = [
      { key: "codigo", label: "Código" },
      { key: "nombre", label: "Nombre del establecimiento" },
      { key: "zonaTrabajo", label: "Zona de trabajo" },
      { key: "calle", label: "Calle" },
      { key: "colonia", label: "Colonia" },
      { key: "codigoPostal", label: "Código postal" },
      { key: "ciudad", label: "Ciudad" },
      { key: "estado", label: "Estado" },
      { key: "telefono", label: "Teléfono" },
    ];

    const missing = requiredFields.filter(({ key }) => {
      const value = sanitized[key];
      return typeof value !== "string" || value.length === 0;
    });

    if (missing.length > 0) {
      toast({
        title: "Campos obligatorios",
        description: `Completa: ${missing.map((f) => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (sanitized.codigoPostal && sanitized.codigoPostal.length !== 5) {
      toast({
        title: "Código postal inválido",
        description: "Debe contener 5 dígitos",
        variant: "destructive",
      });
      return;
    }

    if (sanitized.telefono && sanitized.telefono.length !== 10) {
      toast({
        title: "Teléfono inválido",
        description: "Debes capturar 10 dígitos",
        variant: "destructive",
      });
      return;
    }

    onSubmit(sanitized);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Información del Establecimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo || ""}
              onChange={(e) =>
                handleChange("codigo", e.target.value.toUpperCase())
              }
              placeholder="A-00"
              required
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="nombre">Nombre del Establecimiento *</Label>
            <Input
              id="nombre"
              value={formData.nombre || ""}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Nombre del local o establecimiento"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zonaTrabajo">Zona de Trabajo *</Label>
            <Select
              value={formData.zonaTrabajo || ""}
              onValueChange={(value) => handleChange("zonaTrabajo", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar zona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Zona Centro">Zona Centro</SelectItem>
                <SelectItem value="Zona Río">Zona Río</SelectItem>
                <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                <SelectItem value="Zona Este">Zona Este</SelectItem>
                <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                <SelectItem value="Playas de Tijuana">
                  Playas de Tijuana
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Dirección
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          {lugar ? "Guardar Cambios" : "Registrar Lugar"}
        </Button>
      </div>
    </form>
  );
}
