import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "certificado",
    description: "Certificado emitido para Alberto García",
    time: "Hace 5 min",
    status: "success",
  },
  {
    id: 2,
    type: "examen",
    description: "Resultado de VDRL registrado - Negativo",
    time: "Hace 15 min",
    status: "success",
  },
  {
    id: 3,
    type: "afiliado",
    description: "Nuevo afiliado registrado: María López",
    time: "Hace 30 min",
    status: "info",
  },
  {
    id: 4,
    type: "alerta",
    description: "Certificado por vencer: Juan Pérez",
    time: "Hace 1 hora",
    status: "warning",
  },
  {
    id: 5,
    type: "consulta",
    description: "Consulta clínica realizada por Dra. Sánchez",
    time: "Hace 2 horas",
    status: "info",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge
                variant={
                  activity.status === "success" ? "default" : activity.status === "warning" ? "secondary" : "outline"
                }
                className={
                  activity.status === "success"
                    ? "bg-accent text-accent-foreground"
                    : activity.status === "warning"
                      ? "bg-warning text-warning-foreground"
                      : ""
                }
              >
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
