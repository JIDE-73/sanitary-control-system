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
import { TestTube, User } from "lucide-react";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4 md:flex-row md:items-center md:gap-3">
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
        <Button onClick={handleSearch} disabled={loading}>
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
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  {afiliado.nombreCompleto}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p>
                    <span className="font-medium text-muted-foreground">
                      CURP:{" "}
                    </span>
                    <span className="font-mono">{afiliado.curp || "N/D"}</span>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0 || afiliados.length === 0}
              >
                Anterior
              </Button>
              <span className="text-sm font-medium">
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Exámenes — {modalAfiliado?.nombreCompleto}</DialogTitle>
            <DialogDescription>
              Listado de exámenes del afiliado. Puedes actualizar el estatus
              desde aquí.
            </DialogDescription>
          </DialogHeader>
          {modalAfiliado ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="rounded-lg border border-border overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Examen</TableHead>
                      <TableHead className="min-w-[120px]">Fecha orden</TableHead>
                      <TableHead className="min-w-[120px]">Próximo examen</TableHead>
                      <TableHead className="min-w-[100px]">Estatus</TableHead>
                      <TableHead className="text-right min-w-[180px]">Actualizar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalAfiliado.examenes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          Sin exámenes registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      modalAfiliado.examenes.map((examen) => {
                        const s =
                          examen.estatus ?? examen.dilucionVDRL;
                        return (
                          <TableRow key={examen.id}>
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
                                    s === "negativo" ? "default" : "destructive"
                                  }
                                  className={
                                    s === "negativo"
                                      ? "bg-accent text-accent-foreground"
                                      : ""
                                  }
                                >
                                  {s}
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
                                  <SelectTrigger className="w-[130px]">
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
    </div>
  );
}
