"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormMedico } from "@/components/medicos/form-medico"
import { medicos } from "@/lib/mock-data"
import type { Medico } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditarMedicoPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const medico = medicos.find((m) => m.id === id)

  const handleSubmit = (data: Partial<Medico>) => {
    console.log("Actualizar médico:", data)
    router.push(`/medicos/${id}`)
  }

  if (!medico) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Médico no encontrado</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Médico</h1>
          <p className="text-muted-foreground">
            Dr(a). {medico.nombres} {medico.apellidoPaterno} {medico.apellidoMaterno}
          </p>
        </div>

        <FormMedico medico={medico} onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
