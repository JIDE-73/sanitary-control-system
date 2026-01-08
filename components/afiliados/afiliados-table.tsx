"use client";

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
import { Eye, Edit, IdCard } from "lucide-react";

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
}: AfiliadosTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-border">
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
                      onClick={() =>
                        router.push(`/afiliados/${afiliado.id}/editar`)
                      }
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(
                          `/certificados/nuevo?afiliado=${afiliado.id}`
                        )
                      }
                      title="Generar Credencial"
                    >
                      <IdCard className="h-4 w-4" />
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
