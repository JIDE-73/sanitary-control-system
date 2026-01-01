"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormExamen } from "@/components/examenes/form-examen"
import type { ExamenClinico } from "@/lib/types"

function NuevoExamenContent() {
  const router = useRouter()

  const handleSubmit = (data: Partial<ExamenClinico>) => {
    console.log("Nuevo examen:", data)
    router.push("/examenes")
  }

  return <FormExamen onSubmit={handleSubmit} />
}

export default function NuevoExamenPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordenar Examen</h1>
          <p className="text-muted-foreground">Crear una nueva orden de examen clínico</p>
        </div>

        <Suspense fallback={<div>Cargando...</div>}>
          <NuevoExamenContent />
        </Suspense>
      </div>
    </MainLayout>
  )
}
