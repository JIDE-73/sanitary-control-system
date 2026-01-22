"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Camera, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

interface AvatarUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  label?: string;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  label = "Avatar",
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(() => {
    // Inicializar preview basado en value
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentFileRef = useRef<File | null>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError(
        "Formato no permitido. Solo se aceptan: JPEG, PNG, WEBP, JPG"
      );
      return false;
    }
    return true;
  };

  const handleFileSelect = useCallback(
    (file: File | null) => {
      setError(null);
      if (!file) {
        currentFileRef.current = null;
        setPreview((prevPreview) => {
          if (prevPreview && prevPreview.startsWith("blob:")) {
            URL.revokeObjectURL(prevPreview);
          }
          return null;
        });
        onChange(null);
        return;
      }

      if (!validateFile(file)) {
        return;
      }

      currentFileRef.current = file;
      setPreview((prevPreview) => {
        // Limpiar URL anterior si existe
        if (prevPreview && prevPreview.startsWith("blob:")) {
          URL.revokeObjectURL(prevPreview);
        }
        return URL.createObjectURL(file);
      });
      onChange(file);
    },
    [onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
    // Reset input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setCameraError(
        "No se pudo acceder a la cámara. Por favor, verifica los permisos."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleCameraClick = () => {
    setShowCameraDialog(true);
  };

  const handleCloseCameraDialog = () => {
    stopCamera();
    setShowCameraDialog(false);
    setCameraError(null);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        // Convertir blob a File
        const file = new File([blob], "photo.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        handleFileSelect(file);
        stopCamera();
        setShowCameraDialog(false);
        setCameraError(null);
      },
      "image/jpeg",
      0.9 // Calidad
    );
  }, [handleFileSelect, stopCamera]);

  // Iniciar cámara cuando se abre el diálogo
  useEffect(() => {
    if (showCameraDialog) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [showCameraDialog, startCamera, stopCamera]);

  // Sincronizar preview con value prop (solo cuando cambia externamente, no por handleFileSelect)
  useEffect(() => {
    // Si el File es el mismo que ya tenemos, no hacer nada
    if (value instanceof File && value === currentFileRef.current) {
      return;
    }

    // Si el value es un File, crear URL; si es string, usarlo directamente; si es null, limpiar
    if (value instanceof File) {
      currentFileRef.current = value;
      setPreview((prevPreview) => {
        // Limpiar URL anterior si existe
        if (prevPreview && prevPreview.startsWith("blob:")) {
          URL.revokeObjectURL(prevPreview);
        }
        return URL.createObjectURL(value);
      });
    } else if (typeof value === "string" && value.trim()) {
      currentFileRef.current = null;
      setPreview((prevPreview) => {
        // Solo actualizar si el valor es diferente
        if (prevPreview === value) {
          return prevPreview;
        }
        // Limpiar blob URL anterior si existe
        if (prevPreview && prevPreview.startsWith("blob:")) {
          URL.revokeObjectURL(prevPreview);
        }
        return value;
      });
    } else if (!value || (typeof value === "string" && !value.trim())) {
      currentFileRef.current = null;
      setPreview((prevPreview) => {
        if (prevPreview && prevPreview.startsWith("blob:")) {
          URL.revokeObjectURL(prevPreview);
        }
        return null;
      });
    }
  }, [value]);

  // Limpiar URLs de objetos cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleRemove = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="space-y-4">
        {/* Preview */}
        {preview && (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border bg-muted">
              <img
                src={preview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Cargar Imagen
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCameraClick}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Tomar Foto
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Camera Dialog */}
        <Dialog open={showCameraDialog} onOpenChange={handleCloseCameraDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tomar Foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {cameraError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive mb-4">{cameraError}</p>
                  <Button onClick={handleCloseCameraDialog} variant="outline">
                    Cerrar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative w-full bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseCameraDialog}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="rounded-full h-16 w-16 p-0"
                    >
                      <Circle className="h-8 w-8 fill-white" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Help text */}
        {!preview && (
          <p className="text-xs text-muted-foreground">
            Formatos permitidos: JPEG, PNG, WEBP, JPG
          </p>
        )}
      </div>
    </div>
  );
}

