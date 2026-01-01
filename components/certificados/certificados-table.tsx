"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, QrCode, Printer } from "lucide-react"
import type { CertificadoSanitario, Afiliado, Medico } from "@/lib/types"

interface CertificadosTableProps {
  certificados: CertificadoSanitario[]
  afiliados: Afiliado[]
  medicos: Medico[]
}

const estatusVariants = {
  vigente: "default",
  vencido: "destructive",
  cancelado: "secondary",
} as const

export function CertificadosTable({ certificados, afiliados, medicos }: CertificadosTableProps) {
  const router = useRouter()

  const getAfiliadoNombre = (afiliadoId: string) => {
    const afiliado = afiliados.find((a) => a.id === afiliadoId)
    return afiliado ? `${afiliado.nombres} ${afiliado.apellidoPaterno} ${afiliado.apellidoMaterno}` : "Desconocido"
  }

  const getMedicoNombre = (medicoId: string) => {
    const medico = medicos.find((m) => m.id === medicoId)
    return medico ? `Dr(a). ${medico.nombres} ${medico.apellidoPaterno}` : "Desconocido"
  }

  const isExpiringSoon = (fechaVigencia: string) => {
    const vigencia = new Date(fechaVigencia)
    const today = new Date()
    const diffDays = Math.ceil((vigencia.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
            <TableHead>Afiliado</TableHead>
            <TableHead>Médico Emisor</TableHead>
            <TableHead>Fecha Emisión</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificados.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No se encontraron certificados
              </TableCell>
            </TableRow>
          ) : (
            certificados.map((certificado) => (
              <TableRow key={certificado.id}>
                <TableCell className="font-mono text-sm font-medium">{certificado.folio}</TableCell>
                <TableCell>{getAfiliadoNombre(certificado.afiliadoId)}</TableCell>
                <TableCell>{getMedicoNombre(certificado.medicoId)}</TableCell>
                <TableCell>{new Date(certificado.fechaEmision).toLocaleDateString("es-MX")}</TableCell>
                <TableCell>
                  <span className={isExpiringSoon(certificado.fechaVigencia) ? "text-warning font-medium" : ""}>
                    {new Date(certificado.fechaVigencia).toLocaleDateString("es-MX")}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={estatusVariants[certificado.estatus]}>
                    {certificado.estatus.charAt(0).toUpperCase() + certificado.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/certificados/${certificado.id}`)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/certificados/verificar?folio=${certificado.folio}`)}
                      title="Verificar QR"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Imprimir">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Descargar PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
