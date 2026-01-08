"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormAfiliado } from "@/components/afiliados/form-afiliado";
import { request } from "@/lib/request";
import type { AffiliatePayload, LugarTrabajo } from "@/lib/types";

export default function NuevoAfiliadoPage() {
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

  const handleSubmit = (data: AffiliatePayload) => {
    // En producción, esto se enviaría a la API
    console.log("Nuevo afiliado:", data);
    router.push("/afiliados");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Afiliado</h1>
          <p className="text-muted-foreground">
            Registrar un nuevo afiliado en el sistema
          </p>
        </div>

        <FormAfiliado
          lugaresTrabajo={lugaresTrabajo}
          lugaresLoading={lugaresLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  );
}
