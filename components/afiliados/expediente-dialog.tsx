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
  const [uploadingField, setUploadingField] = useState<string | null>(null);
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

  const handleUpload = async (fileKey?: string) => {
    // Si se especifica un fileKey, solo subir ese archivo
    // Si no, subir todos los archivos seleccionados (4 archivos al mismo tiempo)
    const filesToUpload = fileKey
      ? { [fileKey]: selectedFiles[fileKey] }
      : selectedFiles;

    const fileKeys = Object.keys(filesToUpload);
    
    if (fileKeys.length === 0) {
      toast({
        variant: "destructive",
        title: "No hay archivos",
        description: "Selecciona al menos un archivo para subir.",
      });
      return;
    }

    // Si no hay fileKey, se deben subir los 4 archivos al mismo tiempo
    if (!fileKey && fileKeys.length < 4) {
      const missingFiles = FILE_TYPES.filter(
        (ft) => !filesToUpload[ft.key]
      );
      toast({
        variant: "destructive",
        title: "Archivos incompletos",
        description: `Debes seleccionar los 4 archivos para crear el expediente completo. Faltan: ${missingFiles.map((f) => f.label).join(", ")}`,
      });
      return;
    }

    setUploading(true);
    if (fileKey) {
      setUploadingField(fileKey);
    }

    try {
      const formData = new FormData();
      formData.append("persona_id", afiliado.id);

      fileKeys.forEach((key) => {
        const file = filesToUpload[key];
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
            ? fileKey
              ? "Archivo actualizado"
              : "Expediente actualizado"
            : "Expediente creado",
          description: isUpdate
            ? fileKey
              ? "El archivo fue actualizado correctamente."
              : "El expediente fue actualizado correctamente."
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
      setUploadingField(null);
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
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Expediente - {afiliado.nombres} {afiliado.apellidoPaterno}
            </DialogTitle>
            <DialogDescription>
              Gestiona los archivos del expediente médico (todos los documentos deben ser PDF)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Lista de archivos del expediente */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Label>Archivos del expediente</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadRecord}
                    disabled={loading || deleting}
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
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar Expediente
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="space-y-4">
                      {FILE_TYPES.map((fileType) => {
                        const Icon = fileType.icon;
                        const filePath = record?.[fileType.key];
                        const selectedFile = selectedFiles[fileType.key];
                        const hasFile = !!filePath;
                        const isUploading = uploadingField === fileType.key;

                        return (
                          <div
                            key={fileType.key}
                            className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <Label className="text-base font-medium">
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

                            <div className="flex gap-2">
                              <Input
                                id={`file-${fileType.key}`}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => handleFileSelect(e, fileType.key)}
                                className="flex-1"
                                disabled={uploading || isUploading}
                              />
                              <Button
                                onClick={() => handleUpload(fileType.key)}
                                disabled={
                                  !selectedFile || uploading || isUploading
                                }
                                size="sm"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Subiendo...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {hasFile ? "Actualizar" : "Subir"}
                                  </>
                                )}
                              </Button>
                              {hasFile && (
                                <>
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
                                  >
                                    <Download className="mr-2 h-3 w-3" />
                                    Descargar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewFile(filePath)}
                                    disabled={uploading}
                                  >
                                    <Eye className="mr-2 h-3 w-3" />
                                    Ver
                                  </Button>
                                </>
                              )}
                            </div>

                            {selectedFile && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
                                <FileText className="h-4 w-4" />
                                <span className="flex-1 truncate">
                                  {selectedFile.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSelectedFile(fileType.key)}
                                  className="text-destructive hover:text-destructive/80"
                                  disabled={uploading}
                                >
                                  ×
                                </button>
                              </div>
                            )}

                            {hasFile && (
                              <p className="text-xs text-muted-foreground">
                                Archivo existente: {filePath.split("/").pop()}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!record && !loading && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No hay expediente creado aún
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sube los archivos requeridos para crear el expediente
                        </p>
                      </div>
                    )}

                    {Object.keys(selectedFiles).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleUpload()}
                          disabled={uploading || Object.keys(selectedFiles).length < 4 || deleting}
                          className="w-full"
                          size="lg"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {record ? "Actualizando expediente..." : "Creando expediente..."}
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              {record
                                ? "Actualizar todos los archivos"
                                : "Crear expediente completo"}
                            </>
                          )}
                        </Button>
                        {Object.keys(selectedFiles).length < 4 && (
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Selecciona los 4 archivos para crear el expediente completo
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para vista previa de PDF */}
      {previewFile && (
        <Dialog
          open={!!previewFile}
          onOpenChange={() => setPreviewFile(null)}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Vista previa</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center max-h-[70vh]">
              <iframe
                src={getFileUrl(previewFile)}
                className="w-full h-[70vh] border rounded-lg"
                title="Vista previa del archivo"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

