"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"
import type { ConsultaClinica, Afiliado, Medico } from "@/lib/types"

interface ConsultasTableProps {
  consultas: ConsultaClinica[]
  afiliados: Afiliado[]
  medicos: Medico[]
}

export function ConsultasTable({ consultas, afiliados, medicos }: ConsultasTableProps) {
  const router = useRouter()

  const getAfiliado = (id: string) => afiliados.find((a) => a.id === id)
  const getMedico = (id: string) => medicos.find((m) => m.id === id)

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Afiliado</TableHead>
            <TableHead>CURP</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Tensión Arterial</TableHead>
            <TableHead>Diagnóstico</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No se encontraron consultas
              </TableCell>
            </TableRow>
          ) : (
            consultas.map((consulta) => {
              const afiliado = getAfiliado(consulta.afiliadoId)
              const medico = getMedico(consulta.medicoId)
              return (
                <TableRow key={consulta.id}>
                  <TableCell>{new Date(consulta.fecha).toLocaleDateString("es-MX")}</TableCell>
                  <TableCell className="font-medium">
                    {afiliado ? `${afiliado.nombres} ${afiliado.apellidoPaterno}` : "Afiliado no encontrado"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{afiliado?.curp || "-"}</TableCell>
                  <TableCell>{medico ? `Dr(a). ${medico.nombres} ${medico.apellidoPaterno}` : "-"}</TableCell>
                  <TableCell>{consulta.tensionArterial} mmHg</TableCell>
                  <TableCell className="max-w-xs truncate">{consulta.diagnostico}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/consultas/${consulta.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/afiliados/${consulta.afiliadoId}`)}
                        title="Ver expediente"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
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
