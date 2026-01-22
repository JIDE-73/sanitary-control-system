"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Loader2, Plus } from "lucide-react";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Infection } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

interface InfeccionesTableProps {
  infecciones: Infection[];
  loading?: boolean;
  onReload: () => void;
}

export function InfeccionesTable({
  infecciones,
  loading = false,
  onReload,
}: InfeccionesTableProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formNombre, setFormNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(infecciones.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedInfecciones = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return infecciones.slice(start, start + ITEMS_PER_PAGE);
  }, [infecciones, page]);

  const showingStart = infecciones.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    infecciones.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, infecciones.length);

  const handleCreate = () => {
    setEditingId(null);
    setFormNombre("");
    setDialogOpen(true);
  };

  const handleEdit = (infeccion: Infection) => {
    setEditingId(infeccion.id);
    setFormNombre(infeccion.nombre);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la infección "${nombre}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const response = await request(
        `/sics/infections/deleteInfection/${id}`,
        "DELETE"
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Infección eliminada",
          description: "La infección fue eliminada correctamente.",
        });
        onReload();
      } else {
        toast({
          variant: "destructive",
          title: "No se pudo eliminar",
          description: response?.message || "Intenta de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar infección", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "Ocurrió un error. Intenta nuevamente.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (!formNombre.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "El nombre es obligatorio.",
      });
      return;
    }

    try {
      setSaving(true);
      const payload = { nombre: formNombre.trim() };

      if (editingId) {
        // Update
        const response = await request(
          `/sics/infections/updateInfection/${editingId}`,
          "PUT",
          payload
        );

        if (response.status >= 200 && response.status < 300) {
          toast({
            title: "Infección actualizada",
            description: "Los cambios se guardaron correctamente.",
          });
          setDialogOpen(false);
          onReload();
        } else {
          toast({
            variant: "destructive",
            title: "No se pudo actualizar",
            description: response?.message || "Inténtalo de nuevo.",
          });
        }
      } else {
        // Create
        const response = await request(
          "/sics/infections/createInfection",
          "POST",
          payload
        );

        if (response.status >= 200 && response.status < 300) {
          toast({
            title: "Infección creada",
            description: "La infección fue creada correctamente.",
          });
          setDialogOpen(false);
          onReload();
        } else {
          toast({
            variant: "destructive",
            title: "No se pudo crear",
            description: response?.message || "Inténtalo de nuevo.",
          });
        }
      }
    } catch (error) {
      console.error("Error al guardar infección", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Ocurrió un problema. Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Infección" : "Nueva Infección"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifica los datos de la infección."
                : "Ingresa los datos de la nueva infección."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </label>
              <Input
                id="nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Ej: Clamidya"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : editingId ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">Catálogo de Infecciones</h2>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Infección
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  <p className="mt-2">Cargando infecciones...</p>
                </TableCell>
              </TableRow>
            ) : infecciones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No se encontraron infecciones. Crea una nueva para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInfecciones.map((infeccion) => (
                <TableRow key={infeccion.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {infeccion.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    {infeccion.nombre}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(infeccion)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(infeccion.id, infeccion.nombre)
                        }
                        disabled={deletingId === infeccion.id}
                        title="Eliminar"
                      >
                        {deletingId === infeccion.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
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
            Mostrando {showingStart}-{showingEnd} de {infecciones.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0 || infecciones.length === 0}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">
              Página {infecciones.length === 0 ? 0 : page + 1} de{" "}
              {infecciones.length === 0 ? 0 : totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
              }
              disabled={infecciones.length === 0 || page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

