"use client";

import { useState, useEffect, useMemo } from "react";
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
import { TestTube, Plus, Loader2, Filter, Search, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
type ExamItem = {
  id: string;
  examenId?: string;
  nombreExamen?: string;
  fechaOrden?: string;
  fechaResultado?: string;
  fechaProximoExamen?: string;
  dilucionVDRL?: string;
  estatus?: string;
  resultado?: string;
  observaciones?: string;
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

type ResultadoLaboratorio = {
  id: string;
  certificado_id: string | null;
  laboratorio_id: string;
  tipo_examen_id: string;
  examen_id: string;
  cat_infecciones: string;
  resultados_valores: string | null;
  resultados_positivo: boolean;
  fecha_registro: string;
  examen: {
    id: string;
    examen: string;
    fecha_orden: string;
    fecha_proximo_examen: string;
    estatus: string;
    Persona: Array<{
      id: string;
      curp: string;
      nombre: string;
      apellido_paterno: string;
      apellido_materno: string;
      fecha_nacimiento: string;
      genero: string;
      email: string;
      telefono: string;
      direccion: string;
      foto: string | null;
      created_at: string;
    }>;
  };
};


export function ResultadosTable() {
  const { toast } = useToast();
  
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

  // Estados para el filtro de resultados
  const [allResultados, setAllResultados] = useState<ResultadoLaboratorio[]>([]);
  const [filteredResultados, setFilteredResultados] = useState<ResultadoLaboratorio[]>([]);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterData, setFilterData] = useState({
    laboratorio_id: "all",
    tipo_examen_id: "all",
    cat_infecciones: "all",
    resultados_positivo: "all" as "all" | "true" | "false",
    searchQuery: "",
  });


  const getStatusBadge = (estatus: string | undefined) => {
    if (!estatus) return <Badge variant="outline">Sin resultado</Badge>;

    const estatusLower = estatus.toLowerCase();
    if (estatusLower === "negativo") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Negativo
        </Badge>
      );
    }
    if (estatusLower === "positivo") {
      return (
        <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
          Positivo
        </Badge>
      );
    }
    return <Badge variant="outline">{estatus}</Badge>;
  };

  const loadLaboratorios = async () => {
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
  };

  const loadTiposExamen = async () => {
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
  };

  const loadInfecciones = async () => {
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
  };

  const handleOpenResultadoDialog = (examen: ExamItem) => {
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
  };

  const loadAllResultados = async () => {
    setLoadingResultados(true);
    try {
      const response = await request(
        "/sics/results/getAllLaboratoryResults",
        "GET"
      );
      
      let data: any[] = [];
      if (Array.isArray(response?.results)) {
        data = response.results;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      setAllResultados(data);
      setFilteredResultados(data);
    } catch (error) {
      console.error("Error al cargar resultados", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados.",
        variant: "destructive",
      });
      setAllResultados([]);
      setFilteredResultados([]);
    } finally {
      setLoadingResultados(false);
    }
  };

  const filteredResultadosMemo = useMemo(() => {
    let filtered = [...allResultados];

    // Filtro por búsqueda de texto (nombre, CURP)
    if (filterData.searchQuery.trim()) {
      const query = filterData.searchQuery.toLowerCase();
      filtered = filtered.filter((resultado) => {
        const persona = resultado.examen?.Persona?.[0];
        if (!persona) return false;
        const nombreCompleto = `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`.toLowerCase();
        return (
          nombreCompleto.includes(query) ||
          persona.curp.toLowerCase().includes(query)
        );
      });
    }

    // Filtro por laboratorio
    if (filterData.laboratorio_id && filterData.laboratorio_id !== "all") {
      filtered = filtered.filter(
        (r) => r.laboratorio_id === filterData.laboratorio_id
      );
    }

    // Filtro por tipo de examen
    if (filterData.tipo_examen_id && filterData.tipo_examen_id !== "all") {
      filtered = filtered.filter(
        (r) => r.tipo_examen_id === filterData.tipo_examen_id
      );
    }

    // Filtro por infección
    if (filterData.cat_infecciones && filterData.cat_infecciones !== "all") {
      filtered = filtered.filter(
        (r) => r.cat_infecciones === filterData.cat_infecciones
      );
    }

    // Filtro por resultado positivo/negativo
    if (filterData.resultados_positivo !== "all") {
      const isPositivo = filterData.resultados_positivo === "true";
      filtered = filtered.filter((r) => r.resultados_positivo === isPositivo);
    }

    return filtered;
  }, [allResultados, filterData]);

  useEffect(() => {
    setFilteredResultados(filteredResultadosMemo);
  }, [filteredResultadosMemo]);

  const clearFilters = () => {
    setFilterData({
      laboratorio_id: "all",
      tipo_examen_id: "all",
      cat_infecciones: "all",
      resultados_positivo: "all",
      searchQuery: "",
    });
  };

  useEffect(() => {
    loadAllResultados();
    loadLaboratorios();
    loadTiposExamen();
    loadInfecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleCreateResultado = async () => {
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
        // Recargar todos los resultados
        await loadAllResultados();
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
  };

  return (
    <div className="space-y-4">
          {/* Filtros de resultados */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o CURP..."
                    value={filterData.searchQuery}
                    onChange={(e) =>
                      setFilterData({ ...filterData, searchQuery: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
                {(filterData.laboratorio_id !== "all" ||
                  filterData.tipo_examen_id !== "all" ||
                  filterData.cat_infecciones !== "all" ||
                  filterData.resultados_positivo !== "all" ||
                  filterData.searchQuery.trim() !== "") && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </div>

              {showFilters && (
                <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Laboratorio</Label>
                    <Select
                      value={filterData.laboratorio_id}
                      onValueChange={(value) =>
                        setFilterData({ ...filterData, laboratorio_id: value })
                      }
                      disabled={loadingLaboratorios}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los laboratorios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {laboratorios.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.nombre_comercial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Examen</Label>
                    <Select
                      value={filterData.tipo_examen_id}
                      onValueChange={(value) =>
                        setFilterData({ ...filterData, tipo_examen_id: value })
                      }
                      disabled={loadingTiposExamen}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {tiposExamen.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Infección</Label>
                    <Select
                      value={filterData.cat_infecciones}
                      onValueChange={(value) =>
                        setFilterData({ ...filterData, cat_infecciones: value })
                      }
                      disabled={loadingInfecciones}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las infecciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {infecciones.map((inf) => (
                          <SelectItem key={inf.id} value={inf.id}>
                            {inf.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resultado</Label>
                    <Select
                      value={filterData.resultados_positivo}
                      onValueChange={(value) =>
                        setFilterData({
                          ...filterData,
                          resultados_positivo: value as "all" | "true" | "false",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los resultados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="true">Positivo</SelectItem>
                        <SelectItem value="false">Negativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de resultados filtrados */}
          {loadingResultados ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Cargando resultados...
              </span>
            </div>
          ) : filteredResultados.length === 0 ? (
            <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
              <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Sin resultados</p>
              <p>
                {allResultados.length === 0
                  ? "No hay resultados de laboratorio registrados."
                  : "No se encontraron resultados con los filtros aplicados."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <div className="p-4 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredResultados.length} de {allResultados.length}{" "}
                  resultados
                </p>
              </div>
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Persona</TableHead>
                      <TableHead>CURP</TableHead>
                      <TableHead>Examen</TableHead>
                      <TableHead>Fecha Orden</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Estatus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResultados.map((resultado) => {
                      const persona = resultado.examen?.Persona?.[0];
                      const nombreCompleto = persona
                        ? `${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno}`
                        : "N/D";
                      return (
                        <TableRow key={resultado.id}>
                          <TableCell className="font-medium">
                            {nombreCompleto}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {persona?.curp || "N/D"}
                          </TableCell>
                          <TableCell>
                            {resultado.examen?.examen || "N/D"}
                          </TableCell>
                          <TableCell>
                            {resultado.examen?.fecha_orden
                              ? new Date(
                                  resultado.examen.fecha_orden
                                ).toLocaleDateString("es-MX")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {resultado.fecha_registro
                              ? new Date(
                                  resultado.fecha_registro
                                ).toLocaleDateString("es-MX")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {resultado.resultados_positivo ? (
                              <Badge
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Positivo
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                Negativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(resultado.examen?.estatus)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

      {/* Dialog para crear resultado */}
      <Dialog open={dialogResultadoOpen} onOpenChange={setDialogResultadoOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
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
                  {examenSeleccionado.nombreExamen || examenSeleccionado.examenId || "N/D"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogResultadoOpen(false)}
              disabled={savingResultado}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateResultado} disabled={savingResultado}>
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

