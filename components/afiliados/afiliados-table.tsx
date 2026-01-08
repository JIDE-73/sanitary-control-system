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
import { Eye, Edit, FileText } from "lucide-react";

export interface AfiliadoListado {
  id: string;
  curp: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  genero: "masculino" | "femenino" | "lgbt+" | "LGBTQ+" | string;
  telefono?: string;
  ciudad?: string;
  estatus: "activo" | "inactivo" | "suspendido" | "pendiente";
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
            <TableHead>CURP</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando afiliados...
              </TableCell>
            </TableRow>
          ) : afiliados.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron afiliados
              </TableCell>
            </TableRow>
          ) : (
            afiliados.map((afiliado) => (
              <TableRow key={afiliado.id}>
                <TableCell className="font-mono text-sm">
                  {afiliado.curp}
                </TableCell>
                <TableCell className="font-medium">
                  {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                  {afiliado.apellidoMaterno}
                </TableCell>
                <TableCell>{generoLabels[afiliado.genero]}</TableCell>
                <TableCell>{afiliado.telefono}</TableCell>
                <TableCell>{afiliado.ciudad}</TableCell>
                <TableCell>
                  <Badge variant={estatusVariants[afiliado.estatus]}>
                    {afiliado.estatus.charAt(0).toUpperCase() +
                      afiliado.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/afiliados/${afiliado.id}`)}
                      title="Ver expediente"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
                      title="Emitir certificado"
                    >
                      <FileText className="h-4 w-4" />
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
