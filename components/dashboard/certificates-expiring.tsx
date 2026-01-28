import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw } from "lucide-react"

const expiringCertificates = [
  {
    id: 1,
    name: "Alberto García Pérez",
    folio: "SICS-2024-00001",
    expiresIn: 3,
    lugarTrabajo: "Restaurante El Buen Sabor",
  },
  {
    id: 2,
    name: "Laura Morales López",
    folio: "SICS-2024-00045",
    expiresIn: 5,
    lugarTrabajo: "Hotel Plaza Marina",
  },
  {
    id: 3,
    name: "Carlos Ramírez Díaz",
    folio: "SICS-2024-00089",
    expiresIn: 7,
    lugarTrabajo: "Bar La Cantina",
  },
]

export function CertificatesExpiring() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle>Certificados por Vencer</CardTitle>
        </div>
        <CardDescription>Próximos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringCertificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{cert.name}</p>
                <p className="text-xs text-muted-foreground">{cert.folio}</p>
                <p className="text-xs text-muted-foreground">{cert.lugarTrabajo}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  {cert.expiresIn} días
                </Badge>
                <Button size="sm" variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Renovar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
