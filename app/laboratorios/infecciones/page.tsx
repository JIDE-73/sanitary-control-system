"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { InfeccionesTable } from "@/components/infecciones/infecciones-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Virus, Search, RefreshCw } from "lucide-react";
import { request } from "@/lib/request";
import type { Infection } from "@/lib/types";

export default function LaboratorioInfeccionesPage() {
  const [infecciones, setInfecciones] = useState<Infection[]>([]);
  const [filteredInfecciones, setFilteredInfecciones] = useState<Infection[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInfecciones = async () => {
    setLoading(true);
    try {
      const response = await request(
        "/sics/infections/getAllInfections",
        "GET"
      );

      // Extract infections array from response
      let data: Infection[] = [];
      if (Array.isArray(response?.infections)) {
        data = response.infections;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const normalizados: Infection[] = data.map((item: any) => ({
        id: item.id ?? crypto.randomUUID(),
        nombre: item.nombre ?? "",
      }));

      setInfecciones(normalizados);
      applySearch(searchQuery, normalizados);
    } catch (error) {
      console.error("No se pudieron cargar las infecciones", error);
      setInfecciones([]);
      setFilteredInfecciones([]);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (query: string, list: Infection[]) => {
    if (!query.trim()) {
      setFilteredInfecciones(list);
      return;
    }
    const term = query.toLowerCase();
    const filtered = list.filter((inf) =>
      inf.nombre.toLowerCase().includes(term)
    );
    setFilteredInfecciones(filtered);
  };

  useEffect(() => {
    loadInfecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applySearch(query, infecciones);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Catálogo de Infecciones
            </h1>
            <p className="text-muted-foreground">
              Gestión del catálogo de infecciones registradas{" "}
              {filteredInfecciones.length > 0
                ? `(${filteredInfecciones.length})`
                : ""}
            </p>
          </div>
          <Button onClick={loadInfecciones} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch(searchQuery)}>Buscar</Button>
        </div>

        <InfeccionesTable
          infecciones={filteredInfecciones}
          loading={loading}
          onReload={loadInfecciones}
        />
      </div>
    </MainLayout>
  );
}

