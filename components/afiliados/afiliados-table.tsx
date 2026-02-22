"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import { Eye, Edit, IdCard, Loader2, RefreshCcw, Trash2, FolderOpen, Download } from "lucide-react";
import { ExpedienteDialog } from "./expediente-dialog";

export interface AfiliadoListado {
  id: string;
  curp: string;
  noAfiliacion?: string;
  sidmoCodigo?: string | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  genero: "masculino" | "femenino" | "lgbt+" | "LGBTQ+" | string;
  telefono?: string;
  ciudad?: string;
  lugarTrabajoId?: string;
  lugarTrabajoCodigo?: string;
  lugarTrabajoNombre?: string;
  estatus: "activo" | "inactivo" | "suspendido" | "pendiente";
  // Campos extra opcionales que puede devolver la API
  fechaNacimiento?: string;
  fechaInicio?: string;
  fechaInicioTijuana?: string;
  estadoCivil?: string;
  actaNacimiento?: boolean;
  lugarProcedencia?: string;
  email?: string;
  direccion?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  ocupacion?: string;
  catalogoCalle?: string;
  catalogoColonia?: string;
  catalogoCodigoPostal?: string;
  catalogoCiudad?: string;
  catalogoEstado?: string;
  catalogoTelefono?: string;
  foto?: string | null;
}

interface AfiliadosTableProps {
  afiliados: AfiliadoListado[];
  loading?: boolean;
  onReload?: () => Promise<void> | void;
}

const generoLabels: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  "lgbt+": "LGBT+",
  lgbtq: "LGBTQ+",
  "lgbtq+": "LGBTQ+",
};

const estatusVariants = {
  activo: "success",
  vigente: "success",
  inactivo: "secondary",
  suspendido: "destructive",
  pendiente: "outline",
} as const;

const ITEMS_PER_PAGE = 10;
const LOGO_PATH = "/Logo_XXVAyto_Horizontal.png";
let logoDataUrlCache: string | null = null;

const loadLogoDataUrl = async () => {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const response = await fetch(LOGO_PATH);
    const blob = await response.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onerror = () => reject(new Error("No se pudo leer el logo"));
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    logoDataUrlCache = dataUrl;
    return dataUrl;
  } catch (error) {
    console.warn("No se pudo cargar el logo para PDF", error);
    return null;
  }
};

