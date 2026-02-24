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
  Loader2,
  Download,
  Eye,
  FileCheck,
  UserCheck,
  ClipboardList,
  Receipt,
  Trash2,
} from "lucide-react";
import type { AfiliadoListado } from "./afiliados-table";

interface ExpedienteRecord {
  id: string;
  persona_id: string;
  historia_clinica_file: string;
  consentimiento_informado_file: string;
  ficha_identificacion_file: string;
  recibo_pago_file: string;
  createdAt: string;
  updateAt: string;
}

interface ExpedienteFile {
  key: "historia_clinica_file" | "consentimiento_informado_file" | "ficha_identificacion_file" | "recibo_pago_file";
  label: string;
  icon: typeof FileText;
  filePath?: string;
}

interface ExpedienteDialogProps {
  afiliado: AfiliadoListado;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const baseUrl = process.env.NEXT_PUBLIC_URL;

const FILE_TYPES: ExpedienteFile[] = [
  {
    key: "historia_clinica_file",
    label: "Historia Clínica",
    icon: ClipboardList,
  },
  {
    key: "consentimiento_informado_file",
    label: "Consentimiento Informado",
    icon: UserCheck,
  },
  {
    key: "ficha_identificacion_file",
    label: "Ficha de Identificación",
    icon: FileCheck,
  },
  {
    key: "recibo_pago_file",
    label: "Recibo de Pago",
    icon: Receipt,
  },
];

export function ExpedienteDialog({
  afiliado,
  open,
  onOpenChange,
}: ExpedienteDialogProps) {
  const { toast } = useToast();
  const [record, setRecord] = useState<ExpedienteRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRecord = async () => {
    setLoading(true);
    try {
      const recordId = record?.id || afiliado.id;
      
      const response = await request(
        `/sics/record/getRecordByID/${recordId}`,
        "GET"
      );

      if (response.status >= 200 && response.status < 300) {
        const recordData = response.record || response.data;
        if (recordData) {
          setRecord(recordData);
        } else {
          setRecord(null);
        }
      } else if (response.status === 404) {
        // No existe el record aún
        setRecord(null);
      } else {
        setRecord(null);
      }
    } catch (error) {
      console.error("Error al cargar expediente", error);
      // Si es un 404, no hay record (es normal para expedientes nuevos)
      // Para otros errores, mostramos null
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadRecord();
      setSelectedFiles({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, afiliado.id]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Solo permitir PDFs
    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Archivo inválido",
        description: "Solo se permiten archivos PDF.",
      });
      e.target.value = "";
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [fileKey]: file }));
    e.target.value = "";
  };

  const removeSelectedFile = (fileKey: string) => {
    setSelectedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fileKey];
      return newFiles;
    });
  };

  const handleUpload = async () => {
    // Solo se pueden subir los 4 archivos al mismo tiempo
    const fileKeys = Object.keys(selectedFiles);
    
    if (fileKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "No hay archivos",
        description: "Selecciona los 4 archivos para subir.",
      });
      return;
    }

    // Se deben subir los 4 archivos al mismo tiempo
    if (fileKeys.length < 4) {
      const missingFiles = FILE_TYPES.filter(
        (ft) => !selectedFiles[ft.key]
      );
      toast({
        variant: "destructive",
        title: "Archivos incompletos",
        description: `Debes seleccionar los 4 archivos para crear el expediente completo. Faltan: ${missingFiles.map((f) => f.label).join(", ")}`,
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("persona_id", afiliado.id);

      fileKeys.forEach((key) => {
        const file = selectedFiles[key];
        if (file) {
          formData.append(key, file);
        }
      });

      // Si ya existe un record, usar UPDATE (PUT)
      // Si no existe, usar CREATE (POST)
      const isUpdate = !!record;
      const endpoint = isUpdate
        ? `/sics/updateRecord/${afiliado.id}`
        : `/sics/record/createRecord`;
      const method = isUpdate ? "PUT" : "POST";

      const response = await uploadRequest(endpoint, formData, method);

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: isUpdate
            ? "Expediente actualizado"
            : "Expediente creado",
          description: isUpdate
            ? "El expediente fue actualizado correctamente."
            : "El expediente fue creado correctamente.",
        });

        // Si el response incluye el record creado/actualizado, guardarlo
        const newRecord = response.record || response.data;
        if (newRecord) {
          setRecord(newRecord);
        } else {
          // Si no viene en el response, recargar
          await loadRecord();
        }

        // Limpiar archivos subidos
        fileKeys.forEach((key) => {
          removeSelectedFile(key);
        });
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

  const handleDownload = (filePath: string, fileName: string) => {
    const url = getFileUrl(filePath);
    window.open(url, "_blank");
  };

  const getFileUrl = (filePath: string) => {
    return `${baseUrl}/${filePath}`;
  };

  const handleDelete = async () => {
    if (!record) {
      return;
    }

    // Confirmación con alerta
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar todo el expediente?\n\n" +
      "Esta acción eliminará permanentemente todos los archivos:\n" +
      "- Historia Clínica\n" +
      "- Consentimiento Informado\n" +
      "- Ficha de Identificación\n" +
      "- Recibo de Pago\n\n" +
      "Esta acción no se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      const response = await request(
        `/sics/record/deleteRecord/${afiliado.id}`,
        "DELETE"
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Expediente eliminado",
          description: "El expediente fue eliminado correctamente.",
        });
        setRecord(null);
        setSelectedFiles({});
      } else {
        toast({
          variant: "destructive",
          title: "Error al eliminar",
          description: response?.message || "No se pudo eliminar el expediente.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar expediente", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al eliminar el expediente.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
            <DialogTitle className="text-lg sm:text-xl truncate pr-8">
              Expediente - {afiliado.nombres} {afiliado.apellidoPaterno}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Gestiona los archivos del expediente médico (todos los documentos deben ser PDF)
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Barra de acciones */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b bg-muted/30 shrink-0">
              <Label className="text-sm sm:text-base font-semibold">Archivos del expediente</Label>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadRecord}
                  disabled={loading || deleting}
                  className="flex-1 sm:flex-initial"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Actualizar"
                  )}
                </Button>
                {record && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading || deleting || uploading}
                    className="flex-1 sm:flex-initial"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar Expediente</span>
                        <span className="sm:hidden">Eliminar</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Contenido con scroll */}
            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="px-4 sm:px-6 py-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                  {FILE_TYPES.map((fileType) => {
                        const Icon = fileType.icon;
                        const filePath = record?.[fileType.key];
                        const selectedFile = selectedFiles[fileType.key];
                        const hasFile = !!filePath;

                    return (
                      <div
                        key={fileType.key}
                        className="border rounded-lg p-3 sm:p-4 space-y-3 hover:shadow-md transition-shadow bg-card"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                            <Label className="text-sm sm:text-base font-medium">
                              {fileType.label}
                            </Label>
                          </div>
                          {record?.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.createdAt).toLocaleDateString(
                                "es-MX"
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Input
                            id={`file-${fileType.key}`}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => handleFileSelect(e, fileType.key)}
                            className="w-full text-xs sm:text-sm"
                            disabled={uploading}
                          />
                          {hasFile && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownload(
                                    filePath,
                                    `${fileType.label}.pdf`
                                  )
                                }
                                disabled={uploading}
                                className="flex-1 sm:flex-initial"
                              >
                                <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">Descargar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewFile(filePath)}
                                disabled={uploading}
                                className="flex-1 sm:flex-initial"
                              >
                                <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">Ver</span>
                              </Button>
                            </div>
                          )}
                        </div>

                        {selectedFile && (
                          <div className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-muted rounded-md text-xs sm:text-sm">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="flex-1 truncate min-w-0">
                              {selectedFile.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(fileType.key)}
                              className="text-destructive hover:text-destructive/80 font-bold text-base sm:text-lg leading-none shrink-0 px-1"
                              disabled={uploading}
                              aria-label="Eliminar archivo"
                            >
                              ×
                            </button>
                          </div>
                        )}

                        {hasFile && (
                          <p className="text-xs text-muted-foreground wrap-break-word">
                            Archivo existente: {filePath.split("/").pop()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}

                {(Object.keys(selectedFiles).length > 0 || !record) && (
                  <div className="mt-4 sm:mt-6 pt-4 border-t">
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || Object.keys(selectedFiles).length < 4 || deleting}
                      className="w-full"
                      size="lg"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="text-sm sm:text-base">
                            {record ? "Actualizando expediente..." : "Creando expediente..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          <span className="text-sm sm:text-base">
                            {record
                              ? "Actualizar expediente completo"
                              : "Crear expediente completo"}
                          </span>
                        </>
                      )}
                    </Button>
                    {Object.keys(selectedFiles).length < 4 && (
                      <p className="text-xs text-muted-foreground text-center mt-2 px-2">
                        Debes seleccionar los 4 archivos para {record ? "actualizar" : "crear"} el expediente completo
                      </p>
                    )}
                    {Object.keys(selectedFiles).length === 4 && (
                      <p className="text-xs text-muted-foreground text-center mt-2 px-2 wrap-break-word">
                        {FILE_TYPES.filter(ft => selectedFiles[ft.key]).map(ft => ft.label).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para vista previa de PDF */}
      {previewFile && (
        <Dialog
          open={!!previewFile}
          onOpenChange={() => setPreviewFile(null)}
        >
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-4xl max-h-[90vh] p-0 gap-0">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
              <DialogTitle className="text-lg sm:text-xl">Vista previa</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center max-h-[calc(90vh-80px)] p-4 sm:p-6">
              <iframe
                src={getFileUrl(previewFile)}
                className="w-full h-full min-h-[400px] sm:min-h-[500px] border rounded-lg"
                title="Vista previa del archivo"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

