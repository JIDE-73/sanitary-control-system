"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import { Eye, Edit, IdCard, Loader2, RefreshCcw, Trash2 } from "lucide-react";

export interface AfiliadoListado {
  id: string;
  curp: string;
  noAfiliacion?: string;
  sidmoCodigo?: string | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  genero: "masculino" | "femenino" | "lgbt+" | "LGBTQ+" | string;
  telefono?: string;
  ciudad?: string;
  lugarTrabajoId?: string;
  lugarTrabajoCodigo?: string;
  lugarTrabajoNombre?: string;
  estatus: "activo" | "inactivo" | "suspendido" | "pendiente";
  // Campos extra opcionales que puede devolver la API
  fechaNacimiento?: string;
  fechaInicio?: string;
  fechaInicioTijuana?: string;
  estadoCivil?: string;
  actaNacimiento?: boolean;
  lugarProcedencia?: string;
  email?: string;
  direccion?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  ocupacion?: string;
  catalogoCalle?: string;
  catalogoColonia?: string;
  catalogoCodigoPostal?: string;
  catalogoCiudad?: string;
  catalogoEstado?: string;
  catalogoTelefono?: string;
}

interface AfiliadosTableProps {
  afiliados: AfiliadoListado[];
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

export function AfiliadosTable({
  afiliados,
  loading = false,
  onReload,
}: AfiliadosTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const reloadRef = useRef<(() => Promise<void> | void) | undefined>(onReload);

  useEffect(() => {
    reloadRef.current = onReload;
  }, [onReload]);

  const handleRefresh = () => {
    setRefreshToken((prev) => prev + 1);
  };

  useEffect(() => {
    if (refreshToken === 0) return;

    let cancelled = false;
    const runReload = async () => {
      setIsReloading(true);
      try {
        if (onReload) {
          await onReload();
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("Error al recargar afiliados", error);
        toast({
          variant: "destructive",
          title: "No se pudo recargar",
          description: "Intenta de nuevo más tarde.",
        });
      } finally {
        if (!cancelled) {
          setIsReloading(false);
        }
      }
    };

    runReload();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, router, toast]);

  const handleEdit = (afiliado: AfiliadoListado) => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("afiliado-current", JSON.stringify(afiliado));
      }
    } catch (error) {
      console.warn("No se pudo guardar afiliado en cache", error);
    }
    router.push(`/afiliados/${afiliado.id}/editar`);
  };

  const handleDelete = async (afiliado: AfiliadoListado) => {
    const confirmDelete = window.confirm(
      `¿Eliminar al afiliado ${afiliado.nombres} ${afiliado.apellidoPaterno}?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(afiliado.id);
      const response = await request(
        `/sics/affiliates/deleteAffiliate/${afiliado.id}`,
        "DELETE"
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Afiliado eliminado",
          description: "El afiliado fue eliminado correctamente.",
        });
        setRefreshToken((prev) => prev + 1);
      } else {
        toast({
          variant: "destructive",
          title: "No se pudo eliminar",
          description: response?.message || "Intenta de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar afiliado", error);
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
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Afiliados</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || isReloading || Boolean(deletingId)}
        >
          {isReloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Recargar
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Afiliación</TableHead>
            <TableHead>CURP</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Lugar de Trabajo</TableHead>
            <TableHead>Estatus</TableHead>
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
                Cargando afiliados...
              </TableCell>
            </TableRow>
          ) : afiliados.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron afiliados
              </TableCell>
            </TableRow>
          ) : (
            afiliados.map((afiliado) => (
              <TableRow key={afiliado.id}>
                <TableCell className="font-mono text-sm">
                  {afiliado.noAfiliacion ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {afiliado.curp}
                </TableCell>
                <TableCell className="font-medium">
                  {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                  {afiliado.apellidoMaterno}
                </TableCell>
                <TableCell>
                  {generoLabels[(afiliado.genero || "").toLowerCase()] ??
                    afiliado.genero ??
                    "—"}
                </TableCell>
                <TableCell>{afiliado.telefono}</TableCell>
                <TableCell>{afiliado.ciudad}</TableCell>
                <TableCell>
                  {afiliado.lugarTrabajoCodigo
                    ? `${afiliado.lugarTrabajoCodigo} - ${
                        afiliado.lugarTrabajoNombre ?? ""
                      }`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={estatusVariants[afiliado.estatus]}>
                    {afiliado.estatus.charAt(0).toUpperCase() +
                      afiliado.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver expediente"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                            {afiliado.apellidoMaterno}
                          </DialogTitle>
                          <DialogDescription>
                            Información del afiliado (solo lectura)
                          </DialogDescription>
                        </DialogHeader>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              No. afiliación
                            </dt>
                            <dd className="font-medium">
                              {afiliado.noAfiliacion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Código SIDMO
                            </dt>
                            <dd className="font-medium">
                              {afiliado.sidmoCodigo ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              CURP
                            </dt>
                            <dd className="font-medium break-all">
                              {afiliado.curp}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Nombre completo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                              {afiliado.apellidoMaterno}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Género
                            </dt>
                            <dd className="font-medium">
                              {generoLabels[
                                (afiliado.genero || "").toLowerCase()
                              ] ??
                                afiliado.genero ??
                                "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estatus
                            </dt>
                            <dd>
                              <Badge
                                variant={estatusVariants[afiliado.estatus]}
                              >
                                {afiliado.estatus.charAt(0).toUpperCase() +
                                  afiliado.estatus.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono
                            </dt>
                            <dd className="font-medium">
                              {afiliado.telefono ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Email
                            </dt>
                            <dd className="font-medium break-all">
                              {afiliado.email ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estado civil
                            </dt>
                            <dd className="font-medium">
                              {afiliado.estadoCivil ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de nacimiento
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaNacimiento
                                ? afiliado.fechaNacimiento.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ciudad
                            </dt>
                            <dd className="font-medium">
                              {afiliado.ciudad ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estado (lugar de trabajo)
                            </dt>
                            <dd className="font-medium">
                              {afiliado.catalogoEstado ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Dirección personal
                            </dt>
                            <dd className="font-medium">
                              {afiliado.direccion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Dirección lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {[
                                afiliado.catalogoCalle,
                                afiliado.catalogoColonia,
                                afiliado.catalogoCodigoPostal,
                              ]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ciudad lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.catalogoCiudad ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Lugar de procedencia
                            </dt>
                            <dd className="font-medium">
                              {afiliado.lugarProcedencia ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ocupación
                            </dt>
                            <dd className="font-medium">
                              {afiliado.ocupacion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.catalogoTelefono ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de inicio
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaInicio
                                ? afiliado.fechaInicio.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha inicio Tijuana
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaInicioTijuana
                                ? afiliado.fechaInicioTijuana.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Acta de nacimiento
                            </dt>
                            <dd className="font-medium">
                              {afiliado.actaNacimiento === true
                                ? "Sí"
                                : afiliado.actaNacimiento === false
                                ? "No"
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.lugarTrabajoCodigo
                                ? `${afiliado.lugarTrabajoCodigo} - ${
                                    afiliado.lugarTrabajoNombre ?? ""
                                  }`
                                : afiliado.lugarTrabajoNombre ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de registro
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaRegistro
                                ? afiliado.fechaRegistro.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => handleEdit(afiliado)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Generar Credencial"
                      onClick={() =>
                        router.push(
                          `/certificados/nuevo?afiliado=${afiliado.id}`
                        )
                      }
                    >
                      <IdCard className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      onClick={() => handleDelete(afiliado)}
                      disabled={deletingId === afiliado.id || isReloading}
                    >
                      {deletingId === afiliado.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
