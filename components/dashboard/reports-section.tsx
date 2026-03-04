"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { FileDown } from "lucide-react";

import { request } from "@/lib/request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusKey =
  | "VIGENTE"
  | "PENDIENTE_RENOVACION"
  | "SUSPENSION_TEMPORAL"
  | "CANCELACION_TEMPORAL"
  | "CANCELACION_DEFINITIVA";

const reportColors = {
  certificados: "#2563eb",
  reportes: "#16a34a",
  laboratorios: "#ea580c",
  afiliados: "#7c3aed",
};

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const statusColorMap: Record<StatusKey, string> = {
  VIGENTE: "#16a34a",
  PENDIENTE_RENOVACION: "#eab308",
  SUSPENSION_TEMPORAL: "#ea580c",
  CANCELACION_TEMPORAL: "#3b82f6",
  CANCELACION_DEFINITIVA: "#dc2626",
};

const statusLabels: Record<StatusKey, string> = {
  VIGENTE: "Vigente",
  PENDIENTE_RENOVACION: "Pendiente de renovacion",
  SUSPENSION_TEMPORAL: "Suspension temporal",
  CANCELACION_TEMPORAL: "Cancelacion temporal",
  CANCELACION_DEFINITIVA: "Cancelacion definitiva",
};

interface ReportsState {
  certificadosSanitarios: number;
  getCountReport: number;
  laboratoryResults: number;
  laboratoryResultsByLab: Array<{
    id: string;
    nombre_comercial: string;
    resultados: number;
  }>;
  afiliadosByStatus: Record<StatusKey, number>;
  affiliatePerMonthTotal: number;
  affiliatePerMonthMonth: number | null;
  affiliatePerMonthYear: number | null;
  affiliatePerBar: Array<{
    id: string;
    nombre: string;
    total: number;
  }>;
}

const initialState: ReportsState = {
  certificadosSanitarios: 0,
  getCountReport: 0,
  laboratoryResults: 0,
  laboratoryResultsByLab: [],
  afiliadosByStatus: {
    VIGENTE: 0,
    PENDIENTE_RENOVACION: 0,
    SUSPENSION_TEMPORAL: 0,
    CANCELACION_TEMPORAL: 0,
    CANCELACION_DEFINITIVA: 0,
  },
  affiliatePerMonthTotal: 0,
  affiliatePerMonthMonth: null,
  affiliatePerMonthYear: null,
  affiliatePerBar: [],
};

function toSafeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace("#", "");
  const normalized = sanitized.length === 3
    ? sanitized.split("").map((char) => `${char}${char}`).join("")
    : sanitized;

  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) return [0, 0, 0];

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return [r, g, b];
}

function addColorLegendRow(doc: jsPDF, label: string, color: string, y: number) {
  const [r, g, b] = hexToRgb(color);
  doc.setFillColor(r, g, b);
  doc.rect(20, y - 4, 6, 6, "F");
  doc.setTextColor(33, 33, 33);
  doc.text(label, 30, y);
}

function extractLaboratoryResultsByLab(response: unknown) {
  if (typeof response !== "object" || response === null) return [];
  const raw = Array.isArray((response as { results?: unknown[] }).results)
    ? (response as { results: unknown[] }).results
    : [];

  return raw
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const value = item as {
        id?: unknown;
        nombre_comercial?: unknown;
        _count?: { resultados?: unknown };
      };
      const id = typeof value.id === "string" ? value.id : "";
      const nombreComercial =
        typeof value.nombre_comercial === "string" ? value.nombre_comercial : "Sin nombre";
      const resultados = toSafeCount(value._count?.resultados);
      if (!id) return null;
      return { id, nombre_comercial: nombreComercial, resultados };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        nombre_comercial: string;
        resultados: number;
      } => item !== null,
    );
}

