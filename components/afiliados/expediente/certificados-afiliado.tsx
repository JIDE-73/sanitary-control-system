import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, QrCode, Calendar, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import type { CertificadoSanitario, Medico } from "@/lib/types"

interface CertificadosAfiliadoProps {
  certificados: CertificadoSanitario[]
  medicos: Medico[]
}

export function CertificadosAfiliado({ certificados, medicos }: CertificadosAfiliadoProps) {
  const getMedico = (medicoId: string) => medicos.find((m) => m.id === medicoId)

  const getEstatusIcon = (estatus: string) => {
    switch (estatus) {
      case "vigente":
        return <CheckCircle className="h-4 w-4" />
      case "vencido":
        return <AlertTriangle className="h-4 w-4" />
      case "cancelado":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getEstatusVariant = (estatus: string) => {
    switch (estatus) {
      case "vigente":
        return "default"
      case "vencido":
        return "secondary"
      case "cancelado":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (certificados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Certificados Sanitarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay certificados emitidos</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Certificados Sanitarios
        </CardTitle>
        <CardDescription>
          {certificados.length} certificado{certificados.length !== 1 ? "s" : ""} emitido
          {certificados.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificados.map((certificado) => {
            const medico = getMedico(certificado.medicoId)
            const diasRestantes = Math.ceil(
              (new Date(certificado.fechaVigencia).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <div
                key={certificado.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">{certificado.folio}</p>
                    <Badge
                      variant={
                        getEstatusVariant(certificado.estatus) as "default" | "secondary" | "destructive" | "outline"
                      }
                      className={certificado.estatus === "vigente" ? "bg-accent text-accent-foreground" : ""}
                    >
                      {getEstatusIcon(certificado.estatus)}
                      <span className="ml-1">
                        {certificado.estatus.charAt(0).toUpperCase() + certificado.estatus.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Emitido: {new Date(certificado.fechaEmision).toLocaleDateString("es-MX")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Vigencia: {new Date(certificado.fechaVigencia).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Emitido por: Dr(a). {medico ? `${medico.nombres} ${medico.apellidoPaterno}` : "No disponible"}
                  </p>
                  {certificado.estatus === "vigente" && diasRestantes <= 7 && (
                    <p className="text-sm text-warning font-medium">
                      Vence en {diasRestantes} día{diasRestantes !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <QrCode className="mr-1 h-4 w-4" />
                    Ver QR
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
