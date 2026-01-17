"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormLugar } from "@/components/lugares-trabajo/form-lugar";
import type { LugarTrabajo } from "@/lib/types";
import { request } from "@/lib/request";

export default function NuevoLugarPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<LugarTrabajo>) => {
    const payload = {
      codigo: data.codigo?.trim() ?? "",
      nombre: data.nombre?.trim() ?? "",
      calle: data.calle?.trim() ?? "",
      colonia: data.colonia?.trim() ?? "",
      codigo_postal: data.codigoPostal ?? data.codigo_postal ?? "",
      telefono: data.telefono?.trim() ?? "",
      ciudad: data.ciudad?.trim() ?? "",
      estado: data.estado?.trim() ?? "",
    };

    try {
      const response = await request(
        "/sics/workPlace/createWorkPlace",
        "POST",
        payload
      );

      if (response.status === 201) {
        router.push("/lugares-trabajo");
      } else {
        console.error(
          response.message || "No se pudo registrar el lugar de trabajo"
        );
      }
    } catch (error) {
      console.error("Error al registrar el lugar de trabajo", error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nuevo Lugar de Trabajo
          </h1>
          <p className="text-muted-foreground">
            Registrar un nuevo establecimiento en el catálogo
          </p>
        </div>

        <FormLugar onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
}
