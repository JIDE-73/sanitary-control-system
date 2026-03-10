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
};

export interface ConsentimientoVihItsPayload {
  persona_id: string;
  medico_id: string;
  expediente: string;
}

interface FormConsentimientoVihItsProps {
  medicoId: string;
  onCancel: () => void;
  onSubmit: (payload: ConsentimientoVihItsPayload) => Promise<void>;
  submitting?: boolean;
}

export function FormConsentimientoVihIts({
  medicoId,
  onCancel,
  onSubmit,
  submitting = false,
}: FormConsentimientoVihItsProps) {
  const [afiliados, setAfiliados] = useState<AfiliadoOption[]>([]);
  const [loadingAfiliados, setLoadingAfiliados] = useState(false);
  const [personaId, setPersonaId] = useState("");
  const [expediente, setExpediente] = useState("");

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
    if (!expediente.trim()) {
      setExpediente(String(Date.now()).slice(-6));
    }
  }, [selectedAfiliado, expediente]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!medicoId.trim()) return;

    await onSubmit({
      persona_id: personaId.trim(),
      medico_id: medicoId.trim(),
      expediente: expediente.trim(),
    });
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

        <div className="space-y-2">
          <Label htmlFor="medico_id">Médico del sistema</Label>
          <Input id="medico_id" value={medicoId} readOnly />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="expediente">Expediente</Label>
          <Input
            id="expediente"
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
            placeholder="Ej. 12345"
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
