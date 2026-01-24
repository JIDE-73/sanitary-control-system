"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormLugar } from "@/components/lugares-trabajo/form-lugar";
import type { LugarTrabajo } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

export default function NuevoLugarPage() {
  const router = useRouter();
  const { toast } = useToast();

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
        toast({
          title: "Lugar de trabajo registrado",
          description: "El lugar de trabajo se registró correctamente.",
        });
        router.push("/lugares-trabajo");
      } else {
        toast({
          title: "No se pudo registrar",
          description: response.message || "Ocurrió un error al registrar el lugar de trabajo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al registrar el lugar de trabajo", error);
      toast({
        title: "Error al registrar lugar de trabajo",
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
