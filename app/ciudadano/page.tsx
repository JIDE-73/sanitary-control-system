"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import {
  CiudadanosTable,
  type CiudadanoListado,
} from "@/components/ciudadanos/ciudadanos-table";
import { SearchCiudadano } from "@/components/ciudadanos/search-ciudadano";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/request";
import { useAuth } from "@/components/auth/auth-context";

export default function CiudadanoPage() {
  const { hasPermission } = useAuth();
  const [ciudadanos, setCiudadanos] = useState<CiudadanoListado[]>([]);
  const [filteredCiudadanos, setFilteredCiudadanos] = useState<
    CiudadanoListado[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeCiudadano = (item: any): CiudadanoListado => ({
    id: String(item?.persona_id ?? item?.persona?.id ?? item?.id ?? ""),
    curp: item?.persona?.curp ?? "",
    nombres: item?.persona?.nombre ?? "",
    apellidoPaterno: item?.persona?.apellido_paterno ?? "",
    apellidoMaterno: item?.persona?.apellido_materno ?? "",
    genero: (item?.persona?.genero ??
      "masculino") as CiudadanoListado["genero"],
    telefono: item?.persona?.telefono ?? "",
    ciudad: item?.persona?.direccion ?? "",
    estatus: "activo",
    nivelRiesgo: item?.nivel_riesgo ?? item?.persona?.nivel_riesgo,
    fechaNacimiento: item?.persona?.fecha_nacimiento,
    email: item?.persona?.email,
    lugarProcedencia: item?.persona?.lugar_procedencia,
    ocupacion: item?.ocupacion ?? item?.persona?.ocupacion,
    direccion: item?.persona?.direccion,
    lugarTrabajoCodigo: item?.persona?.lugar_trabajo_codigo ?? "",
    lugarTrabajoNombre: item?.persona?.lugar_trabajo_nombre ?? "",
    fechaRegistro: item?.persona?.created_at,
  });

  const extractArray = (response: any) => {
    if (Array.isArray(response?.citizens)) return response.citizens;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
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

  const loadCiudadanos = async () => {
    setLoading(true);
    try {
      const response = await request(
        "/alcoholimetria/citizens/getCitizens",
        "GET"
      );
      const data = extractArray(response);
      const normalizados = data
        .map(normalizeCiudadano)
        .filter((c: CiudadanoListado) => c.id && c.curp);

      setCiudadanos(normalizados);
      setFilteredCiudadanos(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los ciudadanos", error);
      setCiudadanos([]);
      setFilteredCiudadanos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCiudadanos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    let results = [...ciudadanos];

    if (normalizedQuery) {
      results = results.filter((ciudadano) => {
        const fullName = `${ciudadano.nombres} ${ciudadano.apellidoPaterno} ${
          ciudadano.apellidoMaterno ?? ""
        }`.toLowerCase();

        return (
          ciudadano.curp.toLowerCase().includes(normalizedQuery) ||
          fullName.includes(normalizedQuery) ||
          ciudadano.id.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    if (filters.genero && filters.genero !== "all") {
      results = results.filter(
        (c) => (c.genero || "").toLowerCase() === filters.genero?.toLowerCase()
      );
    }

    if (filters.estatus && filters.estatus !== "all") {
      results = results.filter((c) => c.estatus === filters.estatus);
    }

    setFilteredCiudadanos(results);
  };

  const totalCiudadanos = useMemo(
    () => filteredCiudadanos.length,
    [filteredCiudadanos]
  );

  const canCreate = hasPermission("ciudadanos", "create");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ciudadano</h1>
            <p className="text-muted-foreground">
              Búsqueda y consulta rápida de ciudadanos registrados{" "}
              {totalCiudadanos ? `(${totalCiudadanos})` : ""}
            </p>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/ciudadano/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Ciudadano
              </Link>
            </Button>
          )}
        </div>

        <SearchCiudadano onSearch={handleSearch} />

        <CiudadanosTable ciudadanos={filteredCiudadanos} loading={loading} />
      </div>
    </MainLayout>
  );
}
