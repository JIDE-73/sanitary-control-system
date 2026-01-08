"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormLaboratorio } from "@/components/laboratorios/form-laboratorio";
import type { LaboratorioPayload } from "@/lib/types";
import { request } from "@/lib/request";

export default function NuevoLaboratorioPage() {
  const router = useRouter();

  const handleSubmit = async (data: LaboratorioPayload) => {
    try {
      const response = await request(
        "/sics/laboratories/createLaboratory",
        "POST",
        data
        );
        
      if (response.status >= 200 && response.status < 300) {
        router.push("/laboratorios");
      } else {
        console.error(
          response.message || "No se pudo registrar el laboratorio"
        );
      }
    } catch (error) {
      console.error("Error al registrar el laboratorio", error);
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
