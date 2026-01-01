"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormMedico } from "@/components/medicos/form-medico"
import type { Medico } from "@/lib/types"

export default function NuevoMedicoPage() {
  const router = useRouter()

  const handleSubmit = (data: Partial<Medico>) => {
    console.log("Nuevo médico:", data)
    router.push("/medicos")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Médico</h1>
          <p className="text-muted-foreground">Registrar un nuevo médico autorizado en el sistema</p>
        </div>

        <FormMedico onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
