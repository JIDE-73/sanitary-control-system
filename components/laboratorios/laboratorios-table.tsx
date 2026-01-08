"use client";

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
import { Eye, Edit, Trash2, ShieldCheck } from "lucide-react";
import type { LaboratorioListado } from "@/lib/types";

interface LaboratoriosTableProps {
  laboratorios: LaboratorioListado[];
  loading?: boolean;
}

export function LaboratoriosTable({
  laboratorios,
  loading = false,
}: LaboratoriosTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Comercial</TableHead>
            <TableHead>RFC</TableHead>
            <TableHead>Certificado</TableHead>
            <TableHead>Email de Contacto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando laboratorios...
              </TableCell>
            </TableRow>
          ) : laboratorios.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron laboratorios
              </TableCell>
            </TableRow>
          ) : (
            laboratorios.map((lab) => (
              <TableRow key={lab.id}>
                <TableCell className="font-medium">
                  {lab.nombre_comercial}
                </TableCell>
                <TableCell className="font-mono text-sm">{lab.rfc}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lab.certificado_organismo ? "default" : "secondary"
                    }
                    className="gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {lab.certificado_organismo ? "Certificado" : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{lab.email_contacto}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Detalles próximamente"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Edición próximamente"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Eliminación próximamente"
                    >
                      <Trash2 className="h-4 w-4" />
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
