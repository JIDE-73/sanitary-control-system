"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormMedico } from "@/components/medicos/form-medico";
import type { DoctorPayload } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

export default function NuevoMedicoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: DoctorPayload) => {
    try {
      const response = await request(
        "/sics/doctors/createDoctor",
        "POST",
        data
      );
      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Médico registrado",
          description: "El médico se registró correctamente.",
        });
        router.push("/medicos");
      } else {
        toast({
          title: "No se pudo registrar",
          description: response.message || "Ocurrió un error al registrar el médico.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al registrar el médico", error);
      toast({
        title: "Error al registrar médico",
        description: "Revisa tu conexión o inténtalo más tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Médico</h1>
          <p className="text-muted-foreground">
            Registrar un nuevo médico autorizado en el sistema
          </p>
        </div>

        <FormMedico onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
}
