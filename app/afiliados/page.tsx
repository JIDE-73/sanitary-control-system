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

  const loadAfiliados = async () => {
    setLoading(true);
    try {
      const response = await request("/sics/affiliates/getAffiliattes", "GET");
      const data = Array.isArray(response) ? response : [];
      const normalizados: AfiliadoListado[] = data.map((item: any) => ({
        id: item.persona_id,
        curp: item.persona?.curp ?? "",
        nombres: item.persona?.nombre ?? "",
        apellidoPaterno: item.persona?.apellido_paterno ?? "",
        apellidoMaterno: item.persona?.apellido_materno ?? "",
        genero: (item.persona?.genero ??
          "masculino") as AfiliadoListado["genero"],
        telefono: item.persona?.telefono ?? "",
        ciudad: item.catalogo?.ciudad ?? "",
        estatus: "activo",
      }));
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

  const handleSearch = (
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => {
    let results = [...afiliados];

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        (a) =>
          a.curp.toLowerCase().includes(searchTerm) ||
          `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno ?? ""}`
            .toLowerCase()
            .includes(searchTerm) ||
          a.id.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.genero && filters.genero !== "all") {
      results = results.filter(
        (a) => (a.genero || "").toLowerCase() === filters.genero?.toLowerCase()
      );
    }

    if (filters.estatus && filters.estatus !== "all") {
      results = results.filter((a) => a.estatus === filters.estatus);
    }

    setFilteredAfiliados(results);
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
