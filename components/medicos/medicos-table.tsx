"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Award, CheckCircle, XCircle } from "lucide-react"
import type { Medico } from "@/lib/types"

interface MedicosTableProps {
  medicos: Medico[]
}

export function MedicosTable({ medicos }: MedicosTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cédula Profesional</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Firma Digital</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medicos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                No se encontraron médicos
              </TableCell>
            </TableRow>
          ) : (
            medicos.map((medico) => (
              <TableRow key={medico.id}>
                <TableCell className="font-mono">{medico.cedulaProfesional}</TableCell>
                <TableCell className="font-medium">
                  Dr(a). {medico.nombres} {medico.apellidoPaterno} {medico.apellidoMaterno}
                </TableCell>
                <TableCell>{medico.especialidad}</TableCell>
                <TableCell>{medico.telefono}</TableCell>
                <TableCell className="text-sm">{medico.email}</TableCell>
                <TableCell>
                  {medico.firmaDigitalUrl ? (
                    <Badge variant="outline" className="gap-1 bg-accent/10 text-accent border-accent/30">
                      <CheckCircle className="h-3 w-3" />
                      Cargada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
                      <XCircle className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={medico.estatus === "activo" ? "default" : "secondary"}>
                    {medico.estatus.charAt(0).toUpperCase() + medico.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/medicos/${medico.id}`)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/medicos/${medico.id}/editar`)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Generar credencial">
                      <Award className="h-4 w-4" />
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
