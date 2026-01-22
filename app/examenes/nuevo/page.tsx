"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormExamen } from "@/components/examenes/form-examen";
import type { ExamenClinico } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

function NuevoExamenContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    data: Partial<ExamenClinico> & { examenId?: string }
  ) => {
    if (!data.afiliadoId) {
      toast({
        title: "Selecciona un afiliado",
        description: "No se puede crear la orden sin un afiliado.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const fechaOrdenISO = data.fechaOrden
        ? new Date(`${data.fechaOrden}T00:00:00.000Z`).toISOString()
        : new Date().toISOString();
      const fechaProximoISO = data.fechaProximoExamen
        ? new Date(`${data.fechaProximoExamen}T00:00:00.000Z`).toISOString()
        : undefined;

      const payload = {
        examen: (data.examenId ?? data.tipoExamen) as string,
        fecha_orden: fechaOrdenISO,
        ...(fechaProximoISO && {
          fecha_proximo_examen: fechaProximoISO,
        }),
        estatus: data.dilucionVDRL as "positivo" | "negativo" | "pendiente",
      };

      const response = await request(
        `/sics/exams/createExam/${encodeURIComponent(data.afiliadoId)}`,
        "POST",
        payload
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Orden creada",
          description: "El examen se registró correctamente.",
        });
        router.push("/examenes");
      } else {
        toast({
          title: "No se pudo crear la orden",
          description:
            response.message || "Intenta nuevamente en unos momentos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear examen", error);
      toast({
        title: "Error al crear examen",
        description: "No se pudo registrar la orden. Inténtalo más tarde.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return <FormExamen onSubmit={handleSubmit} submitting={submitting} />;
}

export default function NuevoExamenPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordenar Examen</h1>
          <p className="text-muted-foreground">
            Crear una nueva orden de examen clínico
          </p>
        </div>

        <Suspense fallback={<div>Cargando...</div>}>
          <NuevoExamenContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
