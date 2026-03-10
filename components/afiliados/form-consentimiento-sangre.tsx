"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { request } from "@/lib/request";

type AfiliadoOption = {
  id: string;
  nombreCompleto: string;
  fechaNacimiento?: string;
  curp?: string;
};

export interface ConsentimientoSangrePayload {
  persona_id: string;
  medico_id: string;
  fecha_nacimiento: string;
  no_identificacion: string;
  nombre_flebotomista: string;
  fecha_toma: string;
}

interface FormConsentimientoSangreProps {
  medicoId: string;
  onCancel: () => void;
  onSubmit: (payload: ConsentimientoSangrePayload) => Promise<void>;
  submitting?: boolean;
}

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export function FormConsentimientoSangre({
  medicoId,
  onCancel,
  onSubmit,
  submitting = false,
}: FormConsentimientoSangreProps) {
  const [afiliados, setAfiliados] = useState<AfiliadoOption[]>([]);
  const [loadingAfiliados, setLoadingAfiliados] = useState(false);

  const [personaId, setPersonaId] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [noIdentificacion, setNoIdentificacion] = useState("");
  const [nombreFlebotomista, setNombreFlebotomista] = useState("");
  const [fechaToma, setFechaToma] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAfiliados = async () => {
      setLoadingAfiliados(true);
      try {
        const response = await request(
          "/sics/affiliates/getAffiliattes",
          "GET",
        );

        if (!mounted) return;

        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        const mapped = rows
          .map((item: any) => {
            const persona = item?.persona ?? {};
            const nombreCompleto = [
              persona?.nombre,
              persona?.apellido_paterno,
              persona?.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

            const id = String(item?.persona_id ?? persona?.id ?? "").trim();
            if (!id) return null;

            return {
              id,
              nombreCompleto: nombreCompleto || id,
              fechaNacimiento: persona?.fecha_nacimiento,
              curp: persona?.curp,
            } as AfiliadoOption;
          })
          .filter(Boolean) as AfiliadoOption[];

        setAfiliados(mapped);
      } catch (error) {
        console.error("No se pudieron cargar afiliados", error);
      } finally {
        if (mounted) setLoadingAfiliados(false);
      }
    };

    loadAfiliados();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedAfiliado = useMemo(
    () => afiliados.find((item) => item.id === personaId),
    [afiliados, personaId],
  );

  useEffect(() => {
    if (!selectedAfiliado) return;
    if (!fechaNacimiento && selectedAfiliado.fechaNacimiento) {
      setFechaNacimiento(toDateInputValue(selectedAfiliado.fechaNacimiento));
    }
    if (!noIdentificacion && selectedAfiliado.curp) {
      setNoIdentificacion(selectedAfiliado.curp);
    }
  }, [selectedAfiliado, fechaNacimiento, noIdentificacion]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!medicoId.trim()) return;

    const payload: ConsentimientoSangrePayload = {
      persona_id: personaId.trim(),
      medico_id: medicoId.trim(),
      fecha_nacimiento: new Date(`${fechaNacimiento}T00:00:00`).toISOString(),
      no_identificacion: noIdentificacion.trim(),
      nombre_flebotomista: nombreFlebotomista.trim(),
      fecha_toma: new Date(fechaToma).toISOString(),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="persona_id">Afiliado</Label>
          <Select value={personaId} onValueChange={setPersonaId} required>
            <SelectTrigger
              id="persona_id"
              disabled={loadingAfiliados || submitting}
            >
              <SelectValue
                placeholder={
                  loadingAfiliados
                    ? "Cargando afiliados..."
                    : "Selecciona un afiliado"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {afiliados.map((afiliado) => (
                <SelectItem key={afiliado.id} value={afiliado.id}>
                  {afiliado.nombreCompleto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="medico_id">Médico del sistema</Label>
          <Input id="medico_id" value={medicoId} readOnly />
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="no_identificacion">No. identificación</Label>
          <Input
            id="no_identificacion"
            value={noIdentificacion}
            onChange={(e) => setNoIdentificacion(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre_flebotomista">Nombre flebotomista</Label>
          <Input
            id="nombre_flebotomista"
            value={nombreFlebotomista}
            onChange={(e) => setNombreFlebotomista(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_toma">Fecha y hora de toma</Label>
          <Input
            id="fecha_toma"
            type="datetime-local"
            value={fechaToma}
            onChange={(e) => setFechaToma(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button
          type="submit"
          disabled={submitting || !medicoId.trim() || !personaId.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Guardar consentimiento"}
        </Button>
      </div>
    </form>
  );
}
