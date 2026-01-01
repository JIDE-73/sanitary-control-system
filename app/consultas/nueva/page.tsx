"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormConsulta } from "@/components/consultas/form-consulta"
import type { ConsultaClinica } from "@/lib/types"

function NuevaConsultaContent() {
  const router = useRouter()

  const handleSubmit = (data: Partial<ConsultaClinica>) => {
    console.log("Nueva consulta:", data)
    router.push("/consultas")
  }

  return <FormConsulta onSubmit={handleSubmit} />
}

export default function NuevaConsultaPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Consulta Clínica</h1>
          <p className="text-muted-foreground">Registrar una nueva consulta médica</p>
        </div>

        <Suspense fallback={<div>Cargando...</div>}>
          <NuevaConsultaContent />
        </Suspense>
      </div>
    </MainLayout>
  )
}
