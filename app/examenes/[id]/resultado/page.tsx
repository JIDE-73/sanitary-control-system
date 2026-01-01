"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { FormResultado } from "@/components/examenes/form-resultado"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, TestTube } from "lucide-react"
import { examenesClinicosData, afiliados } from "@/lib/mock-data"
import type { ExamenClinico } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ResultadoExamenPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const examen = examenesClinicosData.find((e) => e.id === id)
  const afiliado = examen ? afiliados.find((a) => a.id === examen.afiliadoId) : null

  const handleSubmit = (data: Partial<ExamenClinico>) => {
    console.log("Resultado registrado:", data)
    router.push("/examenes")
  }

  if (!examen) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Examen no encontrado</p>
          <Button onClick={() => router.push("/examenes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar Resultado</h1>
            <p className="text-muted-foreground">Capturar resultado de examen clínico</p>
          </div>
        </div>

        {/* Info del afiliado y examen */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Afiliado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">
                  {afiliado
                    ? `${afiliado.nombres} ${afiliado.apellidoPaterno} ${afiliado.apellidoMaterno}`
                    : "No encontrado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CURP</p>
                <p className="font-mono font-medium">{afiliado?.curp || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TestTube className="h-5 w-5 text-primary" />
                Examen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Examen</p>
                <p className="font-medium">{examen.tipoExamen}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Orden</p>
                <p className="font-medium">{new Date(examen.fechaOrden).toLocaleDateString("es-MX")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <FormResultado examen={examen} onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  )
}
