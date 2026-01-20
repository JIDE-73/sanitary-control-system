"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { request, uploadRequest } from "@/lib/request";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import type { AfiliadoListado } from "./afiliados-table";

interface ExpedienteFile {
  id: string;
  nombre: string;
  tipo: string;
  url: string;
  fechaSubida?: string;
}

interface ExpedienteDialogProps {
  afiliado: AfiliadoListado;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const baseUrl = process.env.NEXT_PUBLIC_URL;

export function ExpedienteDialog({
  afiliado,
  open,
  onOpenChange,
}: ExpedienteDialogProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<ExpedienteFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await request(
        `/sics/affiliates/getAffiliateFiles/${afiliado.id}`,
        "GET"
      );

      if (response.status >= 200 && response.status < 300) {
        const filesData = response.files || response.data || [];
        setFiles(Array.isArray(filesData) ? filesData : []);
      } else {
        // Si no existe el endpoint aún, usar array vacío
        setFiles([]);
      }
    } catch (error) {
      console.error("Error al cargar archivos", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, afiliado.id]);

  const MAX_FILES = 4;
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentFilesCount = files.length;
    const currentSelectedCount = selectedFiles.length;
    const totalFilesCount = currentFilesCount + currentSelectedCount;
    const availableSlots = MAX_FILES - totalFilesCount;
    const canUpload = availableSlots > 0;
    
    if (!canUpload) {
      toast({
        variant: "destructive",
        title: "Límite alcanzado",
        description: "Ya se han alcanzado los 4 archivos permitidos. Elimina uno para subir otro.",
      });
      e.target.value = "";
      return;
    }

