"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import type { UsuarioListado } from "@/components/usuarios/ususarios-table";
import type { Doctor } from "@/app/usuarios/relacion-medico/page";

interface RelacionUsuarioMedicoProps {
  usuarios: UsuarioListado[];
  doctores: Doctor[];
  loading?: boolean;
  onReload?: () => Promise<void> | void;
}

export function RelacionUsuarioMedico({
  usuarios,
  doctores,
  loading = false,
  onReload,
}: RelacionUsuarioMedicoProps) {
  const { toast } = useToast();
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [medicoPersonaId, setMedicoPersonaId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioId) {
      toast({
        title: "Campo requerido",
        description: "Selecciona un usuario.",
        variant: "destructive",
      });
      return;
    }

    if (!medicoPersonaId) {
      toast({
        title: "Campo requerido",
        description: "Selecciona un médico.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        medico_id: medicoPersonaId,
        usuario_id: usuarioId,
      };

      const response = await request(
        "/sics/doctors/linkUser",
        "POST",
        payload
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Relación creada",
          description: "El usuario ha sido vinculado al médico exitosamente.",
        });

        // Reset form
        setUsuarioId("");
        setMedicoPersonaId("");

        // Reload data if callback provided
        if (onReload) {
          await onReload();
        }
      } else {
        toast({
          title: "Error al crear relación",
          description:
            response?.message || "No se pudo vincular el usuario al médico.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al vincular usuario con médico", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo comunicar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getDoctorDisplayName = (doctor: Doctor) => {
    const nombreCompleto = [
      doctor.persona.nombre,
      doctor.persona.apellido_paterno,
      doctor.persona.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ");
    return `${nombreCompleto} - ${doctor.especialidad} (${doctor.cedula_profesional})`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Cargando usuarios y médicos...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vincular Usuario con Médico</CardTitle>
        <CardDescription>
          Selecciona un usuario y un médico para establecer la relación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="usuario"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Usuario
            </label>
            <Select value={usuarioId} onValueChange={setUsuarioId}>
              <SelectTrigger id="usuario">
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    No hay usuarios disponibles
                  </SelectItem>
                ) : (
                  usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nombreUsuario}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="medico"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Médico
            </label>
            <Select value={medicoPersonaId} onValueChange={setMedicoPersonaId}>
              <SelectTrigger id="medico">
                <SelectValue placeholder="Selecciona un médico" />
              </SelectTrigger>
              <SelectContent>
                {doctores.length === 0 ? (
                  <SelectItem value="no-doctors" disabled>
                    No hay médicos disponibles
                  </SelectItem>
                ) : (
                  doctores.map((doctor) => (
                    <SelectItem
                      key={doctor.persona.id}
                      value={doctor.persona.id}
                    >
                      {getDoctorDisplayName(doctor)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !usuarioId || !medicoPersonaId}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Vincular
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

