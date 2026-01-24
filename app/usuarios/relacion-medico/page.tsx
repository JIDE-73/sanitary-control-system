"use client";

import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { RelacionUsuarioMedico } from "@/components/usuarios/relacion-usuario-medico";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import type { UsuarioListado } from "@/components/usuarios/ususarios-table";

export interface Doctor {
  id: string;
  persona_id: string;
  cedula_profesional: string;
  firma_digital_path: string;
  especialidad: string;
  habilitado_para_firmar: boolean;
  persona: {
    id: string;
    curp: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    genero: string;
    email: string;
    telefono: string;
    direccion: string;
    foto: string | null;
    created_at: string;
  };
}

export default function RelacionUsuarioMedicoPage() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([]);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeUsuario = (item: any): UsuarioListado => ({
    id: String(item?.id ?? ""),
    personaId: item?.persona_id ?? item?.personaId ?? "",
    nombreUsuario: item?.nombre_usuario ?? item?.nombreUsuario ?? "",
    activo: Boolean(item?.activo ?? false),
    rolId: item?.rol_id ?? item?.rolId ?? "",
    ultimoLogin: item?.ultimo_login ?? item?.ultimoLogin ?? null,
  });

  const extractArray = (response: any) => {
    if (Array.isArray(response?.users)) return response.users;
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

  const normalizeDoctor = (item: any): Doctor => ({
    id: String(item?.id ?? ""),
    persona_id: String(item?.persona_id ?? ""),
    cedula_profesional: String(item?.cedula_profesional ?? ""),
    firma_digital_path: String(item?.firma_digital_path ?? ""),
    especialidad: String(item?.especialidad ?? ""),
    habilitado_para_firmar: Boolean(item?.habilitado_para_firmar ?? false),
    persona: {
      id: String(item?.persona?.id ?? ""),
      curp: String(item?.persona?.curp ?? ""),
      nombre: String(item?.persona?.nombre ?? ""),
      apellido_paterno: String(item?.persona?.apellido_paterno ?? ""),
      apellido_materno: String(item?.persona?.apellido_materno ?? ""),
      fecha_nacimiento: String(item?.persona?.fecha_nacimiento ?? ""),
      genero: String(item?.persona?.genero ?? ""),
      email: String(item?.persona?.email ?? ""),
      telefono: String(item?.persona?.telefono ?? ""),
      direccion: String(item?.persona?.direccion ?? ""),
      foto: item?.persona?.foto ?? null,
      created_at: String(item?.persona?.created_at ?? ""),
    },
  });

  const loadUsuarios = useCallback(async () => {
    try {
      const response = await request("/admin/users/getUsers", "GET");
      const data = extractArray(response);
      const normalizados = data
        .map(normalizeUsuario)
        .filter((user: UsuarioListado) => user.id && user.nombreUsuario);
      setUsuarios(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los usuarios", error);
      toast({
        title: "No se pudieron cargar los usuarios",
        description: "Intenta de nuevo más tarde.",
        variant: "destructive",
      });
      setUsuarios([]);
    }
  }, [toast]);

  const loadDoctores = useCallback(async () => {
    try {
      const response = await request("/sics/doctors/getDoctors", "GET");
      const data = Array.isArray(response) ? response : extractArray(response);
      const normalizados = data
        .map(normalizeDoctor)
        .filter((doctor: Doctor) => doctor.id && doctor.persona?.id);
      setDoctores(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los médicos", error);
      toast({
        title: "No se pudieron cargar los médicos",
        description: "Intenta de nuevo más tarde.",
        variant: "destructive",
      });
      setDoctores([]);
    }
  }, [toast]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsuarios(), loadDoctores()]);
    } finally {
      setLoading(false);
    }
  }, [loadUsuarios, loadDoctores]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Relación Usuario Médico
          </h1>
          <p className="text-muted-foreground">
            Vincula usuarios del sistema con médicos registrados.
          </p>
        </div>

        <RelacionUsuarioMedico
          usuarios={usuarios}
          doctores={doctores}
          loading={loading}
          onReload={loadData}
        />
      </div>
    </MainLayout>
  );
}

