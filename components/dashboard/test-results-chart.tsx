'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { request } from "@/lib/request"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface Statistics {
  VIH: number
  VDRL: number
  cultivo: number
  resultadoNeisseria: number
  resultadoGardnerella: number
  resultadoTrichomonas: number
  resultadoVDRL: number
  resultadoHIV: number
  resultadosPositivos: number
}

export function TestResultsChart() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await request("/sics/statistics/getAllStatistics", "GET")
        if (response && response.affiliates !== undefined) {
          setStats({
            VIH: response.VIH || 0,
            VDRL: response.VDRL || 0,
            cultivo: response.cultivo || 0,
            resultadoNeisseria: response.resultadoNeisseria || 0,
            resultadoGardnerella: response.resultadoGardnerella || 0,
            resultadoTrichomonas: response.resultadoTrichomonas || 0,
            resultadoVDRL: response.resultadoVDRL || 0,
            resultadoHIV: response.resultadoHIV || 0,
            resultadosPositivos: response.resultadosPositivos || 0,
          })
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] sm:h-[300px] flex items-center justify-center">
          <div className="animate-pulse">Cargando estadísticas...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  // Datos para el gráfico de pruebas realizadas
  const testsPerformed = [
    { name: "VDRL", realizadas: stats.VDRL || 0, resultados: stats.resultadoVDRL || 0 },
    { name: "VIH", realizadas: stats.VIH || 0, resultados: stats.resultadoHIV || 0 },
    { name: "Cultivo", realizadas: stats.cultivo || 0, resultados: 0 },
  ]

  // Datos para resultados de cultivos
  const cultureResults = [
    { name: "Neisseria", value: stats.resultadoNeisseria || 0 },
    { name: "Gardnerella", value: stats.resultadoGardnerella || 0 },
    { name: "Trichomonas", value: stats.resultadoTrichomonas || 0 },
  ]

  const chartConfig = {
    realizadas: {
      label: "Pruebas Realizadas",
      color: "hsl(var(--chart-1))",
    },
    resultados: {
      label: "Resultados",
      color: "hsl(var(--chart-2))",
    },
    value: {
      label: "Cantidad",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gráfico de pruebas realizadas vs resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Pruebas Realizadas vs Resultados</CardTitle>
          <CardDescription>Comparación de pruebas realizadas y resultados obtenidos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px]">
            <BarChart data={testsPerformed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="realizadas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resultados" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de resultados de cultivos */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Cultivos</CardTitle>
          <CardDescription>Resultados específicos de exámenes de cultivo</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px]">
            <BarChart data={cultureResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

