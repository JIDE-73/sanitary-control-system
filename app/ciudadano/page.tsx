"use client";

import { useMemo, useState } from "react";

import {
  CiudadanosTable,
  type CiudadanoListado,
} from "@/components/ciudadanos/ciudadanos-table";
import { SearchCiudadano } from "@/components/ciudadanos/search-ciudadano";
import { MainLayout } from "@/components/layout/main-layout";
import { afiliados as ciudadanosMock, lugaresTrabajo } from "@/lib/mock-data";

export default function CiudadanoPage() {
  const baseCiudadanos = useMemo<CiudadanoListado[]>(() => {
    return ciudadanosMock.map((ciudadano) => {
      const lugarTrabajo = lugaresTrabajo.find(
        (l) => l.id === ciudadano.lugarTrabajoId
      );

      return {
        id: ciudadano.id,
        curp: ciudadano.curp,
        nombres: ciudadano.nombres,
        apellidoPaterno: ciudadano.apellidoPaterno,
        apellidoMaterno: ciudadano.apellidoMaterno,
        genero: ciudadano.genero,
        telefono: ciudadano.telefono,
        ciudad: ciudadano.ciudad,
        estatus: ciudadano.estatus,
        fechaNacimiento: ciudadano.fechaNacimiento,
        email: ciudadano.email,
        lugarProcedencia: ciudadano.lugarProcedencia,
        ocupacion: ciudadano.ocupacion,
        lugarTrabajoCodigo: lugarTrabajo?.codigo,
        lugarTrabajoNombre: lugarTrabajo?.nombre,
        fechaRegistro: ciudadano.fechaRegistro,
      };
    });
  }, []);

  const [filteredCiudadanos, setFilteredCiudadanos] =
    useState<CiudadanoListado[]>(baseCiudadanos);

  const handleSearch = (
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => {
    const normalizedQuery = query.trim().toLowerCase();
    let results = [...baseCiudadanos];

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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ciudadano</h1>
            <p className="text-muted-foreground">
              Consulta sin integración a API{" "}
              {totalCiudadanos ? `(${totalCiudadanos})` : ""}
            </p>
          </div>
        </div>

        <SearchCiudadano onSearch={handleSearch} />

        <CiudadanosTable ciudadanos={filteredCiudadanos} />
      </div>
    </MainLayout>
  );
}
