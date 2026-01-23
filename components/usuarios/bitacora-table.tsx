"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Eye, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import type { BitacoraEntry } from "@/lib/types";

interface BitacoraTableProps {
  loading?: boolean;
  onReload?: () => Promise<void> | void;
}

const ITEMS_PER_PAGE = 10;

const formatFecha = (date?: string | null) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getActionBadgeVariant = (action: string) => {
  if (action.includes("LOGIN")) return "default";
  if (action.includes("CREATE") || action.includes("CREAR")) return "default";
  if (action.includes("UPDATE") || action.includes("ACTUALIZAR")) return "secondary";
  if (action.includes("DELETE") || action.includes("ELIMINAR")) return "destructive";
  return "outline";
};

const formatAction = (action: string) => {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export function BitacoraTable({
  loading = false,
  onReload,
}: BitacoraTableProps) {
  const { toast } = useToast();
  const [bitacora, setBitacora] = useState<BitacoraEntry[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(bitacora.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedBitacora = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return bitacora.slice(start, start + ITEMS_PER_PAGE);
  }, [bitacora, page]);

  const showingStart = bitacora.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    bitacora.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, bitacora.length);

  const loadBitacora = async () => {
    setInternalLoading(true);
    try {
      const response = await request("/admin/binnacle/getBinnacle", "GET");
      
      if (response.status >= 200 && response.status < 300) {
        const entries = Array.isArray(response?.binnacle)
          ? response.binnacle
          : [];
        setBitacora(entries);
      } else {
        toast({
          title: "No se pudo cargar la bitácora",
          description: response?.message || "Intenta de nuevo más tarde.",
          variant: "destructive",
        });
        setBitacora([]);
      }
    } catch (error) {
      console.error("Error al cargar bitácora", error);
      toast({
        title: "Error al cargar bitácora",
        description: "Revisa tu conexión e intenta nuevamente.",
        variant: "destructive",
      });
      setBitacora([]);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    void loadBitacora();
  }, []);

  const runReload = async () => {
    setReloading(true);
    try {
      await loadBitacora();
      if (onReload) {
        await onReload();
      }
    } finally {
      setReloading(false);
    }
  };

  const isLoading = loading || internalLoading;

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm text-muted-foreground">Bitácora de auditoría</p>
        <Button
          variant="outline"
          size="sm"
          onClick={runReload}
          disabled={reloading || isLoading}
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
            <TableHead>Usuario</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Dirección IP</TableHead>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando bitácora...
              </TableCell>
            </TableRow>
          ) : bitacora.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron registros en la bitácora
              </TableCell>
            </TableRow>
          ) : (
            paginatedBitacora.map((entry) => {
              const nombreCompleto = entry.usuario?.persona
                ? [
                    entry.usuario.persona.nombre,
                    entry.usuario.persona.apellido_paterno,
                    entry.usuario.persona.apellido_materno,
                  ]
                    .filter(Boolean)
                    .join(" ")
                : "";

              return (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{entry.usuario?.nombre_usuario || "—"}</span>
                      {nombreCompleto && (
                        <span className="text-xs text-muted-foreground">
                          {nombreCompleto}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(entry.action)}>
                      {formatAction(entry.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.ip_address || "—"}
                  </TableCell>
                  <TableCell>{formatFecha(entry.fecha_hora)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={selectedEntry?.id === entry.id}
                      onOpenChange={(open) =>
                        setSelectedEntry(open ? entry : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalles"
                          aria-label="Ver detalles de bitácora"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalle de Bitácora</DialogTitle>
                          <DialogDescription>
                            Información completa del registro de auditoría
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                ID
                              </dt>
                              <dd className="font-mono text-xs break-all">
                                {entry.id}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Usuario ID
                              </dt>
                              <dd className="font-mono text-xs break-all">
                                {entry.usuario_id}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Nombre de Usuario
                              </dt>
                              <dd className="font-medium">
                                {entry.usuario?.nombre_usuario || "—"}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Nombre Completo
                              </dt>
                              <dd className="font-medium">
                                {nombreCompleto || "—"}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Acción
                              </dt>
                              <dd>
                                <Badge variant={getActionBadgeVariant(entry.action)}>
                                  {formatAction(entry.action)}
                                </Badge>
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Dirección IP
                              </dt>
                              <dd className="font-mono text-xs">
                                {entry.ip_address || "—"}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-1 sm:col-span-2">
                              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Fecha y Hora
                              </dt>
                              <dd className="font-medium">
                                {formatFecha(entry.fecha_hora)}
                              </dd>
                            </div>
                          </dl>

                          {(entry.datos_antiguos || entry.datos_nuevos) && (
                            <div className="space-y-4">
                              {entry.datos_antiguos && (
                                <div className="rounded-md border border-border p-4">
                                  <div className="mb-2 text-sm font-semibold">
                                    Datos Antiguos
                                  </div>
                                  <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                                    {JSON.stringify(entry.datos_antiguos, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {entry.datos_nuevos && (
                                <div className="rounded-md border border-border p-4">
                                  <div className="mb-2 text-sm font-semibold">
                                    Datos Nuevos
                                  </div>
                                  <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                                    {JSON.stringify(entry.datos_nuevos, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Mostrando {showingStart}-{showingEnd} de {bitacora.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0 || bitacora.length === 0}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {bitacora.length === 0 ? 0 : page + 1} de{" "}
            {bitacora.length === 0 ? 0 : totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
            }
            disabled={bitacora.length === 0 || page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