export function AfiliadosTable({
  afiliados,
  loading = false,
  onReload,
}: AfiliadosTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [expedienteOpen, setExpedienteOpen] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState<AfiliadoListado | null>(null);
  const [page, setPage] = useState(0);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const reloadRef = useRef<(() => Promise<void> | void) | undefined>(onReload);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(afiliados.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedAfiliados = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return afiliados.slice(start, start + ITEMS_PER_PAGE);
  }, [afiliados, page]);

  const showingStart = afiliados.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    afiliados.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, afiliados.length);

  useEffect(() => {
    reloadRef.current = onReload;
  }, [onReload]);

  const handleRefresh = () => {
    setRefreshToken((prev) => prev + 1);
  };

  useEffect(() => {
    if (refreshToken === 0) return;

    let cancelled = false;
    const runReload = async () => {
      setIsReloading(true);
      try {
        if (onReload) {
          await onReload();
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("Error al recargar afiliados", error);
        toast({
          variant: "destructive",
          title: "No se pudo recargar",
          description: "Intenta de nuevo más tarde.",
        });
      } finally {
        if (!cancelled) {
          setIsReloading(false);
        }
      }
    };

    runReload();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, router, toast]);

  const handleEdit = (afiliado: AfiliadoListado) => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("afiliado-current", JSON.stringify(afiliado));
      }
    } catch (error) {
      console.warn("No se pudo guardar afiliado en cache", error);
    }
    router.push(`/afiliados/${afiliado.id}/editar`);
  };

  const handleDelete = async (afiliado: AfiliadoListado) => {
    const confirmDelete = window.confirm(
      `¿Eliminar al afiliado ${afiliado.nombres} ${afiliado.apellidoPaterno}?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(afiliado.id);
      const response = await request(
        `/sics/affiliates/deleteAffiliate/${afiliado.id}`,
        "DELETE"
      );

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Afiliado eliminado",
          description: "El afiliado fue eliminado correctamente.",
        });
        setRefreshToken((prev) => prev + 1);
      } else {
        toast({
          variant: "destructive",
          title: "No se pudo eliminar",
          description: response?.message || "Intenta de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al eliminar afiliado", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "Ocurrió un error. Intenta nuevamente.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCredencial = (afiliado: AfiliadoListado) => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("afiliado-current", JSON.stringify(afiliado));
      }
    } catch (error) {
      console.warn("No se pudo guardar afiliado en cache", error);
    }
    const identifier = afiliado.curp || afiliado.id;
    router.push(`/afiliados/${identifier}/credencial`);
  };

  const handleExpediente = (afiliado: AfiliadoListado) => {
    setSelectedAfiliado(afiliado);
    setExpedienteOpen(true);
  };

  const handleExportExpediente = async (afiliado: AfiliadoListado) => {
    setExportingId(afiliado.id);
    try {
      // Obtener datos del expediente
      const response = await request(
        `/sics/affiliates/getAffiliateInfo/${afiliado.id}`,
        "GET"
      );

      if (response.status < 200 || response.status >= 300) {
        toast({
          variant: "destructive",
          title: "No se pudo obtener el expediente",
          description: response?.message || "Intenta de nuevo más tarde.",
        });
        return;
      }

      const affiliateData = response?.affiliate;
      if (!affiliateData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontraron datos del expediente.",
        });
        return;
      }

      // Generar PDF
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 12;
      const marginRight = pageWidth - marginX;
      const centerX = pageWidth / 2;
      const logoDataUrl = await loadLogoDataUrl();
      const baseFont = "helvetica";

      const now = new Date();
      const day = `${now.getDate()}`.padStart(2, "0");
      const month = now.toLocaleString("es-MX", { month: "long" }).toUpperCase();
      const year = `${now.getFullYear()}`;
      const fechaEmision = `${day} de ${month} de ${year}`;

      const safe = (value?: string | number | null) =>
        value === undefined || value === null || `${value}`.trim() === ""
          ? "-"
          : `${value}`;

      const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      const formatDateTime = (dateString?: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      let cursorY = 12;

      // Logo y encabezado
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, cursorY, 60, 20);
      }

      doc.setFontSize(10);
      doc.setFont(baseFont, "bold");
      doc.text(
        "Dirección Municipal de Prevención\nControl y Sanidad",
        centerX,
        cursorY + 8,
        { align: "center" }
      );
      doc.setFont(baseFont, "normal");
      doc.text("Expediente Médico", marginRight, cursorY + 8, {
        align: "right",
      });

      cursorY += 25;
      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      doc.line(marginX, cursorY, marginRight, cursorY);

      cursorY += 8;
      doc.setFontSize(12);
      doc.setFont(baseFont, "bold");
      doc.text("EXPEDIENTE MÉDICO", centerX, cursorY, { align: "center" });
      cursorY += 6;

      doc.setLineWidth(0.3);
      doc.line(marginX, cursorY, marginRight, cursorY);
      cursorY += 8;

      // Fecha de emisión
      doc.setFontSize(9);
      doc.setFont(baseFont, "normal");
      doc.text(`Fecha de emisión: ${fechaEmision}`, marginRight, cursorY, {
        align: "right",
      });
      cursorY += 10;

      // Información del afiliado
      doc.setFontSize(11);
      doc.setFont(baseFont, "bold");
      doc.text("INFORMACIÓN DEL AFILIADO", marginX, cursorY);
      cursorY += 8;

      doc.setFontSize(9);
      const nombreCompleto = [
        affiliateData.nombre,
        affiliateData.apellido_paterno,
        affiliateData.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ");

      const drawLabeledRow = (label: string, value: string, y: number) => {
        doc.setFont(baseFont, "bold");
        doc.text(`${label}:`, marginX, y);
        doc.setFont(baseFont, "normal");
        const lines = doc.splitTextToSize(value, marginRight - marginX - 50);
        doc.text(lines, marginX + 50, y);
        return lines.length * 5;
      };

      cursorY += drawLabeledRow("Nombre completo", nombreCompleto, cursorY);
      cursorY += drawLabeledRow("CURP", safe(affiliateData.curp), cursorY);
      cursorY += drawLabeledRow(
        "Fecha de nacimiento",
        formatDate(affiliateData.fecha_nacimiento),
        cursorY
      );
      cursorY += drawLabeledRow("Género", safe(affiliateData.genero), cursorY);
      cursorY += drawLabeledRow("Email", safe(affiliateData.email), cursorY);
      cursorY += drawLabeledRow("Teléfono", safe(affiliateData.telefono), cursorY);
      cursorY += drawLabeledRow("Dirección", safe(affiliateData.direccion), cursorY);
      cursorY += 8;

      // Notas médicas
      if (affiliateData.Nota_Medica && affiliateData.Nota_Medica.length > 0) {
        if (cursorY > pageHeight - 50) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFontSize(11);
        doc.setFont(baseFont, "bold");
        doc.text("NOTAS MÉDICAS", marginX, cursorY);
        cursorY += 8;

        doc.setFontSize(9);
        affiliateData.Nota_Medica.forEach((nota: any, index: number) => {
          if (cursorY > pageHeight - 60) {
            doc.addPage();
            cursorY = 20;
          }

          doc.setFont(baseFont, "bold");
          doc.text(`Nota Médica ${index + 1}`, marginX, cursorY);
          cursorY += 6;

          cursorY += drawLabeledRow(
            "Fecha de consulta",
            formatDateTime(nota.consulta_fecha),
            cursorY
          );
          cursorY += drawLabeledRow("Diagnóstico", safe(nota.diagnostico), cursorY);
          cursorY += drawLabeledRow("Tratamiento", safe(nota.tratamiento), cursorY);
          cursorY += drawLabeledRow("Comentario", safe(nota.comentario), cursorY);
          cursorY += 8;
        });
      }

      // Exámenes
      if (affiliateData.Examen && affiliateData.Examen.length > 0) {
        if (cursorY > pageHeight - 50) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFontSize(11);
        doc.setFont(baseFont, "bold");
        doc.text("EXÁMENES", marginX, cursorY);
        cursorY += 8;

        doc.setFontSize(9);
        affiliateData.Examen.forEach((examen: any, index: number) => {
          if (cursorY > pageHeight - 60) {
            doc.addPage();
            cursorY = 20;
          }

          doc.setFont(baseFont, "bold");
          doc.text(`Examen ${index + 1}`, marginX, cursorY);
          cursorY += 6;

          cursorY += drawLabeledRow("Tipo de examen", safe(examen.examen), cursorY);
          cursorY += drawLabeledRow(
            "Fecha de orden",
            formatDate(examen.fecha_orden),
            cursorY
          );
          cursorY += drawLabeledRow(
            "Fecha próximo examen",
            formatDate(examen.fecha_proximo_examen),
            cursorY
          );
          cursorY += drawLabeledRow("Estatus", safe(examen.estatus), cursorY);

          // Detalles de exámenes
          if (examen.Examenes && examen.Examenes.length > 0) {
            cursorY += 4;
            doc.setFont(baseFont, "bold");
            doc.text("Detalles:", marginX, cursorY);
            cursorY += 6;

            examen.Examenes.forEach((detalle: any, detIndex: number) => {
              if (cursorY > pageHeight - 40) {
                doc.addPage();
                cursorY = 20;
              }

              doc.setFont(baseFont, "normal");
              doc.setFontSize(8);
              doc.text(`  Detalle ${detIndex + 1}:`, marginX + 5, cursorY);
              cursorY += 5;
              cursorY += drawLabeledRow(
                "    Fecha de registro",
                formatDateTime(detalle.fecha_registro),
                cursorY
              );
              cursorY += drawLabeledRow(
                "    Resultado positivo",
                detalle.resultados_positivo ? "Sí" : "No",
                cursorY
              );
              if (detalle.resultados_valores) {
                cursorY += drawLabeledRow(
                  "    Valores",
                  safe(detalle.resultados_valores),
                  cursorY
                );
              }
              cursorY += 4;
            });
          }

          cursorY += 6;
        });
      }

      // Guardar PDF
      const fileName = `expediente-${affiliateData.curp || affiliateData.id}.pdf`;
      doc.save(fileName);

      // Registrar la generación del reporte
      try {
        await request("/sics/reports/createCountReport", "POST", {
          total: 1,
          nombre_reporte: "Expediente Médico",
        });
      } catch (reportError) {
        console.warn("No se pudo registrar el reporte", reportError);
      }

      toast({
        title: "Expediente exportado",
        description: "El PDF se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error al exportar expediente", error);
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: "No se pudo generar el PDF del expediente.",
      });
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Afiliados</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || isReloading || Boolean(deletingId)}
        >
          {isReloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Recargar
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Afiliación</TableHead>
            <TableHead>CURP</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Lugar de Trabajo</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                Cargando afiliados...
              </TableCell>
            </TableRow>
          ) : afiliados.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-8 text-center text-muted-foreground"
              >
                No se encontraron afiliados
              </TableCell>
            </TableRow>
          ) : (
            paginatedAfiliados.map((afiliado) => (
              <TableRow key={afiliado.id}>
                <TableCell className="font-mono text-sm">
                  {afiliado.noAfiliacion ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {afiliado.curp}
                </TableCell>
                <TableCell className="font-medium">
                  {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                  {afiliado.apellidoMaterno}
                </TableCell>
                <TableCell>
                  {generoLabels[(afiliado.genero || "").toLowerCase()] ??
                    afiliado.genero ??
                    "—"}
                </TableCell>
                <TableCell>{afiliado.telefono}</TableCell>
                <TableCell>{afiliado.ciudad}</TableCell>
                <TableCell>
                  {afiliado.lugarTrabajoCodigo
                    ? `${afiliado.lugarTrabajoCodigo} - ${
                        afiliado.lugarTrabajoNombre ?? ""
                      }`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={estatusVariants[afiliado.estatus?.toLowerCase() as keyof typeof estatusVariants] || "outline"}>
                    {afiliado.estatus.charAt(0).toUpperCase() +
                      afiliado.estatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Exportar expediente PDF"
                      onClick={() => handleExportExpediente(afiliado)}
                      disabled={exportingId === afiliado.id || isReloading}
                    >
                      {exportingId === afiliado.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver expediente de archivos"
                      onClick={() => handleExpediente(afiliado)}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver información"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                            {afiliado.apellidoMaterno}
                          </DialogTitle>
                          <DialogDescription>
                            Información del afiliado (solo lectura)
                          </DialogDescription>
                        </DialogHeader>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              No. afiliación
                            </dt>
                            <dd className="font-medium">
                              {afiliado.noAfiliacion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Código SIDMO
                            </dt>
                            <dd className="font-medium">
                              {afiliado.sidmoCodigo ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              CURP
                            </dt>
                            <dd className="font-medium break-all">
                              {afiliado.curp}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Nombre completo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                              {afiliado.apellidoMaterno}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Género
                            </dt>
                            <dd className="font-medium">
                              {generoLabels[
                                (afiliado.genero || "").toLowerCase()
                              ] ??
                                afiliado.genero ??
                                "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estatus
                            </dt>
                            <dd>
                              <Badge
                                variant={estatusVariants[afiliado.estatus?.toLowerCase() as keyof typeof estatusVariants] || "outline"}
                              >
                                {afiliado.estatus.charAt(0).toUpperCase() +
                                  afiliado.estatus.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono
                            </dt>
                            <dd className="font-medium">
                              {afiliado.telefono ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Email
                            </dt>
                            <dd className="font-medium break-all">
                              {afiliado.email ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estado civil
                            </dt>
                            <dd className="font-medium">
                              {afiliado.estadoCivil ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de nacimiento
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaNacimiento
                                ? afiliado.fechaNacimiento.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ciudad
                            </dt>
                            <dd className="font-medium">
                              {afiliado.ciudad ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Estado (lugar de trabajo)
                            </dt>
                            <dd className="font-medium">
                              {afiliado.catalogoEstado ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Dirección personal
                            </dt>
                            <dd className="font-medium">
                              {afiliado.direccion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Dirección lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {[
                                afiliado.catalogoCalle,
                                afiliado.catalogoColonia,
                                afiliado.catalogoCodigoPostal,
                              ]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ciudad lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.catalogoCiudad ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Lugar de procedencia
                            </dt>
                            <dd className="font-medium">
                              {afiliado.lugarProcedencia ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Ocupación
                            </dt>
                            <dd className="font-medium">
                              {afiliado.ocupacion ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Teléfono lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.catalogoTelefono ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de inicio
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaInicio
                                ? afiliado.fechaInicio.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha inicio Tijuana
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaInicioTijuana
                                ? afiliado.fechaInicioTijuana.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Acta de nacimiento
                            </dt>
                            <dd className="font-medium">
                              {afiliado.actaNacimiento === true
                                ? "Sí"
                                : afiliado.actaNacimiento === false
                                ? "No"
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Lugar de trabajo
                            </dt>
                            <dd className="font-medium">
                              {afiliado.lugarTrabajoCodigo
                                ? `${afiliado.lugarTrabajoCodigo} - ${
                                    afiliado.lugarTrabajoNombre ?? ""
                                  }`
                                : afiliado.lugarTrabajoNombre ?? "—"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Fecha de registro
                            </dt>
                            <dd className="font-medium">
                              {afiliado.fechaRegistro
                                ? afiliado.fechaRegistro.split("T")[0]
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => handleEdit(afiliado)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Generar Credencial"
                      onClick={() => handleCredencial(afiliado)}
                    >
                      <IdCard className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      onClick={() => handleDelete(afiliado)}
                      disabled={deletingId === afiliado.id || isReloading}
                    >
                      {deletingId === afiliado.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
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
          Mostrando {showingStart}-{showingEnd} de {afiliados.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0 || afiliados.length === 0}
          >
            Anterior
          </Button>
          <span className="text-sm font-medium">
            Página {afiliados.length === 0 ? 0 : page + 1} de{" "}
            {afiliados.length === 0 ? 0 : totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
            }
            disabled={afiliados.length === 0 || page >= totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
      
      {selectedAfiliado && (
        <ExpedienteDialog
          afiliado={selectedAfiliado}
          open={expedienteOpen}
          onOpenChange={setExpedienteOpen}
        />
      )}
    </div>
  );
}
