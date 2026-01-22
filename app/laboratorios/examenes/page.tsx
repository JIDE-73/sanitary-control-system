"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { request } from "@/lib/request";
import type { LaboratorioListado } from "@/lib/types";
import {
  CheckCircle2,
  FlaskConical,
  Loader2,
  RefreshCcw,
  TestTube,
  Trash2,
} from "lucide-react";

interface ExamCatalogItem {
  id: string;
  nombre: string;
}

export default function LaboratorioExamenesPage() {
  const [laboratorios, setLaboratorios] = useState<LaboratorioListado[]>([]);
  const [examenes, setExamenes] = useState<ExamCatalogItem[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [creatingExam, setCreatingExam] = useState(false);
  const [linkingExam, setLinkingExam] = useState(false);
  const [nombreExamen, setNombreExamen] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [mensajeCreacion, setMensajeCreacion] = useState<string | null>(null);
  const [mensajeRelacion, setMensajeRelacion] = useState<string | null>(null);
  const [deletingExams, setDeletingExams] = useState<Set<string>>(new Set());

  const extractArray = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.laboratories)) return response.laboratories;
    if (Array.isArray(response?.exams)) return response.exams;
    if (Array.isArray(response?.catalog)) return response.catalog;

    if (response && typeof response === "object") {
      const numericKeys = Object.keys(response).filter((k) => /^\d+$/.test(k));
      if (numericKeys.length) {
        return numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => (response as any)[k])
          .filter(Boolean);
      }
    }
    return [];
  };

  const loadLaboratorios = async () => {
    setLoadingLabs(true);
    try {
      const response = await request(
        "/sics/laboratories/getLaboratories",
        "GET"
      );
      const data = extractArray(response);
      const normalizados: LaboratorioListado[] = data.map((item: any) => ({
        id: item.id ?? item.labId ?? crypto.randomUUID(),
        nombre_comercial: item.nombre_comercial ?? item.nombre ?? "",
        rfc: item.rfc ?? "",
        certificado_organismo: Boolean(item.certificado_organismo),
        email_contacto: item.email_contacto ?? item.email ?? "",
      }));
      setLaboratorios(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los laboratorios", error);
      setLaboratorios([]);
    } finally {
      setLoadingLabs(false);
    }
  };

  const loadExamenes = async () => {
    setLoadingExams(true);
    try {
      const response = await request("/sics/exams/getExams", "GET");
      const data = extractArray(response);
      const normalizados: ExamCatalogItem[] = data.map((item: any) => ({
        id:
          item.id ??
          item.examenId ??
          item.examId ??
          item.examen_id ??
          crypto.randomUUID(),
        nombre: item.nombre ?? item.nombre_examen ?? item.descripcion ?? "",
      }));
      setExamenes(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los exámenes", error);
      setExamenes([]);
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    loadLaboratorios();
    loadExamenes();
  }, []);

  const handleCreateExam = async (event: React.FormEvent) => {
    event.preventDefault();
    const nombreLimpio = nombreExamen.trim();
    if (!nombreLimpio) return;
    setCreatingExam(true);
    setMensajeCreacion(null);

    try {
      const response = await request("/sics/exams/createExamCatalog", "POST", {
        nombre: nombreLimpio,
      });

      if (response.status >= 200 && response.status < 300) {
        const nuevoExamen: ExamCatalogItem = {
          id:
            response.id ??
            response.examenId ??
            response.examId ??
            crypto.randomUUID(),
          nombre: response.nombre ?? nombreLimpio,
        };
        setExamenes((prev) => {
          const existe = prev.find((ex) => ex.id === nuevoExamen.id);
          if (existe) {
            return prev.map((ex) =>
              ex.id === nuevoExamen.id ? nuevoExamen : ex
            );
          }
          return [nuevoExamen, ...prev];
        });
        setNombreExamen("");
        setMensajeCreacion("Examen creado correctamente.");
      } else {
        setMensajeCreacion(response.message || "No se pudo crear el examen.");
      }
    } catch (error) {
      console.error("Error al crear examen", error);
      setMensajeCreacion("No se pudo crear el examen.");
    } finally {
      setCreatingExam(false);
    }
  };

  const handleRelacion = async () => {
    if (!selectedLab || !selectedExam) return;
    setLinkingExam(true);
    setMensajeRelacion(null);
    try {
      const response = await request("/sics/laboratories/addExam", "PUT", {
        labId: selectedLab,
        examenId: selectedExam,
      });

      if (response.status >= 200 && response.status < 300) {
        setMensajeRelacion("Examen asignado al laboratorio.");
      } else {
        setMensajeRelacion(response.message || "No se pudo asignar el examen.");
      }
    } catch (error) {
      console.error("Error al asignar examen", error);
      setMensajeRelacion("No se pudo asignar el examen.");
    } finally {
      setLinkingExam(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!examId) return;
    setDeletingExams((prev) => new Set(prev).add(examId));
    try {
      const response = await request(
        `/sics/exams/deleteExamCatalog/${examId}`,
        "POST"
      );

      if (response.status >= 200 && response.status < 300) {
        setExamenes((prev) => prev.filter((ex) => ex.id !== examId));
        // Si el examen eliminado estaba seleccionado, limpiar la selección
        if (selectedExam === examId) {
          setSelectedExam("");
        }
      } else {
        console.error(
          "Error al eliminar examen:",
          response.message || "No se pudo eliminar el examen."
        );
      }
    } catch (error) {
      console.error("Error al eliminar examen", error);
    } finally {
      setDeletingExams((prev) => {
        const next = new Set(prev);
        next.delete(examId);
        return next;
      });
    }
  };

  const puedeRelacionar = useMemo(
    () => Boolean(selectedLab && selectedExam && !linkingExam),
    [linkingExam, selectedExam, selectedLab]
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Exámenes de laboratorio
            </h1>
            <p className="text-muted-foreground">
              Crear catálogo de exámenes y asignarlos a laboratorios
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                loadLaboratorios();
                loadExamenes();
              }}
              disabled={loadingLabs || loadingExams}
            >
              {loadingLabs || loadingExams ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Actualizar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TestTube className="h-5 w-5 text-primary" />
                Crear examen
              </CardTitle>
              <CardDescription>
                Solo se envía el campo nombre al catálogo de exámenes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreExamen">Nombre del examen</Label>
                  <Input
                    id="nombreExamen"
                    placeholder="Ej. Biometría hemática"
                    value={nombreExamen}
                    onChange={(e) => setNombreExamen(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={creatingExam}>
                    {creatingExam ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Guardar examen
                  </Button>
                  {mensajeCreacion && (
                    <span className="text-sm text-muted-foreground">
                      {mensajeCreacion}
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5 text-primary" />
                Asignar examen a laboratorio
              </CardTitle>
              <CardDescription>
                Selecciona un laboratorio y un examen disponibles para crear la
                relación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Laboratorio</Label>
                <Select
                  value={selectedLab}
                  onValueChange={setSelectedLab}
                  disabled={loadingLabs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {laboratorios.map((lab) => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.nombre_comercial || "Laboratorio sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Examen</Label>
                <Select
                  value={selectedExam}
                  onValueChange={setSelectedExam}
                  disabled={loadingExams}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar examen" />
                  </SelectTrigger>
                  <SelectContent>
                    {examenes.map((examen) => (
                      <SelectItem key={examen.id} value={examen.id}>
                        {examen.nombre || "Examen sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  disabled={!puedeRelacionar}
                  onClick={handleRelacion}
                >
                  {linkingExam ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Asignar
                </Button>
                {mensajeRelacion && (
                  <span className="text-sm text-muted-foreground">
                    {mensajeRelacion}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exámenes disponibles</CardTitle>
            <CardDescription>
              Catálogo cargado desde la API de exámenes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExams ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando exámenes...
              </div>
            ) : examenes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay exámenes registrados todavía.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {examenes.map((examen) => {
                  const isDeleting = deletingExams.has(examen.id);
                  return (
                    <li
                      key={examen.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span>{examen.nombre || "Examen sin nombre"}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExam(examen.id)}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
