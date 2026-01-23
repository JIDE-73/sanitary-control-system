"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import type { AfiliadoListado } from "@/components/afiliados/afiliados-table";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { request } from "@/lib/request";
import { ArrowLeft, IdCard, RefreshCcw, Download } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_URL;
const validationBaseUrl = process.env.NEXT_PUBLIC_CERV || process.env.NEXT_PUBLIC_URL || "https://localhost:3000";

interface PageProps {
  params: Promise<{ id: string }>;
}

const normalizeAfiliado = (item: any): AfiliadoListado => {
  // Normalizar estatus a minúsculas
  const estatus = item?.estatus 
    ? (item.estatus.toLowerCase() === "vigente" ? "activo" : item.estatus.toLowerCase())
    : "activo";

  return {
    id: String(item?.persona_id ?? item?.persona?.id ?? item?.id ?? ""),
    noAfiliacion:
      item?.no_Afiliacion ?? item?.no_afiliacion ?? item?.noAfiliacion,
    sidmoCodigo: item?.sidmo_codigo ?? null,
    curp: item?.persona?.curp ?? "",
    nombres: item?.persona?.nombre ?? "",
    apellidoPaterno: item?.persona?.apellido_paterno ?? "",
    apellidoMaterno: item?.persona?.apellido_materno ?? "",
    genero: (item?.persona?.genero ?? "masculino") as AfiliadoListado["genero"],
    telefono: item?.persona?.telefono ?? "",
    ciudad:
      item?.catalogo?.ciudad ??
      item?.persona?.ciudad ??
      item?.lugar_procedencia ??
      "",
    lugarTrabajoId:
      item?.catalogo?.id ?? item?.persona?.catalogo_id ?? item?.lugar_trabajo,
    lugarTrabajoCodigo: item?.catalogo?.codigo ?? item?.lugar_trabajo,
    lugarTrabajoNombre: item?.catalogo?.nombre,
    estatus: estatus as AfiliadoListado["estatus"],
    fechaNacimiento: item?.persona?.fecha_nacimiento,
    fechaInicio: item?.fecha_inicio,
    fechaInicioTijuana: item?.fecha_inicio_tijuana,
    estadoCivil: item?.estado_civil,
    actaNacimiento: item?.acta_nacimiento,
    lugarProcedencia: item?.lugar_procedencia,
    email: item?.persona?.email,
    direccion: item?.persona?.direccion,
    fechaRegistro: item?.persona?.created_at,
    ocupacion: item?.persona?.ocupacion ?? item?.ocupacion,
    catalogoCalle: item?.catalogo?.calle,
    catalogoColonia: item?.catalogo?.colonia,
    catalogoCodigoPostal: item?.catalogo?.codigo_postal,
    catalogoCiudad: item?.catalogo?.ciudad,
    catalogoEstado: item?.catalogo?.estado,
    catalogoTelefono: item?.catalogo?.telefono,
    foto: item?.persona?.foto ?? null,
  };
};