export function ReportsSection() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [reports, setReports] = useState<ReportsState>(initialState);
  const [loading, setLoading] = useState(true);
  const [affiliatePerMonthLoading, setAffiliatePerMonthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          certificadosResponse,
          countReportResponse,
          afiliadosStatusResponse,
          laboratoryResultsResponse,
          laboratoryResultsByLabResponse,
          affiliatePerBarResponse,
        ] = await Promise.all([
          request("/sics/reports/certificadosSanitarios", "GET"),
          request("/sics/reports/getCountReport", "GET"),
          request("/sics/reports/getAfiliadosCountByStatus", "GET"),
          request("/sics/reports/laboratoryResults", "GET"),
          request("/sics/laboratories/laboratoryResults", "GET"),
          request("/sics/reports/affiliatePerBar", "GET"),
        ]);

        setReports({
          certificadosSanitarios: toSafeCount(certificadosResponse?.count),
          getCountReport: toSafeCount(countReportResponse?.count),
          laboratoryResults: toSafeCount(laboratoryResultsResponse?.count),
          laboratoryResultsByLab: extractLaboratoryResultsByLab(laboratoryResultsByLabResponse),
          afiliadosByStatus: {
            VIGENTE: toSafeCount(afiliadosStatusResponse?.VIGENTE),
            PENDIENTE_RENOVACION: toSafeCount(afiliadosStatusResponse?.PENDIENTE_RENOVACION),
            SUSPENSION_TEMPORAL: toSafeCount(afiliadosStatusResponse?.SUSPENSION_TEMPORAL),
            CANCELACION_TEMPORAL: toSafeCount(afiliadosStatusResponse?.CANCELACION_TEMPORAL),
            CANCELACION_DEFINITIVA: toSafeCount(afiliadosStatusResponse?.CANCELACION_DEFINITIVA),
          },
          affiliatePerMonthTotal: 0,
          affiliatePerMonthMonth: selectedMonth,
          affiliatePerMonthYear: selectedYear,
          affiliatePerBar:
            Array.isArray(affiliatePerBarResponse?.result)
              ? affiliatePerBarResponse.result
                  .map((item: unknown) => {
                    if (typeof item !== "object" || item === null) return null;
                    const value = item as {
                      id?: unknown;
                      nombre?: unknown;
                      total?: unknown;
                    };
                    const id = typeof value.id === "string" ? value.id : "";
                    const nombre =
                      typeof value.nombre === "string"
                        ? value.nombre
                        : "Sin nombre";
                    const total = toSafeCount(value.total);
                    if (!id) return null;
                    return { id, nombre, total };
                  })
                  .filter(
                    (
                      item: {
                        id: string;
                        nombre: string;
                        total: number;
                      } | null,
                    ): item is {
                      id: string;
                      nombre: string;
                      total: number;
                    } => item !== null,
                  )
              : [],
        });
      } catch (err) {
        console.error("Error al cargar reportes:", err);
        setError("No se pudieron cargar los reportes.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    const loadAffiliatePerMonth = async () => {
      try {
        setAffiliatePerMonthLoading(true);

        const affiliatePerMonthResponse = await request(
          `/sics/reports/affiliatePerMonth?month=${selectedMonth}&year=${selectedYear}`,
          "GET",
        );

        setReports((prev) => ({
          ...prev,
          affiliatePerMonthTotal: toSafeCount(affiliatePerMonthResponse?.total),
          affiliatePerMonthMonth:
            typeof affiliatePerMonthResponse?.month === "number"
              ? affiliatePerMonthResponse.month
              : Number.isFinite(Number(affiliatePerMonthResponse?.month))
              ? Number(affiliatePerMonthResponse?.month)
              : selectedMonth,
          affiliatePerMonthYear:
            typeof affiliatePerMonthResponse?.year === "number"
              ? affiliatePerMonthResponse.year
              : Number.isFinite(Number(affiliatePerMonthResponse?.year))
              ? Number(affiliatePerMonthResponse?.year)
              : selectedYear,
        }));
      } catch (err) {
        console.error("Error al cargar afiliados por mes:", err);
        setReports((prev) => ({
          ...prev,
          affiliatePerMonthTotal: 0,
          affiliatePerMonthMonth: selectedMonth,
          affiliatePerMonthYear: selectedYear,
        }));
      } finally {
        setAffiliatePerMonthLoading(false);
      }
    };

    loadAffiliatePerMonth();
  }, [selectedMonth, selectedYear]);

  const afiliadosStatusData = useMemo(
    () =>
      (Object.keys(statusLabels) as StatusKey[]).map((status) => ({
        name: statusLabels[status],
        value: reports.afiliadosByStatus[status],
        fill: statusColorMap[status],
      })),
    [reports.afiliadosByStatus],
  );

  const createCountReport = async (total: number, nombreReporte: string) => {
    try {
      await request("/sics/reports/createCountReport", "POST", {
        total,
        nombre_reporte: nombreReporte,
      });
    } catch (err) {
      console.error("No se pudo registrar el reporte generado:", err);
    }
  };

  const laboratoryResultsByLabChartData = useMemo(
    () =>
      reports.laboratoryResultsByLab.map((item) => ({
        name: item.nombre_comercial,
        value: item.resultados,
      })),
    [reports.laboratoryResultsByLab],
  );

  const affiliatePerBarChartData = useMemo(
    () =>
      reports.affiliatePerBar.map(
        (item: { id: string; nombre: string; total: number }) => ({
          name: item.nombre,
          value: item.total,
        }),
      ),
    [reports.affiliatePerBar],
  );

  const affiliatePerMonthLabel = useMemo(() => {
    if (reports.affiliatePerMonthMonth && reports.affiliatePerMonthYear) {
      const idx = reports.affiliatePerMonthMonth - 1;
      const monthName =
        monthNames[idx] ?? `Mes ${reports.affiliatePerMonthMonth}`;
      return `${monthName} ${reports.affiliatePerMonthYear}`;
    }
    return "Mes seleccionado";
  }, [reports.affiliatePerMonthMonth, reports.affiliatePerMonthYear]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const values = new Set<number>([selectedYear]);

    for (let year = currentYear - 3; year <= currentYear + 1; year += 1) {
      values.add(year);
    }

    return Array.from(values).sort((a, b) => b - a);
  }, [selectedYear]);

  const downloadSimpleCountPdf = async (config: {
    title: string;
    endpoint: string;
    description: string;
    count: number;
    color: string;
    fileName: string;
    nombreReporte: string;
  }) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(config.title, 20, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(config.description, 20, 40);

    const [r, g, b] = hexToRgb(config.color);
    doc.setFillColor(r, g, b);
    doc.rect(20, 52, 170, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`Total: ${config.count}`, 24, 64);

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);
    doc.text("Leyenda de color:", 20, 84);
    addColorLegendRow(doc, "Conteo total reportado", config.color, 92);

    doc.save(config.fileName);
    await createCountReport(config.count, config.nombreReporte);
  };

  const downloadAfiliadosStatusPdf = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de afiliados por estatus", 20, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Endpoint: /sics/reports/getAfiliadosCountByStatus", 20, 30);
    doc.text(
      "Distribucion de afiliados segun su estatus sanitario actual.",
      20,
      40,
    );

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(12);
    doc.text("Valores:", 20, 54);

    let y = 64;
    afiliadosStatusData.forEach((item) => {
      doc.text(`${item.name}: ${item.value}`, 30, y);
      addColorLegendRow(doc, item.name, item.fill, y);
      y += 10;
    });

    doc.save("reporte-afiliados-por-estatus.pdf");
    const totalAfiliados = afiliadosStatusData.reduce((acc, item) => acc + item.value, 0);
    await createCountReport(totalAfiliados, "Afiliados por estatus sanitario");
  };

  const downloadLaboratoryResultsPdf = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de resultados de laboratorio", 20, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Endpoint resumen: /sics/reports/laboratoryResults", 20, 30);
    doc.text("Endpoint detalle: /sics/laboratories/laboratoryResults", 20, 38);
    doc.text("Conteo total y desglose de resultados por laboratorio.", 20, 46);

    const [r, g, b] = hexToRgb(reportColors.laboratorios);
    doc.setFillColor(r, g, b);
    doc.rect(20, 54, 170, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(`Total de resultados: ${reports.laboratoryResults}`, 24, 63);

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(11);
    doc.text("Detalle por laboratorio:", 20, 78);

    let y = 86;
    reports.laboratoryResultsByLab.forEach((item) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${item.nombre_comercial}: ${item.resultados}`, 24, y);
      y += 8;
    });

    doc.save("reporte-resultados-laboratorio.pdf");
    await createCountReport(reports.laboratoryResults, "Resultados de laboratorio");
  };

  const downloadAffiliatePerBarPdf = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de afiliados por bar", 20, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Endpoint: /sics/reports/affiliatePerBar", 20, 30);
    doc.text("Conteo de afiliados agrupados por bar.", 20, 40);

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(12);
    doc.text("Detalle por bar:", 20, 54);

    let y = 64;
    reports.affiliatePerBar.forEach((item) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${item.nombre}: ${item.total}`, 24, y);
      y += 10;
    });

    doc.save("reporte-afiliados-por-bar.pdf");
    const totalAfiliados = reports.affiliatePerBar.reduce(
      (acc, item) => acc + item.total,
      0,
    );
    await createCountReport(totalAfiliados, "Afiliados por bar");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes</CardTitle>
          <CardDescription>Cargando seccion de reportes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse text-sm text-muted-foreground">
            Consultando endpoints de reportes.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reportes</CardTitle>
          <CardDescription>Seccion de reportes del dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Reportes rapidos</h2>
        <p className="text-sm text-muted-foreground">
          Cada tarjeta consulta un endpoint de reportes, muestra su grafica y permite descargar un PDF individual.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificados sanitarios obtenidos</CardTitle>
            <CardDescription>
              Este grafico de barras muestra el total de certificados obtenidos exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              config={{
                value: { label: "Certificados", color: reportColors.certificados },
              }}
              className="h-[220px] sm:h-[280px]"
            >
              <BarChart data={[{ name: "Certificados", value: reports.certificadosSanitarios }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={reportColors.certificados} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Color azul: total de certificados sanitarios reportados por el endpoint.
            </p>
            <Button
              variant="outline"
              onClick={async () =>
                downloadSimpleCountPdf({
                  title: "Reporte de certificados sanitarios",
                  endpoint: "/sics/reports/certificadosSanitarios",
                  description: "Conteo de certificados obtenidos exitosamente.",
                  count: reports.certificadosSanitarios,
                  color: reportColors.certificados,
                  fileName: "reporte-certificados-sanitarios.pdf",
                  nombreReporte: "Certificados sanitarios obtenidos",
                })
              }
            >
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Afiliados por bar</CardTitle>
            <CardDescription>
              Conteo de afiliados agrupados por bar reportado por el endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              config={{
                value: { label: "Afiliados", color: reportColors.afiliados },
              }}
              className="h-[220px] sm:h-[280px]"
            >
              <BarChart
                data={
                  affiliatePerBarChartData.length > 0
                    ? affiliatePerBarChartData
                    : [{ name: "Sin datos", value: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value: string) =>
                    value.length > 14 ? `${value.slice(0, 14)}...` : value
                  }
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill={reportColors.afiliados}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Morado: total de afiliados por cada bar devuelto por el endpoint
              /sics/reports/affiliatePerBar.
            </p>
            <Button
              variant="outline"
              onClick={async () => downloadAffiliatePerBarPdf()}
            >
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Afiliados registrados por mes</CardTitle>
            <CardDescription>
              Total de afiliados registrados en el período: {affiliatePerMonthLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Mes</p>
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={month} value={String(index + 1)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Año</p>
                <Select
                  value={String(selectedYear)}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona año" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ChartContainer
              config={{
                value: { label: "Afiliados", color: reportColors.afiliados },
              }}
              className="h-[220px] sm:h-[280px]"
            >
              <BarChart
                data={[
                  {
                    name: affiliatePerMonthLabel,
                    value: reports.affiliatePerMonthTotal,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill={reportColors.afiliados}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Morado: total de afiliados reportados por el endpoint para el mes y año indicados.
            </p>
            {affiliatePerMonthLoading && (
              <p className="text-xs text-muted-foreground">Consultando datos para el período seleccionado...</p>
            )}
            <Button
              variant="outline"
              disabled={affiliatePerMonthLoading}
              onClick={async () =>
                downloadSimpleCountPdf({
                  title: "Afiliados registrados por mes",
                  endpoint:
                    `/sics/reports/affiliatePerMonth?month=${selectedMonth}&year=${selectedYear}`,
                  description: `Afiliados registrados en ${affiliatePerMonthLabel}.`,
                  count: reports.affiliatePerMonthTotal,
                  color: reportColors.afiliados,
                  fileName: "reporte-afiliados-por-mes.pdf",
                  nombreReporte: "Afiliados por mes",
                })
              }
            >
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteo general de reportes</CardTitle>
            <CardDescription>
              Este grafico de barras representa el conteo general devuelto por el endpoint de reportes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              config={{
                value: { label: "Conteo", color: reportColors.reportes },
              }}
              className="h-[220px] sm:h-[280px]"
            >
              <BarChart data={[{ name: "Reportes", value: reports.getCountReport }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={reportColors.reportes} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Color verde: cantidad total informada por el endpoint de conteo general.
            </p>
            <Button
              variant="outline"
              onClick={async () =>
                downloadSimpleCountPdf({
                  title: "Reporte de conteo general",
                  endpoint: "/sics/reports/getCountReport",
                  description: "Conteo total obtenido exitosamente.",
                  count: reports.getCountReport,
                  color: reportColors.reportes,
                  fileName: "reporte-conteo-general.pdf",
                  nombreReporte: "Conteo general de reportes",
                })
              }
            >
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Afiliados por estatus sanitario</CardTitle>
            <CardDescription>
              Este grafico de pastel muestra la distribucion de afiliados por estatus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              config={{
                vigente: { label: statusLabels.VIGENTE, color: statusColorMap.VIGENTE },
                pendiente: { label: statusLabels.PENDIENTE_RENOVACION, color: statusColorMap.PENDIENTE_RENOVACION },
                suspension: { label: statusLabels.SUSPENSION_TEMPORAL, color: statusColorMap.SUSPENSION_TEMPORAL },
                cancelacionTemporal: { label: statusLabels.CANCELACION_TEMPORAL, color: statusColorMap.CANCELACION_TEMPORAL },
                cancelacionDefinitiva: { label: statusLabels.CANCELACION_DEFINITIVA, color: statusColorMap.CANCELACION_DEFINITIVA },
              }}
              className="h-[220px] sm:h-[280px]"
            >
              <PieChart>
                <Pie
                  data={afiliadosStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {afiliadosStatusData.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Verde: vigente, amarillo: pendiente de renovacion, naranja: suspension temporal, azul: cancelacion temporal, rojo: cancelacion definitiva.
            </p>
            <Button variant="outline" onClick={async () => downloadAfiliadosStatusPdf()}>
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados de laboratorio</CardTitle>
            <CardDescription>
              Este grafico de barras muestra el total de resultados de laboratorios obtenidos exitosamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChartContainer
              config={{
                value: { label: "Resultados", color: reportColors.laboratorios },
              }}
              className="h-[220px] sm:h-[280px]"
            >
              <BarChart
                data={
                  laboratoryResultsByLabChartData.length > 0
                    ? laboratoryResultsByLabChartData
                    : [{ name: "Laboratorios", value: reports.laboratoryResults }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value: string) =>
                    value.length > 14 ? `${value.slice(0, 14)}...` : value
                  }
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={reportColors.laboratorios} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Color naranja: conteo de resultados por laboratorio (endpoint de detalle) y total general.
            </p>
            <Button
              variant="outline"
              onClick={async () => downloadLaboratoryResultsPdf()}
            >
              <FileDown className="h-4 w-4" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

