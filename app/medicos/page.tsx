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
import { useAuth } from "@/components/auth/auth-context";

export default function MedicosPage() {
  const { hasPermission } = useAuth();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [filteredMedicos, setFilteredMedicos] = useState<Medico[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
        "cedula_profesional" in candidate
      ) {
        return [candidate];
      }
    }
    return [];
  };

  const normalizeMedico = (item: any): Medico => ({
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
    curp: item.persona?.curp ?? "",
    genero: item.persona?.genero ?? "masculino",
    fechaNacimiento: item.persona?.fecha_nacimiento ?? "",
    direccion: item.persona?.direccion ?? "",
    habilitado_para_firmar: Boolean(item.habilitado_para_firmar),
    firmaDigitalUrl: item.firma_digital_path ?? "",
    fechaRegistro: item.persona?.created_at ?? "",
  });

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
      const normalizados: Medico[] = data.map(normalizeMedico);
      setMedicos(normalizados);
      setFilteredMedicos(normalizados);
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

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setFilteredMedicos(medicos);
      return;
    }

    setLoading(true);
    try {
      const response = await request(
        `/sics/doctors/getDoctor/${encodeURIComponent(trimmed)}`,
        "GET"
      );
      const data = extractArray(response);
      const normalizados = data.map(normalizeMedico);
      setFilteredMedicos(normalizados);
    } catch (error) {
      console.error("Error al buscar médico", error);
      setFilteredMedicos([]);
    } finally {
      setLoading(false);
    }
  };

  const totalMedicos = useMemo(() => filteredMedicos.length, [filteredMedicos]);

  const canCreate = hasPermission("medicos", "create");

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
          {canCreate && (
            <Link href="/medicos/nuevo">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Médico
              </Button>
            </Link>
          )}
        </div>

        <div className="flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cédula profesional o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Buscar</Button>
        </div>

        <MedicosTable medicos={filteredMedicos} loading={loading} />
      </div>
    </MainLayout>
  );
}
