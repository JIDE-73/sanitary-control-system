"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { DatosPersonales } from "@/components/afiliados/expediente/datos-personales"
import { HistorialConsultas } from "@/components/afiliados/expediente/historial-consultas"
import { HistorialExamenes } from "@/components/afiliados/expediente/historial-examenes"
import { CertificadosAfiliado } from "@/components/afiliados/expediente/certificados-afiliado"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, FileText, ClipboardPlus, TestTube } from "lucide-react"
import {
  afiliados,
  lugaresTrabajo,
  consultasClinicas,
  examenesClinicosData,
  certificados,
  medicos,
} from "@/lib/mock-data"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ExpedienteAfiliadoPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const afiliado = afiliados.find((a) => a.id === id)
  const lugarTrabajo = afiliado?.lugarTrabajoId
    ? lugaresTrabajo.find((l) => l.id === afiliado.lugarTrabajoId)
    : undefined
  const consultasAfiliado = consultasClinicas.filter((c) => c.afiliadoId === id)
  const examenesAfiliado = examenesClinicosData.filter((e) => e.afiliadoId === id)
  const certificadosAfiliado = certificados.filter((c) => c.afiliadoId === id)

  if (!afiliado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Afiliado no encontrado</p>
          <Button onClick={() => router.push("/afiliados")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Afiliados
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
              </h1>
              <p className="text-muted-foreground font-mono">{afiliado.curp}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/consultas/nueva?afiliado=${id}`}>
              <Button variant="outline">
                <ClipboardPlus className="mr-2 h-4 w-4" />
                Nueva Consulta
              </Button>
            </Link>
            <Link href={`/examenes/nuevo?afiliado=${id}`}>
              <Button variant="outline">
                <TestTube className="mr-2 h-4 w-4" />
                Ordenar Examen
              </Button>
            </Link>
            <Link href={`/certificados/nuevo?afiliado=${id}`}>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Emitir Certificado
              </Button>
            </Link>
            <Link href={`/afiliados/${id}/editar`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="datos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="datos">Datos Personales</TabsTrigger>
            <TabsTrigger value="consultas">Consultas Clínicas ({consultasAfiliado.length})</TabsTrigger>
            <TabsTrigger value="examenes">Exámenes ({examenesAfiliado.length})</TabsTrigger>
            <TabsTrigger value="certificados">Certificados ({certificadosAfiliado.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="datos">
            <DatosPersonales afiliado={afiliado} lugarTrabajo={lugarTrabajo} />
          </TabsContent>

          <TabsContent value="consultas">
            <HistorialConsultas consultas={consultasAfiliado} medicos={medicos} />
          </TabsContent>

          <TabsContent value="examenes">
            <HistorialExamenes examenes={examenesAfiliado} />
          </TabsContent>

          <TabsContent value="certificados">
            <CertificadosAfiliado certificados={certificadosAfiliado} medicos={medicos} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
