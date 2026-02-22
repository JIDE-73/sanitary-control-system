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
};

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
  afiliadosByStatus: Record<StatusKey, number>;
}

const initialState: ReportsState = {
  certificadosSanitarios: 0,
  getCountReport: 0,
  laboratoryResults: 0,
  afiliadosByStatus: {
    VIGENTE: 0,
    PENDIENTE_RENOVACION: 0,
    SUSPENSION_TEMPORAL: 0,
    CANCELACION_TEMPORAL: 0,
    CANCELACION_DEFINITIVA: 0,
  },
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

export function ReportsSection() {
  const [reports, setReports] = useState<ReportsState>(initialState);
  const [loading, setLoading] = useState(true);
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
        ] = await Promise.all([
          request("/sics/reports/certificadosSanitarios", "GET"),
          request("/sics/reports/getCountReport", "GET"),
          request("/sics/reports/getAfiliadosCountByStatus", "GET"),
          request("/sics/reports/laboratoryResults", "GET"),
        ]);

        setReports({
          certificadosSanitarios: toSafeCount(certificadosResponse?.count),
          getCountReport: toSafeCount(countReportResponse?.count),
          laboratoryResults: toSafeCount(laboratoryResultsResponse?.count),
          afiliadosByStatus: {
            VIGENTE: toSafeCount(afiliadosStatusResponse?.VIGENTE),
            PENDIENTE_RENOVACION: toSafeCount(afiliadosStatusResponse?.PENDIENTE_RENOVACION),
            SUSPENSION_TEMPORAL: toSafeCount(afiliadosStatusResponse?.SUSPENSION_TEMPORAL),
            CANCELACION_TEMPORAL: toSafeCount(afiliadosStatusResponse?.CANCELACION_TEMPORAL),
            CANCELACION_DEFINITIVA: toSafeCount(afiliadosStatusResponse?.CANCELACION_DEFINITIVA),
          },
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
              <BarChart data={[{ name: "Laboratorios", value: reports.laboratoryResults }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill={reportColors.laboratorios} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground">
              Color naranja: total de resultados de laboratorio reportados por el endpoint.
            </p>
            <Button
              variant="outline"
              onClick={async () =>
                downloadSimpleCountPdf({
                  title: "Reporte de resultados de laboratorio",
                  endpoint: "/sics/reports/laboratoryResults",
                  description: "Conteo de resultados de laboratorios obtenido exitosamente.",
                  count: reports.laboratoryResults,
                  color: reportColors.laboratorios,
                  fileName: "reporte-resultados-laboratorio.pdf",
                  nombreReporte: "Resultados de laboratorio",
                })
              }
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

