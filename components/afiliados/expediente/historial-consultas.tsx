import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Calendar,
  Activity,
  FileText,
  MessageSquare,
} from "lucide-react";
import type { ConsultaClinica, Medico } from "@/lib/types";

interface HistorialConsultasProps {
  consultas: ConsultaClinica[];
  medicos: Medico[];
}

export function HistorialConsultas({
  consultas,
  medicos,
}: HistorialConsultasProps) {
  const getMedico = (medicoId: string) =>
    medicos.find((m) => m.id === medicoId);

  if (consultas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Historial de notas médicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No hay notas médicas registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Historial de notas médicas
        </CardTitle>
        <CardDescription>
          {consultas.length === 1
            ? "1 nota médica registrada"
            : `${consultas.length} notas médicas registradas`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {consultas.map((consulta) => {
            const medico = getMedico(consulta.medicoId);
            return (
              <div
                key={consulta.id}
                className="rounded-lg border border-border p-4 space-y-4"
              >
                {/* Header de la consulta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {medico
                          ? `Dr(a). ${medico.nombres} ${medico.apellidoPaterno}`
                          : "Médico no encontrado"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {medico?.especialidad}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(consulta.fecha).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Detalles de la consulta */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <Activity className="h-4 w-4 mt-1 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tensión Arterial
                      </p>
                      <p className="font-medium">
                        {consulta.tensionArterial} mmHg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Diagnóstico
                      </p>
                      <p className="font-medium">{consulta.diagnostico}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Tratamiento</p>
                    <p className="text-sm">{consulta.tratamiento}</p>
                  </div>
                  {consulta.comentarios && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Comentarios
                        </p>
                        <p className="text-sm">{consulta.comentarios}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exámenes de la consulta */}
                {consulta.examenes && consulta.examenes.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium mb-2">
                      Exámenes ordenados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {consulta.examenes.map((examen) => (
                        <Badge key={examen.id} variant="outline">
                          {examen.tipoExamen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
