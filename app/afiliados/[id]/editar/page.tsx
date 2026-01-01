"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormAfiliado } from "@/components/afiliados/form-afiliado"
import { afiliados, lugaresTrabajo } from "@/lib/mock-data"
import type { Afiliado } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditarAfiliadoPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const afiliado = afiliados.find((a) => a.id === id)

  const handleSubmit = (data: Partial<Afiliado>) => {
    // En producción, esto se enviaría a la API
    console.log("Actualizar afiliado:", data)
    router.push(`/afiliados/${id}`)
  }

  if (!afiliado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Afiliado no encontrado</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Afiliado</h1>
          <p className="text-muted-foreground">
            {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
          </p>
        </div>

        <FormAfiliado afiliado={afiliado} lugaresTrabajo={lugaresTrabajo} onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
