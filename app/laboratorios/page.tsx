"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { LaboratoriosTable } from "@/components/laboratorios/laboratorios-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlaskConical, Search, Plus, TestTube } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/request";
import type { LaboratorioListado } from "@/lib/types";

export default function LaboratoriosPage() {
  const [laboratorios, setLaboratorios] = useState<LaboratorioListado[]>([]);
  const [loading, setLoading] = useState(true);

  const extractArray = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.laboratories)) return response.laboratories;
    if (Array.isArray(response?.data)) return response.data;

    if (response && typeof response === "object") {
      const numericKeys = Object.keys(response).filter((k) => /^\d+$/.test(k));
      if (numericKeys.length) {
        return numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => (response as any)[k])
          .filter(Boolean);
      }
    }
    return [];
  };

  const loadLaboratorios = async () => {
    setLoading(true);
    try {
      const response = await request(
        "/sics/laboratories/getLaboratories",
        "GET"
      );
      const data = extractArray(response);
      const normalizados: LaboratorioListado[] = data.map((item: any) => ({
        id: item.id ?? crypto.randomUUID(),
        nombre_comercial: item.nombre_comercial ?? item.nombre ?? "",
        rfc: item.rfc ?? "",
        certificado_organismo: Boolean(item.certificado_organismo),
        email_contacto: item.email_contacto ?? item.email ?? "",
      }));
      setLaboratorios(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los laboratorios", error);
      setLaboratorios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLaboratorios();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Laboratorios</h1>
            <p className="text-muted-foreground">
              Catálogo de laboratorios certificados y en revisión
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/laboratorios/examenes">
              <Button variant="outline">
                <TestTube className="mr-2 h-4 w-4" />
                Gestionar exámenes
              </Button>
            </Link>
            <Link href="/laboratorios/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Laboratorio
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Búsqueda de laboratorios (próximamente)"
            disabled
            className="pl-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            En construcción
          </span>
        </div>

        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-3 text-sm text-muted-foreground flex items-center gap-2">
          <FlaskConical className="h-4 w-4" />
          La edición, eliminación y búsqueda estarán disponibles en una
          siguiente versión. Por ahora sólo se muestra el listado obtenido de la
          API.
        </div>

        <LaboratoriosTable laboratorios={laboratorios} loading={loading} />
      </div>
    </MainLayout>
  );
}
