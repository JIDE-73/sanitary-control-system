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
import { Eye, Edit, IdCard, CheckCircle, XCircle } from "lucide-react";
import type { Medico } from "@/lib/types";

interface MedicosTableProps {
  medicos: Medico[];
  loading?: boolean;
}

const estatusVariants = {
  activo: "default",
  inactivo: "secondary",
  suspendido: "destructive",
} as const;

export function MedicosTable({ medicos, loading = false }: MedicosTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cédula Profesional</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Firma Digital</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando médicos...
              </TableCell>
            </TableRow>
          ) : medicos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron médicos
              </TableCell>
            </TableRow>
          ) : (
            medicos.map((medico) => (
              <TableRow key={medico.id}>
                <TableCell className="font-mono">
                  {medico.cedulaProfesional}
                </TableCell>
                <TableCell className="font-medium">
                  Dr(a). {medico.nombres} {medico.apellidoPaterno}{" "}
                  {medico.apellidoMaterno}
                </TableCell>
                <TableCell>{medico.especialidad}</TableCell>
                <TableCell>{medico.telefono}</TableCell>
                <TableCell className="text-sm">{medico.email}</TableCell>
                <TableCell>
                  {medico.firmaDigitalUrl ? (
                    <Badge
                      variant="outline"
                      className="gap-1 bg-accent/10 text-accent border-accent/30"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Cargada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 text-destructive border-destructive/30"
                    >
                      <XCircle className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={estatusVariants[medico.estatus] ?? "secondary"}
                  >
                    {medico.estatus.charAt(0).toUpperCase() +
                      medico.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Dr(a). {medico.nombres} {medico.apellidoPaterno}{" "}
                            {medico.apellidoMaterno}
                          </DialogTitle>
                          <DialogDescription>
                            Información del médico (solo lectura)
                          </DialogDescription>
                        </DialogHeader>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Cédula profesional
                            </dt>
                            <dd className="font-medium">
                              {medico.cedulaProfesional}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Especialidad
                            </dt>
                            <dd className="font-medium">
                              {medico.especialidad}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono
                            </dt>
                            <dd className="font-medium">{medico.telefono}</dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Email
                            </dt>
                            <dd className="font-medium break-all">
                              {medico.email}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estatus
                            </dt>
                            <dd>
                              <Badge
                                variant={
                                  estatusVariants[medico.estatus] ?? "secondary"
                                }
                              >
                                {medico.estatus.charAt(0).toUpperCase() +
                                  medico.estatus.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Firma digital
                            </dt>
                            <dd>
                              {medico.firmaDigitalUrl ? (
                                <Badge
                                  variant="outline"
                                  className="gap-1 bg-accent/10 text-accent border-accent/30"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Cargada
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-destructive border-destructive/30"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Pendiente
                                </Badge>
                              )}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              CURP
                            </dt>
                            <dd className="font-medium">
                              {medico.curp || "No especificado"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Habilitado para firmar
                            </dt>
                            <dd className="font-medium">
                              {medico.habilitado_para_firmar === true
                                ? "Sí"
                                : medico.habilitado_para_firmar === false
                                ? "No"
                                : "No especificado"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de registro
                            </dt>
                            <dd className="font-medium">
                              {medico.fechaRegistro || "No disponible"}
                            </dd>
                          </div>
                        </dl>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/medicos/${medico.id}/editar`)
                      }
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Generar credencial"
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
