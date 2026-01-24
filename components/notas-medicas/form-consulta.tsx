"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
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
import {
  Stethoscope,
  User,
  Activity,
  FileText,
  Save,
  ArrowLeft,
  Search,
  Thermometer,
  HeartPulse,
} from "lucide-react";
import type { ConsultaClinica } from "@/lib/types";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

interface FormNotaMedicaProps {
  onSubmit: (data: Partial<ConsultaClinica>) => void;
  submitting?: boolean;
}

type AfiliadoResultado = {
  personaId: string;
  nombreCompleto: string;
  curp: string;
  numeroAfiliacion?: string;
  genero?: string;
};

type MedicoOpcion = {
  id: string;
  nombreCompleto: string;
  especialidad?: string;
  habilitado?: boolean;
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

const normalizeMedico = (item: any): MedicoOpcion => {
  const persona = item?.persona ?? {};
  const nombre = `${persona.nombre ?? ""} ${persona.apellido_paterno ?? ""} ${
    persona.apellido_materno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: item?.persona_id ?? persona?.id ?? "",
    nombreCompleto: nombre || "Médico sin nombre",
    especialidad: item?.especialidad,
    habilitado: Boolean(item?.habilitado_para_firmar),
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
  }

  return [];
};

export function FormNotaMedica({
  onSubmit,
  submitting = false,
}: FormNotaMedicaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const afiliadoIdParam = searchParams.get("afiliado");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAfiliado, setSelectedAfiliado] =
    useState<AfiliadoResultado | null>(null);
  const [searchResults, setSearchResults] = useState<AfiliadoResultado[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [medicoOptions, setMedicoOptions] = useState<MedicoOpcion[]>([]);
  const [formData, setFormData] = useState<Partial<ConsultaClinica>>({
    afiliadoId: afiliadoIdParam || "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const loadMedicos = async () => {
    setLoadingMedicos(true);
    try {
      const response = await request("/sics/doctors/getDoctors", "GET");
      const data = extractArray(response);
      const normalizados = data.map(normalizeMedico);
      setMedicoOptions(normalizados);
    } catch (error) {
      console.error("No se pudieron cargar los médicos", error);
      toast({
        title: "No se pudieron cargar los médicos",
        description: "Vuelve a intentarlo en unos momentos.",
        variant: "destructive",
      });
      setMedicoOptions([]);
    } finally {
      setLoadingMedicos(false);
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
    loadMedicos();
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

  const handleChange = (field: keyof ConsultaClinica, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedAfiliado) {
      toast({
        title: "Selecciona un afiliado",
        description: "Debes elegir un afiliado antes de guardar.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.medicoId) {
      toast({
        title: "Selecciona un médico",
        description: "Debes elegir un médico para registrar la nota médica.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.diagnostico || !formData.tratamiento) {
      toast({
        title: "Faltan datos obligatorios",
        description: "Diagnóstico y tratamiento son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
  };

  const medicoPlaceholder = useMemo(() => {
    if (loadingMedicos) return "Cargando médicos...";
    if (!medicoOptions.length) return "Sin médicos disponibles";
    return "Seleccionar médico";
  }, [loadingMedicos, medicoOptions.length]);

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

      {/* Datos del Afiliado Seleccionado */}
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

      {/* Datos de la Consulta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Datos de la nota médica
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="medicoId">Médico *</Label>
            <Select
              value={formData.medicoId || ""}
              onValueChange={(value) => handleChange("medicoId", value)}
              disabled={loadingMedicos || !medicoOptions.length}
            >
              <SelectTrigger>
                <SelectValue placeholder={medicoPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {medicoOptions.map((medico) => (
                  <SelectItem key={medico.id} value={medico.id}>
                    Dr(a). {medico.nombreCompleto}
                    {medico.especialidad ? ` - ${medico.especialidad}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signos Vitales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="h-5 w-5 text-primary" />
            Signos Vitales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="FC">FC (Frecuencia Cardíaca)</Label>
            <Input
              id="FC"
              value={formData.FC || ""}
              onChange={(e) => handleChange("FC", e.target.value)}
              placeholder="Ej: 72 lpm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="TA">TA (Tensión Arterial)</Label>
            <Input
              id="TA"
              value={formData.TA || ""}
              onChange={(e) => handleChange("TA", e.target.value)}
              placeholder="Ej: 120/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="FR">FR (Frecuencia Respiratoria)</Label>
            <Input
              id="FR"
              value={formData.FR || ""}
              onChange={(e) => handleChange("FR", e.target.value)}
              placeholder="Ej: 16 rpm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="peso">Peso</Label>
            <Input
              id="peso"
              value={formData.peso || ""}
              onChange={(e) => handleChange("peso", e.target.value)}
              placeholder="Ej: 70 kg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Temperatura">Temperatura</Label>
            <Input
              id="Temperatura"
              value={formData.Temperatura || ""}
              onChange={(e) => handleChange("Temperatura", e.target.value)}
              placeholder="Ej: 36.5 °C"
            />
          </div>
        </CardContent>
      </Card>

      {/* Examen Físico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Examen Físico
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cabeza">Cabeza</Label>
            <Textarea
              id="cabeza"
              value={formData.cabeza || ""}
              onChange={(e) => handleChange("cabeza", e.target.value)}
              placeholder="Observaciones de cabeza..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuello">Cuello</Label>
            <Textarea
              id="cuello"
              value={formData.cuello || ""}
              onChange={(e) => handleChange("cuello", e.target.value)}
              placeholder="Observaciones de cuello..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="torax">Tórax</Label>
            <Textarea
              id="torax"
              value={formData.torax || ""}
              onChange={(e) => handleChange("torax", e.target.value)}
              placeholder="Observaciones de tórax..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abdomen">Abdomen</Label>
            <Textarea
              id="abdomen"
              value={formData.abdomen || ""}
              onChange={(e) => handleChange("abdomen", e.target.value)}
              placeholder="Observaciones de abdomen..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="miembros">Miembros</Label>
            <Textarea
              id="miembros"
              value={formData.miembros || ""}
              onChange={(e) => handleChange("miembros", e.target.value)}
              placeholder="Observaciones de miembros..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genitales">Genitales</Label>
            <Textarea
              id="genitales"
              value={formData.genitales || ""}
              onChange={(e) => handleChange("genitales", e.target.value)}
              placeholder="Observaciones de genitales..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico y Tratamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Diagnóstico y Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea
              id="diagnostico"
              value={formData.diagnostico || ""}
              onChange={(e) => handleChange("diagnostico", e.target.value)}
              placeholder="Describir el diagnóstico del paciente..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tratamiento">Tratamiento *</Label>
            <Textarea
              id="tratamiento"
              value={formData.tratamiento || ""}
              onChange={(e) => handleChange("tratamiento", e.target.value)}
              placeholder="Indicar el tratamiento recomendado..."
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios Adicionales</Label>
            <Textarea
              id="comentarios"
              value={formData.comentarios || ""}
              onChange={(e) => handleChange("comentarios", e.target.value)}
              placeholder="Observaciones o notas adicionales..."
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
          {submitting ? "Guardando..." : "Guardar nota médica"}
        </Button>
      </div>
    </form>
  );
}
