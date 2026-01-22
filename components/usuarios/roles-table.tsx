"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

type PermissionAction = "create" | "read" | "update" | "delete";

type RoleRow = {
  id: string;
  nombre: string;
  permisos: {
    modulos: Record<string, PermissionAction[]>;
    sistema?: Record<string, PermissionAction[]>;
  };
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  afiliados: "Afiliados",
  ciudadanos: "Ciudadanos",
  usuarios: "Usuarios",
  medicos: "Médicos",
  lugares_trabajo: "Lugares de trabajo",
  laboratorios: "Laboratorios",
  notas_medicas_cs: "Notas médicas CS",
  notas_medicas_alm: "Notas médicas ALM",
  examenes_cs: "Exámenes CS",
  certificados_alm: "Certificados ALM",
};

const ITEMS_PER_PAGE = 10;

export function RolesTable() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request("/admin/rol/getRoles", "GET");
      if (response.status >= 200 && response.status < 300) {
        setRoles(response.roles || []);
      } else {
        setError(response?.message || "No se pudieron obtener los roles.");
      }
    } catch (err) {
      console.error("Error al obtener roles", err);
      setError("Error al obtener roles. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (roleId: string) => {
    const confirmDelete = window.confirm("¿Eliminar este rol?");
    if (!confirmDelete) return;
    try {
      setDeletingId(roleId);
      const response = await request(
        `/admin/rol/deleteRol/${roleId}`,
        "DELETE",
        { id_role: roleId }
      );
      if (response.status >= 200 && response.status < 300) {
        setRoles((prev) => prev.filter((role) => role.id !== roleId));
        toast({
          title: "Rol eliminado",
          description: "El rol se eliminó correctamente.",
        });
      } else {
        setError(response?.message || "No se pudo eliminar el rol.");
      }
    } catch (err) {
      console.error("Error al eliminar rol", err);
      setError("Error al eliminar rol. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  const summary = useMemo(
    () =>
      roles.map((role) => {
        const modulesWithPermissions = Object.entries(
          role.permisos?.modulos || {}
        ).filter(([, actions]) => Array.isArray(actions) && actions.length > 0);
        return {
          id: role.id,
          nombre: role.nombre,
          modulesWithPermissions,
          modulesCount: modulesWithPermissions.length,
        };
      }),
    [roles]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(summary.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedSummary = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return summary.slice(start, start + ITEMS_PER_PAGE);
  }, [summary, page]);

  const showingStart = summary.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    summary.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, summary.length);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Roles registrados</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRoles}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Recargar
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Nombre</TableHead>
                <TableHead className="w-1/4">Módulos con permisos</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="w-[140px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-6 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando roles...
                    </div>
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No hay roles registrados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSummary.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">
                      {item.nombre}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {item.modulesCount} módulos
                      </Badge>
                    </TableCell>
                    <TableCell className="space-y-1">
                      {item.modulesWithPermissions.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Sin permisos asignados
                        </span>
                      ) : (
                        item.modulesWithPermissions.map(
                          ([moduleKey, actions]) => (
                            <div
                              key={`${item.id}-${moduleKey}`}
                              className="text-sm"
                            >
                              <span className="font-medium">
                                {MODULE_LABELS[moduleKey] || moduleKey}
                                {": "}
                              </span>
                              <span className="text-muted-foreground">
                                {(actions as PermissionAction[]).join(", ")}
                              </span>
                            </div>
                          )
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Mostrando {showingStart}-{showingEnd} de {summary.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0 || summary.length === 0}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">
              Página {summary.length === 0 ? 0 : page + 1} de{" "}
              {summary.length === 0 ? 0 : totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
              }
              disabled={summary.length === 0 || page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
