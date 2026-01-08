"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { MedicosTable } from "@/components/medicos/medicos-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/request";
import type { Medico } from "@/lib/types";

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [filteredMedicos, setFilteredMedicos] = useState<Medico[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const extractArray = (response: any) => {
    if (Array.isArray(response)) return response;
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

  const applySearch = (query: string, list: Medico[]) => {
    if (!query) return list;
    const term = query.toLowerCase();
    return list.filter(
      (m) =>
        m.cedulaProfesional.toLowerCase().includes(term) ||
        `${m.nombres} ${m.apellidoPaterno} ${m.apellidoMaterno ?? ""}`
          .toLowerCase()
          .includes(term) ||
        m.especialidad.toLowerCase().includes(term)
    );
  };

  const loadMedicos = async () => {
    setLoading(true);
    try {
      const response = await request("/sics/doctors/getDoctors", "GET");
      const data = extractArray(response);
      const normalizados: Medico[] = data.map((item: any) => ({
        id:
          item.persona_id ??
          item.persona?.id ??
          item.id ??
          item.cedula_profesional ??
          "",
        cedulaProfesional: item.cedula_profesional ?? "",
        nombres: item.persona?.nombre ?? "",
        apellidoPaterno: item.persona?.apellido_paterno ?? "",
        apellidoMaterno: item.persona?.apellido_materno ?? "",
        especialidad: item.especialidad ?? "",
        telefono: item.persona?.telefono ?? "",
        email: item.persona?.email ?? "",
        estatus: item.habilitado_para_firmar ? "activo" : "inactivo",
        firmaDigitalUrl: item.firma_digital_path ?? "",
        fechaRegistro: item.persona?.created_at ?? "",
      }));
      setMedicos(normalizados);
      setFilteredMedicos(applySearch(searchQuery, normalizados));
    } catch (error) {
      console.error("No se pudieron cargar los médicos", error);
      setMedicos([]);
      setFilteredMedicos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredMedicos(applySearch(searchQuery, medicos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicos]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredMedicos(applySearch(query, medicos));
  };

  const totalMedicos = useMemo(() => filteredMedicos.length, [filteredMedicos]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Médicos</h1>
            <p className="text-muted-foreground">
              Gestión de médicos autorizados para emitir certificados{" "}
              {totalMedicos ? `(${totalMedicos})` : ""}
            </p>
          </div>
          <Link href="/medicos/nuevo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Médico
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cédula, nombre o especialidad..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <MedicosTable medicos={filteredMedicos} loading={loading} />
      </div>
    </MainLayout>
  );
}
