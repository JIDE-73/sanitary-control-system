"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormMedico } from "@/components/medicos/form-medico";
import type { DoctorPayload } from "@/lib/types";
import { request } from "@/lib/request";

export default function NuevoMedicoPage() {
  const router = useRouter();

  const handleSubmit = async (data: DoctorPayload) => {
    try {
      const response = await request(
        "/sics/doctors/createDoctor",
        "POST",
        data
      );
      if (response.status >= 200 && response.status < 300) {
        router.push("/medicos");
      } else {
        console.error(response.message || "No se pudo registrar el médico");
      }
    } catch (error) {
      console.error("Error al registrar el médico", error);
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
