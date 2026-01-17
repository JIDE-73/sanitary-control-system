"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MapPin } from "lucide-react";
import type { LugarTrabajo } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LugaresTableProps {
  lugares: LugarTrabajo[];
  loading?: boolean;
}

export function LugaresTable({ lugares, loading = false }: LugaresTableProps) {
  const [selectedLugar, setSelectedLugar] = useState<LugarTrabajo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleView = (lugar: LugarTrabajo) => {
    setSelectedLugar(lugar);
    setDialogOpen(true);
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedLugar(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLugar?.nombre ?? "Lugar de trabajo"}
            </DialogTitle>
            <DialogDescription>
              Información completa del establecimiento seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedLugar ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Código
                </p>
                <p className="font-mono text-base">{selectedLugar.codigo}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Dirección
                </p>
                <p className="text-base">
                  {[selectedLugar.calle, selectedLugar.colonia]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-muted-foreground">
                  CP{" "}
                  {selectedLugar.codigo_postal ||
                    selectedLugar.codigoPostal ||
                    ""}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Ciudad
                  </p>
                  <p>{selectedLugar.ciudad || "Sin dato"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Estado
                  </p>
                  <p>{selectedLugar.estado || "Sin dato"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Zona de trabajo
                  </p>
                  <p>{selectedLugar.colonia || "Sin dato"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Teléfono
                  </p>
                  <p>{selectedLugar.telefono || "No registrado"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona un lugar desde la tabla para ver los detalles.
            </p>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre del Establecimiento</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Ciudad / Estado</TableHead>
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
                  Cargando lugares de trabajo...
                </TableCell>
              </TableRow>
            ) : lugares.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No se encontraron lugares de trabajo
                </TableCell>
              </TableRow>
            ) : (
              lugares.map((lugar) => (
                <TableRow key={lugar.id}>
                  <TableCell className="font-mono font-medium">
                    {lugar.codigo}
                  </TableCell>
                  <TableCell className="font-medium">{lugar.nombre}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {lugar.calle}, {lugar.colonia}{" "}
                        {lugar.codigo_postal || lugar.codigoPostal || ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{lugar.telefono}</TableCell>
                  <TableCell>
                    {lugar.ciudad}, {lugar.estado}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(lugar)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
