"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Stethoscope, Phone, Mail, Calendar, Award, CheckCircle, XCircle } from "lucide-react"
import { medicos, certificados } from "@/lib/mock-data"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function MedicoDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const medico = medicos.find((m) => m.id === id)
  const certificadosEmitidos = certificados.filter((c) => c.medicoId === id)

  if (!medico) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Médico no encontrado</p>
          <Button onClick={() => router.push("/medicos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Médicos
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Dr(a). {medico.nombres} {medico.apellidoPaterno} {medico.apellidoMaterno}
              </h1>
              <p className="text-muted-foreground">{medico.especialidad}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Award className="mr-2 h-4 w-4" />
              Generar Credencial
            </Button>
            <Link href={`/medicos/${id}/editar`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                Información Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cédula Profesional</p>
                  <p className="font-mono font-medium">{medico.cedulaProfesional}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estatus</p>
                  <Badge variant={medico.estatus === "activo" ? "default" : "secondary"}>
                    {medico.estatus.charAt(0).toUpperCase() + medico.estatus.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Especialidad</p>
                <p className="font-medium">{medico.especialidad}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Firma Digital</p>
                {medico.firmaDigitalUrl ? (
                  <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/30">
                    <CheckCircle className="h-3 w-3" />
                    Firma cargada correctamente
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
                    <XCircle className="h-3 w-3" />
                    Firma pendiente de cargar
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{medico.telefono}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{medico.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                  <p className="font-medium">{new Date(medico.fechaRegistro).toLocaleDateString("es-MX")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Estadísticas de Productividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{certificadosEmitidos.length}</p>
                  <p className="text-sm text-muted-foreground">Certificados Emitidos</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-3xl font-bold text-accent">
                    {certificadosEmitidos.filter((c) => c.estatus === "vigente").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Vigentes</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-3xl font-bold">15</p>
                  <p className="text-sm text-muted-foreground">Consultas este mes</p>
                </div>
                <div className="rounded-lg border border-border p-4 text-center">
                  <p className="text-3xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Exámenes ordenados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
