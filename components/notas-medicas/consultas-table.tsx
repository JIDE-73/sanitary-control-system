"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { request } from "@/lib/request";

export type NotaMedica = {
  id: string;
  persona_id: string;
  medico_id: string | null;
  diagnostico: string;
  tratamiento: string;
  comentario?: string;
  consulta_fecha: string;
  FC?: string | null;
  TA?: string | null;
  FR?: string | null;
  Peso?: string | null;
  Temperatura?: string | null;
  cabeza?: string | null;
  cuello?: string | null;
  torax?: string | null;
  abdomen?: string | null;
  miembros?: string | null;
  genitales?: string | null;
  persona?: {
    id?: string;
    curp?: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
  } | null;
  medico?: {
    id?: string;
    persona_id?: string;
    persona?: {
      nombre?: string;
      apellido_paterno?: string;
      apellido_materno?: string;
    } | null;
  } | null;
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

const ITEMS_PER_PAGE = 10;
const emptyValue = (value?: string | null) => (value ? value : "-");

export function NotasMedicasTable({
  notas,
  afiliados,
  medicos,
  loading,
}: NotasMedicasTableProps) {
  const [selectedNota, setSelectedNota] = useState<NotaMedica | null>(null);
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(notas.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedNotas = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return notas.slice(start, start + ITEMS_PER_PAGE);
  }, [notas, page]);

  const showingStart = notas.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    notas.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, notas.length);

  const getAfiliado = (id: string) => afiliados.find((a) => a.id === id);
  const getMedico = (id?: string | null) =>
    id ? medicos.find((m) => m.id === id) : undefined;

  const afiliadoSeleccionado = useMemo(
    () => (selectedNota ? getAfiliado(selectedNota.persona_id) : undefined),
    [selectedNota, afiliados]
  );

  const medicoSeleccionado = useMemo(
    () => (selectedNota ? getMedico(selectedNota.medico_id) : undefined),
    [selectedNota, medicos]
  );

  const afiliadoNombreFromNota = useMemo(() => {
    const persona = selectedNota?.persona;
    if (!persona) return "";
    return [persona.nombre, persona.apellido_paterno, persona.apellido_materno]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [selectedNota]);

  const medicoNombreFromNota = useMemo(() => {
    const persona = selectedNota?.medico?.persona;
    if (!persona) return "";
    return [persona.nombre, persona.apellido_paterno, persona.apellido_materno]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [selectedNota]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allPageSelected =
    paginatedNotas.length > 0 &&
    paginatedNotas.every((nota) => selectedIds.includes(nota.id));

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      const pageIds = paginatedNotas.map((n) => n.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedNotas.map((n) => n.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectedNotasDetalladas = useMemo(() => {
    if (!selectedIds.length) return [];
    return selectedIds
      .map((id) => notas.find((n) => n.id === id))
      .filter(Boolean)
      .map((nota) => {
        const afiliado = nota ? getAfiliado(nota.persona_id) : undefined;
        const medico = nota ? getMedico(nota.medico_id) : undefined;
        return { nota: nota as NotaMedica, afiliado, medico };
      });
  }, [selectedIds, notas, afiliados, medicos]);

  const handleExportSelected = async () => {
    if (!selectedNotasDetalladas.length) return;

    try {
      setDownloading(true);
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      selectedNotasDetalladas.forEach(({ nota, afiliado, medico }, index) => {
        if (index > 0) {
          doc.addPage();
        }

        const margin = 48;
        let y = margin;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Nota médica", margin, y);

        y += 24;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        const fechaTexto = nota.consulta_fecha
          ? new Date(nota.consulta_fecha).toLocaleDateString("es-MX")
          : "-";

        doc.text(`Fecha: ${fechaTexto}`, margin, y);
        y += 16;

        doc.text(
          `Afiliado: ${afiliado?.nombre ?? "No disponible"}`,
          margin,
          y
        );
        y += 14;

        if (afiliado?.curp) {
          doc.text(`CURP: ${afiliado.curp}`, margin, y);
          y += 14;
        }

        if (afiliado?.numeroAfiliacion) {
          doc.text(
            `Número de afiliación: ${afiliado.numeroAfiliacion}`,
            margin,
            y
          );
          y += 14;
        }

        const nombreMedico = medico
          ? `Dr(a). ${medico.nombre}`
          : "No disponible";
        doc.text(`Médico: ${nombreMedico}`, margin, y);
        y += 24;

        const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

        doc.setFont("helvetica", "bold");
        doc.text("Diagnóstico", margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        const diagnosticoLines = doc.splitTextToSize(
          nota.diagnostico || "-",
          maxWidth
        );
        doc.text(diagnosticoLines, margin, y);
        y += diagnosticoLines.length * 12 + 16;

        doc.setFont("helvetica", "bold");
        doc.text("Tratamiento", margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        const tratamientoLines = doc.splitTextToSize(
          nota.tratamiento || "-",
          maxWidth
        );
        doc.text(tratamientoLines, margin, y);
        y += tratamientoLines.length * 12 + 16;

        doc.setFont("helvetica", "bold");
        doc.text("Comentario", margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        const comentarioLines = doc.splitTextToSize(
          nota.comentario || "-",
          maxWidth
        );
        doc.text(comentarioLines, margin, y);
      });

      doc.save("notas-medicas-seleccionadas.pdf");
      
      // Registrar la generación del reporte
      try {
        await request("/sics/reports/createCountReport", "POST", {
          total: 1,
          nombre_reporte: "Notas Médicas Seleccionadas",
        });
      } catch (reportError) {
        console.warn("No se pudo registrar el reporte", reportError);
      }
    } catch (error) {
      console.error("Error al exportar notas médicas a PDF", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2 text-sm">
        <p className="text-muted-foreground">
          Seleccionadas: {selectedIds.length}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportSelected}
          disabled={!selectedNotasDetalladas.length || downloading}
        >
          <FileText className="mr-2 h-4 w-4" />
          {downloading ? "Generando PDF..." : "Exportar seleccionadas a PDF"}
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  aria-label="Seleccionar todas las notas de la página"
                  checked={allPageSelected}
                  onCheckedChange={toggleSelectAllPage}
                />
              </TableHead>
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
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  Cargando notas médicas...
                </TableCell>
              </TableRow>
            ) : notas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  No se encontraron notas médicas
                </TableCell>
              </TableRow>
            ) : (
              paginatedNotas.map((nota) => {
                const afiliado = getAfiliado(nota.persona_id);
                const medico = getMedico(nota.medico_id);
                return (
                  <TableRow key={nota.id}>
                    <TableCell>
                      <Checkbox
                        aria-label="Seleccionar nota médica"
                        checked={selectedIds.includes(nota.id)}
                        onCheckedChange={() => toggleSelect(nota.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {nota.consulta_fecha
                        ? new Date(nota.consulta_fecha).toLocaleDateString(
                            "es-MX"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {afiliado?.nombre}
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Mostrando {showingStart}-{showingEnd} de {notas.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0 || notas.length === 0}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">
              Página {notas.length === 0 ? 0 : page + 1} de{" "}
              {notas.length === 0 ? 0 : totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
              }
              disabled={notas.length === 0 || page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

    </>
  );
}
