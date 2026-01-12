"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { TestTube, User, Save, ArrowLeft, Search } from "lucide-react";
import type { ExamenClinico } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

interface FormExamenProps {
  onSubmit: (data: Partial<ExamenClinico> & { examenId?: string }) => void;
  submitting?: boolean;
}

type AfiliadoResultado = {
  personaId: string;
  nombreCompleto: string;
  curp: string;
  numeroAfiliacion?: string;
  genero?: string;
};

type ExamCatalogItem = {
  id: string;
  nombre: string;
};

type ExamenFormData = {
  afiliadoId: string;
  examenId?: string;
  fechaOrden?: string;
  fechaProximoExamen?: string;
  dilucionVDRL?: "positivo" | "negativo" | "pendiente";
  observaciones?: string;
};

const normalizeAfiliado = (item: any): AfiliadoResultado => {
  const persona = item?.persona ?? {};
  const nombre = `${persona.nombre ?? ""} ${persona.apellido_paterno ?? ""} ${
    persona.apellido_materno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();

  return {
    personaId: item?.persona_id ?? persona?.id ?? "",
    nombreCompleto: nombre || "Sin nombre",
    curp: persona?.curp ?? "",
    numeroAfiliacion: item?.no_Afiliacion ?? item?.no_afiliacion ?? "",
    genero: persona?.genero,
  };
};

const extractArray = (response: any) => {
  const candidate = Array.isArray(response?.data)
    ? response.data
    : response?.data ?? response;

  if (Array.isArray(candidate)) return candidate;

  if (candidate && typeof candidate === "object") {
    const numericKeys = Object.keys(candidate).filter((k) => /^\d+$/.test(k));
    if (numericKeys.length) {
      return numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => (candidate as any)[k])
        .filter(Boolean);
    }

    if (
      "persona" in candidate ||
      "persona_id" in candidate ||
      "no_Afiliacion" in candidate ||
      "no_afiliacion" in candidate
    ) {
      return [candidate];
    }
    if ("exams" in candidate && Array.isArray((candidate as any).exams)) {
      return (candidate as any).exams;
    }
  }

  return [];
};

const normalizeExam = (item: any): ExamCatalogItem => ({
  id:
    item?.id ??
    item?.examenId ??
    item?.examId ??
    item?.examen_id ??
    crypto.randomUUID(),
  nombre:
    item?.nombre ??
    item?.nombre_examen ??
    item?.descripcion ??
    "Examen sin nombre",
});

export function FormExamen({ onSubmit, submitting = false }: FormExamenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const afiliadoIdParam = searchParams.get("afiliado");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAfiliado, setSelectedAfiliado] =
    useState<AfiliadoResultado | null>(null);
  const [searchResults, setSearchResults] = useState<AfiliadoResultado[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [exams, setExams] = useState<ExamCatalogItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [formData, setFormData] = useState<ExamenFormData>({
    afiliadoId: afiliadoIdParam || "",
    fechaOrden: new Date().toISOString().split("T")[0],
  });

  const loadExams = async () => {
    setLoadingExams(true);
    try {
      const response = await request("/sics/exams/getExams", "GET");
      const data = extractArray(response);
      const normalizados = data.map(normalizeExam);
      setExams(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los exámenes", error);
      toast({
        title: "No se pudieron cargar los exámenes",
        description: "Vuelve a intentarlo en unos momentos.",
        variant: "destructive",
      });
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const term = (query ?? searchQuery).trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const response = await request(
        `/sics/affiliates/getAffiliateById/${encodeURIComponent(term)}`,
        "GET"
      );
      const data = extractArray(response);
      const normalizados = data.map(normalizeAfiliado);

      setSearchResults(normalizados);

      if (!normalizados.length) {
        toast({
          title: "No se encontraron afiliados",
          description: "Intenta con otro criterio de búsqueda.",
        });
      }
    } catch (error) {
      console.error("Error al buscar afiliado", error);
      toast({
        title: "Error al buscar afiliado",
        description: "No se pudo completar la búsqueda. Intenta nuevamente.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const loadAfiliadoInicial = async () => {
    if (!afiliadoIdParam) return;
    await handleSearch(afiliadoIdParam);
  };

  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAfiliadoInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [afiliadoIdParam]);

  useEffect(() => {
    if (afiliadoIdParam && searchResults.length) {
      const encontrado = searchResults.find(
        (a) => a.personaId === afiliadoIdParam
      );
      if (encontrado) {
        setSelectedAfiliado(encontrado);
        setFormData((prev) => ({ ...prev, afiliadoId: encontrado.personaId }));
      }
    }
  }, [afiliadoIdParam, searchResults]);

  const handleSelectAfiliado = (afiliado: AfiliadoResultado) => {
    setSelectedAfiliado(afiliado);
    setFormData((prev) => ({ ...prev, afiliadoId: afiliado.personaId }));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleChange = (field: keyof ExamenFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedAfiliado) {
      toast({
        title: "Selecciona un afiliado",
        description: "Debes elegir un afiliado antes de ordenar un examen.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.examenId) {
      toast({
        title: "Selecciona un examen",
        description: "Debes elegir el examen a realizar.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.fechaOrden) {
      toast({
        title: "Falta la fecha de orden",
        description: "Indica cuándo se expidió la orden.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.dilucionVDRL) {
      toast({
        title: "Selecciona el resultado de dilución",
        description: "Indica si la dilución VDRL es positiva o negativa.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  const examPlaceholder = loadingExams
    ? "Cargando exámenes..."
    : !exams.length
    ? "Sin exámenes disponibles"
    : "Seleccionar examen";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda de Afiliado */}
      {!selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Buscar Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por CURP, número de afiliado o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleSearch())
                }
              />
              <Button
                type="button"
                onClick={() => handleSearch()}
                disabled={loadingSearch}
              >
                {loadingSearch ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((afiliado) => (
                  <div
                    key={afiliado.personaId}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectAfiliado(afiliado)}
                  >
                    <div>
                      <p className="font-medium">{afiliado.nombreCompleto}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {afiliado.curp}
                      </p>
                      {afiliado.numeroAfiliacion ? (
                        <p className="text-xs text-muted-foreground">
                          Afiliación: {afiliado.numeroAfiliacion}
                        </p>
                      ) : null}
                    </div>
                    <Button type="button" size="sm">
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Datos del Afiliado */}
      {selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Datos del Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {selectedAfiliado.nombreCompleto}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CURP</p>
                  <p className="font-mono font-medium">
                    {selectedAfiliado.curp}
                  </p>
                </div>
                {selectedAfiliado.genero ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Género</p>
                    <p className="font-medium capitalize">
                      {selectedAfiliado.genero}
                    </p>
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAfiliado(null)}
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datos del Examen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="h-5 w-5 text-primary" />
            Datos del Examen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="examenId">Examen *</Label>
            <Select
              value={formData.examenId || ""}
              onValueChange={(value) => handleChange("examenId", value)}
              disabled={loadingExams || !exams.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={examPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaOrden">Fecha de Orden *</Label>
            <Input
              id="fechaOrden"
              type="date"
              value={formData.fechaOrden || ""}
              onChange={(e) => handleChange("fechaOrden", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaProximoExamen">Fecha Próximo Examen</Label>
            <Input
              id="fechaProximoExamen"
              type="date"
              value={formData.fechaProximoExamen || ""}
              onChange={(e) =>
                handleChange("fechaProximoExamen", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dilucionVDRL">Dilución VDRL *</Label>
            <Select
              value={formData.dilucionVDRL || ""}
              onValueChange={(value) => handleChange("dilucionVDRL", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positivo">Positivo</SelectItem>
                <SelectItem value="negativo">Negativo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones || ""}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Indicaciones especiales para el laboratorio..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={!selectedAfiliado || submitting}>
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Ordenar Examen"}
        </Button>
      </div>
    </form>
  );
}
