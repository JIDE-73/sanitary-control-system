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

interface LaboratoryStatistics {
  pruebasRealizadasTotal: number
  pruebasRealizadasPositivos: number
  pruebasRealizadasNegativos: number
}

export function TestResultsChart() {
  const [stats, setStats] = useState<LaboratoryStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await request("/sics/statistics/statisticsResultsLaboratory", "GET")
        if (response) {
          setStats({
            pruebasRealizadasTotal: response.pruebasRealizadasTotal ?? 0,
            pruebasRealizadasPositivos: response.pruebasRealizadasPositivos ?? 0,
            pruebasRealizadasNegativos: response.pruebasRealizadasNegativos ?? 0,
          })
        }
      } catch (error) {
        console.error("Error al cargar estadísticas de laboratorio:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [])

  if (loading) {
    return (
      <Card className="min-w-0">
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

  // Datos para el gráfico de resultados de laboratorio
  const labResultsData = [
    {
      name: "Total",
      value: stats.pruebasRealizadasTotal ?? 0,
    },
    {
      name: "Positivos",
      value: stats.pruebasRealizadasPositivos ?? 0,
    },
    {
      name: "Negativos",
      value: stats.pruebasRealizadasNegativos ?? 0,
    },
  ]

  const chartConfig = {
    value: {
      label: "Cantidad de pruebas",
      color: chartColors.primary,
    },
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Resultados de Laboratorio</CardTitle>
        <CardDescription>
          Total de pruebas realizadas y distribución entre resultados positivos y negativos
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px]">
          <BarChart data={labResultsData}>
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
              {labResultsData.map((item, index) => (
                <Cell key={item.name} fill={barPalette[index % barPalette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

