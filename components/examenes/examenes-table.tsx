"use client";

import { useMemo, useState } from "react";
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
import { Search, Info } from "lucide-react";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

type ExamItem = {
  id: string;
  examenId?: string;
  fechaOrden?: string;
  fechaProximoExamen?: string;
  dilucionVDRL?: string;
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
  }

  return [];
};

const normalizeAfiliado = (item: any): AfiliadoExamen => {
  const persona = item?.persona ?? {};
  const nombre = `${persona.nombre ?? ""} ${persona.apellido_paterno ?? ""} ${
    persona.apellido_materno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();

  const examenes = Array.isArray(persona.Examen)
    ? persona.Examen.map((ex: any) => ({
        id: ex?.id ?? crypto.randomUUID(),
        examenId: ex?.examen,
        fechaOrden: ex?.fecha_orden,
        fechaProximoExamen: ex?.fecha_proximo_examen,
        dilucionVDRL: ex?.dilucion_VDRL,
      }))
    : [];

  return {
    id: item?.persona_id ?? persona?.id ?? crypto.randomUUID(),
    nombreCompleto: nombre || "Afiliado sin nombre",
    curp: persona?.curp ?? "",
    numeroAfiliacion: item?.no_Afiliacion ?? item?.no_afiliacion ?? "",
    examenes,
  };
};

export function ExamenesTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [afiliados, setAfiliados] = useState<AfiliadoExamen[]>([]);

  const rows = useMemo(
    () =>
      afiliados.flatMap((afiliado) =>
        afiliado.examenes.map((examen) => ({ afiliado, examen }))
      ),
    [afiliados]
  );

  const handleSearch = async () => {
    const term = searchQuery.trim();
    setHasSearched(true);
    if (!term) {
      setAfiliados([]);
      return;
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
    } catch (error) {
      console.error("Error al buscar afiliado", error);
      toast({
        title: "Error al buscar afiliado",
        description: "No se pudo completar la búsqueda. Inténtalo nuevamente.",
        variant: "destructive",
      });
      setAfiliados([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4 md:flex-row md:items-center md:gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por CURP, nombre o # de afiliado"
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
          Busca un afiliado por CURP, nombre o número de afiliación para ver sus
          exámenes.
        </div>
      ) : null}

      {hasSearched && rows.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
          No se encontraron exámenes para el criterio buscado.
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha orden</TableHead>
                <TableHead>Afiliado</TableHead>
                <TableHead>CURP</TableHead>
                <TableHead>Examen</TableHead>
                <TableHead>Dilución VDRL</TableHead>
                <TableHead>Próximo examen</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ afiliado, examen }) => (
                <TableRow key={`${afiliado.id}-${examen.id}`}>
                  <TableCell>
                    {examen.fechaOrden
                      ? new Date(examen.fechaOrden).toLocaleDateString("es-MX")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {afiliado.nombreCompleto}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {afiliado.curp || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {examen.examenId || "N/D"}
                  </TableCell>
                  <TableCell>
                    {examen.dilucionVDRL ? (
                      <Badge
                        variant={
                          examen.dilucionVDRL === "negativo"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          examen.dilucionVDRL === "negativo"
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }
                      >
                        {examen.dilucionVDRL}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {examen.fechaProximoExamen
                      ? new Date(examen.fechaProximoExamen).toLocaleDateString(
                          "es-MX"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Ver examen">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalle del examen</DialogTitle>
                          <DialogDescription>
                            Información básica del examen registrado.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Afiliado: </span>
                            {afiliado.nombreCompleto}
                          </p>
                          <p>
                            <span className="font-medium">CURP: </span>
                            {afiliado.curp || "N/D"}
                          </p>
                          <p>
                            <span className="font-medium">Examen ID: </span>
                            {examen.examenId || examen.id}
                          </p>
                          <p>
                            <span className="font-medium">Fecha orden: </span>
                            {examen.fechaOrden
                              ? new Date(examen.fechaOrden).toLocaleDateString(
                                  "es-MX"
                                )
                              : "N/D"}
                          </p>
                          <p>
                            <span className="font-medium">
                              Próximo examen:{" "}
                            </span>
                            {examen.fechaProximoExamen
                              ? new Date(
                                  examen.fechaProximoExamen
                                ).toLocaleDateString("es-MX")
                              : "N/D"}
                          </p>
                          <p>
                            <span className="font-medium">Dilución VDRL: </span>
                            {examen.dilucionVDRL || "N/D"}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
