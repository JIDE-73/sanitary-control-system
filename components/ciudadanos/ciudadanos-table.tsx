"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";

export interface CiudadanoListado {
  id: string;
  curp: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  genero: "masculino" | "femenino" | "lgbt+" | "LGBTQ+" | string;
  telefono?: string;
  ciudad?: string;
  lugarTrabajoCodigo?: string;
  lugarTrabajoNombre?: string;
  estatus: "activo" | "inactivo" | "suspendido" | "pendiente";
  nivelRiesgo?: string;
  fechaNacimiento?: string;
  email?: string;
  lugarProcedencia?: string;
  ocupacion?: string;
  direccion?: string;
  fechaRegistro?: string;
}

interface CiudadanosTableProps {
  ciudadanos: CiudadanoListado[];
  loading?: boolean;
  onReload?: () => Promise<void> | void;
}

const generoLabels: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  "lgbt+": "LGBT+",
  lgbtq: "LGBTQ+",
  "lgbtq+": "LGBTQ+",
};

const estatusVariants = {
  activo: "default",
  inactivo: "secondary",
  suspendido: "destructive",
  pendiente: "outline",
} as const;

const riesgoVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  bajo: "secondary",
  medio: "default",
  alto: "destructive",
};

const ITEMS_PER_PAGE = 10;

export function CiudadanosTable({
  ciudadanos,
  loading = false,
  onReload,
}: CiudadanosTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  const [localCiudadanos, setLocalCiudadanos] = useState(ciudadanos);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLocalCiudadanos(ciudadanos);
  }, [ciudadanos]);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(localCiudadanos.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedCiudadanos = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return localCiudadanos.slice(start, start + ITEMS_PER_PAGE);
  }, [localCiudadanos, page]);

  const showingStart = localCiudadanos.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    localCiudadanos.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, localCiudadanos.length);

  const runReload = async () => {
    setReloading(true);
    try {
      if (onReload) {
        await onReload();
      } else {
        await router.refresh();
      }
    } finally {
      setReloading(false);
    }
  };

  const refreshData = async () => {
    setReloading(true);
    try {
      await router.refresh();
    } finally {
      setReloading(false);
    }
  };

  const handleDelete = async (ciudadanoId: string, nombre: string) => {
    const confirmed = window.confirm(`¿Eliminar a ${nombre}?`);
    if (!confirmed) return;

    try {
      setDeletingId(ciudadanoId);
      const response = await request(
        `/alcoholimetria/citizens/deleteCitizen/${ciudadanoId}`,
        "DELETE"
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Ciudadano eliminado",
          description: "El ciudadano fue eliminado correctamente.",
        });
        setLocalCiudadanos((prev) =>
          prev.filter((item) => item.id !== ciudadanoId)
        );
        await runReload();
      } else {
        toast({
          variant: "destructive",
          title: "No se pudo eliminar",
          description: response?.message || "Intenta de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar ciudadano", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "Ocurrió un error. Intenta nuevamente.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm text-muted-foreground">Ciudadanos registrados</p>
        <Button
          variant="outline"
          size="sm"
          onClick={runReload}
          disabled={reloading || loading}
          className="gap-2"
        >
          {reloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Recargar
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CURP</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead>Nivel de riesgo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando ciudadanos...
              </TableCell>
            </TableRow>
          ) : localCiudadanos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron ciudadanos
              </TableCell>
            </TableRow>
          ) : (
            paginatedCiudadanos.map((ciudadano) => (
              <TableRow key={ciudadano.id}>
                <TableCell className="font-mono text-sm">
                  {ciudadano.curp}
                </TableCell>
                <TableCell className="font-medium">
                  {ciudadano.nombres} {ciudadano.apellidoPaterno}{" "}
                  {ciudadano.apellidoMaterno}
                </TableCell>
                <TableCell>
                  {generoLabels[(ciudadano.genero || "").toLowerCase()] ??
                    ciudadano.genero ??
                    "—"}
                </TableCell>
                <TableCell>{ciudadano.telefono ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={estatusVariants[ciudadano.estatus]}>
                    {ciudadano.estatus.charAt(0).toUpperCase() +
                      ciudadano.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ciudadano.nivelRiesgo ? (
                    <Badge
                      variant={
                        riesgoVariants[ciudadano.nivelRiesgo.toLowerCase()] ??
                        "outline"
                      }
                    >
                      {ciudadano.nivelRiesgo}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalles"
                          aria-label="Ver detalles de ciudadano"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {ciudadano.nombres} {ciudadano.apellidoPaterno}{" "}
                            {ciudadano.apellidoMaterno}
                          </DialogTitle>
                          <DialogDescription>
                            Información de ciudadano
                          </DialogDescription>
                        </DialogHeader>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              CURP
                            </dt>
                            <dd className="font-medium break-all">
                              {ciudadano.curp}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Género
                            </dt>
                            <dd className="font-medium">
                              {generoLabels[
                                (ciudadano.genero || "").toLowerCase()
                              ] ??
                                ciudadano.genero ??
                                "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estatus
                            </dt>
                            <dd>
                              <Badge
                                variant={estatusVariants[ciudadano.estatus]}
                              >
                                {ciudadano.estatus.charAt(0).toUpperCase() +
                                  ciudadano.estatus.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Nivel de riesgo
                            </dt>
                            <dd>
                              {ciudadano.nivelRiesgo ? (
                                <Badge
                                  variant={
                                    riesgoVariants[
                                      ciudadano.nivelRiesgo.toLowerCase()
                                    ] ?? "outline"
                                  }
                                >
                                  {ciudadano.nivelRiesgo}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.telefono ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Email
                            </dt>
                            <dd className="font-medium break-all">
                              {ciudadano.email ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ciudad
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.ciudad ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Dirección
                            </dt>
                            <dd className="font-medium break-all">
                              {ciudadano.direccion ?? ciudadano.ciudad ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Lugar de procedencia
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.lugarProcedencia ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ocupación
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.ocupacion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.lugarTrabajoCodigo
                                ? `${ciudadano.lugarTrabajoCodigo} - ${
                                    ciudadano.lugarTrabajoNombre ?? ""
                                  }`
                                : ciudadano.lugarTrabajoNombre ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de nacimiento
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.fechaNacimiento
                                ? ciudadano.fechaNacimiento.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de registro
                            </dt>
                            <dd className="font-medium">
                              {ciudadano.fechaRegistro
                                ? ciudadano.fechaRegistro.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Mostrando {showingStart}-{showingEnd} de {localCiudadanos.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0 || localCiudadanos.length === 0}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {localCiudadanos.length === 0 ? 0 : page + 1} de{" "}
            {localCiudadanos.length === 0 ? 0 : totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
            }
            disabled={localCiudadanos.length === 0 || page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
