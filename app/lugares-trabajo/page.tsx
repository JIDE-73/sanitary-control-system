"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { LugaresTable } from "@/components/lugares-trabajo/lugares-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/request";
import type { LugarTrabajo } from "@/lib/types";

export default function LugaresTrabajoPage() {
  const [lugares, setLugares] = useState<LugarTrabajo[]>([]);
  const [filteredLugares, setFilteredLugares] = useState<LugarTrabajo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const extractArray = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.Laboratorios)) return response.Laboratorios;
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

  const applySearch = (query: string, list: LugarTrabajo[]) => {
    if (!query) return list;
    const term = query.toLowerCase();
    return list.filter((l) => {
      const ciudad = (l.ciudad || "").toLowerCase();
      const estado = (l.estado || "").toLowerCase();
      const calle = (l.calle || "").toLowerCase();
      const colonia = (l.colonia || "").toLowerCase();
      return (
        l.codigo.toLowerCase().includes(term) ||
        l.nombre.toLowerCase().includes(term) ||
        ciudad.includes(term) ||
        estado.includes(term) ||
        calle.includes(term) ||
        colonia.includes(term)
      );
    });
  };

  const loadLugares = async () => {
    setLoading(true);
    try {
      const response = await request("/sics/workPlace/getWorkPlace", "GET");
      const data = extractArray(response);
      const normalizados: LugarTrabajo[] = data.map((item: any) => ({
        id: item.id ?? item.codigo ?? crypto.randomUUID(),
        codigo: item.codigo ?? "",
        nombre: item.nombre ?? "",
        calle: item.calle ?? "",
        colonia: item.colonia ?? "",
        codigo_postal: item.codigo_postal ?? "",
        codigoPostal: item.codigo_postal ?? "",
        telefono: item.telefono ?? "",
        ciudad: item.ciudad ?? "",
        estado: item.estado ?? "",
      }));
      setLugares(normalizados);
      setFilteredLugares(applySearch(searchQuery, normalizados));
    } catch (error) {
      console.error("No se pudieron cargar los lugares de trabajo", error);
      setLugares([]);
      setFilteredLugares([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLugares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredLugares(applySearch(searchQuery, lugares));
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [lugares]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredLugares(applySearch(query, lugares));
  };

  const totalLugares = useMemo(() => filteredLugares.length, [filteredLugares]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Lugares de Trabajo
            </h1>
            <p className="text-muted-foreground">
              Catálogo de establecimientos registrados{" "}
              {totalLugares ? `(${totalLugares})` : ""}
            </p>
          </div>
          <Link href="/lugares-trabajo/nuevo">
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Nuevo Lugar
            </Button>
          </Link>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nombre, ciudad o calle..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch(searchQuery)}>Buscar</Button>
        </div>

        <LugaresTable lugares={filteredLugares} loading={loading} />
      </div>
    </MainLayout>
  );
}
