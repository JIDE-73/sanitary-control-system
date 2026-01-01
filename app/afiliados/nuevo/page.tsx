"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormAfiliado } from "@/components/afiliados/form-afiliado"
import { lugaresTrabajo } from "@/lib/mock-data"
import type { Afiliado } from "@/lib/types"

export default function NuevoAfiliadoPage() {
  const router = useRouter()

  const handleSubmit = (data: Partial<Afiliado>) => {
    // En producción, esto se enviaría a la API
    console.log("Nuevo afiliado:", data)
    router.push("/afiliados")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Afiliado</h1>
          <p className="text-muted-foreground">Registrar un nuevo afiliado en el sistema</p>
        </div>

        <FormAfiliado lugaresTrabajo={lugaresTrabajo} onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
