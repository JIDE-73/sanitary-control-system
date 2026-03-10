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
import { Loader2 } from "lucide-react";

export type ConsentimientoSangreListado = {
  id: string;
  persona_id: string;
  medico_id: string;
  fecha_nacimiento?: string;
  no_identificacion?: string;
  nombre_flebotomista?: string;
  fecha_toma?: string;
  persona_nombre?: string;
  medico_especialidad?: string;
};

interface ConsentimientosSangreTableProps {
  consentimientos: ConsentimientoSangreListado[];
  loading?: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export function ConsentimientosSangreTable({
  consentimientos,
  loading = false,
}: ConsentimientosSangreTableProps) {
  if (loading) {
    return (
      <div className="flex h-36 items-center justify-center rounded-md border">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!consentimientos.length) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No hay consentimientos de sangre registrados.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Afiliado</TableHead>
            <TableHead>No. Identificacion</TableHead>
            <TableHead>Fecha Nacimiento</TableHead>
            <TableHead>Flebotomista</TableHead>
            <TableHead>Fecha Toma</TableHead>
            <TableHead>Médico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consentimientos.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">#{item.id}</TableCell>
              <TableCell>{item.persona_nombre || item.persona_id}</TableCell>
              <TableCell>{item.no_identificacion || "-"}</TableCell>
              <TableCell>{formatDate(item.fecha_nacimiento)}</TableCell>
              <TableCell>{item.nombre_flebotomista || "-"}</TableCell>
              <TableCell>{formatDate(item.fecha_toma)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {item.medico_especialidad || item.medico_id}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
