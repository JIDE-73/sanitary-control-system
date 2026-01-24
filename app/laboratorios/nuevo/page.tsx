"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormLaboratorio } from "@/components/laboratorios/form-laboratorio";
import type { LaboratorioPayload } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

export default function NuevoLaboratorioPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: LaboratorioPayload) => {
    try {
      const response = await request(
        "/sics/laboratories/createLaboratory",
        "POST",
        data
        );
        
      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Laboratorio registrado",
          description: "El laboratorio se registró correctamente.",
        });
        router.push("/laboratorios");
      } else {
        toast({
          title: "No se pudo registrar",
          description: response.message || "Ocurrió un error al registrar el laboratorio.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al registrar el laboratorio", error);
      toast({
        title: "Error al registrar laboratorio",
        description: "Revisa tu conexión o inténtalo más tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nuevo Laboratorio
          </h1>
          <p className="text-muted-foreground">
            Registrar un nuevo laboratorio en el catálogo
          </p>
        </div>

        <FormLaboratorio onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
}
