"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormMedico } from "@/components/medicos/form-medico";
import { request } from "@/lib/request";
import type { DoctorPayload, Medico } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarMedicoPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [medico, setMedico] = useState<Medico | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const extractArray = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;

    if (response && typeof response === "object") {
      const numericKeys = Object.keys(response).filter((k) => /^\d+$/.test(k));
      if (numericKeys.length) {
        return numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => (response as any)[k])
          .filter(Boolean);
      }
    }
    return [];
  };

  const normalizeMedico = (item: any): Medico => ({
    id:
      item.persona_id ??
      item.persona?.id ??
      item.id ??
      item.cedula_profesional ??
      "",
    cedulaProfesional: item.cedula_profesional ?? "",
    nombres: item.persona?.nombre ?? "",
    apellidoPaterno: item.persona?.apellido_paterno ?? "",
    apellidoMaterno: item.persona?.apellido_materno ?? "",
    especialidad: item.especialidad ?? "",
    telefono: item.persona?.telefono ?? "",
    email: item.persona?.email ?? "",
    estatus: item.habilitado_para_firmar ? "activo" : "inactivo",
    curp: item.persona?.curp ?? "",
    genero: item.persona?.genero ?? "masculino",
    fechaNacimiento: item.persona?.fecha_nacimiento ?? "",
    direccion: item.persona?.direccion ?? "",
    habilitado_para_firmar: Boolean(item.habilitado_para_firmar),
    firmaDigitalUrl: item.firma_digital_path ?? "",
    fechaRegistro: item.persona?.created_at ?? "",
  });

  const loadMedico = async () => {
    setLoading(true);
    try {
      const response = await request("/sics/doctors/getDoctors", "GET");
      const data = extractArray(response);
      const normalizados: Medico[] = data.map(normalizeMedico);
      const encontrado = normalizados.find((m) => m.id === id);
      setMedico(encontrado ?? null);
    } catch (error) {
      console.error("No se pudo cargar el médico", error);
      setMedico(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titulo = useMemo(() => {
    if (!medico) return "Editar Médico";
    return `Editar Médico - Dr(a). ${medico.nombres} ${
      medico.apellidoPaterno
    } ${medico.apellidoMaterno ?? ""}`;
  }, [medico]);

  const handleSubmit = async (data: DoctorPayload) => {
    const confirmed = window.confirm("¿Confirmar cambios del médico?");
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await request(
        `/sics/doctors/updateDoctor/${id}`,
        "PUT",
        data
      );

      if (response.status >= 200 && response.status < 300) {
        router.push("/medicos");
      } else {
        console.error(response.message || "No se pudo actualizar el médico");
      }
    } catch (error) {
      console.error("Error al actualizar el médico", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Cargando médico...</p>
        </div>
      </MainLayout>
    );
  }

  if (!medico) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Médico no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
          <p className="text-muted-foreground">
            Dr(a). {medico.nombres} {medico.apellidoPaterno}{" "}
            {medico.apellidoMaterno}
          </p>
        </div>

        <FormMedico medico={medico} onSubmit={handleSubmit} />

        {saving && (
          <p className="text-sm text-muted-foreground">Guardando cambios...</p>
        )}
      </div>
    </MainLayout>
  );
}
