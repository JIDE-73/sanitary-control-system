"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Building2, MapPin, Phone, Users } from "lucide-react"
import { lugaresTrabajo, afiliados } from "@/lib/mock-data"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LugarDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const lugar = lugaresTrabajo.find((l) => l.id === id)
  const afiliadosLugar = afiliados.filter((a) => a.lugarTrabajoId === id)

  if (!lugar) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-4">Lugar de trabajo no encontrado</p>
          <Button onClick={() => router.push("/lugares-trabajo")}>
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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{lugar.nombre}</h1>
                <Badge variant="outline" className="font-mono">
                  {lugar.codigo}
                </Badge>
              </div>
              <p className="text-muted-foreground">{lugar.zonaTrabajo}</p>
            </div>
          </div>
          <Link href={`/lugares-trabajo/${id}/editar`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Información del Establecimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono font-medium">{lugar.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estatus</p>
                  <Badge variant={lugar.estatus === "activo" ? "default" : "secondary"}>
                    {lugar.estatus.charAt(0).toUpperCase() + lugar.estatus.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{lugar.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zona de Trabajo</p>
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {lugar.zonaTrabajo}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Dirección y Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="font-medium">{lugar.calle}</p>
                <p className="text-sm text-muted-foreground">
                  {lugar.colonia}, C.P. {lugar.codigoPostal}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lugar.ciudad}, {lugar.estado}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{lugar.telefono}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Afiliados en este establecimiento ({afiliadosLugar.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {afiliadosLugar.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay afiliados registrados en este establecimiento
                </p>
              ) : (
                <div className="space-y-2">
                  {afiliadosLugar.map((afiliado) => (
                    <div key={afiliado.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">
                          {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {afiliado.ocupacion || "Sin ocupación"} | {afiliado.curp}
                        </p>
                      </div>
                      <Badge variant={afiliado.estatus === "activo" ? "default" : "secondary"}>
                        {afiliado.estatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
