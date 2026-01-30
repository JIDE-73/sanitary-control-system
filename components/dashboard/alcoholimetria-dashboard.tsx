"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, Shield, Users, MapPin } from "lucide-react";

const summaryStats = [
  {
    label: "Pruebas realizadas hoy",
    value: "124",
    helper: "+8% vs ayer",
    icon: Activity,
  },
  {
    label: "Resultados positivos",
    value: "3",
    helper: "2.4% de las pruebas",
    icon: Shield,
  },
  {
    label: "Pruebas este mes",
    value: "3,482",
    helper: "+18% vs mes anterior",
    icon: Users,
  },
  {
    label: "Puntos activos",
    value: "6",
    helper: "Operativos en curso",
    icon: MapPin,
  },
];

const dailyData = [
  { day: "Lun", total: 120, positivos: 2 },
  { day: "Mar", total: 135, positivos: 3 },
  { day: "Mié", total: 98, positivos: 1 },
  { day: "Jue", total: 142, positivos: 4 },
  { day: "Vie", total: 168, positivos: 5 },
  { day: "Sáb", total: 90, positivos: 1 },
  { day: "Dom", total: 76, positivos: 0 },
];

const checkpointsData = [
  { name: "Centro", total: 420 },
  { name: "Norte", total: 310 },
  { name: "Sur", total: 285 },
  { name: "Oriente", total: 198 },
  { name: "Poniente", total: 176 },
];

const chartConfig = {
  total: {
    label: "Pruebas",
    color: "hsl(var(--chart-1))",
  },
  positivos: {
    label: "Positivos",
    color: "hsl(var(--chart-2))",
  },
};

export function AlcoholimetriaDashboard() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Dashboard de Alcoholimetría
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vista general de los operativos de alcoholimetría (datos de ejemplo).
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            Mockup · Datos simulados
          </Badge>
        </div>

        {/* Tarjetas resumen */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((item) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Gráficas principales */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pruebas diarias</CardTitle>
              <CardDescription>
                Distribución de pruebas y resultados positivos por día (semana de ejemplo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="h-[240px] sm:h-[320px]"
              >
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="positivos"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pruebas por punto de control</CardTitle>
              <CardDescription>
                Volumen de pruebas por zona operativa (ejemplo de distribución).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  total: {
                    label: "Pruebas",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[240px] sm:h-[320px]"
              >
                <BarChart data={checkpointsData}>
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
                    dataKey="total"
                    fill="hsl(var(--chart-3))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}


