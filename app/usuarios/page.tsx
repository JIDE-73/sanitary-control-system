"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  UsuariosListado,
  type UsuarioListado,
} from "@/components/usuarios/ususarios-table";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

export default function UsuariosPage() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([]);
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

  const loadUsuarios = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios del sistema y crea nuevos registros.
            </p>
          </div>
          <Button asChild>
            <Link href="/usuarios/nuevo">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>

        <UsuariosListado
          usuarios={usuarios}
          loading={loading}
          onReload={loadUsuarios}
        />
      </div>
    </MainLayout>
  );
}
