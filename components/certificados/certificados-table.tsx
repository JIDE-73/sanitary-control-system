"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Eye, Loader2, AlertCircle, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { request } from "@/lib/request";
import type { AlcoholCertificate } from "@/lib/types";

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

const formatBoolean = (value: any) => {
  if (value === null || value === undefined) return "Sin dato";
  return value ? "Sí" : "No";
};

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("es-MX");
};

const getPatientName = (certificate: AlcoholCertificate) => {
  const persona = certificate.Persona;
  const fullName =
    persona &&
    [persona.nombre, persona.apellido_paterno, persona.apellido_materno]
      .filter(Boolean)
      .join(" ");
  return certificate.nombre || (fullName?.trim().length ? fullName : undefined);
};

const getPatientGender = (certificate: AlcoholCertificate) =>
  certificate.genero || certificate.Persona?.genero;

const getPatientAge = (certificate: AlcoholCertificate) => {
  if (certificate.edad !== undefined) return certificate.edad;
  const birth = certificate.Persona?.fecha_nacimiento;
  if (!birth) return undefined;
  const dob = new Date(birth);
  if (isNaN(dob.getTime())) return undefined;
  const diff = Date.now() - dob.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age >= 0 ? age : undefined;
};

const getResidence = (certificate: AlcoholCertificate) => {
  if (certificate.residencia_nacional) return "Nacional";
  if (certificate.extranjera) return "Extranjera";
  if (certificate.extranjeras) return "Extranjeras";
  return "Sin dato";
};

const formatValue = (value: any, key?: string) => {
  if (typeof value === "boolean") return formatBoolean(value);
  if (key?.includes("fecha")) return formatDate(String(value));
  if (value === null || value === undefined || value === "") return "Sin dato";
  return String(value);
};

