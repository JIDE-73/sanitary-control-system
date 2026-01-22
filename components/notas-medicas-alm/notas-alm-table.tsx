"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Download, Eye } from "lucide-react";
import type { NotaMedicaALMRecord } from "@/lib/notas-medicas-alm";

interface NotasMedicasALMTableProps {
  notas: NotaMedicaALMRecord[];
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;
const booleanLabel = (value: boolean) => (value ? "Sí" : "No");
const LOGO_PATH = "/Logo_XXVAyto_Horizontal.png";
let logoDataUrlCache: string | null = null;

const loadLogoDataUrl = async () => {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const response = await fetch(LOGO_PATH);
    const blob = await response.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error("No se pudo leer el logo"));
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    logoDataUrlCache = dataUrl;
    return dataUrl;
  } catch (error) {
    console.warn("No se pudo cargar el logo para PDF", error);
    return null;
  }
};

const formatDateTime = (value?: string, withTime?: boolean) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return withTime
    ? date.toLocaleString("es-MX")
    : date.toLocaleDateString("es-MX");
};

export function NotasMedicasALMTable({
  notas,
  loading,
}: NotasMedicasALMTableProps) {
  const [selectedNota, setSelectedNota] = useState<NotaMedicaALMRecord | null>(
    null
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const sortedNotas = useMemo(
    () =>
      [...notas].sort(
        (a, b) =>
          new Date(b.fecha_expedicion).getTime() -
          new Date(a.fecha_expedicion).getTime()
      ),
    [notas]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(sortedNotas.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedNotas = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return sortedNotas.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedNotas, page]);

  const showingStart = sortedNotas.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    sortedNotas.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, sortedNotas.length);

  const handleDownloadPdf = async (nota: NotaMedicaALMRecord) => {
    setDownloadingId(nota.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 12;
      const marginRight = pageWidth - marginX;
      const centerX = pageWidth / 2;
      const logoDataUrl = await loadLogoDataUrl();
      const baseFont = "helvetica";
      const now = nota.fecha_expedicion
        ? new Date(nota.fecha_expedicion)
        : new Date();
      const day = `${now.getDate()}`.padStart(2, "0");
      const month = now
        .toLocaleString("es-MX", { month: "long" })
        .toUpperCase();
      const year = `${now.getFullYear()}`;
      const hours = `${now.getHours()}`.padStart(2, "0");
      const minutes = `${now.getMinutes()}`.padStart(2, "0");
      const folio = nota.id || "-";
      const safe = (value?: string | number | null) =>
        value === undefined || value === null || `${value}`.trim() === ""
          ? "-"
          : `${value}`;
      const personaNombreCompleto = nota.Persona
        ? [
            nota.Persona.nombre,
            nota.Persona.apellido_paterno,
            nota.Persona.apellido_materno,
          ]
            .filter(Boolean)
            .join(" ")
        : "";
      const personaEdad =
        nota.edad && nota.edad !== "0"
          ? nota.edad
          : (() => {
              const birth = nota.Persona?.fecha_nacimiento
                ? new Date(nota.Persona.fecha_nacimiento)
                : null;
              if (!birth || Number.isNaN(birth.getTime())) return "-";
              const diff = Date.now() - birth.getTime();
              const ageDate = new Date(diff);
              return `${Math.abs(ageDate.getUTCFullYear() - 1970)}`;
            })();
      const personaGenero = nota.Persona?.genero ?? "NO REFERIDO";
      const personaDireccion = nota.Persona?.direccion ?? "-";
      const personaCurp = nota.Persona?.curp ?? "-";

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, 12, 60, 20);
      }

      doc.setFontSize(10);
      doc.setFont(baseFont, "bold");
      doc.text(
        "Dirección Municipal de Prevención\nControl y Sanidad",
        centerX,
        18,
        { align: "center" }
      );
      doc.setFont(baseFont, "normal");
      doc.text("Departamento de Apoyo\n a Seguridad Pública", marginRight, 18, {
        align: "right",
      });

      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      doc.line(marginX, 36, marginRight, 36);

      doc.setFontSize(12);
      doc.setFont(baseFont, "bold");
      doc.text("HOJA DE NOTAS MÉDICAS", centerX, 42, { align: "center" });

      doc.setLineWidth(0.3);
      doc.line(marginX, 44, marginRight, 44);

      // Folio
      doc.setFontSize(10);
      doc.setFont(baseFont, "bold");
      doc.text("Folio", marginRight - 80, 50, { align: "left" });
      doc.setFont(baseFont, "normal");
      doc.text(folio, marginRight - 30, 50, { align: "center" });

      let cursorY = 58;
      doc.setFontSize(9);

      const drawLabeledRow = (label: string, value: string, y: number) => {
        doc.setFont(baseFont, "bold");
        doc.text(label, marginX, y);
        doc.setFont(baseFont, "normal");
        doc.text(value, marginX + 60, y);
      };

      drawLabeledRow(
        "En Tijuana B.C. a las",
        `${hours} hrs. con ${minutes} minutos del día ${day} del mes de ${month} del año ${year}`,
        cursorY
      );
      cursorY += 8;

      drawLabeledRow(
        "El suscrito Médico Perito Dr.",
        safe(nota.nombre_oficial),
        cursorY
      );
      cursorY += 6;
      drawLabeledRow("Cédula Profesional No.", safe(nota.cedula), cursorY);
      cursorY += 6;
      drawLabeledRow(
        "Examinó a quien dijo llamarse",
        personaNombreCompleto || "- (sin nombre en registro ALM)",
        cursorY
      );
      cursorY += 6;
      drawLabeledRow("CURP", safe(personaCurp), cursorY);
      cursorY += 6;
      drawLabeledRow("Sexo", `${personaGenero}   Edad ${personaEdad}`, cursorY);
      cursorY += 6;
      drawLabeledRow("Domicilio", safe(personaDireccion), cursorY);
      cursorY += 6;
      drawLabeledRow(
        "Que se identifica con",
        safe(nota.se_identifica),
        cursorY
      );
      cursorY += 10;

      // Tabla clínica SI/NO
      doc.setFont(baseFont, "bold");
      doc.text(
        "CLINICAMENTE OBTENIENDO LOS SIGUIENTES RESULTADOS",
        marginX,
        cursorY
      );
      cursorY += 4;

      const tableRows = [
        { label: "CONSCIENTE", value: nota.conciente },
        {
          label: "ORIENTACION ALOPSIQUICA",
          value: nota.orientacion_alopsiquica,
        },
        { label: "CONTROL DE ESFINTERES", value: nota.control_esfinteres },
        { label: "ALIENTO ALCOHOLICO", value: nota.aliento_alcoholico },
        { label: "LESIONES VISIBLES", value: nota.lesiones_visibles },
      ];

      const tableX = marginX;
      const tableWidth = marginRight - marginX;
      const labelWidth = tableWidth * 0.6;
      const yesWidth = (tableWidth - labelWidth) / 2;
      const rowHeight = 8;

      doc.rect(tableX, cursorY, tableWidth, rowHeight);
      doc.rect(tableX + labelWidth, cursorY, yesWidth, rowHeight);
      doc.rect(tableX + labelWidth + yesWidth, cursorY, yesWidth, rowHeight);
      doc.setFont(baseFont, "bold");
      doc.text("RESULTADO", tableX + 2, cursorY + 5);
      doc.text("SI", tableX + labelWidth + yesWidth / 2, cursorY + 5, {
        align: "center",
      });
      doc.text(
        "NO",
        tableX + labelWidth + yesWidth + yesWidth / 2,
        cursorY + 5,
        {
          align: "center",
        }
      );

      tableRows.forEach((row, idx) => {
        const y = cursorY + rowHeight * (idx + 1);
        doc.rect(tableX, y, tableWidth, rowHeight);
        doc.rect(tableX + labelWidth, y, yesWidth, rowHeight);
        doc.rect(tableX + labelWidth + yesWidth, y, yesWidth, rowHeight);
        doc.setFont(baseFont, "normal");
        doc.text(row.label, tableX + 2, y + 5);
        const markYes = row.value ? "X" : "";
        const markNo = row.value ? "" : "X";
        doc.text(markYes, tableX + labelWidth + yesWidth / 2, y + 5, {
          align: "center",
        });
        doc.text(markNo, tableX + labelWidth + yesWidth + yesWidth / 2, y + 5, {
          align: "center",
        });
      });

      cursorY += rowHeight * (tableRows.length + 1) + 6;

      const addParagraph = (title: string, text: string) => {
        doc.setFont(baseFont, "bold");
        doc.text(title, marginX, cursorY);
        cursorY += 5;
        doc.setFont(baseFont, "normal");
        const lines = doc.splitTextToSize(
          text && text.trim() ? text : "-",
          tableWidth
        );
        doc.text(lines, marginX, cursorY);
        cursorY += lines.length * 5 + 6;
      };

      addParagraph("Adicciones referidas", safe(nota.adicciones_referidas));
      addParagraph(
        "Descripción de lesiones Agudas/Hallazgos Médicos",
        safe(nota.descripcion_lesiones_hallazgos)
      );
      addParagraph("Recomendación médica", safe(nota.recomendacion_medico));
      addParagraph("Nombre del Oficial", safe(nota.nombre_oficial));
      addParagraph("Dependencia", safe(nota.dependencia));

      doc.setFont(baseFont, "bold");
      doc.text(
        `Oficial No: ${safe(nota.noOficial)}    No de Unidad: ${safe(
          nota.noUnidad
        )}`,
        marginX,
        cursorY
      );
      cursorY += 18;

      const lineWidth = 60;
      const leftLineX = marginX + 10;
      const rightLineX = marginRight - lineWidth - 10;
      doc.line(leftLineX, cursorY, leftLineX + lineWidth, cursorY);
      doc.line(rightLineX, cursorY, rightLineX + lineWidth, cursorY);
      doc.setFont(baseFont, "normal");
      doc.text("Sello y Firma", leftLineX + lineWidth / 2, cursorY + 6, {
        align: "center",
      });
      doc.text("Firma oficial", rightLineX + lineWidth / 2, cursorY + 6, {
        align: "center",
      });

      doc.save(`nota-medica-alm-${nota.id}.pdf`);
    } catch (error) {
      console.error("No se pudo generar el PDF de la nota ALM", error);
    } finally {
      setDownloadingId(null);
    }
  };

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
              paginatedNotas.map((nota) => (
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
                      onClick={() => void handleDownloadPdf(nota)}
                      title="Descargar PDF"
                      disabled={downloadingId === nota.id}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Mostrando {showingStart}-{showingEnd} de {sortedNotas.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0 || sortedNotas.length === 0}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">
              Página {sortedNotas.length === 0 ? 0 : page + 1} de{" "}
              {sortedNotas.length === 0 ? 0 : totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
              }
              disabled={sortedNotas.length === 0 || page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
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
            <Button
              onClick={() =>
                selectedNota ? void handleDownloadPdf(selectedNota) : null
              }
              disabled={!selectedNota || downloadingId === selectedNota?.id}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
            <Button variant="outline" onClick={() => setSelectedNota(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
