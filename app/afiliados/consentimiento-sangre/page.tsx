"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { request } from "@/lib/request";
import { toast } from "sonner";
import {
  ConsentimientosSangreTable,
  type ConsentimientoSangreListado,
} from "@/components/afiliados/consentimientos-sangre-table";
import {
  FormConsentimientoSangre,
  type ConsentimientoSangrePayload,
} from "@/components/afiliados/form-consentimiento-sangre";

const GET_ALL_ENDPOINT = "/sics/record/getAllConsentimientoSangre";
const CREATE_ENDPOINT = "/sics/record/createConsentimientoSangre";

const normalizeDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
};

const extractArray = (response: any) => {
  const candidate = Array.isArray(response?.consentimientos)
    ? response.consentimientos
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

  return Array.isArray(candidate) ? candidate : [];
};

const normalizeConsentimiento = (item: any): ConsentimientoSangreListado => {
  const persona = item?.Persona ?? {};
  const medico = item?.Medico ?? {};

  const personaNombre = [
    persona?.nombre,
    persona?.apellido_paterno,
    persona?.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: String(item?.id ?? ""),
    persona_id: String(item?.persona_id ?? ""),
    medico_id: String(item?.medico_id ?? ""),
    fecha_nacimiento: normalizeDate(item?.fecha_nacimiento),
    no_identificacion: item?.no_identificacion ?? "",
    nombre_flebotomista: item?.nombre_flebotomista ?? "",
    fecha_toma: normalizeDate(item?.fecha_toma),
    persona_nombre: personaNombre || undefined,
    medico_especialidad: medico?.especialidad,
  };
};

export default function ConsentimientoSangrePage() {
  const { user, hasPermission } = useAuth();
  const [view, setView] = useState<"table" | "form">("table");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [consentimientos, setConsentimientos] = useState<
    ConsentimientoSangreListado[]
  >([]);

  const medicoId = String(user?.persona?.Medico?.id ?? "").trim();
  const canCreate = hasPermission("afiliados", "create");

  const loadConsentimientos = async () => {
    setLoading(true);
    try {
      const response = await request(GET_ALL_ENDPOINT, "GET");

      if (response.status < 200 || response.status >= 300) {
        toast.error("No se pudieron cargar los consentimientos", {
          description: response?.message || "Error del servidor",
        });
        setConsentimientos([]);
        return;
      }

      const rows = extractArray(response).map(normalizeConsentimiento);
      setConsentimientos(rows);
    } catch (error) {
      console.error("Error al cargar consentimientos", error);
      toast.error("Error de red", {
        description: "No se pudo consultar la lista de consentimientos.",
      });
      setConsentimientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsentimientos();
  }, []);

  const handleSubmit = async (payload: ConsentimientoSangrePayload) => {
    try {
      setSubmitting(true);
      const response = await request(CREATE_ENDPOINT, "POST", payload);

      if (response.status < 200 || response.status >= 300) {
        toast.error("No se pudo guardar el consentimiento", {
          description:
            response?.message ||
            "Valida el endpoint de creación en backend para este módulo.",
        });
        return;
      }

      toast.success("Consentimiento guardado correctamente");
      setView("table");
      await loadConsentimientos();
    } catch (error) {
      console.error("Error al guardar consentimiento", error);
      toast.error("Error al guardar", {
        description: "No fue posible registrar el consentimiento.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const total = useMemo(() => consentimientos.length, [consentimientos]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Consentimiento de Sangre
            </h1>
            <p className="text-muted-foreground">
              Registro y consulta de consentimientos de sangre{" "}
              {total ? `(${total})` : ""}
            </p>
          </div>

          {view === "table" && canCreate && (
            <Button onClick={() => setView("form")}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo consentimiento
            </Button>
          )}
        </div>

        {!medicoId && view === "form" ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No se encontró el médico asociado al usuario actual. Asigna primero
            una relación usuario-médico para poder crear consentimientos.
          </div>
        ) : null}

        {view === "table" ? (
          <ConsentimientosSangreTable
            consentimientos={consentimientos}
            loading={loading}
          />
        ) : (
          <FormConsentimientoSangre
            medicoId={medicoId}
            onCancel={() => setView("table")}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </MainLayout>
  );
}
