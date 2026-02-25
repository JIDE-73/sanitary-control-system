"use client";

import { useEffect, useState } from "react";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GaleriaItem {
  id: string;
  path_foto: string;
  descripcion: string | null;
  fecha: string;
}

interface GalleryResponse {
  status: number;
  message?: string;
  gallery?: GaleriaItem[];
  galery?: GaleriaItem[];
  data?: GaleriaItem[] | { gallery?: GaleriaItem[]; galery?: GaleriaItem[] };
}

const baseUrl = process.env.NEXT_PUBLIC_URL || "";

export function GaleriaEvidencias({ onRefresh }: { onRefresh?: () => void }) {
  const [galeria, setGaleria] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GaleriaItem | null>(null);
  const { toast } = useToast();

  const loadGaleria = async () => {
    setLoading(true);
    try {
      const response = (await request(
        "/alcoholimetria/gallery/getAllGallery",
        "GET"
      )) as GalleryResponse;

      if (response.status >= 200 && response.status < 300) {
        // Nuevo contrato: { message, gallery: [] }. Se mantiene fallback por compatibilidad.
        const nestedData =
          response.data && !Array.isArray(response.data) ? response.data : undefined;
        const nestedGallery = Array.isArray(nestedData?.gallery)
          ? nestedData?.gallery
          : undefined;
        const nestedGalery = Array.isArray(nestedData?.galery)
          ? nestedData?.galery
          : undefined;

        const items = Array.isArray(response.gallery)
          ? response.gallery
          : Array.isArray(response.galery)
            ? response.galery
            : Array.isArray(response.data)
              ? response.data
              : nestedGallery
                ? nestedGallery
                : nestedGalery
                  ? nestedGalery
                  : [];

        setGaleria(items);
      } else {
        toast({
          title: "No se pudieron cargar las evidencias",
          description:
            response?.message ||
            "El backend devolvió un error al listar las evidencias.",
          variant: "destructive",
        });
        setGaleria([]);
      }
    } catch (error) {
      toast({
        title: "Error de red",
        description: "No se pudo comunicar con el backend.",
        variant: "destructive",
      });
      setGaleria([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGaleria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadGaleria();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) {
      console.warn("Path vacío para imagen");
      return "";
    }
    
    // Si el path ya es una URL completa, retornarlo
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    
    // Construir la URL completa
    // El path puede venir como "uploads/gallery/..." o "/uploads/gallery/..."
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    
    // Asegurarse de que baseUrl no termine con / y cleanPath no empiece con /
    const baseUrlClean = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const imageUrl = `${baseUrlClean}/${cleanPath}`;
    
    return imageUrl;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-MX", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (galeria.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No hay evidencias disponibles
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Revisa la consola para ver los detalles de la respuesta
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="mt-4"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Recargar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Total de evidencias: {galeria.length}
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Recargar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {galeria.map((item) => {
          const imageUrl = getImageUrl(item.path_foto);
          return (
            <div
              key={item.id}
              className="relative group border rounded-lg overflow-hidden bg-muted/50 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedImage(item)}
            >
              <div className="aspect-square relative bg-muted">
                <img
                  src={imageUrl}
                  alt={item.descripcion || "Evidencia"}
                  className="w-full h-full object-cover"

                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate">
                  {formatDate(item.fecha)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evidencia</DialogTitle>
            <DialogDescription>
              {selectedImage && formatDate(selectedImage.fecha)}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(selectedImage.path_foto)}
                  alt={selectedImage.descripcion || "Evidencia"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              {selectedImage.descripcion && (
                <p className="text-sm text-muted-foreground">
                  {selectedImage.descripcion}
                </p>
              )}
              <div className="text-xs text-muted-foreground">
                <p>ID: {selectedImage.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

