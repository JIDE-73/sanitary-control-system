"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormAfiliado } from "@/components/afiliados/form-afiliado";
import { afiliados } from "@/lib/mock-data";
import { request } from "@/lib/request";
import type { AffiliatePayload, LugarTrabajo } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarAfiliadoPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [lugaresTrabajo, setLugaresTrabajo] = useState<LugarTrabajo[]>([]);
  const [lugaresLoading, setLugaresLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLugaresTrabajo = async () => {
      setLugaresLoading(true);
      try {
        const response = await request("/sics/workPlace/getWorkPlace", "GET");
        const lugares = Array.isArray(response?.Laboratorios)
          ? response.Laboratorios.map((item: any) => ({
              id: item.id,
              codigo: item.codigo,
              nombre: item.nombre,
              calle: item.calle,
              colonia: item.colonia,
              codigo_postal: item.codigo_postal,
              telefono: item.telefono,
              ciudad: item.ciudad,
              estado: item.estado,
            }))
          : [];
        setLugaresTrabajo(lugares);
      } catch (error) {
        console.error("No se pudieron cargar los lugares de trabajo", error);
        setLugaresTrabajo([]);
      } finally {
        setLugaresLoading(false);
      }
    };

    fetchLugaresTrabajo();
  }, []);

  const afiliado = afiliados.find((a) => a.id === id);

  const handleSubmit = (data: AffiliatePayload) => {
    // En producción, esto se enviaría a la API
    console.log("Actualizar afiliado:", data);
    router.push(`/afiliados/${id}`);
  };

  if (!afiliado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">
            Afiliado no encontrado
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Afiliado</h1>
          <p className="text-muted-foreground">
            {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
            {afiliado.apellidoMaterno}
          </p>
        </div>

        <FormAfiliado
          afiliado={afiliado}
          lugaresTrabajo={lugaresTrabajo}
          lugaresLoading={lugaresLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  );
}
