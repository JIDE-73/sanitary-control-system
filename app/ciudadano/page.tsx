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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { request } from "@/lib/request";
import { useAuth } from "@/components/auth/auth-context";

export default function CiudadanoPage() {
  const { hasPermission } = useAuth();
  const [ciudadanos, setCiudadanos] = useState<CiudadanoListado[]>([]);
  const [filteredCiudadanos, setFilteredCiudadanos] = useState<
    CiudadanoListado[]
  >([]);
  const [activeTab, setActiveTab] = useState<"all" | "notas" | "certificados">(
    "all"
  );
  const [searchState, setSearchState] = useState<{
    query: string;
    filters: { genero?: string; estatus?: string };
  }>({
    query: "",
    filters: {},
  });
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeCiudadano = (item: any): CiudadanoListado => ({
    ...(Array.isArray(item?.persona?.Nota_Medica_Alcoholimetria) &&
    item.persona.Nota_Medica_Alcoholimetria.length > 0
      ? {
          notaMedicaBasica: {
            id: String(item.persona.Nota_Medica_Alcoholimetria[0]?.id ?? ""),
            fecha: String(
              item.persona.Nota_Medica_Alcoholimetria[0]?.fecha_expedicion ?? ""
            ),
            cedula: String(
              item.persona.Nota_Medica_Alcoholimetria[0]?.cedula ?? ""
            ),
            nombreOficial: String(
              item.persona.Nota_Medica_Alcoholimetria[0]?.nombre_oficial ?? ""
            ),
            dependencia: String(
              item.persona.Nota_Medica_Alcoholimetria[0]?.dependencia ?? ""
            ),
          },
        }
      : {}),
    ...(Array.isArray(item?.persona?.Certificado_Alcoholimetria) &&
    item.persona.Certificado_Alcoholimetria.length > 0
      ? {
          certificadoBasico: {
            id: String(item.persona.Certificado_Alcoholimetria[0]?.id ?? ""),
            folio: String(item.persona.Certificado_Alcoholimetria[0]?.folio ?? ""),
            fecha: String(
              item.persona.Certificado_Alcoholimetria[0]?.fecha_expedicion ?? ""
            ),
            nombre: String(
              item.persona.Certificado_Alcoholimetria[0]?.nombre ?? ""
            ),
            cedulaPerito: String(
              item.persona.Certificado_Alcoholimetria[0]?.cedula_perito ?? ""
            ),
          },
        }
      : {}),
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
    tipoIdentificacion:
      item?.tipo_identificacion ?? item?.persona?.tipo_identificacion,
    numeroIdentificacion:
      item?.numero_identificacion ??
      item?.numero_idetificacion ??
      item?.persona?.numero_identificacion ??
      item?.persona?.numero_idetificacion,
    totalNotasMedicas: Array.isArray(item?.persona?.Nota_Medica_Alcoholimetria)
      ? item.persona.Nota_Medica_Alcoholimetria.length
      : 0,
    totalCertificados: Array.isArray(item?.persona?.Certificado_Alcoholimetria)
      ? item.persona.Certificado_Alcoholimetria.length
      : 0,
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

  const applyFilters = (
    baseData: CiudadanoListado[],
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    let results = [...baseData];

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

    if (activeTab === "notas") {
      results = results.filter((c) => (c.totalNotasMedicas ?? 0) > 0);
    } else if (activeTab === "certificados") {
      results = results.filter((c) => (c.totalCertificados ?? 0) > 0);
    }

    setFilteredCiudadanos(results);
  };

  const handleSearch = (
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => {
    setSearchState({ query, filters });
    applyFilters(ciudadanos, query, filters);
  };

  const totalCiudadanos = useMemo(
    () => filteredCiudadanos.length,
    [filteredCiudadanos]
  );
  const totalConNotas = useMemo(
    () => ciudadanos.filter((c) => (c.totalNotasMedicas ?? 0) > 0).length,
    [ciudadanos]
  );
  const totalConCertificados = useMemo(
    () => ciudadanos.filter((c) => (c.totalCertificados ?? 0) > 0).length,
    [ciudadanos]
  );

  useEffect(() => {
    applyFilters(ciudadanos, searchState.query, searchState.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ciudadanos]);

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
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "all" | "notas" | "certificados")
          }
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">Todos ({ciudadanos.length})</TabsTrigger>
            <TabsTrigger value="notas">
              Con notas ({totalConNotas})
            </TabsTrigger>
            <TabsTrigger value="certificados">
              Con certificados ({totalConCertificados})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <CiudadanosTable ciudadanos={filteredCiudadanos} loading={loading} />
      </div>
    </MainLayout>
  );
}
