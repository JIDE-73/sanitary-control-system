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
import { Stethoscope, Save, ArrowLeft } from "lucide-react";
import type { DoctorPayload, Medico } from "@/lib/types";

interface FormMedicoProps {
  medico?: Medico;
  onSubmit: (data: DoctorPayload) => void;
}

const initialForm: DoctorPayload = {
  curp: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  fecha_nacimiento: "",
  genero: "masculino",
  direccion: "",
  telefono: "",
  email: "",
  cedula_profesional: "",
  especialidad: "",
  habilitado_para_firmar: false,
};

export function FormMedico({ medico, onSubmit }: FormMedicoProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DoctorPayload>(() => {
    if (!medico) return initialForm;
    return {
      curp: "",
      nombre: medico.nombres ?? "",
      apellido_paterno: medico.apellidoPaterno ?? "",
      apellido_materno: medico.apellidoMaterno ?? "",
      fecha_nacimiento: "",
      genero: "masculino",
      direccion: "",
      telefono: medico.telefono ?? "",
      email: medico.email ?? "",
      cedula_profesional: medico.cedulaProfesional ?? "",
      especialidad: medico.especialidad ?? "",
      habilitado_para_firmar: false,
    };
  });

  const handleChange = <K extends keyof DoctorPayload>(
    field: K,
    value: DoctorPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: DoctorPayload = {
      ...formData,
      curp: formData.curp.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      apellido_paterno: formData.apellido_paterno.trim(),
      apellido_materno: formData.apellido_materno?.trim() || undefined,
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email?.trim() || undefined,
      especialidad: formData.especialidad.trim(),
      cedula_profesional: formData.cedula_profesional.trim(),
    };
    onSubmit(payload);
  };

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
                    .slice(0, 18)
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
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
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
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
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
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
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
                handleChange("genero", value as DoctorPayload["genero"])
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
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="direccion">Dirección *</Label>
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
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="6641234567"
              maxLength={10}
              pattern="\d{10}"
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
              placeholder="dr.nombre@correo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cedula_profesional">Cédula Profesional *</Label>
            <Input
              id="cedula_profesional"
              value={formData.cedula_profesional}
              onChange={(e) =>
                handleChange(
                  "cedula_profesional",
                  e.target.value.trim().toUpperCase()
                )
              }
              placeholder="FPMOMCT1"
              minLength={5}
              maxLength={20}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="especialidad">Especialidad *</Label>
            <Input
              id="especialidad"
              value={formData.especialidad}
              onChange={(e) => handleChange("especialidad", e.target.value)}
              placeholder="Cardiólogo"
              minLength={2}
              maxLength={60}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="habilitado_para_firmar"
              type="checkbox"
              checked={formData.habilitado_para_firmar}
              onChange={(e) =>
                handleChange(
                  "habilitado_para_firmar",
                  Boolean(e.target.checked)
                )
              }
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="habilitado_para_firmar" className="mt-1">
              Habilitado para firmar
            </Label>
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
  );
}
