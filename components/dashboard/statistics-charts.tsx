'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { request } from "@/lib/request"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"

const chartColors = {
  primary: "#2563eb",
  secondary: "#16a34a",
  tertiary: "#ea580c",
}

const barPalette = ["#2563eb", "#16a34a", "#ea580c", "#dc2626", "#7c3aed"]

interface Statistics {
  affiliates: number
  medicalNote: number
  laboratory: number
  resultadosPositivos: number
  VIH: number
  VDRL: number
  cultivo: number
  resultadoNeisseria: number
  resultadoGardnerella: number
  resultadoTrichomonas: number
  resultadoVDRL: number
  resultadoHIV: number
}

export function StatisticsCharts() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await request("/sics/statistics/getAllStatistics", "GET")
        if (response && response.affiliates !== undefined) {
          setStats({
            affiliates: response.affiliates || 0,
            medicalNote: response.medicalNote || 0,
            laboratory: response.laboratory || 0,
            resultadosPositivos: response.resultadosPositivos || 0,
            VIH: response.VIH || 0,
            VDRL: response.VDRL || 0,
            cultivo: response.cultivo || 0,
            resultadoNeisseria: response.resultadoNeisseria || 0,
            resultadoGardnerella: response.resultadoGardnerella || 0,
            resultadoTrichomonas: response.resultadoTrichomonas || 0,
            resultadoVDRL: response.resultadoVDRL || 0,
            resultadoHIV: response.resultadoHIV || 0,
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cargando...</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[300px] flex items-center justify-center">
            <div className="animate-pulse">Cargando estadísticas...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Datos para el gráfico de resumen general
  const overviewData = [
    { name: "Afiliados", value: stats.affiliates },
    { name: "Notas Médicas", value: stats.medicalNote },
    { name: "Laboratorios", value: stats.laboratory },
  ]

  // Datos para el gráfico de resultados
  const resultsData = [
    { name: "VDRL", value: stats.resultadoVDRL || 0 },
    { name: "HIV", value: stats.resultadoHIV || 0 },
    { name: "Neisseria", value: stats.resultadoNeisseria || 0 },
    { name: "Gardnerella", value: stats.resultadoGardnerella || 0 },
    { name: "Trichomonas", value: stats.resultadoTrichomonas || 0 },
  ]

  const chartConfig = {
    affiliates: {
      label: "Afiliados",
      color: chartColors.primary,
    },
    medicalNote: {
      label: "Notas Médicas",
      color: chartColors.secondary,
    },
    laboratory: {
      label: "Laboratorios",
      color: chartColors.tertiary,
    },
    value: {
      label: "Cantidad",
      color: chartColors.primary,
    },
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gráfico de resumen general */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
          <CardDescription>Distribución de registros principales</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px]">
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {overviewData.map((item, index) => (
                  <Cell key={`overview-${item.name}`} fill={barPalette[index % barPalette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de resultados de laboratorio */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Resultados de Pruebas</CardTitle>
          <CardDescription>Resultados de exámenes de laboratorio</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px]">
            <BarChart data={resultsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {resultsData.map((item, index) => (
                  <Cell key={`results-${item.name}`} fill={barPalette[index % barPalette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

