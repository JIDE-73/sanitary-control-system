"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormLugar } from "@/components/lugares-trabajo/form-lugar"
import type { LugarTrabajo } from "@/lib/types"

export default function NuevoLugarPage() {
  const router = useRouter()

  const handleSubmit = (data: Partial<LugarTrabajo>) => {
    console.log("Nuevo lugar de trabajo:", data)
    router.push("/lugares-trabajo")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Lugar de Trabajo</h1>
          <p className="text-muted-foreground">Registrar un nuevo establecimiento en el catálogo</p>
        </div>

        <FormLugar onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
