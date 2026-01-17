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
import { ArrowLeft, Briefcase, MapPin, Save, Shield, User } from "lucide-react";
import { request } from "@/lib/request";
import type { CitizenPayload, GeneroBackend, NivelRiesgo } from "@/lib/types";

const initialForm: CitizenPayload = {
  curp: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  fecha_nacimiento: "",
  genero: "masculino",
  email: "",
  telefono: "",
  direccion: "",
  lugar_procedencia: "",
  ocupacion: "",
  nivel_riesgo: "BAJO",
};

interface FormCiudadanoProps {
  onSubmit: (data: CitizenPayload) => void;
}

export function FormCiudadano({ onSubmit }: FormCiudadanoProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CitizenPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const normalizeGenero = (value?: string): GeneroBackend => {
    if (value === "LGBTQ+") return "LGBTQ+";
    if ((value || "").toLowerCase() === "lgbt+") return "LGBTQ+";
    if (value === "femenino") return "femenino";
    return "masculino";
  };

  const handleChange = <K extends keyof CitizenPayload>(
    field: K,
    value: CitizenPayload[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CitizenPayload = {
      ...formData,
      curp: formData.curp.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      apellido_paterno: formData.apellido_paterno.trim(),
      apellido_materno: formData.apellido_materno?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
      ocupacion: formData.ocupacion?.trim() || undefined,
      genero: normalizeGenero(formData.genero),
      nivel_riesgo: formData.nivel_riesgo as NivelRiesgo,
    };

    try {
      setSubmitting(true);
      const response = await request(
        "/alcoholimetria/citizens/createCitizen",
        "POST",
        payload,
      );

      if (response.status === 201) {
        onSubmit(payload);
        router.push("/ciudadano");
      } else {
        console.error(response.message || "No se pudo registrar al ciudadano");
      }
    } catch (error) {
      console.log(error);
      console.error("Error al enviar el formulario de ciudadano", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              value={formData.curp}
              onChange={(e) =>
                handleChange(
                  "curp",
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 18),
                )
              }
              placeholder="XXXX000000XXXXXX00"
              maxLength={18}
              minLength={18}
              pattern="[A-Z0-9]{18}"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                handleChange(
                  "nombre",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, ""),
                )
              }
              pattern="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
            <Input
              id="apellido_paterno"
              value={formData.apellido_paterno}
              onChange={(e) =>
                handleChange(
                  "apellido_paterno",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, ""),
                )
              }
              pattern="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido_materno">Apellido Materno</Label>
            <Input
              id="apellido_materno"
              value={formData.apellido_materno || ""}
              onChange={(e) =>
                handleChange(
                  "apellido_materno",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, ""),
                )
              }
              pattern="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genero">Género *</Label>
            <Select
              value={formData.genero}
              onValueChange={(value) =>
                handleChange("genero", value as GeneroBackend)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="LGBTQ+">LGBTQ+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Contacto y Procedencia
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="direccion">Dirección completa *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              minLength={5}
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) =>
                handleChange(
                  "telefono",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="6641234567"
              maxLength={10}
              pattern="[0-9]{10}"
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
              placeholder="correo@ejemplo.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="ocupacion">Ocupación</Label>
            <Input
              id="ocupacion"
              value={formData.ocupacion || ""}
              onChange={(e) =>
                handleChange(
                  "ocupacion",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/g, ""),
                )
              }
              placeholder="Profesión u oficio"
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nivel_riesgo">Nivel de riesgo *</Label>
            <Select
              value={formData.nivel_riesgo}
              onValueChange={(value) =>
                handleChange("nivel_riesgo", value as NivelRiesgo)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel de riesgo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAJO">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Bajo
                  </div>
                </SelectItem>
                <SelectItem value="MEDIO">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    Medio
                  </div>
                </SelectItem>
                <SelectItem value="ALTO">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    Alto
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Registrar Ciudadano"}
        </Button>
      </div>
    </form>
  );
}
