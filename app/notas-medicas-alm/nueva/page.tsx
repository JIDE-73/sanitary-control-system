"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import {
  FormNotaMedicaALM,
  type NotaMedicaALMFormValues,
} from "@/components/notas-medicas-alm/form-nota-alm";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

function NuevaNotaALMContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: NotaMedicaALMFormValues) => {
    setSaving(true);
    try {
      const response = await request(
        "/alcoholimetria/medicalNotes/createMedicalNote",
        "POST",
        {
          ...data,
          // Enviar la edad como cadena (evita errores de parseo en backend)
          edad: data.edad?.toString().trim() ?? "",
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Nota médica creada",
          description: "La nota de alcoholimetría se envió correctamente.",
        });
        router.push("/notas-medicas-alm");
        return;
      }

      toast({
        title: "No se pudo crear la nota",
        description:
          response?.message ||
          "El backend devolvió un error. Revisa los datos e intenta nuevamente.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error al crear la nota ALM", error);
      toast({
        title: "Error de red",
        description: "No se pudo comunicar con el backend.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return <FormNotaMedicaALM onSubmit={handleSubmit} submitting={saving} />;
}

export default function NuevaNotaALMPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva nota médica ALM
          </h1>
          <p className="text-muted-foreground">
            Captura y envío de nota médica para alcoholimetría
          </p>
        </div>

        <Suspense fallback={<div>Cargando formulario...</div>}>
          <NuevaNotaALMContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
