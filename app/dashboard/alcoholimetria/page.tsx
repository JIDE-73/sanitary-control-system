"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RequireModuleAccess } from "@/components/auth/auth-context";
import { Activity, AlertTriangle, Beer, Gauge } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AlcoholimetriaDashboardPage() {
  // Datos mock de ejemplo
  const trendData = [
    { day: "Lun", total: 96, positivos: 10 },
    { day: "Mar", total: 112, positivos: 14 },
    { day: "Mié", total: 105, positivos: 12 },
    { day: "Jue", total: 134, positivos: 18 },
    { day: "Vie", total: 148, positivos: 21 },
    { day: "Sáb", total: 172, positivos: 26 },
    { day: "Dom", total: 128, positivos: 17 },
  ];

  const distributionData = [
    { rango: "0.00 - 0.03", personas: 54 },
    { rango: "0.04 - 0.07", personas: 32 },
    { rango: "0.08 - 0.12", personas: 15 },
    { rango: "> 0.12", personas: 5 },
  ];

  const trendConfig = {
    total: {
      label: "Pruebas totales",
      color: "hsl(var(--chart-1))",
    },
    positivos: {
      label: "Pruebas positivas",
      color: "hsl(var(--chart-2))",
    },
  };

  const distributionConfig = {
    personas: {
      label: "Personas",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <RequireModuleAccess module="dashboard" action="read">
      <MainLayout>
        <div className="space-y-6 px-4 sm:px-0">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Dashboard de Alcoholimetría
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Vista general (mockup) de controles y resultados de alcoholimetría.
              </p>
            </div>
          </div>

          {/* Top stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pruebas del día
                </CardTitle>
                <Gauge className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12% vs. ayer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Positivos
                </CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground mt-1">
                  14% de las pruebas realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Promedio de BAC
                </CardTitle>
                <Beer className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.034%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sobre la población evaluada hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alertas críticas
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">3</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Casos con BAC &gt; 0.08%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficas de ejemplo */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Tendencia de pruebas por día</CardTitle>
                <CardDescription>
                  Gráfico de líneas con volumen de pruebas de alcoholimetría (datos de ejemplo).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendConfig} className="h-[240px] sm:h-[320px]">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="positivos"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Distribución de niveles de BAC</CardTitle>
                <CardDescription>
                  Gráfico de barras por rangos de BAC (datos de ejemplo).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={distributionConfig} className="h-[240px] sm:h-[320px]">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="rango"
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="personas"
                      fill="hsl(var(--chart-3))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </RequireModuleAccess>
  );
}