    const selected = Array.from(e.target.files || []);
    const validFiles = selected.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      return isImage || isPdf;
    });

    if (validFiles.length !== selected.length) {
      toast({
        variant: "destructive",
        title: "Archivos inválidos",
        description: "Solo se permiten imágenes y archivos PDF.",
      });
    }

    // Limitar la cantidad de archivos que se pueden seleccionar
    // Teniendo en cuenta los archivos ya seleccionados
    const filesToAdd = validFiles.slice(0, availableSlots);
    
    if (filesToAdd.length < validFiles.length) {
      toast({
        variant: "destructive",
        title: "Demasiados archivos",
        description: `Solo puedes seleccionar ${availableSlots} archivo(s) más (total máximo: ${MAX_FILES}). Se han seleccionado ${filesToAdd.length} archivo(s).`,
      });
    }

    if (filesToAdd.length > 0) {
      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    }
    
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No hay archivos",
        description: "Selecciona al menos un archivo para subir.",
      });
      return;
    }

    // Verificar que no se exceda el límite
    const currentFilesCount = files.length;
    if (currentFilesCount + selectedFiles.length > MAX_FILES) {
      toast({
        variant: "destructive",
        title: "Límite excedido",
        description: `Solo puedes tener ${MAX_FILES} archivos. Actualmente tienes ${currentFilesCount} y estás intentando subir ${selectedFiles.length}.`,
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("affiliateId", afiliado.id);

      const response = await uploadRequest(
        `/sics/affiliates/uploadAffiliateFiles`,
        formData
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Archivos subidos",
          description: `${selectedFiles.length} archivo(s) subido(s) correctamente.`,
        });
        setSelectedFiles([]);
        await loadFiles();
      } else {
        toast({
          variant: "destructive",
          title: "Error al subir",
          description: response?.message || "No se pudieron subir los archivos.",
        });
      }
    } catch (error) {
      console.error("Error al subir archivos", error);
      toast({
        variant: "destructive",
        title: "Error de red",
        description: "No se pudo comunicar con el servidor.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) {
      return;
    }

    setDeletingId(fileId);
    try {
      const response = await request(
        `/sics/affiliates/deleteAffiliateFile/${fileId}`,
        "DELETE"
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Archivo eliminado",
          description: "El archivo fue eliminado correctamente.",
        });
        await loadFiles();
      } else {
        toast({
          variant: "destructive",
          title: "Error al eliminar",
          description: response?.message || "No se pudo eliminar el archivo.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar archivo", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar el archivo.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (file: ExpedienteFile) => {
    window.open(file.url, "_blank");
  };

  const isImage = (tipo: string) => {
    return tipo.startsWith("image/");
  };

  const isPdf = (tipo: string) => {
    return tipo === "application/pdf" || tipo.includes("pdf");
  };

  const getFileIcon = (tipo: string) => {
    if (isImage(tipo)) return ImageIcon;
    if (isPdf(tipo)) return FileText;
    return FileText;
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileUrl = (file: ExpedienteFile) => {
    // Si la URL ya es completa, usarla directamente
    if (file.url.startsWith("http")) {
      return file.url;
    }
    // Si es una ruta relativa, construir la URL completa
    return `${baseUrl}${file.url.startsWith("/") ? "" : "/"}${file.url}`;
  };

  // Variables para el render - incluyendo archivos seleccionados
  const currentFilesCount = files.length;
  const selectedFilesCount = selectedFiles.length;
  const totalFilesCount = currentFilesCount + selectedFilesCount;
  const availableSlots = MAX_FILES - totalFilesCount;
  const canUpload = availableSlots > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Expediente - {afiliado.nombres} {afiliado.apellidoPaterno}
            </DialogTitle>
            <DialogDescription>
              Gestiona los archivos del expediente (imágenes y documentos PDF)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Sección de carga */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="file-upload">Agregar archivos</Label>
                  <span className="text-sm text-muted-foreground">
                    {totalFilesCount}/{MAX_FILES} espacios ocupados
                    {selectedFilesCount > 0 && (
                      <span className="ml-1 text-primary">
                        ({selectedFilesCount} seleccionado{selectedFilesCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="flex-1"
                    disabled={!canUpload}
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading || !canUpload}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir
                      </>
                    )}
                  </Button>
                </div>
                {!canUpload && (
                  <p className="text-sm text-muted-foreground">
                    Límite de {MAX_FILES} archivos alcanzado. Elimina un archivo para subir otro.
                  </p>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Archivos seleccionados ({selectedFiles.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => {
                      const Icon = getFileIcon(file.type);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="max-w-[200px] truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="ml-1 text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de archivos */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Label>
                  Archivos del expediente ({files.length})
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadFiles}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Actualizar"
                  )}
                </Button>
              </div>

              <ScrollArea className="flex-1 border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No hay archivos en el expediente
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Selecciona archivos arriba para agregarlos
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {files.map((file) => {
                        const Icon = getFileIcon(file.tipo);
                        const fileUrl = getFileUrl(file);
                        const isImg = isImage(file.tipo);

                        return (
                          <div
                            key={file.id}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {isImg ? (
                              <div
                                className="aspect-video bg-muted cursor-pointer relative group"
                                onClick={() => setPreviewImage(fileUrl)}
                              >
                                <img
                                  src={fileUrl}
                                  alt={file.nombre}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Eye className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-video bg-muted flex items-center justify-center">
                                <Icon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="p-3 space-y-2">
                              <p className="text-sm font-medium truncate">
                                {file.nombre}
                              </p>
                              {file.fechaSubida && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(file.fechaSubida).toLocaleDateString(
                                    "es-MX"
                                  )}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Descargar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(file.id)}
                                  disabled={deletingId === file.id}
                                  className="text-destructive hover:text-destructive"
                                >
                                  {deletingId === file.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Espacios vacíos */}
                      {Array.from({ length: MAX_FILES - files.length }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="border-2 border-dashed rounded-lg aspect-video bg-muted/30 flex flex-col items-center justify-center text-muted-foreground"
                        >
                          <FileText className="h-12 w-12 mb-2 opacity-30" />
                          <p className="text-sm opacity-50">Espacio disponible</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para vista previa de imágenes */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex items-center justify-center max-h-[70vh]">
              <img
                src={previewImage}
                alt="Vista previa"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

