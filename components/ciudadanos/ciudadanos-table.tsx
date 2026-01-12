"use client";

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
import { Eye } from "lucide-react";

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

export function CiudadanosTable({
  ciudadanos,
  loading = false,
}: CiudadanosTableProps) {
  return (
    <div className="rounded-lg border border-border">
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
          ) : ciudadanos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron ciudadanos
              </TableCell>
            </TableRow>
          ) : (
            ciudadanos.map((ciudadano) => (
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
                            Identificador
                          </dt>
                          <dd className="font-medium">{ciudadano.id}</dd>
                        </div>
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
                            <Badge variant={estatusVariants[ciudadano.estatus]}>
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
