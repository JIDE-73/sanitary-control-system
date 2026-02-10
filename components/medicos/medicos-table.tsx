"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Edit,
  IdCard,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2,
  Download,
} from "lucide-react";
import type { Medico } from "@/lib/types";
import { request } from "@/lib/request";

interface MedicosTableProps {
  medicos: Medico[];
  loading?: boolean;
}

const estatusVariants = {
  activo: "default",
  inactivo: "secondary",
  suspendido: "destructive",
} as const;

const ITEMS_PER_PAGE = 10;

interface StatisticsResponse {
  message: string;
  stats: Record<string, number>;
}

function StatisticsModal({ medicoId, medicoNombre }: { medicoId: string; medicoNombre: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const loadStatistics = async () => {
    if (!open) return;
    setLoading(true);
    setError(null);
    try {
      const response = await request(
        `/sics/statistics/getStatisticsByMedic/${medicoId}`,
        "GET"
      );
      if (response.status >= 200 && response.status < 300) {
        setStatistics(response);
      } else {
        setError(response.message || "No se pudo cargar la productividad");
      }
    } catch (err) {
      console.error("Error al cargar productividad", err);
      setError("No se pudo cargar la productividad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadStatistics();
    } else {
      setStatistics(null);
      setError(null);
    }
  }, [open, medicoId]);

  const formatMonth = (key: string) => {
    // Formato esperado: "2026-1" -> "Enero 2026"
    const [year, month] = key.split("-");
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex] || month} ${year}`;
  };

  const sortedStats = useMemo(() => {
    if (!statistics?.stats) return [];
    return Object.entries(statistics.stats).sort(([a], [b]) => {
      const [yearA, monthA] = a.split("-").map(Number);
      const [yearB, monthB] = b.split("-").map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
  }, [statistics]);

  const totalCertificados = useMemo(() => {
    if (!statistics?.stats) return 0;
    return Object.values(statistics.stats).reduce((sum, count) => sum + count, 0);
  }, [statistics]);

  const handleDownloadPdf = async () => {
    if (!statistics?.stats || sortedStats.length === 0) return;

    try {
      setDownloading(true);
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 48;

      // Título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Productividad de certificados por médico", pageWidth / 2, margin, {
        align: "center",
      });

      // Nombre del médico
      doc.setFontSize(14);
      doc.text(`Dr(a). ${medicoNombre}`, pageWidth / 2, margin + 28, {
        align: "center",
      });

      // Resumen total
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total de certificados emitidos: ${totalCertificados}`,
        margin,
        margin + 60
      );

      // Área de gráfica
      const chartTop = margin + 90;
      const chartHeight = 260;
      const chartLeft = margin;
      const chartRight = pageWidth - margin;
      const chartWidth = chartRight - chartLeft;

      const values = sortedStats.map(([, value]) => value as number);
      const maxValue = Math.max(...values, 1);

      // Ejes
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(1);
      // Eje Y
      doc.line(chartLeft, chartTop, chartLeft, chartTop + chartHeight);
      // Eje X
      doc.line(chartLeft, chartTop + chartHeight, chartRight, chartTop + chartHeight);

      // Líneas de guía horizontales y etiquetas de escala
      doc.setFontSize(8);
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const ratio = i / gridLines;
        const y = chartTop + chartHeight - chartHeight * ratio;
        const value = Math.round(maxValue * ratio);

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(chartLeft, y, chartRight, y);

        doc.setTextColor(80, 80, 80);
        doc.text(String(value), chartLeft - 10, y + 3, { align: "right" });
      }

      // Barras
      const barCount = sortedStats.length;
      const barSpacing = chartWidth / Math.max(barCount, 1);
      const barWidth = Math.max(16, barSpacing * 0.5);

      const monthShortNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      sortedStats.forEach(([key, value], index) => {
        const v = value as number;
        const barHeight = (v / maxValue) * chartHeight;
        const centerX = chartLeft + barSpacing * index + barSpacing / 2;
        const x = centerX - barWidth / 2;
        const y = chartTop + chartHeight - barHeight;

        // Barra
        doc.setFillColor(117, 13, 47);
        doc.setDrawColor(117, 13, 47);
        doc.rect(x, y, barWidth, barHeight, "FD");

        // Etiqueta de valor sobre la barra
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text(String(v), centerX, y - 4, { align: "center" });

        // Etiqueta de mes debajo
        const [yearStr, monthStr] = key.split("-");
        const monthIndex = Number(monthStr) - 1;
        const yearShort = yearStr?.slice(-2) ?? "";
        const monthLabel = `${
          monthShortNames[monthIndex] || monthStr || ""
        } ${yearShort}`;

        doc.text(
          monthLabel,
          centerX,
          chartTop + chartHeight + 14,
          { align: "center" }
        );
      });

      // Leyenda simple
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Barras: certificados emitidos por mes",
        margin,
        chartTop + chartHeight + 40
      );

      doc.save(
        `estadisticas-medico-${medicoNombre.replace(/\s+/g, "-")}.pdf`
      );
    } catch (err) {
      console.error("Error al generar el PDF de estadísticas", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Ver productividad"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Productividad de Certificados
          </DialogTitle>
          <DialogDescription>
            Dr(a). {medicoNombre}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando productividad...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <XCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : statistics ? (
            <>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total de certificados
                  </span>
                  <span className="text-2xl font-bold">{totalCertificados}</span>
                </div>
              </div>
              {sortedStats.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Certificados por mes
                  </h4>
                  <div className="rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead className="text-right">Certificados</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedStats.map(([key, count]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {formatMonth(key)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay datos de productividad disponibles para este período
                </p>
              )}
              {sortedStats.length > 0 && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {downloading ? "Generando PDF..." : "Descargar PDF"}
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MedicosTable({ medicos, loading = false }: MedicosTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(medicos.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedMedicos = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return medicos.slice(start, start + ITEMS_PER_PAGE);
  }, [medicos, page]);

  const showingStart = medicos.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    medicos.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, medicos.length);

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cédula Profesional</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Firma Digital</TableHead>
            <TableHead>Estatus</TableHead>
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
                Cargando médicos...
              </TableCell>
            </TableRow>
          ) : medicos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron médicos
              </TableCell>
            </TableRow>
          ) : (
            paginatedMedicos.map((medico) => (
              <TableRow key={medico.id}>
                <TableCell className="font-mono">
                  {medico.cedulaProfesional}
                </TableCell>
                <TableCell className="font-medium">
                  Dr(a). {medico.nombres} {medico.apellidoPaterno}{" "}
                  {medico.apellidoMaterno}
                </TableCell>
                <TableCell>{medico.especialidad}</TableCell>
                <TableCell>{medico.telefono}</TableCell>
                <TableCell className="text-sm">{medico.email}</TableCell>
                <TableCell>
                  {medico.firmaDigitalUrl ? (
                    <Badge
                      variant="outline"
                      className="gap-1 bg-accent/10 text-accent border-accent/30"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Cargada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 text-destructive border-destructive/30"
                    >
                      <XCircle className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={estatusVariants[medico.estatus] ?? "secondary"}
                  >
                    {medico.estatus.charAt(0).toUpperCase() +
                      medico.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <StatisticsModal
                      medicoId={medico.id}
                      medicoNombre={`${medico.nombres} ${medico.apellidoPaterno} ${medico.apellidoMaterno}`}
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Dr(a). {medico.nombres} {medico.apellidoPaterno}{" "}
                            {medico.apellidoMaterno}
                          </DialogTitle>
                          <DialogDescription>
                            Información del médico (solo lectura)
                          </DialogDescription>
                        </DialogHeader>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Cédula profesional
                            </dt>
                            <dd className="font-medium">
                              {medico.cedulaProfesional}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Especialidad
                            </dt>
                            <dd className="font-medium">
                              {medico.especialidad}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono
                            </dt>
                            <dd className="font-medium">{medico.telefono}</dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Email
                            </dt>
                            <dd className="font-medium break-all">
                              {medico.email}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estatus
                            </dt>
                            <dd>
                              <Badge
                                variant={
                                  estatusVariants[medico.estatus] ?? "secondary"
                                }
                              >
                                {medico.estatus.charAt(0).toUpperCase() +
                                  medico.estatus.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Firma digital
                            </dt>
                            <dd>
                              {medico.firmaDigitalUrl ? (
                                <Badge
                                  variant="outline"
                                  className="gap-1 bg-accent/10 text-accent border-accent/30"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Cargada
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-destructive border-destructive/30"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Pendiente
                                </Badge>
                              )}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              CURP
                            </dt>
                            <dd className="font-medium">
                              {medico.curp || "No especificado"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Habilitado para firmar
                            </dt>
                            <dd className="font-medium">
                              {medico.habilitado_para_firmar === true
                                ? "Sí"
                                : medico.habilitado_para_firmar === false
                                ? "No"
                                : "No especificado"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de registro
                            </dt>
                            <dd className="font-medium">
                              {medico.fechaRegistro || "No disponible"}
                            </dd>
                          </div>
                        </dl>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/medicos/${medico.id}/editar`)
                      }
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Mostrando {showingStart}-{showingEnd} de {medicos.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0 || medicos.length === 0}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {medicos.length === 0 ? 0 : page + 1} de{" "}
            {medicos.length === 0 ? 0 : totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
            }
            disabled={medicos.length === 0 || page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
