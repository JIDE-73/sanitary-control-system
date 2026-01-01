"use client"

import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, MapPin } from "lucide-react"
import type { LugarTrabajo } from "@/lib/types"

interface LugaresTableProps {
  lugares: LugarTrabajo[]
}

export function LugaresTable({ lugares }: LugaresTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre del Establecimiento</TableHead>
            <TableHead>Zona de Trabajo</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lugares.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                No se encontraron lugares de trabajo
              </TableCell>
            </TableRow>
          ) : (
            lugares.map((lugar) => (
              <TableRow key={lugar.id}>
                <TableCell className="font-mono font-medium">{lugar.codigo}</TableCell>
                <TableCell className="font-medium">{lugar.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {lugar.zonaTrabajo}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {lugar.calle}, {lugar.colonia}
                </TableCell>
                <TableCell>{lugar.telefono}</TableCell>
                <TableCell>
                  {lugar.ciudad}, {lugar.estado}
                </TableCell>
                <TableCell>
                  <Badge variant={lugar.estatus === "activo" ? "default" : "secondary"}>
                    {lugar.estatus.charAt(0).toUpperCase() + lugar.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/lugares-trabajo/${lugar.id}`)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/lugares-trabajo/${lugar.id}/editar`)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
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
