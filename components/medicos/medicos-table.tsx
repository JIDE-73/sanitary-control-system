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
import { Eye, Edit, IdCard, CheckCircle, XCircle, BarChart3, Loader2 } from "lucide-react";
import type { Medico } from "@/lib/types";
import { request } from "@/lib/request";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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

export function MedicosTable({ medicos, loading = false }: MedicosTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [statsOpen, setStatsOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

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

  const loadStatistics = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      // Obtener ID de persona del usuario actual desde localStorage
      const userStr = window.localStorage.getItem("sics-auth-user");
      if (!userStr) {
        throw new Error("No se encontró información del usuario");
      }
      const user = JSON.parse(userStr);
      const personaId = user?.persona?.id;

      if (!personaId) {
        throw new Error("No se encontró el ID de persona del usuario");
      }

      const response = await request(
        `/sics/statistics/getStatisticsByMedic/${personaId}`,
        "GET"
      );

      if (response.status >= 200 && response.status < 300) {
        setStatistics(response);
      } else {
        throw new Error(response.message || "No se pudieron cargar las estadísticas");
      }
    } catch (err) {
      console.error("Error al cargar estadísticas", err);
      setStatsError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las estadísticas"
      );
      setStatistics(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleOpenStats = () => {
    setStatsOpen(true);
    if (!statistics) {
      loadStatistics();
    }
  };

  // Formatear datos para el gráfico
  const chartData = useMemo(() => {
    if (!statistics?.stats) return [];
    
    return Object.entries(statistics.stats)
      .map(([key, value]) => {
        // Formatear clave "2026-1" a "Enero 2026"
        const [year, month] = key.split("-");
        const monthNames = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        const monthName = monthNames[parseInt(month) - 1] || month;
        return {
          mes: `${monthName} ${year}`,
          certificados: value,
          key: key,
        };
      })
      .sort((a, b) => {
        // Ordenar por año y mes
        const [yearA, monthA] = a.key.split("-").map(Number);
        const [yearB, monthB] = b.key.split("-").map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      });
  }, [statistics]);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium">Lista de médicos</p>
        <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpenStats}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Mis estadísticas
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
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
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas de Certificados
            </DialogTitle>
            <DialogDescription>
              Certificados emitidos por mes
            </DialogDescription>
          </DialogHeader>
          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : statsError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-destructive">{statsError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStatistics}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : chartData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No hay estadísticas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              <ChartContainer
                config={{
                  certificados: {
                    label: "Certificados",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="certificados"
                    fill="var(--color-certificados)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Resumen por mes:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {chartData.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <span className="text-muted-foreground">{item.mes}</span>
                      <span className="font-medium">{item.certificados} certificados</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
