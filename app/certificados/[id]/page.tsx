"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Download, QrCode, FileText, User, Stethoscope, Calendar, Building2 } from "lucide-react"
import { certificados, afiliados, medicos, lugaresTrabajo } from "@/lib/mock-data"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DetalleCertificadoPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const certificado = certificados.find((c) => c.id === id)
  const afiliado = certificado ? afiliados.find((a) => a.id === certificado.afiliadoId) : null
  const medico = certificado ? medicos.find((m) => m.id === certificado.medicoId) : null
  const lugarTrabajo = afiliado?.lugarTrabajoId ? lugaresTrabajo.find((l) => l.id === afiliado.lugarTrabajoId) : null

  if (!certificado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Certificado no encontrado</p>
          <Button onClick={() => router.push("/certificados")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Certificados
          </Button>
        </div>
      </MainLayout>
    )
  }

  const isVigente = new Date(certificado.fechaVigencia) >= new Date()

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
              <h1 className="text-2xl font-bold tracking-tight">Certificado Sanitario</h1>
              <p className="font-mono text-muted-foreground">{certificado.folio}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Ver QR
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Datos del Certificado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Datos del Certificado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Folio</p>
                  <p className="font-mono font-bold">{certificado.folio}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estatus</p>
                  <Badge
                    variant={
                      certificado.estatus === "vigente" && isVigente
                        ? "default"
                        : certificado.estatus === "cancelado"
                          ? "destructive"
                          : "secondary"
                    }
                    className={certificado.estatus === "vigente" && isVigente ? "bg-green-600" : ""}
                  >
                    {certificado.estatus === "vigente" && !isVigente
                      ? "Vencido"
                      : certificado.estatus.charAt(0).toUpperCase() + certificado.estatus.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                  <p className="font-medium">
                    {new Date(certificado.fechaEmision).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vigente hasta</p>
                  <p className={`font-medium ${!isVigente ? "text-destructive" : ""}`}>
                    {new Date(certificado.fechaVigencia).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos del Afiliado */}
          {afiliado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Titular del Certificado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="font-medium">
                    {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CURP</p>
                  <p className="font-mono">{afiliado.curp}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Género</p>
                    <p className="font-medium capitalize">{afiliado.genero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ocupación</p>
                    <p className="font-medium">{afiliado.ocupacion || "No especificada"}</p>
                  </div>
                </div>
                <Link href={`/afiliados/${afiliado.id}`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver Expediente Completo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Datos del Médico */}
          {medico && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Médico Emisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    Dr(a). {medico.nombres} {medico.apellidoPaterno} {medico.apellidoMaterno}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cédula Profesional</p>
                    <p className="font-mono">{medico.cedulaProfesional}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Especialidad</p>
                    <p className="font-medium">{medico.especialidad}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lugar de Trabajo */}
          {lugarTrabajo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Lugar de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Establecimiento</p>
                  <p className="font-medium">{lugarTrabajo.nombre}</p>
                  <p className="text-sm text-muted-foreground">Código: {lugarTrabajo.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zona de Trabajo</p>
                  <p className="font-medium">{lugarTrabajo.zonaTrabajo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{lugarTrabajo.calle}</p>
                  <p className="text-sm text-muted-foreground">
                    {lugarTrabajo.colonia}, {lugarTrabajo.ciudad}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