const extractArray = (response: any) => {
  const candidate = Array.isArray(response?.data)
    ? response.data
    : (response?.data ?? response);

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

export default function CredencialAfiliadoPage({ params }: PageProps) {
  const { id: curp } = use(params); // el segmento de ruta lleva la curp
  const router = useRouter();

  const [afiliado, setAfiliado] = useState<AfiliadoListado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const loadAssetAsDataUrl = async (path: string) => {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (assetError) {
      console.warn(`No se pudo cargar el recurso ${path}`, assetError);
      return null;
    }
  };

  const loadAfiliado = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(
        `/sics/affiliates/getAffiliateById/${encodeURIComponent(curp)}`,
        "GET",
      );
      const data = extractArray(response);
      const item = data[0];

      if (!item) {
        setAfiliado(null);
        setError("No se encontró al afiliado solicitado.");
        return;
      }

      setAfiliado(normalizeAfiliado(item));
    } catch (err) {
      console.error("No se pudo cargar el afiliado", err);
      setError("No se pudo cargar el afiliado. Intenta de nuevo.");
      setAfiliado(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAfiliado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curp]);

  useEffect(() => {
    let mounted = true;
    const loadAssets = async () => {
      const [logo, signature] = await Promise.all([
        loadAssetAsDataUrl("/tijuana_sgm_dms_sin_fondo.png"),
        loadAssetAsDataUrl("/doc_sign.jpeg"),
      ]);

      if (!mounted) return;
      setLogoDataUrl(logo);
      setSignatureDataUrl(signature);
    };

    loadAssets();
    return () => {
      mounted = false;
    };
  }, []);

  // Cargar foto del afiliado cuando cambie
  useEffect(() => {
    let mounted = true;
    const loadPhoto = async () => {
      if (!afiliado?.foto) {
        setPhotoDataUrl(null);
        return;
      }

      const photoUrl = `${baseUrl}/${afiliado.foto}`;
      const photo = await loadAssetAsDataUrl(photoUrl);
      
      if (!mounted) return;
      setPhotoDataUrl(photo);
    };

    loadPhoto();
    return () => {
      mounted = false;
    };
  }, [afiliado?.foto]);

  const fullName = useMemo(() => {
    if (!afiliado) return "";
    return `${afiliado.nombres} ${afiliado.apellidoPaterno} ${
      afiliado.apellidoMaterno ?? ""
    }`.trim();
  }, [afiliado]);

  const handleDownloadPdf = async () => {
    if (!afiliado) return;

    setDownloading(true);
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import("jspdf");

      // Generar certificado y obtener token
      const certificateResponse = await request(
        `/sics/certificateA/generateCertificate/${afiliado.id}`,
        "GET",
      );

      const token = certificateResponse?.token;
      if (!token) {
        throw new Error("No se pudo obtener el token del certificado");
      }

      // Construir URL completa de validación
      const validationUrl = `${validationBaseUrl}${token}`;

      // Generar QR code con la URL completa de validación
      const qrDataUrl = await QRCode.toDataURL(validationUrl, {
        width: 300,
        margin: 2,
      });

      const cardWidth = 242.8;
      const cardHeight = 153;
      const margin = 14;
      const headerHeight = 45;
      const expeditionDate = (
        afiliado.fechaRegistro ? new Date(afiliado.fechaRegistro) : new Date()
      ).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [cardWidth, cardHeight],
      });

      // Fondo general
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, cardWidth, cardHeight, "F");

      // Encabezado
      doc.setFillColor(117, 13, 47);
      doc.rect(0, 0, cardWidth, headerHeight, "F");
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", margin, 8, 90, headerHeight - 16);
      }
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("Dirección Municipal de Salud", cardWidth - margin, 20, {
        align: "right",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Sistema de Control Sanitario", cardWidth - margin, 34, {
        align: "right",
      });

      // Identificador y fecha
      doc.setTextColor(23, 41, 64);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5);
      doc.text(
        `# Afiliado: ${afiliado.noAfiliacion ?? "Sin asignar"}`,
        margin,
        headerHeight + 8,
      );
      doc.text(
        `Fecha de expedición: ${expeditionDate}`,
        margin,
        headerHeight + 95,
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      // Foto
      const photoX = margin;
      const photoY = headerHeight + 10;
      const photoW = 74;
      const photoH = 78;
      doc.setDrawColor(160, 170, 185);
      doc.setLineWidth(1);
      doc.roundedRect(photoX, photoY, photoW, photoH, 6, 6);
      
      // Agregar la foto del afiliado si está disponible
      if (photoDataUrl) {
        try {
          doc.addImage(photoDataUrl, "JPEG", photoX + 2, photoY + 2, photoW - 4, photoH - 4, undefined, "FAST");
        } catch (error) {
          console.warn("No se pudo agregar la foto al PDF", error);
        }
      }

      // Datos del afiliado
      let infoX = photoX + photoW + 16;
      let cursorY = photoY + 4;
      doc.setTextColor(19, 32, 52);

      const printField = (label: string, value?: string | null) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(label, infoX, cursorY);
        cursorY += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(value && value.trim() ? value : "—", infoX, cursorY);
        cursorY += 10;
      };

      const infoFields = [
        { label: "Nombre completo", value: fullName },
        {
          label: "Teléfono",
          value: afiliado.telefono ?? afiliado.catalogoTelefono ?? "—",
        },
      ];

      infoFields.forEach((field) => printField(field.label, field.value));

      // Área de firma
      const signatureW = 120;
      const signatureH = 46;
      const signatureX = cardWidth - signatureW - margin;
      const signatureY = cardHeight - signatureH - 16;
      if (signatureDataUrl) {
        doc.addImage(
          signatureDataUrl,
          "JPEG",
          signatureX + 10,
          signatureY+2,
          signatureW - 20,
          signatureH -10,
          undefined,
          "FAST",
          -359.99,
        );
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(19, 32, 52);
      doc.text(
        "Dr. Sharai Bustamante Hernandez",
        signatureX + signatureW / 2,
        signatureY + signatureH - 2,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(
        "Jefa de control sanitario",
        signatureX + signatureW / 2,
        signatureY + signatureH + 9,
        { align: "center" },
      );

      // --- Reverso: QR con token ---
      doc.addPage([cardWidth, cardHeight], "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(" ", margin, margin + 10);

      if (qrDataUrl) {
        const qrSize = 90;
        const qrX = (cardWidth - qrSize) / 2;
        const qrY = (cardHeight - qrSize) / 2;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      }

      doc.save(`credencial-${afiliado.curp || afiliado.id}.pdf`);
    } catch (err) {
      console.error("Error al generar el PDF", err);
      setError("No se pudo generar la credencial. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error || !afiliado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <p className="text-lg font-semibold">
            No se pudo cargar la credencial
          </p>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button onClick={loadAfiliado}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">
                Expedición de credencial
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                Credencial del afiliado
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadAfiliado}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar datos
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Generando..." : "Descargar PDF"}
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Credencial sanitaria</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="capitalize"
              title="Estatus actual del afiliado"
            >
              {afiliado.estatus}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="relative flex h-48 w-36 items-center justify-center overflow-hidden rounded-lg border-2 border-muted-foreground/50 bg-muted/30">
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt={`Foto de ${fullName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="px-3 text-center text-xs text-muted-foreground">
                    Espacio reservado para la fotografía del afiliado
                  </div>
                )}
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Nombre completo
                  </p>
                  <p className="font-semibold">{fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    CURP
                  </p>
                  <p className="font-mono text-sm">{afiliado.curp || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    No. Afiliación
                  </p>
                  <p className="font-medium">
                    {afiliado.noAfiliacion ?? "Sin asignar"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    SIDMO
                  </p>
                  <p className="font-medium">{afiliado.sidmoCodigo ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Género
                  </p>
                  <p className="capitalize">{afiliado.genero}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Ocupación
                  </p>
                  <p className="font-medium">
                    {afiliado.ocupacion ?? "No especificada"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Teléfono
                  </p>
                  <p className="font-medium">
                    {afiliado.telefono ?? afiliado.catalogoTelefono ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Ciudad
                  </p>
                  <p className="font-medium">
                    {afiliado.ciudad ??
                      afiliado.catalogoCiudad ??
                      afiliado.lugarProcedencia ??
                      "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Dirección
                  </p>
                  <p className="font-medium">
                    {afiliado.direccion ??
                      afiliado.catalogoCalle ??
                      afiliado.catalogoColonia ??
                      "—"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Lugar de trabajo
                  </p>
                  <p className="font-medium">
                    {afiliado.lugarTrabajoCodigo
                      ? `${afiliado.lugarTrabajoCodigo} - ${
                          afiliado.lugarTrabajoNombre ?? ""
                        }`
                      : (afiliado.lugarTrabajoNombre ?? "—")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
