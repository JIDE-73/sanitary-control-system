"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
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

export function RolesTable() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
                summary.map((item) => (
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
