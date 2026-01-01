"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ExamenesTable } from "@/components/examenes/examenes-table"
import { examenesClinicosData, afiliados } from "@/lib/mock-data"

export default function ResultadosPage() {
  // Filtrar solo exámenes sin resultado
  const examenesPendientes = examenesClinicosData.filter((e) => !e.fechaResultado)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resultados Pendientes</h1>
          <p className="text-muted-foreground">Exámenes en espera de resultado</p>
        </div>

        <ExamenesTable examenes={examenesPendientes} afiliados={afiliados} />
      </div>
    </MainLayout>
  )
}
