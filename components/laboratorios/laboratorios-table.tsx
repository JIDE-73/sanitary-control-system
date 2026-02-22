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
import { Input } from "@/components/ui/input";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

interface LaboratoriosTableProps {
  laboratorios: LaboratorioListado[];
  loading?: boolean;
  onUpdateLaboratorio?: (
    id: string,
    payload: {
      nombre_comercial: string;
      rfc: string;
      certificado_organismo: boolean;
      email_contacto: string;
    },
  ) => Promise<void>;
  onDeleteLaboratorio?: (id: string) => Promise<void>;
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

const ITEMS_PER_PAGE = 10;

export function LaboratoriosTable({
  laboratorios,
  loading = false,
  onUpdateLaboratorio,
  onDeleteLaboratorio,
}: LaboratoriosTableProps) {
  const { toast } = useToast();
  const [modalLaboratorio, setModalLaboratorio] =
    useState<LaboratorioCompleto | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editLaboratorioId, setEditLaboratorioId] = useState<string | null>(null);
  const [editNombreComercial, setEditNombreComercial] = useState("");
  const [editRfc, setEditRfc] = useState("");
  const [editEmailContacto, setEditEmailContacto] = useState("");
  const [editCertificadoOrganismo, setEditCertificadoOrganismo] = useState(false);
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

  const startEditing = (laboratorio: LaboratorioListado) => {
    setEditLaboratorioId(laboratorio.id);
    setEditNombreComercial(laboratorio.nombre_comercial ?? "");
    setEditRfc(laboratorio.rfc ?? "");
    setEditEmailContacto(laboratorio.email_contacto ?? "");
    setEditCertificadoOrganismo(Boolean(laboratorio.certificado_organismo));
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!onUpdateLaboratorio || !editLaboratorioId) return;
    if (!editNombreComercial.trim() || !editRfc.trim() || !editEmailContacto.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Nombre comercial, RFC y email son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    setSavingEdit(true);
    try {
      await onUpdateLaboratorio(editLaboratorioId, {
        nombre_comercial: editNombreComercial.trim(),
        rfc: editRfc.trim(),
        certificado_organismo: editCertificadoOrganismo,
        email_contacto: editEmailContacto.trim(),
      });
      setEditOpen(false);
      setEditLaboratorioId(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteLaboratorio) return;
    if (!window.confirm("¿Deseas eliminar este laboratorio?")) return;
    setDeletingId(id);
    try {
      await onDeleteLaboratorio(id);
    } finally {
      setDeletingId(null);
    }
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
                    {onUpdateLaboratorio && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(lab)}
                        title="Editar laboratorio"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteLaboratorio && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(lab.id)}
                        title="Eliminar laboratorio"
                        disabled={deletingId === lab.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar laboratorio</DialogTitle>
            <DialogDescription>
              Actualiza nombre comercial, RFC, certificado y correo de contacto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre comercial"
              value={editNombreComercial}
              onChange={(event) => setEditNombreComercial(event.target.value)}
            />
            <Input
              placeholder="RFC"
              value={editRfc}
              onChange={(event) => setEditRfc(event.target.value)}
            />
            <Input
              placeholder="Email de contacto"
              type="email"
              value={editEmailContacto}
              onChange={(event) => setEditEmailContacto(event.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editCertificadoOrganismo}
                onChange={(event) => setEditCertificadoOrganismo(event.target.checked)}
              />
              Certificado por organismo
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
