"use client";

import { useRouter } from "next/navigation";
import { FormCiudadano } from "@/components/ciudadanos/form-ciudadano";
import { MainLayout } from "@/components/layout/main-layout";
import type { CitizenPayload } from "@/lib/types";

export default function NuevoCiudadanoPage() {
  const router = useRouter();

  const handleSubmit = (_data: CitizenPayload) => {
    router.push("/ciudadano");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Ciudadano</h1>
          <p className="text-muted-foreground">
            Registrar un ciudadano para el módulo de alcoholimetría
          </p>
        </div>

        <FormCiudadano onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
}