export function CertificadosTable() {
  const [certificates, setCertificates] = useState<AlcoholCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AlcoholCertificate | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await request(
          "/alcoholimetria/certificates/getCertificates",
          "GET"
        );

        if (!active) return;

        if (
          response.status >= 200 &&
          response.status < 300 &&
          Array.isArray(response.certificates)
        ) {
          setCertificates(response.certificates);
        } else {
          setError(
            response.message || "No se pudieron cargar los certificados"
          );
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar certificados"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCertificates();

    return () => {
      active = false;
    };
  }, []);

  const modalSections = useMemo(() => {
    if (!selected) return [];

    const persona = selected.Persona ?? {};
    const medico = selected.Medico ?? {};
    const patientName = getPatientName(selected);
    const age = getPatientAge(selected);

    const sections: {
      title: string;
      items: { label: string; value: any; key?: string }[];
    }[] = [
      {
        title: "Datos generales",
        items: [
          { label: "Folio", value: selected.id },
          {
            label: "Fecha de expedición",
            value: selected.fecha_expedicion,
            key: "fecha_expedicion",
          },
          { label: "Nombre", value: patientName },
          { label: "CURP", value: persona.curp },
          { label: "Identifica con", value: selected.identifica_con },
          { label: "Edad", value: age },
          { label: "Género", value: getPatientGender(selected) },
          { label: "Nacionalidad", value: selected.nacionalidad },
          { label: "Residencia", value: getResidence(selected) },
          {
            label: "Dirección",
            value: selected.direccion ?? persona.direccion,
          },
        ],
      },
      {
        title: "Exploración física",
        items: [
          { label: "Estado de conciencia", value: selected.estado_conciencia },
          { label: "Aliento", value: selected.aliento },
          { label: "Hipo", value: selected.hipo },
          { label: "Náuseas", value: selected.nauseas },
          { label: "Trastabillea", value: selected.trastabillea },
          { label: "Facies", value: selected.facies },
          { label: "Vómito", value: selected.vomito },
          { label: "Equilibrio marcha", value: selected.equilibrio_marcha },
          { label: "Equilibrio vertical", value: selected.equilibrio_vertical },
          { label: "Levantar objetos", value: selected.levantar_objetos },
          { label: "Conjuntivas", value: selected.conjuntivas },
          { label: "Signo de Romberg", value: selected.signo_romberg },
          { label: "Prueba tandem", value: selected.prueba_tandem },
          { label: "Gira sobre su eje", value: selected.gira_sobre_eje },
          {
            label: "Prueba talón-rodilla",
            value: selected.prueba_talon_rodilla,
          },
          { label: "Pupilas", value: selected.pupilas },
        ],
      },
      {
        title: "Coordinación digital",
        items: [
          { label: "Mano derecha", value: selected.mano_derecha },
          { label: "Falla derecha", value: selected.falla },
          { label: "Mano izquierda", value: selected.mano_izquierda },
          { label: "Falla izquierda", value: selected.falla1 },
          {
            label: "Dedo-nariz derecha",
            value: selected.dedo_nariz_mano_derecha,
          },
          { label: "Falla dedo-nariz derecha", value: selected.falla2 },
          {
            label: "Dedo-nariz izquierda",
            value: selected.dedo_nariz_mano_izquierda,
          },
          { label: "Falla dedo-nariz izquierda", value: selected.falla3 },
        ],
      },
      {
        title: "Habla y signos vitales",
        items: [
          { label: "Habla normal", value: selected.normal },
          { label: "Disartria", value: selected.disartria },
          { label: "Ininteligible", value: selected.ininteligible },
          { label: "Verborrea", value: selected.verborrea },
          { label: "Pulso", value: selected.signos_vitales },
          {
            label: "Frecuencia respiratoria",
            value: selected.frecuencia_respiratoria,
          },
          {
            label: "Tensión arterial",
            value:
              selected.tension_arterial !== undefined ||
              selected.tension_arterial1 !== undefined
                ? `${selected.tension_arterial ?? "-"} / ${
                    selected.tension_arterial1 ?? "-"
                  }`
                : undefined,
          },
          { label: "Temperatura", value: selected.temperatura },
        ],
      },
      {
        title: "Alcoholímetro y observaciones",
        items: [
          {
            label: "Determinación de alcohol",
            value: selected.determinacion_alcohol,
          },
          {
            label: "Determinación adicional",
            value: selected.determinacion_alcohol1,
          },
          { label: "BAC", value: selected.BAC },
          { label: "BR/AC", value: selected.BR_AC },
          { label: "Auto test", value: selected.auto_test },
          { label: "Estado de ebriedad", value: selected.estado_ebriedad },
          { label: "Observaciones", value: selected.observacion },
          {
            label: "Cuadro clínico / Descripción",
            value: selected.cuadro_clinico || selected.el_cual,
          },
          {
            label: "Estupefacientes",
            value: selected.estupefacientes
              ? `Sí (${selected.estupefacientes_texto || "sin detalle"})`
              : selected.estupefacientes === false
              ? "No"
              : undefined,
          },
        ],
      },
      {
        title: "Datos del solicitante",
        items: [
          {
            label: "Nombre del solicitante",
            value: selected.nombre_solicitante,
          },
          { label: "Placa", value: selected.no_placa },
          { label: "Departamento", value: selected.departamento },
          { label: "Dependencia", value: selected.dependencia },
          { label: "No. boleta", value: selected.no_boleta },
          { label: "Nombre del juez", value: selected.nombre_juez },
        ],
      },
      {
        title: "Datos complementarios",
        items: [
          { label: "Vehículo", value: selected.vehiculo },
          { label: "Marca", value: selected.marca },
          { label: "Modelo", value: selected.modelo },
          { label: "Placas", value: selected.placas },
          {
            label: "Nacionales o frontera",
            value: selected.nacionales_o_frontera,
          },
          { label: "Placas extranjeras", value: selected.extranjeras },
        ],
      },
      {
        title: "Datos del médico",
        items: [
          { label: "ID médico", value: selected.medico_id },
          { label: "Cédula perito", value: selected.cedula_perito },
          {
            label: "Cédula profesional",
            value: medico.cedula_profesional,
          },
          { label: "Especialidad", value: medico.especialidad },
          {
            label: "Habilitado para firmar",
            value: medico.habilitado_para_firmar,
          },
          { label: "Firma digital", value: medico.firma_digital_path },
        ],
      },
    ];

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.value !== undefined &&
            item.value !== null &&
            (typeof item.value === "boolean" || item.value !== "")
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [selected]);

  const handleOpenDetails = (certificate: AlcoholCertificate) => {
    setSelected(certificate);
    setOpen(true);
  };

  const handleDownloadPdf = async (certificate: AlcoholCertificate) => {
    setDownloadingId(certificate.id ?? null);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "letter" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 12;
      const marginY = 12;
      const contentBottom = pageHeight - marginY;
      const marginRight = pageWidth - marginX;
      const centerX = pageWidth / 2;
      const logoDataUrl = await loadLogoDataUrl();
      const baseFont = "helvetica";
      const safe = (value: any, fallback = "-") => {
        if (value === null || value === undefined) return fallback;
        const text = `${value}`.trim();
        return text === "" ? fallback : text;
      };
      const patientName = getPatientName(certificate);
      const patientGender = getPatientGender(certificate);
      const patientAge = getPatientAge(certificate);
      const patientResidence = getResidence(certificate);
      const medicoDisplay =
        certificate.medico_nombre ||
        certificate.Medico?.firma_digital_path ||
        certificate.Medico?.especialidad ||
        certificate.medico_id;
      const boolLabel = (value?: boolean) =>
        value === undefined || value === null
          ? "Sin dato"
          : value
          ? "Sí"
          : "No";
      const date = certificate.fecha_expedicion
        ? new Date(certificate.fecha_expedicion)
        : new Date();
      const dateText = date.toLocaleDateString("es-MX");
      const timeText = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const ensureSpace = (height = 10) => {
        if (y + height > contentBottom) {
          doc.addPage();
          y = marginY;
          doc.setFont(baseFont, "normal");
          doc.setFontSize(9);
        }
      };

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, 8, 50, 12);
      }
      doc.setFont(baseFont, "bold");
      doc.setFontSize(12);
      doc.text("TIJUANA, BAJA CALIFORNIA", centerX, 14, { align: "center" });
      doc.setFontSize(16);
      doc.text("CERTIFICADO DE ALCOHOLIMETRÍA", centerX, 22, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.text(`Folio: ${safe(certificate.id)}`, marginRight - 30, 10);

      let y = 28;
      doc.setFont(baseFont, "normal");
      doc.setFontSize(9);
      ensureSpace(18);
      doc.text(
        `En la ciudad de Tijuana, B.C. Siendo las ${timeText} hrs. del día ${dateText}, el suscrito médico ${safe(
          medicoDisplay
        )} con cédula ${safe(
          certificate.Medico?.cedula_profesional || certificate.cedula_perito
        )} certifico:`,
        marginX,
        y,
        { maxWidth: pageWidth - marginX * 2 }
      );

      const sectionTitle = (text: string) => {
        y += 8;
        doc.setFont(baseFont, "bold");
        doc.text(text, marginX, y);
        doc.setFont(baseFont, "normal");
        y += 5;
      };

      const line = (
        label: string,
        value: string,
        width = pageWidth - marginX * 2
      ) => {
        const text = doc.splitTextToSize(`${label}: ${value}`, width);
        const lines = Array.isArray(text) ? text.length : 1;
        ensureSpace(lines * 4.5 + 4);
        doc.text(text, marginX, y);
        y += lines * 4.5;
      };

      sectionTitle("Datos de identificación del paciente");
      line("Nombre", safe(patientName));
      line("CURP", safe(certificate.Persona?.curp));
      line("Identifica con", safe(certificate.identifica_con));
      y += 5;
      line(
        "Edad / Género",
        `${safe(patientAge)} años • ${safe(patientGender)}`
      );
      line("Nacionalidad", safe(certificate.nacionalidad));
      y += 5;
      line("Residencia", patientResidence);
      line(
        "Domicilio",
        safe(certificate.direccion || certificate.Persona?.direccion)
      );
      y += 7;

      sectionTitle("Exploración física");
      const rows = [
        [
          ["Estado de conciencia", safe(certificate.estado_conciencia)],
          ["Facies", safe(certificate.facies)],
          ["Conjuntivas", safe(certificate.conjuntivas)],
        ],
        [
          ["Aliento", safe(certificate.aliento)],
          ["Náuseas", boolLabel(certificate.nauseas)],
          ["Signo de Romberg", safe(certificate.signo_romberg)],
        ],
        [
          ["Hipo", boolLabel(certificate.hipo)],
          ["Vómito", safe(certificate.vomito)],
          ["Prueba tandem", safe(certificate.prueba_tandem)],
        ],
        [
          ["Equilibrio marcha", safe(certificate.equilibrio_marcha)],
          ["Trastabillea", boolLabel(certificate.trastabillea)],
          ["Gira sobre su eje", boolLabel(certificate.gira_sobre_eje)],
        ],
        [
          ["Equilibrio vertical", safe(certificate.equilibrio_vertical)],
          ["Cae", boolLabel(certificate.cae)],
          ["Prueba talón-rodilla", boolLabel(certificate.prueba_talon_rodilla)],
        ],
        [
          ["Levantar objetos", safe(certificate.levantar_objetos)],
          ["Pupilas", safe(certificate.pupilas)],
          ["", ""],
        ],
      ];
      rows.forEach((row) => {
        ensureSpace(7);
        let x = marginX;
        row.forEach(([label, value]) => {
          if (!label) return;
          doc.text(`${label}: ${value}`, x, y);
          x += 70;
        });
        y += 6;
      });

      sectionTitle("Prueba de coordinación digital");
      const coord = [
        ["Mano derecha", boolLabel(certificate.mano_derecha)],
        ["Falla derecha", boolLabel(certificate.falla)],
        ["Mano izquierda", boolLabel(certificate.mano_izquierda)],
        ["Falla izquierda", boolLabel(certificate.falla1)],
        ["Dedo-nariz derecha", boolLabel(certificate.dedo_nariz_mano_derecha)],
        ["Falla dedo-nariz derecha", boolLabel(certificate.falla2)],
        [
          "Dedo-nariz izquierda",
          boolLabel(certificate.dedo_nariz_mano_izquierda),
        ],
        ["Falla dedo-nariz izquierda", boolLabel(certificate.falla3)],
      ];
      coord.forEach(([label, value], idx) => {
        const x = idx % 2 === 0 ? marginX : marginX + 90;
        if (idx % 2 === 0 && idx !== 0) y += 5;
        ensureSpace(6);
        doc.text(`${label}: ${value}`, x, y);
      });
      y += 8;

      sectionTitle("Características del habla y signos vitales");
      const habla = [
        ["Normal", boolLabel(certificate.normal)],
        ["Disartria", boolLabel(certificate.disartria)],
        ["Ininteligible", boolLabel(certificate.ininteligible)],
        ["Verborrea", boolLabel(certificate.verborrea)],
      ];
      const hablaStartY = y;
      habla.forEach(([label, value]) => {
        ensureSpace(5);
        doc.text(`${label}: ${value}`, marginX, y);
        y += 4.5;
      });
      const vitales = [
        ["Pulso", safe(certificate.signos_vitales)],
        ["Frecuencia resp.", safe(certificate.frecuencia_respiratoria)],
        [
          "Tensión arterial",
          `${safe(certificate.tension_arterial)} / ${safe(
            certificate.tension_arterial1
          )}`,
        ],
        ["Temperatura", safe(certificate.temperatura)],
      ];
      let vitalY = hablaStartY;
      vitales.forEach(([label, value], idx) => {
        ensureSpace(5);
        doc.text(`${label}: ${value}`, marginX + 90, vitalY + idx * 4.5);
      });
      y = Math.max(y, vitalY + vitales.length * 4.5) + 2;

      sectionTitle("Alcoholímetro y observaciones");
      line("Determinación de alcohol", safe(certificate.determinacion_alcohol));
      line("Determinación adicional", safe(certificate.determinacion_alcohol1));
      line("BAC", boolLabel(certificate.BAC));
      line("BR/AC", boolLabel(certificate.BR_AC));
      line("Auto test", safe(certificate.auto_test));
      line("Observaciones", safe(certificate.observacion));
      y += 6;

      sectionTitle("Diagnóstico y conclusiones");
      line(
        "Cuadro clínico",
        certificate.estado_ebriedad
          ? "Bajo influjos del alcohol"
          : "Sin ebriedad aparente"
      );
      line(
        "Descripción",
        safe(certificate.cuadro_clinico || certificate.el_cual)
      );
      line(
        "Estupefacientes u otras sustancias",
        certificate.estupefacientes
          ? `Sí (${safe(certificate.estupefacientes_texto)})`
          : "No"
      );
      y += 8;

      sectionTitle("Datos del solicitante");
      line("Nombre del solicitante", safe(certificate.nombre_solicitante));
      line(
        "Placa / Departamento",
        `${safe(certificate.no_placa)} • ${safe(certificate.departamento)}`
      );
      line(
        "Dependencia / Boleta",
        `${safe(certificate.dependencia)} • ${safe(certificate.no_boleta)}`
      );
      line("Nombre del juez", safe(certificate.nombre_juez));
      y += 6;

      sectionTitle("Datos complementarios");
      line("Vehículo", safe(certificate.vehiculo));
      line(
        "Marca / Modelo / Placas",
        `${safe(certificate.marca)} • ${safe(certificate.modelo)} • ${safe(
          certificate.placas
        )}`
      );
      line(
        "Placas extranjeras",
        (() => {
          if (certificate.extranjeras === undefined) return "Sin dato";
          return certificate.extranjeras ? "Sí" : "No";
        })()
      );
      line("Nacionales o frontera", safe(certificate.nacionales_o_frontera));

      // Espacios para firmas y sello
      ensureSpace(42);
      y += 10;
      doc.setFont(baseFont, "bold");
      doc.text("Firmas / Sellos", centerX, y, { align: "center" });
      doc.setFont(baseFont, "normal");
      const signatureY = y + 22;
      const signatureWidth = 55;
      const signatures = [
        { label: "Juez municipal", x: marginX },
        { label: "Atentamente", x: centerX - signatureWidth / 2 },
        { label: "Conductor", x: marginRight - signatureWidth },
      ];
      signatures.forEach(({ label, x }) => {
        doc.line(x, signatureY, x + signatureWidth, signatureY);
        doc.text(label, x + signatureWidth / 2, signatureY + 6, {
          align: "center",
        });
      });

      doc.save(`certificado-${safe(certificate.id, "sin-folio")}.pdf`);
    } catch (err) {
      console.error("No se pudo generar el PDF del certificado", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo de documento</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Fecha de expedición</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando certificados...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-destructive"
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : certificates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No se encontraron certificados
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((certificate) => {
                const isEbrio = Boolean((certificate as any).estado_ebriedad);
                const patientName = getPatientName(certificate);
                const patientGender = getPatientGender(certificate);
                const patientAge = getPatientAge(certificate);
                return (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {certificate.id?.slice(0, 8) ?? "Sin ID"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {patientName || "Sin nombre"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {patientGender || "N/D"}
                    </TableCell>
                    <TableCell>{patientAge ?? "N/D"}</TableCell>
                    <TableCell>
                      {formatDate(certificate.fecha_expedicion)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isEbrio ? "destructive" : "secondary"}>
                        {isEbrio
                          ? "En estado de ebriedad"
                          : "Sin ebriedad aparente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetails(certificate)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPdf(certificate)}
                        title="Descargar PDF"
                        disabled={downloadingId === certificate.id}
                      >
                        {downloadingId === certificate.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setSelected(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {selected
                ? `Certificado de ${getPatientName(selected) || "Paciente"}`
                : "Detalle del certificado"}
            </DialogTitle>
            <DialogDescription>
              {selected?.fecha_expedicion
                ? `Emitido el ${formatDate(selected.fecha_expedicion)}`
                : null}
              {selected?.id ? ` • ID: ${selected.id}` : null}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-6">
                {modalSections.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <p className="text-sm font-semibold text-primary">
                      {section.title}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {section.items.map((item) => (
                        <div
                          key={`${section.title}-${item.label}`}
                          className="rounded-lg border bg-muted/40 p-3"
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold wrap-break-word">
                            {formatValue(item.value, item.key)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
