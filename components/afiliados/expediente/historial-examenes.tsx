import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TestTube, CheckCircle, XCircle, Clock } from "lucide-react"
import type { ExamenClinico } from "@/lib/types"

interface HistorialExamenesProps {
  examenes: ExamenClinico[]
}

export function HistorialExamenes({ examenes }: HistorialExamenesProps) {
  if (examenes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Historial de Exámenes Clínicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No hay exámenes clínicos registrados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          Historial de Exámenes Clínicos
        </CardTitle>
        <CardDescription>
          {examenes.length} examen{examenes.length !== 1 ? "es" : ""} registrado
          {examenes.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Examen</TableHead>
              <TableHead>Fecha de Orden</TableHead>
              <TableHead>Fecha Resultado</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Dilución VDRL</TableHead>
              <TableHead>Próximo Examen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examenes.map((examen) => (
              <TableRow key={examen.id}>
                <TableCell className="font-medium">{examen.tipoExamen}</TableCell>
                <TableCell>{new Date(examen.fechaOrden).toLocaleDateString("es-MX")}</TableCell>
                <TableCell>
                  {examen.fechaResultado ? (
                    new Date(examen.fechaResultado).toLocaleDateString("es-MX")
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {examen.resultadoVDRL ? (
                    <Badge
                      variant={examen.resultadoVDRL === "negativo" ? "default" : "destructive"}
                      className={examen.resultadoVDRL === "negativo" ? "bg-accent text-accent-foreground" : ""}
                    >
                      {examen.resultadoVDRL === "negativo" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {examen.resultadoVDRL.charAt(0).toUpperCase() + examen.resultadoVDRL.slice(1)}
                    </Badge>
                  ) : examen.resultado ? (
                    <span className="text-sm">{examen.resultado}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {examen.tipoExamen === "VDRL" && examen.dilucionVDRL ? (
                    <span className="font-mono text-sm">{examen.dilucionVDRL}</span>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {examen.fechaProximoExamen ? (
                    <span
                      className={new Date(examen.fechaProximoExamen) < new Date() ? "text-destructive font-medium" : ""}
                    >
                      {new Date(examen.fechaProximoExamen).toLocaleDateString("es-MX")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
