"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadRequest } from "@/lib/request";

const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".webp"];

interface SelectedFile {
  file: File;
  preview: string;
  id: string;
}

interface FormEvidenciasProps {
  onUploadSuccess?: () => void;
}

export function FormEvidencias({ onUploadSuccess }: FormEvidenciasProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tipo MIME
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      toast.error("Tipo de archivo no permitido", {
        description: `El archivo ${file.name} no es un formato válido. Solo se permiten: JPEG, PNG, WEBP, JPG`,
      });
      return false;
    }

    // Validar extensión
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error("Extensión no permitida", {
        description: `El archivo ${file.name} no tiene una extensión válida.`,
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Verificar límite de archivos
    const remainingSlots = MAX_FILES - selectedFiles.length;
    if (files.length > remainingSlots) {
      toast.error("Límite de archivos excedido", {
        description: `Solo puedes subir ${remainingSlots} archivo(s) más. Máximo ${MAX_FILES} archivos.`,
      });
      return;
    }

    const validFiles: SelectedFile[] = [];

    files.forEach((file) => {
      if (validateFile(file)) {
        const preview = URL.createObjectURL(file);
        validFiles.push({
          file,
          preview,
          id: `${Date.now()}-${Math.random()}`,
        });
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error("No hay archivos seleccionados", {
        description: "Por favor, selecciona al menos una imagen para subir.",
      });
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      selectedFiles.forEach((selectedFile) => {
        formData.append("fotos", selectedFile.file);
      });

      const response = await uploadRequest(
        "/alcoholimetria/gallery/createGallery",
        formData,
        "POST"
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Evidencias subidas exitosamente", {
          description: `${selectedFiles.length} archivo(s) subido(s) correctamente.`,
        });

        // Limpiar archivos seleccionados
        selectedFiles.forEach((file) => {
          URL.revokeObjectURL(file.preview);
        });
        setSelectedFiles([]);
        
        // Notificar que se deben recargar las evidencias
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        toast.error("Error al subir evidencias", {
          description:
            response?.message ||
            "No se pudieron subir las evidencias. Intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error("Error al subir evidencias", error);
      toast.error("Error de red", {
        description: "No se pudo comunicar con el servidor.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Limpiar previews al desmontar
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fotos">Seleccionar Fotos</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Máximo {MAX_FILES} archivos. Formatos permitidos: JPEG, PNG, WEBP, JPG
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Input
            ref={fileInputRef}
            id="fotos"
            type="file"
            accept=".jpeg,.jpg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || selectedFiles.length >= MAX_FILES}
            className="cursor-pointer"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || selectedFiles.length >= MAX_FILES}
          >
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar
          </Button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Archivos seleccionados: {selectedFiles.length} / {MAX_FILES}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {selectedFiles.map((selectedFile) => (
                <div
                  key={selectedFile.id}
                  className="relative group border rounded-lg overflow-hidden bg-muted/50"
                >
                  <div className="aspect-square relative">
                    <img
                      src={selectedFile.preview}
                      alt={selectedFile.file.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(selectedFile.id)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFiles.length === 0 && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No hay archivos seleccionados
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Haz clic en "Seleccionar" para elegir las imágenes
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            cleanup();
            setSelectedFiles([]);
          }}
          disabled={uploading || selectedFiles.length === 0}
        >
          Limpiar
        </Button>
        <Button type="submit" disabled={uploading || selectedFiles.length === 0}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir Evidencias
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

