"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SearchAfiliado } from "@/components/afiliados/search-afiliado";
import {
  AfiliadosTable,
  type AfiliadoListado,
} from "@/components/afiliados/afiliados-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/request";

export default function AfiliadosPage() {
  const [afiliados, setAfiliados] = useState<AfiliadoListado[]>([]);
  const [filteredAfiliados, setFilteredAfiliados] = useState<AfiliadoListado[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeAfiliado = (item: any): AfiliadoListado => ({
    id: String(item?.persona_id ?? item?.persona?.id ?? item?.id ?? ""),
    noAfiliacion:
      item?.no_Afiliacion ?? item?.no_afiliacion ?? item?.noAfiliacion,
    sidmoCodigo: item?.sidmo_codigo ?? null,
    curp: item?.persona?.curp ?? "",
    nombres: item?.persona?.nombre ?? "",
    apellidoPaterno: item?.persona?.apellido_paterno ?? "",
    apellidoMaterno: item?.persona?.apellido_materno ?? "",
    genero: (item?.persona?.genero ?? "masculino") as AfiliadoListado["genero"],
    telefono: item?.persona?.telefono ?? "",
    ciudad:
      item?.catalogo?.ciudad ??
      item?.persona?.ciudad ??
      item?.lugar_procedencia ??
      "",
    lugarTrabajoCodigo: item?.catalogo?.codigo ?? item?.lugar_trabajo,
    lugarTrabajoNombre: item?.catalogo?.nombre,
    estatus: (item?.estatus ?? "activo") as AfiliadoListado["estatus"],
    fechaNacimiento: item?.persona?.fecha_nacimiento,
    fechaInicio: item?.fecha_inicio,
    fechaInicioTijuana: item?.fecha_inicio_tijuana,
    estadoCivil: item?.estado_civil,
    actaNacimiento: item?.acta_nacimiento,
    lugarProcedencia: item?.lugar_procedencia,
    email: item?.persona?.email,
    direccion: item?.persona?.direccion,
    fechaRegistro: item?.persona?.created_at,
    catalogoCalle: item?.catalogo?.calle,
    catalogoColonia: item?.catalogo?.colonia,
    catalogoCodigoPostal: item?.catalogo?.codigo_postal,
    catalogoCiudad: item?.catalogo?.ciudad,
    catalogoEstado: item?.catalogo?.estado,
    catalogoTelefono: item?.catalogo?.telefono,
  });

  const extractArray = (response: any) => {
    const candidate = Array.isArray(response?.data)
      ? response.data
      : response?.data ?? response;

    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const numericKeys = Object.keys(candidate).filter((k) => /^\d+$/.test(k));
      if (numericKeys.length) {
        return numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => (candidate as any)[k])
          .filter(Boolean);
      }

      if (
        "persona" in candidate ||
        "persona_id" in candidate ||
        "no_Afiliacion" in candidate ||
        "no_afiliacion" in candidate
      ) {
        return [candidate];
      }
    }

    return [];
  };

  const loadAfiliados = async () => {
    setLoading(true);
    try {
      const response = await request("/sics/affiliates/getAffiliattes", "GET");
      const data = extractArray(response);
      const normalizados: AfiliadoListado[] = data.map(normalizeAfiliado);
      console.log("normalizados", normalizados);
      setAfiliados(normalizados);
      setFilteredAfiliados(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los afiliados", error);
      setAfiliados([]);
      setFilteredAfiliados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAfiliados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => {
    setLoading(true);

    try {
      const trimmedQuery = query.trim();
      let results: AfiliadoListado[] = [...afiliados];

      if (trimmedQuery) {
        const response = await request(
          `/sics/affiliates/getAffiliateById/${encodeURIComponent(
            trimmedQuery
          )}`,
          "GET"
        );
        const data = extractArray(response);
        results = data.map(normalizeAfiliado);
      }

      if (filters.genero && filters.genero !== "all") {
        results = results.filter(
          (a) =>
            (a.genero || "").toLowerCase() === filters.genero?.toLowerCase()
        );
      }

      if (filters.estatus && filters.estatus !== "all") {
        results = results.filter((a) => a.estatus === filters.estatus);
      }

      setFilteredAfiliados(results);
    } catch (error) {
      console.error("Error al buscar afiliado", error);
      setFilteredAfiliados([]);
    } finally {
      setLoading(false);
    }
  };

  const totalAfiliados = useMemo(
    () => filteredAfiliados.length,
    [filteredAfiliados]
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Afiliados</h1>
            <p className="text-muted-foreground">
              Buscar y gestionar expedientes de afiliados{" "}
              {totalAfiliados ? `(${totalAfiliados})` : ""}
            </p>
          </div>
          <Link href="/afiliados/nuevo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Afiliado
            </Button>
          </Link>
        </div>

        {/* Search */}
        <SearchAfiliado onSearch={handleSearch} />

        {/* Results */}
        <AfiliadosTable afiliados={filteredAfiliados} loading={loading} />
      </div>
    </MainLayout>
  );
}
