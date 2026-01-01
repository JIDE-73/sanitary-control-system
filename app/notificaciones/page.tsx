import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  Clock,
  CheckCircle,
  Trash2,
  CheckCheck,
  TestTube,
} from "lucide-react"

// Mock data for notifications
const notificaciones = [
  {
    id: "1",
    tipo: "certificado_vencimiento",
    titulo: "Certificado próximo a vencer",
    mensaje: "El certificado SICS-2024-00001 de Alberto García vence en 3 días",
    fecha: "2024-12-28T10:30:00",
    leida: false,
    prioridad: "alta",
    enlace: "/certificados/1",
  },
  {
    id: "2",
    tipo: "examen_pendiente",
    titulo: "Examen pendiente de resultado",
    mensaje: "El examen VDRL de Laura Morales lleva 5 días sin resultado",
    fecha: "2024-12-27T14:15:00",
    leida: false,
    prioridad: "media",
    enlace: "/examenes",
  },
  {
    id: "3",
    tipo: "nuevo_afiliado",
    titulo: "Nuevo afiliado registrado",
    mensaje: "Enrique Rosas ha sido registrado como afiliado pendiente",
    fecha: "2024-12-26T09:00:00",
    leida: true,
    prioridad: "baja",
    enlace: "/afiliados/3",
  },
  {
    id: "4",
    tipo: "examen_vencimiento",
    titulo: "Examen próximo a vencer",
    mensaje: "El examen VIH de Alberto García vence el 17 de junio de 2025",
    fecha: "2024-12-25T11:45:00",
    leida: true,
    prioridad: "media",
    enlace: "/afiliados/1",
  },
]

const getIconByTipo = (tipo: string) => {
  switch (tipo) {
    case "certificado_vencimiento":
      return <FileText className="h-5 w-5" />
    case "examen_pendiente":
      return <TestTube className="h-5 w-5" />
    case "examen_vencimiento":
      return <Calendar className="h-5 w-5" />
    case "nuevo_afiliado":
      return <User className="h-5 w-5" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case "alta":
      return "text-destructive"
    case "media":
      return "text-amber-600"
    default:
      return "text-muted-foreground"
  }
}

export default function NotificacionesPage() {
  const noLeidas = notificaciones.filter((n) => !n.leida)
  const todas = notificaciones

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
            <p className="text-muted-foreground">
              {noLeidas.length > 0
                ? `Tienes ${noLeidas.length} notificación${noLeidas.length !== 1 ? "es" : ""} sin leer`
                : "No tienes notificaciones pendientes"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todas">
          <TabsList>
            <TabsTrigger value="todas">Todas ({todas.length})</TabsTrigger>
            <TabsTrigger value="no-leidas">
              Sin leer
              {noLeidas.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {noLeidas.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4 mt-6">
            {todas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No hay notificaciones</p>
                  <p className="text-muted-foreground">Las notificaciones aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              todas.map((notificacion) => (
                <Card key={notificacion.id} className={!notificacion.leida ? "border-primary/50 bg-primary/5" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${getPrioridadColor(notificacion.prioridad)}`}>
                        {getIconByTipo(notificacion.tipo)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-medium ${!notificacion.leida ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {notificacion.titulo}
                          </p>
                          <div className="flex items-center gap-2">
                            {!notificacion.leida && <Badge variant="default">Nueva</Badge>}
                            {notificacion.prioridad === "alta" && (
                              <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Urgente
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(notificacion.fecha).toLocaleString("es-MX", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Marcar leída
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="no-leidas" className="space-y-4 mt-6">
            {noLeidas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <p className="text-lg font-medium">Todo al día</p>
                  <p className="text-muted-foreground">No tienes notificaciones pendientes</p>
                </CardContent>
              </Card>
            ) : (
              noLeidas.map((notificacion) => (
                <Card key={notificacion.id} className="border-primary/50 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${getPrioridadColor(notificacion.prioridad)}`}>
                        {getIconByTipo(notificacion.tipo)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notificacion.titulo}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Nueva</Badge>
                            {notificacion.prioridad === "alta" && (
                              <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Urgente
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(notificacion.fecha).toLocaleString("es-MX", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Marcar leída
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
