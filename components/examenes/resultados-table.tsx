"use client";

import { useCallback, useState } from "react";
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
import { TestTube, User, FileText } from "lucide-react";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const estatus = ex?.estatus ?? ex?.dilucion_VDRL ?? ex?.resultado;
  return {
    id: ex?.id ?? crypto.randomUUID(),
    examenId: ex?.examen ?? ex?.examenId ?? ex?.tipo_examen,
    nombreExamen: ex?.nombre_examen ?? ex?.tipoExamen ?? ex?.examen,
    fechaOrden: ex?.fecha_orden ?? ex?.fechaOrden,
    fechaResultado: ex?.fecha_resultado ?? ex?.fechaResultado,
    fechaProximoExamen: ex?.fecha_proximo_examen ?? ex?.fechaProximoExamen,
    dilucionVDRL: ex?.dilucion_VDRL ?? ex?.dilucionVDRL,
    estatus: estatus,
    resultado: ex?.resultado ?? ex?.resultadoVDRL,
    observaciones: ex?.observaciones,
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

  // Filtrar solo exámenes con resultados (no pendientes)
  const examenesConResultado = examenes.filter(
    (ex) => ex.estatus && ex.estatus.toLowerCase() !== "pendiente"
  );

  return {
    id: item?.persona_id ?? persona?.id ?? crypto.randomUUID(),
    nombreCompleto: nombre || "Afiliado sin nombre",
    curp: persona?.curp ?? "",
    numeroAfiliacion: item?.no_Afiliacion ?? item?.no_afiliacion ?? "",
    examenes: examenesConResultado,
  };
};

export function ResultadosTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [afiliados, setAfiliados] = useState<AfiliadoExamen[]>([]);
  const [modalAfiliado, setModalAfiliado] = useState<AfiliadoExamen | null>(
    null
  );

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
      // Filtrar afiliados que tengan al menos un examen con resultado
      const afiliadosConResultados = normalizados.filter(
        (a) => a.examenes.length > 0
      );
      setAfiliados(afiliadosConResultados);

      if (!afiliadosConResultados.length) {
        toast({
          title: "Sin resultados",
          description:
            "No se encontraron exámenes con resultados para ese criterio.",
        });
      }
      return afiliadosConResultados;
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
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            Consulta de Resultados de Exámenes
          </p>
          <p>
            Busca por CURP, número de afiliado, nombre o apellido para ver los
            resultados de exámenes del afiliado.
          </p>
        </div>
      ) : null}

      {hasSearched && afiliados.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
          <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Sin resultados encontrados</p>
          <p>
            No se encontraron exámenes con resultados para el criterio buscado.
          </p>
        </div>
      ) : null}

      {afiliados.length > 0 ? (
        <div className="space-y-4">
          {afiliados.map((afiliado) => (
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
                      Exámenes con resultados:{" "}
                    </span>
                    {afiliado.examenes.length}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAfiliado(afiliado)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Ver resultados
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog
        open={!!modalAfiliado}
        onOpenChange={(open) => !open && setModalAfiliado(null)}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Resultados de Exámenes — {modalAfiliado?.nombreCompleto}
            </DialogTitle>
            <DialogDescription>
              Detalle de resultados de exámenes del afiliado.
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
                      <TableHead className="min-w-[120px]">Fecha resultado</TableHead>
                      <TableHead className="min-w-[120px]">Próximo examen</TableHead>
                      <TableHead className="min-w-[100px]">Resultado</TableHead>
                      <TableHead className="min-w-[150px]">Dilución VDRL</TableHead>
                      <TableHead className="min-w-[200px]">Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalAfiliado.examenes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          Sin resultados de exámenes registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      modalAfiliado.examenes.map((examen) => {
                        return (
                          <TableRow key={examen.id}>
                            <TableCell className="font-medium">
                              <div
                                className="max-w-[200px] truncate"
                                title={examen.nombreExamen || examen.examenId || "N/D"}
                              >
                                {examen.nombreExamen || examen.examenId || "N/D"}
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
                              {examen.fechaResultado
                                ? new Date(
                                    examen.fechaResultado
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
                            <TableCell>{getStatusBadge(examen.estatus)}</TableCell>
                            <TableCell>
                              {examen.dilucionVDRL ? (
                                <span className="font-mono text-sm">
                                  {examen.dilucionVDRL}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={examen.observaciones || ""}>
                                {examen.observaciones || "-"}
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

