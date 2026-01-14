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
import { Download, Eye } from "lucide-react";
import type { NotaMedicaALMRecord } from "@/lib/notas-medicas-alm";

interface NotasMedicasALMTableProps {
  notas: NotaMedicaALMRecord[];
  loading?: boolean;
}

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

  const sortedNotas = useMemo(
    () =>
      [...notas].sort(
        (a, b) =>
          new Date(b.fecha_expedicion).getTime() -
          new Date(a.fecha_expedicion).getTime()
      ),
    [notas]
  );

  const handleDownloadPdf = async (nota: NotaMedicaALMRecord) => {
    setDownloadingId(nota.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 14;
      const marginRight = pageWidth - marginX;
      const centerX = pageWidth / 2;
      const logoDataUrl = await loadLogoDataUrl();
      const baseFont = "helvetica";

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, 12, 60, 20);
      }

      doc.setFontSize(10);
      doc.setFont(baseFont, "bold");
      doc.text(
        "Dirección Municipal de Prevención, Control y Sanidad",
        centerX,
        18,
        { align: "center" }
      );
      doc.setFont(baseFont, "normal");
      doc.text("Departamento de Apoyo a Seguridad Pública", marginRight, 18, {
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

      let cursorY = 54;
      doc.setFontSize(10);

      const addField = (label: string, value: string) => {
        doc.setFont(baseFont, "bold");
        doc.text(label, marginX, cursorY);
        doc.setFont(baseFont, "normal");
        doc.text(value || "-", marginX + 55, cursorY);
        cursorY += 6;
      };

      const addBooleanField = (label: string, value: boolean) => {
        addField(label, booleanLabel(value));
      };

      const addParagraph = (title: string, text: string) => {
        doc.setFont(baseFont, "bold");
        doc.text(title, marginX, cursorY);
        cursorY += 5;
        doc.setFont(baseFont, "normal");
        const lines = doc.splitTextToSize(
          text && text.trim() ? text : "-",
          marginRight - marginX
        );
        doc.text(lines, marginX, cursorY);
        cursorY += lines.length * 5 + 3;
      };

      addField("ID de nota", nota.id);
      addField(
        "Fecha de expedición",
        formatDateTime(nota.fecha_expedicion, true)
      );
      addField("Médico oficial", nota.nombre_oficial || "-");
      addField("Dependencia", nota.dependencia || "-");
      addField("No. oficial", `${nota.noOficial ?? "-"}`);
      addField("No. unidad", `${nota.noUnidad ?? "-"}`);
      addField("Cédula profesional", nota.cedula || "-");
      addField("Edad", nota.edad ? `${nota.edad} años` : "-");
      addField("Se identifica con", nota.se_identifica || "-");

      cursorY += 2;
      addBooleanField("Consciente", nota.conciente);
      addBooleanField("Orientación alopsíquica", nota.orientacion_alopsiquica);
      addBooleanField("Control de esfínteres", nota.control_esfinteres);
      addBooleanField("Aliento alcohólico", nota.aliento_alcoholico);
      addBooleanField("Lesiones visibles", nota.lesiones_visibles);

      cursorY += 2;
      addParagraph("Adicciones referidas", nota.adicciones_referidas || "-");
      addParagraph(
        "Descripción de lesiones / hallazgos",
        nota.descripcion_lesiones_hallazgos || "-"
      );
      addParagraph("Recomendación médica", nota.recomendacion_medico || "-");

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
