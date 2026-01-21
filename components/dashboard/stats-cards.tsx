'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, FlaskConical, Activity } from "lucide-react"
import { request } from "@/lib/request"

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

export function StatsCards() {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground animate-pulse">
                Cargando...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Afiliados",
      value: stats?.affiliates?.toLocaleString() || "0",
      icon: Users,
    },
    {
      title: "Notas Médicas",
      value: stats?.medicalNote?.toLocaleString() || "0",
      icon: FileText,
    },
    {
      title: "Laboratorios",
      value: stats?.laboratory?.toLocaleString() || "0",
      icon: FlaskConical,
    },
    {
      title: "Resultados Positivos",
      value: stats?.resultadosPositivos?.toLocaleString() || "0",
      icon: Activity,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
