"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ClipboardSignature,
  HeartPulse,
  LayoutGrid,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import type {
  ClasificacionTriageALM,
  EstadoNotaALM,
  MedicoALM,
  PacienteALM,
  ServicioAtencionALM,
  SignosVitalesALM,
} from "@/lib/notas-medicas-alm";
import { medicosAlm, pacientesAlm } from "@/lib/notas-medicas-alm";

export type NotaMedicaALMFormValues = {
  folio?: string;
  fecha: string;
  servicio: ServicioAtencionALM;
  clasificacion: ClasificacionTriageALM;
  estado: EstadoNotaALM;
  pacienteId: string;
  medicoId: string;
  motivoConsulta: string;
  impresionDiagnostica: string;
  planManejo: string;
  seguimiento?: string;
  notasEnfermeria?: string;
  proximaCita?: string;
  signosVitales: SignosVitalesALM;
};

interface FormNotaMedicaALMProps {
  onSubmit: (data: NotaMedicaALMFormValues) => void;
  submitting?: boolean;
}

const servicioOptions: ServicioAtencionALM[] = [
  "Urgencias",
  "Consulta externa",
  "Hospitalización",
  "Seguimiento",
];

const clasificacionOptions: ClasificacionTriageALM[] = [
  "Rojo",
  "Naranja",
  "Amarillo",
  "Verde",
  "Azul",
];

const estadoOptions: EstadoNotaALM[] = [
  "abierta",
  "pendiente de estudios",
  "cerrada",
  "referida",
];

const formatDate = (value: string) => {
  if (!value) return "";
  return value.split("T")[0];
};

