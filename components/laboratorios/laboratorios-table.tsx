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
import { Eye, Edit, Trash2, ShieldCheck, FlaskConical } from "lucide-react";
import type { LaboratorioListado } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

interface LaboratoriosTableProps {
  laboratorios: LaboratorioListado[];
  loading?: boolean;
}

type LaboratorioCompleto = {
  id: string;
  nombre_comercial: string;
  rfc: string;
  certificado_organismo: boolean;
  email_contacto: string;
  examenes: Array<{
    id: string;
    nombre: string;
  }>;
};

export function LaboratoriosTable({
  laboratorios,
  loading = false,
}: LaboratoriosTableProps) {
  const { toast } = useToast();
  const [modalLaboratorio, setModalLaboratorio] =
    useState<LaboratorioCompleto | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(laboratorios.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedLaboratorios = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return laboratorios.slice(start, start + ITEMS_PER_PAGE);
  }, [laboratorios, page]);

  const showingStart = laboratorios.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    laboratorios.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, laboratorios.length);

  const extractArray = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.laboratories)) return response.laboratories;
    if (Array.isArray(response?.data)) return response.data;

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

  const loadLaboratorioCompleto = async (laboratorioId: string) => {
    setLoadingModal(true);
    try {
      const response = await request(
        "/sics/laboratories/getLaboratories",
        "GET"
      );
      const data = extractArray(response);
      const encontrado = data.find((lab: any) => lab.id === laboratorioId);
      if (encontrado) {
        setModalLaboratorio({
          id: encontrado.id ?? laboratorioId,
          nombre_comercial:
            encontrado.nombre_comercial ?? encontrado.nombre ?? "",
          rfc: encontrado.rfc ?? "",
          certificado_organismo: Boolean(encontrado.certificado_organismo),
          email_contacto: encontrado.email_contacto ?? encontrado.email ?? "",
          examenes: Array.isArray(encontrado.examenes)
            ? encontrado.examenes.map((ex: any) => ({
                id: ex?.id ?? crypto.randomUUID(),
                nombre: ex?.nombre ?? ex?.nombre_examen ?? "Sin nombre",
              }))
            : [],
        });
      } else {
        toast({
          title: "No se encontró el laboratorio",
          description: "El laboratorio no está disponible.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al cargar laboratorio", error);
      toast({
        title: "Error al cargar información",
        description: "No se pudo obtener los datos del laboratorio.",
        variant: "destructive",
      });
    } finally {
      setLoadingModal(false);
    }
  };

  const handleOpenModal = (laboratorio: LaboratorioListado) => {
    loadLaboratorioCompleto(laboratorio.id);
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Comercial</TableHead>
            <TableHead>RFC</TableHead>
            <TableHead>Certificado</TableHead>
            <TableHead>Email de Contacto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando laboratorios...
              </TableCell>
            </TableRow>
          ) : laboratorios.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron laboratorios
              </TableCell>
            </TableRow>
          ) : (
            paginatedLaboratorios.map((lab) => (
              <TableRow key={lab.id}>
                <TableCell className="font-medium">
                  {lab.nombre_comercial}
                </TableCell>
                <TableCell className="font-mono text-sm">{lab.rfc}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lab.certificado_organismo ? "default" : "secondary"
                    }
                    className="gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {lab.certificado_organismo ? "Certificado" : "Pendiente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{lab.email_contacto}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(lab)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Mostrando {showingStart}-{showingEnd} de {laboratorios.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0 || laboratorios.length === 0}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {laboratorios.length === 0 ? 0 : page + 1} de{" "}
            {laboratorios.length === 0 ? 0 : totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
            }
            disabled={laboratorios.length === 0 || page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Dialog
        open={!!modalLaboratorio}
        onOpenChange={(open) => !open && setModalLaboratorio(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              {modalLaboratorio?.nombre_comercial}
            </DialogTitle>
            <DialogDescription>
              Información completa del laboratorio
            </DialogDescription>
          </DialogHeader>
          {loadingModal ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando información...
            </div>
          ) : modalLaboratorio ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nombre Comercial
                  </p>
                  <p className="text-sm font-medium">
                    {modalLaboratorio.nombre_comercial}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    RFC
                  </p>
                  <p className="text-sm font-mono">{modalLaboratorio.rfc}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Certificado
                  </p>
                  <Badge
                    variant={
                      modalLaboratorio.certificado_organismo
                        ? "default"
                        : "secondary"
                    }
                    className="gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {modalLaboratorio.certificado_organismo
                      ? "Certificado"
                      : "Pendiente"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email de Contacto
                  </p>
                  <p className="text-sm">{modalLaboratorio.email_contacto}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Exámenes Autorizados
                </p>
                {modalLaboratorio.examenes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay exámenes autorizados para este laboratorio.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modalLaboratorio.examenes.map((examen) => (
                      <Badge key={examen.id} variant="outline">
                        {examen.nombre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
