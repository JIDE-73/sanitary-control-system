"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormNotaMedica } from "@/components/notas-medicas/form-consulta";
import type { ConsultaClinica } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

function NuevaNotaMedicaContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: Partial<ConsultaClinica>) => {
    if (!data.afiliadoId || !data.medicoId) {
      toast({
        title: "Faltan datos obligatorios",
        description: "Selecciona afiliado y médico para continuar.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      persona_id: data.afiliadoId,
      medico_id: data.medicoId,
      diagnostico: data.diagnostico ?? "",
      tratamiento: data.tratamiento ?? "",
      comentario: data.comentarios ?? "",
      FC: data.FC ?? "",
      TA: data.TA ?? "",
      FR: data.FR ?? "",
      peso: data.peso ?? "",
      Temperatura: data.Temperatura ?? "",
      cabeza: data.cabeza ?? "",
      cuello: data.cuello ?? "",
      torax: data.torax ?? "",
      abdomen: data.abdomen ?? "",
      miembros: data.miembros ?? "",
      genitales: data.genitales ?? "",
    };

    setSaving(true);
    try {
      const response = await request(
        "/sics/medical/createMedicalNote",
        "POST",
        payload
      );
      if (response.status == 201) {
        toast({
          title: "Nota médica registrada",
          description: "La nota médica se guardó correctamente.",
        });
        router.push("/notas-medicas");
      } else {
        toast({
          title: "No se pudo guardar",
          description: response?.message ?? "Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear la nota médica", error);
      toast({
        title: "Error inesperado",
        description: "No se pudo registrar la consulta.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return <FormNotaMedica onSubmit={handleSubmit} submitting={saving} />;
}

export default function NuevaNotaMedicaPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva nota médica
          </h1>
          <p className="text-muted-foreground">
            Registrar una nueva nota médica
          </p>
        </div>

        <Suspense fallback={<div>Cargando...</div>}>
          <NuevaNotaMedicaContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
