"use client";

import { useEffect, useState } from "react";

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

export interface UsuarioListado {
  id: string;
  personaId?: string;
  nombreUsuario: string;
  activo: boolean;
  rolId?: string;
  ultimoLogin?: string | null;
}

interface UsuariosTableProps {
  usuarios: UsuarioListado[];
  loading?: boolean;
  onReload?: () => Promise<void> | void;
}

interface UsuarioDetalle extends UsuarioListado {
  rolId?: string;
  persona?: {
    id?: string;
    curp?: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    fecha_nacimiento?: string;
    genero?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    foto?: string | null;
    created_at?: string;
  };
}

const estatusVariants = {
  activo: "default",
  inactivo: "secondary",
} as const;

const formatFecha = (date?: string | null) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
};

export function UsuariosListado({
  usuarios,
  loading = false,
  onReload,
}: UsuariosTableProps) {
  const { toast } = useToast();
  const [localUsuarios, setLocalUsuarios] =
    useState<UsuarioListado[]>(usuarios);
  const [reloading, setReloading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<UsuarioDetalle | null>(null);
  const [detalleCache, setDetalleCache] = useState<
    Record<string, UsuarioDetalle>
  >({});
  const [detalleLoading, setDetalleLoading] = useState(false);

  useEffect(() => {
    setLocalUsuarios(usuarios);
  }, [usuarios]);

  const runReload = async () => {
    if (!onReload) return;
    setReloading(true);
    try {
      await onReload();
    } finally {
      setReloading(false);
    }
  };

  const normalizeDetalle = (response: any): UsuarioDetalle | null => {
    const item = response?.user ?? response;
    if (!item) return null;

    return {
      id: String(item?.id ?? ""),
      personaId: item?.persona_id ?? item?.personaId ?? "",
      nombreUsuario: item?.nombre_usuario ?? item?.nombreUsuario ?? "",
      activo: Boolean(item?.activo ?? false),
      rolId: item?.rol_id ?? item?.rolId ?? "",
      ultimoLogin: item?.ultimo_login ?? item?.ultimoLogin ?? null,
      persona: item?.persona
        ? {
            id: item?.persona?.id,
            curp: item?.persona?.curp,
            nombre: item?.persona?.nombre,
            apellido_paterno: item?.persona?.apellido_paterno,
            apellido_materno: item?.persona?.apellido_materno,
            fecha_nacimiento: item?.persona?.fecha_nacimiento,
            genero: item?.persona?.genero,
            email: item?.persona?.email,
            telefono: item?.persona?.telefono,
            direccion: item?.persona?.direccion,
            foto: item?.persona?.foto,
            created_at: item?.persona?.created_at,
          }
        : undefined,
    };
  };

  const fetchDetalle = async (id: string) => {
    if (detalleCache[id]) {
      setDetalle(detalleCache[id]);
      return;
    }

    setDetalleLoading(true);
    try {
      const response = await request(`/admin/users/getUserbyId/${id}`, "GET");
      const normalizado = normalizeDetalle(response);
      if (normalizado) {
        setDetalle(normalizado);
        setDetalleCache((prev) => ({ ...prev, [id]: normalizado }));
      } else {
        toast({
          title: "No se pudo cargar el detalle",
          description: "Respuesta inválida del servidor.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al obtener usuario por id", error);
      toast({
        title: "Error al cargar detalle",
        description: "Intenta nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleDialogChange = (open: boolean, usuario: UsuarioListado) => {
    if (open) {
      setSelectedId(usuario.id);
      setDetalle(null);
      void fetchDetalle(usuario.id);
    } else {
      setSelectedId(null);
      setDetalle(null);
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm text-muted-foreground">Usuarios registrados</p>
        <Button
          variant="outline"
          size="sm"
          onClick={runReload}
          disabled={reloading || loading || !onReload}
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
            <TableHead>Último acceso</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando usuarios...
              </TableCell>
            </TableRow>
          ) : localUsuarios.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          ) : (
            localUsuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">
                  {usuario.nombreUsuario}
                </TableCell>
                <TableCell>{formatFecha(usuario.ultimoLogin)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      estatusVariants[usuario.activo ? "activo" : "inactivo"]
                    }
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={selectedId === usuario.id}
                    onOpenChange={(open) => handleDialogChange(open, usuario)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ver detalles"
                        aria-label="Ver detalles de usuario"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{usuario.nombreUsuario}</DialogTitle>
                        <DialogDescription>
                          Información del usuario
                        </DialogDescription>
                      </DialogHeader>
                      {detalleLoading ? (
                        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando detalle...
                        </div>
                      ) : (
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              ID
                            </dt>
                            <dd className="font-mono text-xs break-all">
                              {detalle?.id ?? usuario.id}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Rol ID
                            </dt>
                            <dd className="font-mono text-xs break-all">
                              {detalle?.rolId || usuario.rolId || "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Persona ID
                            </dt>
                            <dd className="font-mono text-xs break-all">
                              {detalle?.persona?.id ||
                                detalle?.personaId ||
                                usuario.personaId ||
                                "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estatus
                            </dt>
                            <dd>
                              <Badge
                                variant={
                                  estatusVariants[
                                    detalle?.activo ?? usuario.activo
                                      ? "activo"
                                      : "inactivo"
                                  ]
                                }
                              >
                                {detalle?.activo ?? usuario.activo
                                  ? "Activo"
                                  : "Inactivo"}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Último acceso
                            </dt>
                            <dd className="font-medium">
                              {formatFecha(
                                detalle?.ultimoLogin ?? usuario.ultimoLogin
                              )}
                            </dd>
                          </div>

                          {detalle?.persona && (
                            <>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  CURP
                                </dt>
                                <dd className="font-mono text-xs break-all">
                                  {detalle.persona.curp || "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Nombre
                                </dt>
                                <dd className="font-medium">
                                  {[
                                    detalle.persona.nombre,
                                    detalle.persona.apellido_paterno,
                                    detalle.persona.apellido_materno,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") || "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Email
                                </dt>
                                <dd className="font-medium break-all">
                                  {detalle.persona.email || "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Teléfono
                                </dt>
                                <dd className="font-medium">
                                  {detalle.persona.telefono || "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Dirección
                                </dt>
                                <dd className="font-medium break-all">
                                  {detalle.persona.direccion || "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Fecha de nacimiento
                                </dt>
                                <dd className="font-medium">
                                  {detalle.persona.fecha_nacimiento
                                    ? detalle.persona.fecha_nacimiento.split(
                                        "T"
                                      )[0]
                                    : "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1">
                                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Fecha de registro
                                </dt>
                                <dd className="font-medium">
                                  {detalle.persona.created_at
                                    ? detalle.persona.created_at.split("T")[0]
                                    : "—"}
                                </dd>
                              </div>
                            </>
                          )}
                        </dl>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
