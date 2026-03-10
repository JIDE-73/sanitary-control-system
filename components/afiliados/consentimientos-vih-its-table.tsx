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

export type ConsentimientoVihItsListado = {
  id: string;
  persona_id: string;
  medico_id: string;
  fecha?: string;
  expediente?: string;
  persona_nombre?: string;
  medico_especialidad?: string;
};

interface ConsentimientosVihItsTableProps {
  consentimientos: ConsentimientoVihItsListado[];
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

export function ConsentimientosVihItsTable({
  consentimientos,
  loading = false,
}: ConsentimientosVihItsTableProps) {
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
        No hay consentimientos de VIH/ITS registrados.
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
            <TableHead>Expediente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Médico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consentimientos.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">#{item.id}</TableCell>
              <TableCell>{item.persona_nombre || item.persona_id}</TableCell>
              <TableCell>{item.expediente || "-"}</TableCell>
              <TableCell>{formatDate(item.fecha)}</TableCell>
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
