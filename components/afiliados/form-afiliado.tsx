"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { User, MapPin, Briefcase, Save, ArrowLeft } from "lucide-react";
import type {
  Afiliado,
  AffiliatePayload,
  EstadoCivil,
  GeneroBackend,
  LugarTrabajo,
} from "@/lib/types";
import { request } from "@/lib/request";

const MEXICO_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Coahuila",
  "Colima",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "México",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
] as const;

const COUNTRIES = [
  "Estados Unidos",
  "Canadá",
  "Guatemala",
  "Colombia",
  "Argentina",
  "España",
  "Francia",
  "Alemania",
  "China",
  "Japón",
  "Brasil",
  "Perú",
  "Chile",
  "Cuba",
] as const;

interface FormAfiliadoProps {
  afiliado?: Afiliado;
  lugaresTrabajo: LugarTrabajo[];
  lugaresLoading?: boolean;
  onSubmit: (data: AffiliatePayload) => void;
}

export function FormAfiliado({
  afiliado,
  lugaresTrabajo,
  lugaresLoading = false,
  onSubmit,
}: FormAfiliadoProps) {
  const router = useRouter();
  const isEdit = Boolean(afiliado?.id);
  const [submitting, setSubmitting] = useState(false);
  const [isExtranjero, setIsExtranjero] = useState<boolean>(() =>
    afiliado?.lugarProcedencia
      ? !MEXICO_STATES.includes(
          afiliado.lugarProcedencia as (typeof MEXICO_STATES)[number]
        )
      : false
  );

  const normalizeGenero = (value?: string): GeneroBackend => {
    if (value === "LGBTQ+") return "LGBTQ+";
    if (value?.toLowerCase() === "lgbt+") return "LGBTQ+";
    if (value === "femenino") return "femenino";
    return "masculino";
  };

  const buildDireccion = (afiliadoData?: Afiliado) => {
    if (!afiliadoData) return "";
    if (afiliadoData.direccion) return afiliadoData.direccion;
    return [
      afiliadoData.calle,
      afiliadoData.colonia,
      afiliadoData.codigoPostal,
      afiliadoData.ciudad,
      afiliadoData.estado,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getInitialData = (afiliadoData?: Afiliado): AffiliatePayload => ({
    curp: afiliadoData?.curp ?? "",
    nombre: afiliadoData?.nombres ?? "",
    apellido_paterno: afiliadoData?.apellidoPaterno ?? "",
    apellido_materno: afiliadoData?.apellidoMaterno ?? "",
    fecha_nacimiento: afiliadoData?.fechaNacimiento
      ? afiliadoData.fechaNacimiento.slice(0, 10)
      : "",
    genero: normalizeGenero(afiliadoData?.genero),
    direccion: buildDireccion(afiliadoData),
    telefono: afiliadoData?.telefono ?? "",
    email: afiliadoData?.email ?? "",
    lugar_procedencia: afiliadoData?.lugarProcedencia ?? "",
    estado_civil:
      (afiliadoData?.estadoCivil as EstadoCivil | undefined) ?? "SOLTERO",
    lugar_trabajo: afiliadoData?.lugarTrabajoId ?? "",
    fecha_inicio: afiliadoData?.fechaInicio
      ? afiliadoData.fechaInicio.slice(0, 10)
      : "",
    fecha_inicio_tijuana: afiliadoData?.fechaInicioTijuana
      ? afiliadoData.fechaInicioTijuana.slice(0, 10)
      : "",
    acta_nacimiento: Boolean(afiliadoData?.actaNacimiento),
  });

  const [formData, setFormData] = useState<AffiliatePayload>(() =>
    getInitialData(afiliado)
  );

  useEffect(() => {
    setFormData(getInitialData(afiliado));
    setIsExtranjero(
      afiliado?.lugarProcedencia
        ? !MEXICO_STATES.includes(
            afiliado.lugarProcedencia as (typeof MEXICO_STATES)[number]
          )
        : false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [afiliado?.id]);

  const hasLugaresTrabajo = lugaresTrabajo.length > 0;

  const handleChange = <K extends keyof AffiliatePayload>(
    field: K,
    value: AffiliatePayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AffiliatePayload = {
      ...formData,
      curp: formData.curp.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      apellido_paterno: formData.apellido_paterno.trim(),
      apellido_materno: formData.apellido_materno?.trim() || undefined,
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email?.trim() || undefined,
      lugar_procedencia: formData.lugar_procedencia.trim(),
      estado_civil: formData.estado_civil,
      lugar_trabajo: formData.lugar_trabajo,
      fecha_nacimiento: formData.fecha_nacimiento,
      fecha_inicio: formData.fecha_inicio,
      fecha_inicio_tijuana: formData.fecha_inicio_tijuana,
      acta_nacimiento: Boolean(formData.acta_nacimiento),
      genero: formData.genero,
    };

    if (!payload.lugar_trabajo) {
      console.error("Selecciona un lugar de trabajo válido");
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = isEdit
        ? `/sics/affiliates/updateAffiliate/${afiliado?.id}`
        : "/sics/affiliates/createAffiliate";
      const method = isEdit ? "PUT" : "POST";
      const response = await request(endpoint, method, payload);

      if (response.status >= 200 && response.status < 300) {
        onSubmit(payload);
        router.push(`/afiliados`);
      } else {
        console.error(response.message || "No se pudo registrar el afiliado");
      }
    } catch (error) {
      console.error("Error al enviar el formulario de afiliado", error);
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="space-y-2">
            <Label htmlFor="estado_civil">Estado Civil *</Label>
            <Select
              value={formData.estado_civil}
              onValueChange={(value) =>
                handleChange("estado_civil", value as EstadoCivil)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOLTERO">Soltero</SelectItem>
                <SelectItem value="CASADO">Casado</SelectItem>
                <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                <SelectItem value="VIUDO">Viudo</SelectItem>
                <SelectItem value="UNION_LIBRE">Unión libre</SelectItem>
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
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="6641234567"
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contacto Secundario</Label>
            <Input
              id="email"
              type="string"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="acta_nacimiento"
              type="checkbox"
              checked={formData.acta_nacimiento}
              onChange={(e) =>
                handleChange("acta_nacimiento", Boolean(e.target.checked))
              }
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="acta_nacimiento" className="mt-1">
              Cuenta con acta de nacimiento
            </Label>
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
            <Label htmlFor="lugar_trabajo">Lugar de Trabajo *</Label>
            <Select
              value={formData.lugar_trabajo}
              onValueChange={(value) => handleChange("lugar_trabajo", value)}
              disabled={lugaresLoading || !hasLugaresTrabajo}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    lugaresLoading
                      ? "Cargando lugares..."
                      : "Seleccionar lugar de trabajo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {lugaresLoading && (
                  <SelectItem value="loading" disabled>
                    Cargando lugares...
                  </SelectItem>
                )}
                {!lugaresLoading && !hasLugaresTrabajo && (
                  <SelectItem value="no-data" disabled>
                    No hay lugares disponibles
                  </SelectItem>
                )}
                {!lugaresLoading &&
                  hasLugaresTrabajo &&
                  lugaresTrabajo.map((lugar) => (
                    <SelectItem key={lugar.id} value={lugar.id}>
                      {lugar.codigo} - {lugar.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="lugar_procedencia">Lugar de Procedencia *</Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="extranjero"
                  className="text-sm font-normal text-muted-foreground"
                >
                  Extranjero
                </Label>
                <Switch
                  id="extranjero"
                  checked={isExtranjero}
                  onCheckedChange={(checked) => {
                    setIsExtranjero(checked);
                    setFormData((prev) => ({
                      ...prev,
                      lugar_procedencia: "",
                    }));
                  }}
                />
              </div>
            </div>
            <Select
              value={formData.lugar_procedencia || undefined}
              onValueChange={(value) =>
                handleChange("lugar_procedencia", value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isExtranjero
                      ? "Seleccionar país de procedencia"
                      : "Seleccionar estado de procedencia"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(isExtranjero ? COUNTRIES : MEXICO_STATES).map((place) => (
                  <SelectItem key={place} value={place}>
                    {place}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
            <Input
              id="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => handleChange("fecha_inicio", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio_tijuana">
              Fecha de Inicio Tijuana *
            </Label>
            <Input
              id="fecha_inicio_tijuana"
              type="date"
              value={formData.fecha_inicio_tijuana}
              onChange={(e) =>
                handleChange("fecha_inicio_tijuana", e.target.value)
              }
              required
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
        <Button type="submit" disabled={submitting}>
          <Save className="mr-2 h-4 w-4" />
          {submitting
            ? "Guardando..."
            : afiliado
            ? "Guardar Cambios"
            : "Registrar Afiliado"}
        </Button>
      </div>
    </form>
  );
}
