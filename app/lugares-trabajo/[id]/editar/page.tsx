"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormLugar } from "@/components/lugares-trabajo/form-lugar"
import { lugaresTrabajo } from "@/lib/mock-data"
import type { LugarTrabajo } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditarLugarPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const lugar = lugaresTrabajo.find((l) => l.id === id)

  const handleSubmit = (data: Partial<LugarTrabajo>) => {
    console.log("Actualizar lugar:", data)
    router.push(`/lugares-trabajo/${id}`)
  }

  if (!lugar) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Lugar no encontrado</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Lugar de Trabajo</h1>
          <p className="text-muted-foreground">
            {lugar.codigo} - {lugar.nombre}
          </p>
        </div>

        <FormLugar lugar={lugar} onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
