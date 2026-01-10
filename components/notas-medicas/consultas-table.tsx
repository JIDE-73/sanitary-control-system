"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export type NotaMedica = {
  id: string;
  persona_id: string;
  medico_id: string;
  diagnostico: string;
  tratamiento: string;
  comentario?: string;
  consulta_fecha: string;
};

export type AfiliadoTabla = {
  id: string;
  nombre: string;
  curp: string;
  numeroAfiliacion?: string;
};

export type MedicoTabla = {
  id: string;
  nombre: string;
};

interface NotasMedicasTableProps {
  notas: NotaMedica[];
  afiliados: AfiliadoTabla[];
  medicos: MedicoTabla[];
  loading?: boolean;
}

export function NotasMedicasTable({
  notas,
  afiliados,
  medicos,
  loading,
}: NotasMedicasTableProps) {
  const router = useRouter();
  const [selectedNota, setSelectedNota] = useState<NotaMedica | null>(null);

  const getAfiliado = (id: string) => afiliados.find((a) => a.id === id);
  const getMedico = (id: string) => medicos.find((m) => m.id === id);

  const afiliadoSeleccionado = useMemo(
    () => (selectedNota ? getAfiliado(selectedNota.persona_id) : undefined),
    [selectedNota, afiliados]
  );

  const medicoSeleccionado = useMemo(
    () => (selectedNota ? getMedico(selectedNota.medico_id) : undefined),
    [selectedNota, medicos]
  );

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Afiliado</TableHead>
              <TableHead>CURP</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Tratamiento</TableHead>
              <TableHead>Comentario</TableHead>
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
                  Cargando notas médicas...
                </TableCell>
              </TableRow>
            ) : notas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No se encontraron notas médicas
                </TableCell>
              </TableRow>
            ) : (
              notas.map((nota) => {
                const afiliado = getAfiliado(nota.persona_id);
                const medico = getMedico(nota.medico_id);
                return (
                  <TableRow key={nota.id}>
                    <TableCell>
                      {nota.consulta_fecha
                        ? new Date(nota.consulta_fecha).toLocaleDateString(
                            "es-MX"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {afiliado?.nombre ?? "Afiliado no encontrado"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {afiliado?.curp || "-"}
                    </TableCell>
                    <TableCell>
                      {medico ? `Dr(a). ${medico.nombre}` : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {nota.diagnostico || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {nota.tratamiento || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {nota.comentario || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedNota(nota)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/afiliados/${nota.persona_id}`)
                          }
                          title="Ver expediente"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedNota} onOpenChange={() => setSelectedNota(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la nota médica</DialogTitle>
            <DialogDescription>
              Información básica de la nota médica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Afiliado</p>
                <p className="font-medium">
                  {afiliadoSeleccionado?.nombre ?? "No disponible"}
                </p>
                {afiliadoSeleccionado?.numeroAfiliacion ? (
                  <p className="text-xs text-muted-foreground">
                    Afiliación: {afiliadoSeleccionado.numeroAfiliacion}
                  </p>
                ) : null}
                <p className="font-mono text-xs">
                  {afiliadoSeleccionado?.curp}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Médico</p>
                <p className="font-medium">
                  {medicoSeleccionado
                    ? `Dr(a). ${medicoSeleccionado.nombre}`
                    : "No disponible"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {selectedNota?.consulta_fecha
                    ? new Date(selectedNota.consulta_fecha).toLocaleString(
                        "es-MX"
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Diagnóstico</p>
                <p className="font-medium">
                  {selectedNota?.diagnostico || "-"}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-muted-foreground">Tratamiento</p>
              <p className="font-medium whitespace-pre-wrap">
                {selectedNota?.tratamiento || "-"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Comentario</p>
              <p className="font-medium whitespace-pre-wrap">
                {selectedNota?.comentario || "-"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedNota(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