export function FormNotaMedicaALM({
  onSubmit,
  submitting = false,
}: FormNotaMedicaALMProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<NotaMedicaALMFormValues>({
    folio: "",
    fecha: formatDate(new Date().toISOString()),
    servicio: "Consulta externa",
    clasificacion: "Verde",
    estado: "abierta",
    pacienteId: pacientesAlm[0]?.id ?? "",
    medicoId: medicosAlm[0]?.id ?? "",
    motivoConsulta: "",
    impresionDiagnostica: "",
    planManejo: "",
    seguimiento: "",
    notasEnfermeria: "",
    proximaCita: "",
    signosVitales: {
      tensionArterial: "",
      frecuenciaCardiaca: "",
      frecuenciaRespiratoria: "",
      temperatura: "",
      saturacion: "",
      glucemia: "",
    },
  });

  const pacienteSeleccionado: PacienteALM | undefined = useMemo(
    () => pacientesAlm.find((p) => p.id === formData.pacienteId),
    [formData.pacienteId]
  );

  const medicoSeleccionado: MedicoALM | undefined = useMemo(
    () => medicosAlm.find((m) => m.id === formData.medicoId),
    [formData.medicoId]
  );

  const handleChange = <K extends keyof NotaMedicaALMFormValues>(
    field: K,
    value: NotaMedicaALMFormValues[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignoVital = (field: keyof SignosVitalesALM, value: string) => {
    setFormData((prev) => ({
      ...prev,
      signosVitales: { ...prev.signosVitales, [field]: value },
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!formData.pacienteId || !formData.medicoId) return;
    if (
      !formData.motivoConsulta.trim() ||
      !formData.impresionDiagnostica.trim()
    )
      return;
    if (!formData.planManejo.trim()) return;

    onSubmit({
      ...formData,
      fecha: formatDate(formData.fecha),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Datos generales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="folio">Folio (opcional)</Label>
            <Input
              id="folio"
              value={formData.folio}
              onChange={(e) => handleChange("folio", e.target.value)}
              placeholder="ALM-2025-0004"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={formatDate(formData.fecha)}
              onChange={(e) => handleChange("fecha", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Servicio</Label>
            <Select
              value={formData.servicio}
              onValueChange={(value) =>
                handleChange("servicio", value as ServicioAtencionALM)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {servicioOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Clasificación</Label>
            <Select
              value={formData.clasificacion}
              onValueChange={(value) =>
                handleChange("clasificacion", value as ClasificacionTriageALM)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Clasificación" />
              </SelectTrigger>
              <SelectContent>
                {clasificacionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                handleChange("estado", value as EstadoNotaALM)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado de la nota" />
              </SelectTrigger>
              <SelectContent>
                {estadoOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proximaCita">Próxima cita (opcional)</Label>
            <Input
              id="proximaCita"
              type="date"
              value={formData.proximaCita || ""}
              onChange={(e) => handleChange("proximaCita", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Participantes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Select
              value={formData.pacienteId}
              onValueChange={(value) => handleChange("pacienteId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientesAlm.map((paciente) => (
                  <SelectItem key={paciente.id} value={paciente.id}>
                    {paciente.nombre} ({paciente.curp})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pacienteSeleccionado ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  {pacienteSeleccionado.nombre}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {pacienteSeleccionado.curp}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {pacienteSeleccionado.edad} años
                </Badge>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Médico responsable</Label>
            <Select
              value={formData.medicoId}
              onValueChange={(value) => handleChange("medicoId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el médico" />
              </SelectTrigger>
              <SelectContent>
                {medicosAlm.map((medico) => (
                  <SelectItem key={medico.id} value={medico.id}>
                    {medico.nombre} — {medico.especialidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {medicoSeleccionado ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  {medicoSeleccionado.nombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  {medicoSeleccionado.especialidad}
                </p>
                <Badge variant="outline" className="mt-2">
                  {medicoSeleccionado.rol}
                </Badge>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="h-5 w-5 text-primary" />
            Signos vitales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="ta">Tensión arterial</Label>
            <Input
              id="ta"
              placeholder="120/80"
              value={formData.signosVitales.tensionArterial}
              onChange={(e) =>
                handleSignoVital("tensionArterial", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fc">Frecuencia cardiaca (lpm)</Label>
            <Input
              id="fc"
              placeholder="72"
              value={formData.signosVitales.frecuenciaCardiaca}
              onChange={(e) =>
                handleSignoVital("frecuenciaCardiaca", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fr">Frecuencia respiratoria (rpm)</Label>
            <Input
              id="fr"
              placeholder="16"
              value={formData.signosVitales.frecuenciaRespiratoria}
              onChange={(e) =>
                handleSignoVital("frecuenciaRespiratoria", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temp">Temperatura (°C)</Label>
            <Input
              id="temp"
              placeholder="36.5"
              value={formData.signosVitales.temperatura}
              onChange={(e) => handleSignoVital("temperatura", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spo2">Saturación</Label>
            <Input
              id="spo2"
              placeholder="98%"
              value={formData.signosVitales.saturacion}
              onChange={(e) => handleSignoVital("saturacion", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="glucemia">Glucemia capilar</Label>
            <Input
              id="glucemia"
              placeholder="95 mg/dL"
              value={formData.signosVitales.glucemia}
              onChange={(e) => handleSignoVital("glucemia", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardSignature className="h-5 w-5 text-primary" />
            Nota clínica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de consulta *</Label>
            <Textarea
              id="motivo"
              rows={3}
              value={formData.motivoConsulta}
              onChange={(e) => handleChange("motivoConsulta", e.target.value)}
              placeholder="Describir motivo o evento clínico..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="impresion">Impresión diagnóstica *</Label>
            <Textarea
              id="impresion"
              rows={3}
              value={formData.impresionDiagnostica}
              onChange={(e) =>
                handleChange("impresionDiagnostica", e.target.value)
              }
              placeholder="Hipótesis diagnóstica o hallazgos principales..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Plan de manejo *</Label>
            <Textarea
              id="plan"
              rows={3}
              value={formData.planManejo}
              onChange={(e) => handleChange("planManejo", e.target.value)}
              placeholder="Tratamiento, interconsultas, estudios, restricciones..."
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seguimiento">Seguimiento</Label>
              <Textarea
                id="seguimiento"
                rows={3}
                value={formData.seguimiento}
                onChange={(e) => handleChange("seguimiento", e.target.value)}
                placeholder="Indicaciones para el equipo ALM, criterios de alarma..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enfermeria">Notas de enfermería</Label>
              <Textarea
                id="enfermeria"
                rows={3}
                value={formData.notasEnfermeria}
                onChange={(e) =>
                  handleChange("notasEnfermeria", e.target.value)
                }
                placeholder="Observaciones de signos, insumos aplicados, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          <Thermometer className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Guardar nota ALM"}
        </Button>
      </div>
    </form>
  );
}
