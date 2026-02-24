"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TestTube, User, Plus, Loader2 } from "lucide-react";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ESTATUS_OPCIONES = ["positivo", "negativo", "pendiente"] as const;
type Estatus = (typeof ESTATUS_OPCIONES)[number];

type ExamItem = {
  id: string;
  examenId?: string;
  fechaOrden?: string;
  fechaProximoExamen?: string;
  dilucionVDRL?: string;
  estatus?: string;
};

type Laboratorio = {
  id: string;
  nombre_comercial: string;
  rfc: string;
  certificado_organismo: boolean;
  email_contacto: string;
  examenes?: Array<{ id: string; nombre: string }>;
};

type TipoExamen = {
  id: string;
  nombre: string;
};

type Infeccion = {
  id: string;
  nombre: string;
};

type ResultadoFormData = {
  laboratorio_id: string;
  tipo_examen_id: string;
  examen_id: string;
  cat_infecciones: string;
  resultados_positivo: boolean;
};

type AfiliadoExamen = {
  id: string;
  nombreCompleto: string;
  curp: string;
  numeroAfiliacion?: string;
  examenes: ExamItem[];
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

const mapExamen = (ex: any): ExamItem => {
  const estatus = ex?.estatus ?? ex?.dilucion_VDRL;
  return {
    id: ex?.id ?? crypto.randomUUID(),
    examenId: ex?.examen ?? ex?.examenId,
    fechaOrden: ex?.fecha_orden ?? ex?.fechaOrden,
    fechaProximoExamen: ex?.fecha_proximo_examen ?? ex?.fechaProximoExamen,
    dilucionVDRL: estatus ?? ex?.dilucion_VDRL,
    estatus: estatus ?? ex?.dilucion_VDRL,
  };
};

const normalizeAfiliado = (item: any): AfiliadoExamen => {
  const persona = item?.persona ?? {};
  const nombre = `${persona.nombre ?? ""} ${persona.apellido_paterno ?? ""} ${
    persona.apellido_materno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();

  const examenes = Array.isArray(persona.Examen)
    ? persona.Examen.map(mapExamen)
    : Array.isArray(item?.examenes)
    ? (item.examenes as any[]).map(mapExamen)
    : [];

  return {
    id: item?.persona_id ?? persona?.id ?? crypto.randomUUID(),
    nombreCompleto: nombre || "Afiliado sin nombre",
    curp: persona?.curp ?? "",
    numeroAfiliacion: item?.no_Afiliacion ?? item?.no_afiliacion ?? "",
    examenes,
  };
};

const ITEMS_PER_PAGE = 10;

export function ExamenesTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [afiliados, setAfiliados] = useState<AfiliadoExamen[]>([]);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [modalAfiliado, setModalAfiliado] = useState<AfiliadoExamen | null>(
    null
  );
  const [page, setPage] = useState(0);
  
  // Estados para el formulario de resultado
  const [dialogResultadoOpen, setDialogResultadoOpen] = useState(false);
  const [examenSeleccionado, setExamenSeleccionado] = useState<ExamItem | null>(null);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [tiposExamen, setTiposExamen] = useState<TipoExamen[]>([]);
  const [infecciones, setInfecciones] = useState<Infeccion[]>([]);
  const [loadingLaboratorios, setLoadingLaboratorios] = useState(false);
  const [loadingTiposExamen, setLoadingTiposExamen] = useState(false);
  const [loadingInfecciones, setLoadingInfecciones] = useState(false);
  const [savingResultado, setSavingResultado] = useState(false);
  const [formData, setFormData] = useState<ResultadoFormData>({
    laboratorio_id: "",
    tipo_examen_id: "",
    examen_id: "",
    cat_infecciones: "",
    resultados_positivo: false,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(afiliados.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedAfiliados = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return afiliados.slice(start, start + ITEMS_PER_PAGE);
  }, [afiliados, page]);

  const showingStart = afiliados.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    afiliados.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, afiliados.length);

  const handleSearch = useCallback(async (): Promise<AfiliadoExamen[]> => {
    const term = searchQuery.trim();
    setHasSearched(true);
    if (!term) {
      setAfiliados([]);
      return [];
    }

    setLoading(true);
    try {
      const response = await request(
        `/sics/affiliates/getAffiliateById/${encodeURIComponent(term)}`,
        "GET"
      );
      const data = extractArray(response);
      const normalizados = data.map(normalizeAfiliado);
      setAfiliados(normalizados);

      if (!normalizados.length) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron afiliados para ese criterio.",
        });
      }
      return normalizados;
    } catch (error) {
      console.error("Error al buscar afiliado", error);
      toast({
        title: "Error al buscar afiliado",
        description: "No se pudo completar la búsqueda. Inténtalo nuevamente.",
        variant: "destructive",
      });
      setAfiliados([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchQuery, toast]);

  const loadLaboratorios = useCallback(async () => {
    setLoadingLaboratorios(true);
    try {
      const response = await request(
        "/sics/laboratories/getLaboratories",
        "GET"
      );
      
      let data: any[] = [];
      if (Array.isArray(response?.laboratories)) {
        data = response.laboratories;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const normalizados: Laboratorio[] = data.map((item: any) => ({
        id: item.id ?? crypto.randomUUID(),
        nombre_comercial: item.nombre_comercial ?? item.nombre ?? "",
        rfc: item.rfc ?? "",
        certificado_organismo: Boolean(item.certificado_organismo),
        email_contacto: item.email_contacto ?? item.email ?? "",
        examenes: Array.isArray(item.examenes) ? item.examenes : [],
      }));
      setLaboratorios(normalizados);
    } catch (error) {
      console.error("Error al cargar laboratorios", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los laboratorios.",
        variant: "destructive",
      });
      setLaboratorios([]);
    } finally {
      setLoadingLaboratorios(false);
    }
  }, [toast]);

  const loadTiposExamen = useCallback(async () => {
    setLoadingTiposExamen(true);
    try {
      const response = await request("/sics/exams/getExams", "GET");
      
      let data: any[] = [];
      if (Array.isArray(response?.exams)) {
        data = response.exams;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const normalizados: TipoExamen[] = data.map((item: any) => ({
        id: item.id ?? crypto.randomUUID(),
        nombre: item.nombre ?? item.nombre_examen ?? "",
      }));
      setTiposExamen(normalizados);
    } catch (error) {
      console.error("Error al cargar tipos de examen", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de examen.",
        variant: "destructive",
      });
      setTiposExamen([]);
    } finally {
      setLoadingTiposExamen(false);
    }
  }, [toast]);

  const loadInfecciones = useCallback(async () => {
    setLoadingInfecciones(true);
    try {
      const response = await request(
        "/sics/infections/getAllInfections",
        "GET"
      );
      
      let data: any[] = [];
      if (Array.isArray(response?.infections)) {
        data = response.infections;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const normalizados: Infeccion[] = data.map((item: any) => ({
        id: item.id ?? crypto.randomUUID(),
        nombre: item.nombre ?? "",
      }));
      setInfecciones(normalizados);
    } catch (error) {
      console.error("Error al cargar infecciones", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las infecciones.",
        variant: "destructive",
      });
      setInfecciones([]);
    } finally {
      setLoadingInfecciones(false);
    }
  }, [toast]);

  const handleOpenResultadoDialog = useCallback((examen: ExamItem) => {
    setExamenSeleccionado(examen);
    setFormData({
      laboratorio_id: "",
      tipo_examen_id: "",
      examen_id: examen.id,
      cat_infecciones: "",
      resultados_positivo: false,
    });
    setDialogResultadoOpen(true);
    loadLaboratorios();
    loadTiposExamen();
    loadInfecciones();
  }, [loadLaboratorios, loadTiposExamen, loadInfecciones]);

  const handleCreateResultado = useCallback(async () => {
    if (!formData.laboratorio_id || !formData.tipo_examen_id || !formData.cat_infecciones) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setSavingResultado(true);
    try {
      const payload = {
        laboratorio_id: formData.laboratorio_id,
        tipo_examen_id: formData.tipo_examen_id,
        examen_id: formData.examen_id,
        cat_infecciones: formData.cat_infecciones,
        resultados_positivo: formData.resultados_positivo,
      };

      const response = await request(
        "/sics/results/createLaboratoryResult",
        "POST",
        payload
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Resultado creado",
          description: "El resultado del examen se registró correctamente.",
        });
        setDialogResultadoOpen(false);
        // Recargar los datos del afiliado
        if (modalAfiliado) {
          const next = await handleSearch();
          const updated = next.find((a) => a.id === modalAfiliado.id);
          if (updated) setModalAfiliado(updated);
        }
      } else {
        toast({
          title: "Error al crear resultado",
          description: response?.message || "No se pudo crear el resultado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear resultado", error);
      toast({
        title: "Error al crear resultado",
        description: "Ocurrió un error. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSavingResultado(false);
    }
  }, [formData, modalAfiliado, handleSearch, toast]);

  const updateExamStatus = async (
    examenId: string,
    estatus: Estatus,
    afiliadoId: string
  ) => {
    setUpdatingStatusId(examenId);
    try {
      const url = `/sics/exams/updateExam/${encodeURIComponent(examenId)}`;
      const response = await request(url, "PUT", { estatus });

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Estatus actualizado",
          description: "El examen se actualizó correctamente.",
        });
        const next = await handleSearch();
        if (modalAfiliado?.id === afiliadoId) {
          const updated = next.find((a) => a.id === afiliadoId);
          if (updated) setModalAfiliado(updated);
        }
      } else {
        toast({
          title: "No se pudo actualizar",
          description: response.message || "Intenta nuevamente en unos momentos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al actualizar estatus", error);
      toast({
        title: "Error al actualizar estatus",
        description: "No se pudo guardar el cambio. Inténtalo más tarde.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:p-4 md:flex-row md:items-center md:gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por CURP, número de afiliado, nombre o apellido"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleSearch())
            }
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {!hasSearched ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          Busca por CURP, número de afiliado, nombre o apellido para ver los
          exámenes del afiliado.
        </div>
      ) : null}

      {hasSearched && afiliados.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
          No se encontraron afiliados para el criterio buscado.
        </div>
      ) : null}

      {afiliados.length > 0 ? (
        <div className="space-y-4">
          {paginatedAfiliados.map((afiliado) => (
            <Card key={afiliado.id}>
              <CardHeader className="pb-2 px-4 sm:px-6">
                <CardTitle className="flex items-start gap-2 text-base sm:text-lg wrap-break-word">
                  <User className="h-5 w-5 text-primary" />
                  {afiliado.nombreCompleto}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p>
                    <span className="font-medium text-muted-foreground">
                      CURP:{" "}
                    </span>
                    <span className="font-mono break-all">{afiliado.curp || "N/D"}</span>
                  </p>
                  {afiliado.numeroAfiliacion ? (
                    <p>
                      <span className="font-medium text-muted-foreground">
                        No. afiliación:{" "}
                      </span>
                      {afiliado.numeroAfiliacion}
                    </p>
                  ) : null}
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Exámenes:{" "}
                    </span>
                    {afiliado.examenes.length}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAfiliado(afiliado)}
                  className="w-full sm:w-auto"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Ver exámenes
                </Button>
              </CardContent>
            </Card>
          ))}
          <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Mostrando {showingStart}-{showingEnd} de {afiliados.length}
            </p>
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0 || afiliados.length === 0}
                className="flex-1 sm:flex-none"
              >
                Anterior
              </Button>
              <span className="text-xs sm:text-sm font-medium text-center min-w-[112px]">
                Página {afiliados.length === 0 ? 0 : page + 1} de{" "}
                {afiliados.length === 0 ? 0 : totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
                }
                disabled={afiliados.length === 0 || page >= totalPages - 1}
                className="flex-1 sm:flex-none"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog
        open={!!modalAfiliado}
        onOpenChange={(open) => !open && setModalAfiliado(null)}
      >
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-4xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b bg-muted/20 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg wrap-break-word pr-8">
                Exámenes — {modalAfiliado?.nombreCompleto}
              </DialogTitle>
              <DialogDescription>
                Listado de exámenes del afiliado. Puedes actualizar el estatus
                desde aquí.
              </DialogDescription>
            </DialogHeader>
            {modalAfiliado ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <Badge variant="secondary">
                  Total: {modalAfiliado.examenes.length}
                </Badge>
                <Badge variant="outline">
                  Pendientes:{" "}
                  {
                    modalAfiliado.examenes.filter(
                      (exam) =>
                        !exam.estatus ||
                        exam.estatus.toLowerCase() === "pendiente" ||
                        !exam.dilucionVDRL
                    ).length
                  }
                </Badge>
                <span className="text-muted-foreground sm:ml-auto">
                  Desliza horizontalmente para ver todas las columnas
                </span>
              </div>
            ) : null}
          </div>
          {modalAfiliado ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 sm:px-6 py-4">
              <div className="rounded-lg border border-border overflow-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="min-w-[150px]">Examen</TableHead>
                      <TableHead className="min-w-[120px]">Fecha orden</TableHead>
                      <TableHead className="min-w-[130px]">Próximo examen</TableHead>
                      <TableHead className="min-w-[110px]">Estatus</TableHead>
                      <TableHead className="text-right min-w-[180px]">Actualizar</TableHead>
                      <TableHead className="text-right min-w-[170px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalAfiliado.examenes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-12"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <TestTube className="h-6 w-6" />
                            <p className="text-sm font-medium">
                              Sin exámenes registrados.
                            </p>
                            <p className="text-xs">
                              Cuando existan exámenes aparecerán en esta tabla.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      modalAfiliado.examenes.map((examen) => {
                        const s =
                          examen.estatus ?? examen.dilucionVDRL;
                        return (
                          <TableRow key={examen.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              <div className="max-w-[200px] truncate" title={examen.examenId || "N/D"}>
                                {examen.examenId || "N/D"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {examen.fechaOrden
                                ? new Date(
                                    examen.fechaOrden
                                  ).toLocaleDateString("es-MX")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {examen.fechaProximoExamen
                                ? new Date(
                                    examen.fechaProximoExamen
                                  ).toLocaleDateString("es-MX")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {s ? (
                                <Badge
                                  variant={
                                    s === "negativo"
                                      ? "default"
                                      : s === "pendiente"
                                      ? "outline"
                                      : "destructive"
                                  }
                                  className={
                                    s === "negativo"
                                      ? "bg-accent text-accent-foreground"
                                      : ""
                                  }
                                >
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pendiente</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Select
                                  value={(s || "") as string}
                                  onValueChange={(value) =>
                                    updateExamStatus(
                                      examen.id,
                                      value as Estatus,
                                      modalAfiliado.id
                                    )
                                  }
                                  disabled={updatingStatusId === examen.id}
                                >
                                  <SelectTrigger className="w-[120px] sm:w-[130px]">
                                    <SelectValue placeholder="Estatus" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ESTATUS_OPCIONES.map((opt) => (
                                      <SelectItem key={opt} value={opt}>
                                        {opt.charAt(0).toUpperCase() +
                                          opt.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {updatingStatusId === examen.id && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    Actualizando…
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenResultadoDialog(examen)}
                                className="whitespace-nowrap"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Resultado
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Dialog para crear resultado */}
      <Dialog open={dialogResultadoOpen} onOpenChange={setDialogResultadoOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pr-8">
            <DialogTitle>Agregar Resultado de Examen</DialogTitle>
            <DialogDescription>
              Registra el resultado del examen de laboratorio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="laboratorio_id">
                Laboratorio <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.laboratorio_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, laboratorio_id: value })
                }
                disabled={loadingLaboratorios}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingLaboratorios
                        ? "Cargando laboratorios..."
                        : "Seleccionar laboratorio"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {laboratorios.map((lab) => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.nombre_comercial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_examen_id">
                Tipo de Examen <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.tipo_examen_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo_examen_id: value })
                }
                disabled={loadingTiposExamen}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTiposExamen
                        ? "Cargando tipos de examen..."
                        : "Seleccionar tipo de examen"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {tiposExamen.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat_infecciones">
                Infección <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.cat_infecciones}
                onValueChange={(value) =>
                  setFormData({ ...formData, cat_infecciones: value })
                }
                disabled={loadingInfecciones}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingInfecciones
                        ? "Cargando infecciones..."
                        : "Seleccionar infección"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {infecciones.map((inf) => (
                    <SelectItem key={inf.id} value={inf.id}>
                      {inf.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border border-border p-4">
              <Switch
                id="resultados_positivo"
                checked={formData.resultados_positivo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, resultados_positivo: checked })
                }
              />
              <Label
                htmlFor="resultados_positivo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Resultado Positivo
              </Label>
            </div>

            {examenSeleccionado && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">Examen seleccionado:</p>
                <p className="text-muted-foreground">
                  {examenSeleccionado.examenId || examenSeleccionado.id || "N/D"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogResultadoOpen(false)}
              disabled={savingResultado}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateResultado}
              disabled={savingResultado}
              className="w-full sm:w-auto"
            >
              {savingResultado ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Resultado"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
