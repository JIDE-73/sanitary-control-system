"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, CheckCircle, XCircle, Clock } from "lucide-react"
import type { ExamenClinico, Afiliado } from "@/lib/types"

interface ExamenesTableProps {
  examenes: ExamenClinico[]
  afiliados: Afiliado[]
}

export function ExamenesTable({ examenes, afiliados }: ExamenesTableProps) {
  const router = useRouter()

  const getAfiliado = (id: string) => afiliados.find((a) => a.id === id)

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha Orden</TableHead>
            <TableHead>Afiliado</TableHead>
            <TableHead>CURP</TableHead>
            <TableHead>Tipo de Examen</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead>Dilución VDRL</TableHead>
            <TableHead>Próximo Examen</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {examenes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                No se encontraron exámenes
              </TableCell>
            </TableRow>
          ) : (
            examenes.map((examen) => {
              const afiliado = getAfiliado(examen.afiliadoId)
              return (
                <TableRow key={examen.id}>
                  <TableCell>{new Date(examen.fechaOrden).toLocaleDateString("es-MX")}</TableCell>
                  <TableCell className="font-medium">
                    {afiliado ? `${afiliado.nombres} ${afiliado.apellidoPaterno}` : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{afiliado?.curp || "-"}</TableCell>
                  <TableCell>{examen.tipoExamen}</TableCell>
                  <TableCell>
                    {examen.resultadoVDRL ? (
                      <Badge
                        variant={examen.resultadoVDRL === "negativo" ? "default" : "destructive"}
                        className={examen.resultadoVDRL === "negativo" ? "bg-accent text-accent-foreground" : ""}
                      >
                        {examen.resultadoVDRL === "negativo" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : examen.resultadoVDRL === "positivo" ? (
                          <XCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {examen.resultadoVDRL.charAt(0).toUpperCase() + examen.resultadoVDRL.slice(1)}
                      </Badge>
                    ) : examen.resultado ? (
                      <span>{examen.resultado}</span>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {examen.dilucionVDRL ? (
                      <span className="font-mono">{examen.dilucionVDRL}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {examen.fechaProximoExamen ? new Date(examen.fechaProximoExamen).toLocaleDateString("es-MX") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/afiliados/${examen.afiliadoId}`)}
                        title="Ver expediente"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!examen.fechaResultado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/examenes/${examen.id}/resultado`)}
                          title="Registrar resultado"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
