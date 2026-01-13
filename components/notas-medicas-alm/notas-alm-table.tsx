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
import type { NotaMedicaALM } from "@/lib/notas-medicas-alm";
import { cn } from "@/lib/utils";

interface NotasMedicasALMTableProps {
  notas: NotaMedicaALM[];
  loading?: boolean;
}

const clasificacionTone: Record<NotaMedicaALM["clasificacion"], string> = {
  Rojo: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100",
  Naranja:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-100",
  Amarillo:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
  Verde:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
  Azul: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100",
};

const estadoTone: Record<NotaMedicaALM["estado"], string> = {
  abierta: "bg-primary/10 text-primary",
  "pendiente de estudios":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
  cerrada:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
  referida: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-100",
};

export function NotasMedicasALMTable({
  notas,
  loading,
}: NotasMedicasALMTableProps) {
  const [selectedNota, setSelectedNota] = useState<NotaMedicaALM | null>(null);

  const sortedNotas = useMemo(
    () =>
      [...notas].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ),
    [notas]
  );

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>CURP</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Clasificación</TableHead>
              <TableHead>Estado</TableHead>
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
                  <TableCell className="font-medium">{nota.folio}</TableCell>
                  <TableCell>
                    {nota.fecha
                      ? new Date(nota.fecha).toLocaleDateString("es-MX")
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {nota.pacienteNombre}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {nota.pacienteCurp || "-"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {nota.medicoNombre}
                  </TableCell>
                  <TableCell>{nota.servicio}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "uppercase",
                        clasificacionTone[nota.clasificacion]
                      )}
                    >
                      {nota.clasificacion}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={estadoTone[nota.estado]}
                    >
                      {nota.estado}
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
            <DialogDescription>
              Detalle clínico y plan de manejo registrado
            </DialogDescription>
          </DialogHeader>

          {selectedNota && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Folio</p>
                  <p className="font-medium">{selectedNota.folio}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedNota.fecha).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Paciente</p>
                  <p className="font-medium">{selectedNota.pacienteNombre}</p>
                  <p className="font-mono text-xs">
                    {selectedNota.pacienteCurp}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Médico</p>
                  <p className="font-medium">{selectedNota.medicoNombre}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="secondary">{selectedNota.servicio}</Badge>
                    <Badge
                      className={clasificacionTone[selectedNota.clasificacion]}
                    >
                      {selectedNota.clasificacion}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={estadoTone[selectedNota.estado]}
                    >
                      {selectedNota.estado}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Motivo de consulta</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedNota.motivoConsulta}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Impresión diagnóstica</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedNota.impresionDiagnostica}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Plan de manejo</p>
                <p className="font-medium whitespace-pre-wrap">
                  {selectedNota.planManejo}
                </p>
              </div>

              {selectedNota.seguimiento ? (
                <div>
                  <p className="text-muted-foreground">Seguimiento</p>
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedNota.seguimiento}
                  </p>
                </div>
              ) : null}

              {selectedNota.proximaCita ? (
                <div>
                  <p className="text-muted-foreground">Próxima cita</p>
                  <p className="font-medium">
                    {new Date(selectedNota.proximaCita).toLocaleDateString(
                      "es-MX"
                    )}
                  </p>
                </div>
              ) : null}

              <Separator />

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">TA</p>
                  <p className="font-medium">
                    {selectedNota.signosVitales.tensionArterial}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">FC</p>
                  <p className="font-medium">
                    {selectedNota.signosVitales.frecuenciaCardiaca} lpm
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">FR</p>
                  <p className="font-medium">
                    {selectedNota.signosVitales.frecuenciaRespiratoria} rpm
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Temperatura</p>
                  <p className="font-medium">
                    {selectedNota.signosVitales.temperatura} °C
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">SpO2</p>
                  <p className="font-medium">
                    {selectedNota.signosVitales.saturacion || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Glucemia</p>
                  <p className="font-medium">
                    {selectedNota.signosVitales.glucemia || "-"}
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
