"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import {
  FormNotaMedicaALM,
  type NotaMedicaALMFormValues,
} from "@/components/notas-medicas-alm/form-nota-alm";
import {
  generateAlmFolio,
  loadNotasAlm,
  medicosAlm,
  notasAlmSeed,
  PacienteALM,
  pacientesAlm,
  persistNotasAlm,
  type NotaMedicaALM,
} from "@/lib/notas-medicas-alm";
import { useToast } from "@/hooks/use-toast";

function NuevaNotaALMContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const buildId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `alm-${Date.now()}`;

  const handleSubmit = (data: NotaMedicaALMFormValues) => {
    const paciente: PacienteALM | undefined = pacientesAlm.find(
      (p) => p.id === data.pacienteId
    );
    const medico = medicosAlm.find((m) => m.id === data.medicoId);

    const nota: NotaMedicaALM = {
      id: buildId(),
      folio: data.folio?.trim() || generateAlmFolio(),
      fecha: data.fecha,
      servicio: data.servicio,
      clasificacion: data.clasificacion,
      estado: data.estado,
      pacienteId: data.pacienteId,
      pacienteNombre: paciente?.nombre ?? "Paciente sin nombre",
      pacienteCurp: paciente?.curp ?? "",
      medicoId: data.medicoId,
      medicoNombre: medico?.nombre ?? "Médico sin nombre",
      motivoConsulta: data.motivoConsulta.trim(),
      impresionDiagnostica: data.impresionDiagnostica.trim(),
      planManejo: data.planManejo.trim(),
      seguimiento: data.seguimiento?.trim(),
      notasEnfermeria: data.notasEnfermeria?.trim(),
      proximaCita: data.proximaCita || undefined,
      signosVitales: data.signosVitales,
    };

    setSaving(true);
    try {
      const prevNotas = loadNotasAlm();
      const updated = [nota, ...prevNotas];
      persistNotasAlm(updated);
      toast({
        title: "Nota ALM creada",
        description: "La nota quedó guardada de manera local (sin backend).",
      });
      router.push("/notas-medicas-alm");
    } catch (error) {
      console.error("No se pudo guardar la nota ALM", error);
      persistNotasAlm(notasAlmSeed);
      toast({
        title: "No se pudo guardar",
        description: "Ocurrió un problema inesperado. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return <FormNotaMedicaALM onSubmit={handleSubmit} submitting={saving} />;
}

export default function NuevaNotaALMPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva nota médica ALM
          </h1>
          <p className="text-muted-foreground">
            Captura específica para el esquema ALM (sin integración a backend)
          </p>
        </div>

        <Suspense fallback={<div>Cargando formulario...</div>}>
          <NuevaNotaALMContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
