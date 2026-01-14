"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import type { NotaMedicaALMRecord } from "@/lib/notas-medicas-alm";

interface NotasMedicasALMTableProps {
  notas: NotaMedicaALMRecord[];
  loading?: boolean;
}

const booleanLabel = (value: boolean) => (value ? "Sí" : "No");

export function NotasMedicasALMTable({
  notas,
  loading,
}: NotasMedicasALMTableProps) {
  const [selectedNota, setSelectedNota] = useState<NotaMedicaALMRecord | null>(
    null
  );

  const sortedNotas = useMemo(
    () =>
      [...notas].sort(
        (a, b) =>
          new Date(b.fecha_expedicion).getTime() -
          new Date(a.fecha_expedicion).getTime()
      ),
    [notas]
  );

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha expedición</TableHead>
              <TableHead>Oficial</TableHead>
              <TableHead>Dependencia</TableHead>
              <TableHead>No. oficial</TableHead>
              <TableHead>No. unidad</TableHead>
              <TableHead>Lesiones visibles</TableHead>
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
                  Cargando notas médicas ALM...
                </TableCell>
              </TableRow>
            ) : sortedNotas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  No hay notas registradas para ALM
                </TableCell>
              </TableRow>
            ) : (
              sortedNotas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell className="font-medium">
                    {nota.fecha_expedicion
                      ? new Date(nota.fecha_expedicion).toLocaleDateString(
                          "es-MX"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {nota.nombre_oficial}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {nota.dependencia}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {nota.noOficial ?? "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {nota.noUnidad ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        nota.lesiones_visibles ? "destructive" : "outline"
                      }
                    >
                      {booleanLabel(nota.lesiones_visibles)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedNota(nota)}
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedNota} onOpenChange={() => setSelectedNota(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nota médica ALM</DialogTitle>
            <DialogDescription>Detalle clínico registrado</DialogDescription>
          </DialogHeader>

          {selectedNota && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">{selectedNota.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {selectedNota.fecha_expedicion
                      ? new Date(selectedNota.fecha_expedicion).toLocaleString(
                          "es-MX"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Oficial</p>
                  <p className="font-medium">{selectedNota.nombre_oficial}</p>
                  <p className="font-mono text-xs">
                    Dependencia: {selectedNota.dependencia}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cédula</p>
                  <p className="font-medium">{selectedNota.cedula || "-"}</p>
                  <p className="text-muted-foreground mt-2">Edad</p>
                  <p className="font-medium">{selectedNota.edad || "-"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Se identifica con</p>
                  <p className="font-medium">{selectedNota.se_identifica}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recomendación médica</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedNota.recomendacion_medico}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Adicciones referidas</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedNota.adicciones_referidas}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Descripción lesiones / hallazgos
                  </p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedNota.descripcion_lesiones_hallazgos}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Consciente</p>
                  <p className="font-medium">
                    {booleanLabel(selectedNota.conciente)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    Orientación alopsíquica
                  </p>
                  <p className="font-medium">
                    {booleanLabel(selectedNota.orientacion_alopsiquica)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Control de esfínteres</p>
                  <p className="font-medium">
                    {booleanLabel(selectedNota.control_esfinteres)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Aliento alcohólico</p>
                  <p className="font-medium">
                    {booleanLabel(selectedNota.aliento_alcoholico)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lesiones visibles</p>
                  <p className="font-medium">
                    {booleanLabel(selectedNota.lesiones_visibles)}
                  </p>
                </div>
              </div>
            </div>
          )}

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
