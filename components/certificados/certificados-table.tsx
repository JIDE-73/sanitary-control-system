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
import QRCode from "qrcode";

const LOGO_PATH = "/Logo_XXVAyto_Horizontal.png";
let logoDataUrlCache: string | null = null;
const validationBaseUrl = process.env.NEXT_PUBLIC_CERV || process.env.NEXT_PUBLIC_URL || "https://localhost:3000";
const apiBaseUrl = process.env.NEXT_PUBLIC_URL || "";

type GalleryEvidence = {
  id?: string;
  path_foto?: string;
  descripcion?: string | null;
  imageUrl?: string;
};

const getVigenciaCertificado = (): string => {
  if (typeof window === "undefined") return "30";
  try {
    const stored = localStorage.getItem("config_vigenciaCertificado");
    return stored || "30";
  } catch {
    return "30";
  }
};

const calcularFechaExpiracion = (diasVigencia?: string): string | null => {
  if (!diasVigencia) return null;
  
  try {
    const dias = parseInt(diasVigencia, 10);
    if (isNaN(dias)) return null;
    
    // Calcular desde la fecha actual (hoy)
    const fechaActual = new Date();
    const fechaExpiracion = new Date(fechaActual);
    fechaExpiracion.setDate(fechaExpiracion.getDate() + dias);
    
    const diasSemana = ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."];
    const diaSemana = diasSemana[fechaExpiracion.getDay()];
    const dia = fechaExpiracion.getDate().toString().padStart(2, "0");
    const mes = (fechaExpiracion.getMonth() + 1).toString().padStart(2, "0");
    const ano = fechaExpiracion.getFullYear();
    
    return `${diaSemana} ${dia}-${mes}-${ano}`;
  } catch {
    return null;
  }
};

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

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const baseUrlClean = apiBaseUrl.endsWith("/")
    ? apiBaseUrl.slice(0, -1)
    : apiBaseUrl;
  return `${baseUrlClean}/${cleanPath}`;
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

const getDoctorName = (certificate: AlcoholCertificate) => {
  // Priorizar: primero intentar construir desde Medico.persona (nueva estructura)
  const medicoPersona = certificate.Medico?.persona;
  if (medicoPersona) {
    const fullName = [
      medicoPersona.nombre,
      medicoPersona.apellido_paterno,
      medicoPersona.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (fullName) return fullName;
  }
  // Si no está disponible, intentar desde medico_nombre (campo directo)
  if (certificate.medico_nombre) {
    return certificate.medico_nombre.trim();
  }
  // Fallback al ID del médico
  return certificate.medico_id || "";
};

const formatValue = (value: any, key?: string) => {
  if (typeof value === "boolean") return formatBoolean(value);
  if (key?.includes("fecha")) return formatDate(String(value));
  if (value === null || value === undefined || value === "") return "Sin dato";
  return String(value);
};

const ITEMS_PER_PAGE = 10;

export function CertificadosTable() {
  const [certificates, setCertificates] = useState<AlcoholCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AlcoholCertificate | null>(null);
  const [expandedImage, setExpandedImage] = useState<GalleryEvidence | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(certificates.length, 1) / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const paginatedCertificates = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return certificates.slice(start, start + ITEMS_PER_PAGE);
  }, [certificates, page]);

  const showingStart = certificates.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const showingEnd =
    certificates.length === 0
      ? 0
      : Math.min((page + 1) * ITEMS_PER_PAGE, certificates.length);

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

        if (response.status >= 200 && response.status < 300) {
          const certificatesRaw = Array.isArray(response.certificates)
            ? response.certificates
            : Array.isArray(response.data)
              ? response.data
              : [];

          const mappedCertificates = certificatesRaw.map((certificate: any) => {
            const rawGallery = Array.isArray(certificate?.Galeria_Alcoholimetria)
              ? certificate.Galeria_Alcoholimetria
              : [];

            const galleryWithUrls: GalleryEvidence[] = rawGallery.map(
              (item: any) => ({
                ...item,
                imageUrl: getImageUrl(item?.path_foto),
              })
            );

            return {
              ...certificate,
              Galeria_Alcoholimetria: galleryWithUrls,
            };
          });

          setCertificates(mappedCertificates);
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
          { label: "Folio", value: selected.folio || selected.id },
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
          { label: "Nombre completo", value: getDoctorName(selected) },
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
          { label: "CURP", value: medico.persona?.curp },
          { label: "Email", value: medico.persona?.email },
          { label: "Teléfono", value: medico.persona?.telefono },
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

  /**
   * Genera el PDF del Certificado Médico de Esencia renderizando
   * un HTML idéntico al diseño aprobado, convertido a PDF con
   * html2canvas + jsPDF (una sola página, tamaño carta).
   *
   * Dependencias:
   *   npm install jspdf html2canvas qrcode
   */

  const handleDownloadPdf = async (certificate: AlcoholCertificate) => {
    setDownloadingId(certificate.id ?? null);

    try {
      const { jsPDF }   = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      // ── helpers ───────────────────────────────────────────────────────────────
      const safe = (value: any, fallback = "") => {
        if (value === null || value === undefined || value === "") return fallback;
        return `${value}`.trim();
      };

      const cb = (checked: boolean | undefined) =>
          `<b>${checked === undefined || checked === null ? "N/D" : checked ? "SI" : "NO"}</b>`;

      const val = (value: any, fallback = "______") =>
          `<u><b>${safe(value, fallback)}</b></u>`;

      const patientName   = getPatientName(certificate);
      const patientGender = getPatientGender(certificate);
      const patientAge    = getPatientAge(certificate);
      const medicoNombre  = getDoctorName(certificate);
      const cedula        = safe(certificate.Medico?.cedula_profesional || certificate.cedula_perito);

      const date    = certificate.fecha_expedicion ? new Date(certificate.fecha_expedicion) : new Date();
      const horas   = date.getHours().toString().padStart(2, "0");
      const minutos = date.getMinutes().toString().padStart(2, "0");
      const dia     = date.getDate().toString();
      const meses   = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
        "septiembre","octubre","noviembre","diciembre"];
      const mes     = meses[date.getMonth()];
      const ano     = date.getFullYear().toString();
      const folio   = safe(certificate.folio || certificate.id, "Sin folio");

      // ── Logos ─────────────────────────────────────────────────────────────────
      // Carga los logos como base64. Ajusta las rutas a donde tengas los archivos.
      const loadImgBase64 = (src: string): Promise<string> =>
          new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const c = document.createElement("canvas");
              c.width = img.naturalWidth;
              c.height = img.naturalHeight;
              c.getContext("2d")!.drawImage(img, 0, 0);
              resolve(c.toDataURL("image/png"));
            };
            img.onerror = () => resolve(""); // si no carga, omite el logo
            img.src = src;
          });

      // ── Reemplaza estas rutas con las URLs/paths reales de tus logos ──────────
      const [logoTijuanaB64, logoDmsB64] = await Promise.all([
        loadImgBase64("/Logo_XXVAyto_Horizontal.png"),   // logo XXIV Ayuntamiento Tijuana
        loadImgBase64("/logo-dms.png"),        // logo DMS Dirección Municipal de Salud
      ]);

      const logoTijuanaTag = logoTijuanaB64
          ? `<img src="${logoTijuanaB64}" class="logo-left" alt="Tijuana"/>`
          : `<div class="logo-ph-text">XXIV Ayuntamiento<br/>Tijuana 2021-2024</div>`;

      const logoDmsTag = logoDmsB64
          ? `<img src="${logoDmsB64}" class="logo-right" alt="DMS"/>`
          : `<div class="logo-ph-text" style="text-align:right">DMS<br/>Dirección Municipal<br/>de Salud</div>`;

      // ── QR opcional ──────────────────────────────────────────────────────────
      let qrImg = "";
      const token = certificate.certificadoJWT?.[0]?.token;
      if (token) {
        try {
          const QRCode = (await import("qrcode")).default;
          const url = await QRCode.toDataURL(
              `${validationBaseUrl}/validate-certificate/${token}`,
              { width: 120, margin: 1 }
          );
          qrImg = `<img src="${url}" style="width:18mm;height:18mm;" alt="QR"/>`;
        } catch { /* opcional */ }
      }

      // ── HTML ──────────────────────────────────────────────────────────────────
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7.2pt;
  color: #111;
  background: #fff;
}
.page {
  width: 215.9mm;
  min-height: 279.4mm;
  padding: 7mm 11mm 6mm 11mm;
  background: #fff;
  position: relative;
}

/* ── header ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2mm;
}
.logo-ph {
  width: 36mm; height: 14mm;
  display: flex; align-items: center;
}
.logo-left {
  height: 14mm;
  width: auto;
  max-width: 42mm;
  object-fit: contain;
  object-position: left center;
  display: block;
}
.logo-right {
  height: 14mm;
  width: auto;
  max-width: 36mm;
  object-fit: contain;
  object-position: right center;
  display: block;
}
.logo-ph-text {
  font-size: 6pt;
  color: #555;
  line-height: 1.4;
}

/* ── title ── */
.title-bar {
  background: #7b1a22;
  color: #fff;
  text-align: center;
  padding: 2.2mm 0 1.8mm;
  font-size: 11.5pt;
  font-weight: bold;
  letter-spacing: 1.5px;
  margin-bottom: 2.5mm;
}

/* ── folio ── */
.folio-row {
  text-align: right;
  font-size: 8pt;
  font-weight: bold;
  margin-bottom: 2mm;
}

/* ── section titles ── */
.sec {
  color: #7b1a22;
  font-weight: bold;
  font-size: 7pt;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin: 2mm 0 1mm;
}

/* ── paragraph rows ── */
.prow {
  line-height: 1.95;
  margin-bottom: 0.4mm;
  word-break: break-word;
}

/* ── exploración física: table layout ── */
.exp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 6.5pt;
  table-layout: fixed;
  margin-bottom: 1.2mm;
}
.exp-table td {
  vertical-align: top;
  padding: 0.6mm 1mm 0.2mm 0;
  line-height: 1.75;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
/*
  10 columns (label|value pairs × 5):
  Col1-lbl  Col1-val  Col2-lbl  Col2-val  Col3-lbl  Col3-val  Col4-lbl  Col4-val  Col5-lbl  Col5-val
  Widths tuned so all fit in ~193mm (page - margins):
*/
.exp-table col.c1l { width: 12%; }
.exp-table col.c1v { width: 10%; }
.exp-table col.c2l { width: 9%;  }
.exp-table col.c2v { width: 6%;  }
.exp-table col.c3l { width: 6%;  }
.exp-table col.c3v { width: 10%; }
.exp-table col.c4l { width: 12%; }
.exp-table col.c4v { width: 11%; }
.exp-table col.c5l { width: 9%;  }
.exp-table col.c5v { width: 15%; }
.lbl { color: #333; }
.tval { font-weight: bold; text-decoration: underline; text-underline-offset: 1px; }

/* ── coordinación digital ── */
.coord-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 6.8pt;
  table-layout: fixed;
  margin-bottom: 0.8mm;
}
.coord-table td {
  vertical-align: top;
  padding: 0 1mm 0 0;
  line-height: 1.85;
  width: 50%;
}

/* ── signos vitales ── */
.sv { font-size: 7pt; line-height: 1.95; margin-bottom: 0.4mm; }

/* ── firmas ── */
.sig-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6mm;
}
.sig-table td {
  text-align: center;
  font-size: 7pt;
  padding: 0 4mm;
  width: 33.33%;
}
.sig-line {
  border-top: 0.8px solid #333;
  display: block;
  margin: 8mm 3mm 1.5mm;
}

/* ── qr ── */
.qr-wrap {
  position: absolute;
  bottom: 7mm;
  right: 11mm;
}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo-ph">${logoTijuanaTag}</div>
    <div class="logo-ph" style="justify-content:flex-end">${logoDmsTag}</div>
  </div>

  <!-- BARRA DE TÍTULO -->
  <div class="title-bar">CERTIFICADO MÉDICO DE ESENCIA</div>

  <!-- FOLIO -->
  <div class="folio-row">Folio:&nbsp;<u><b>${folio}</b></u></div>

  <!-- PÁRRAFO INTRO -->
  <div class="prow">
    En la ciudad de Tijuana, B.C. Siendo las ${val(horas,"__")} hrs. ${val(minutos,"__")} min.
    del día ${val(dia,"__")} del mes de ${val(mes,"____________")} del año ${val(ano,"____")}
    el suscrito médico ${val(medicoNombre,"______________________________________")}
    adscrito a la Dirección Municipal de Salud legalmente autorizada para el ejercicio de la profesión
    con registro de la Dirección General de profesionales ${val(cedula,"______________________")}
    y bajo protesta de conducirse con verdad, certifico que:
  </div>

  <!-- ══ DATOS PACIENTE ══ -->
  <div class="sec">Datos de Identificación del Paciente</div>

  <div class="prow">
    Nombre ${val(patientName,"________________________________")}
    &nbsp;se id. con ${val(certificate.identifica_con,"__________")}
    &nbsp;de ${val(patientAge,"__")} años de edad
  </div>
  <div class="prow">
    de sexo ${val(patientGender,"__________")}
    &nbsp;de nacionalidad ${val(certificate.nacionalidad,"______________")}
    &nbsp;con residencia nacional ${cb(certificate.residencia_nacional)}
    &nbsp;o extranjera ${cb(certificate.extranjera)}
  </div>
  <div class="prow">
    con domicilio ${val(
          certificate.direccion || certificate.Persona?.direccion,
          "____________________________________________________________________________"
      )}
  </div>

  <!-- ══ EXPLORACIÓN FÍSICA ══ -->
  <div class="sec">Exploración Física</div>

  <table class="exp-table">
    <colgroup>
      <col class="c1l"/><col class="c1v"/>
      <col class="c2l"/><col class="c2v"/>
      <col class="c3l"/><col class="c3v"/>
      <col class="c4l"/><col class="c4v"/>
      <col class="c5l"/><col class="c5v"/>
    </colgroup>
    <tr>
      <td class="lbl">Estado de conciencia</td>
      <td><span class="tval">${safe(certificate.estado_conciencia,"______")}</span></td>
      <td class="lbl">Excitado</td>
      <td>${cb(certificate.excitado)}</td>
      <td class="lbl">Facies</td>
      <td><span class="tval">${safe(certificate.facies,"______")}</span></td>
      <td class="lbl">Conjuntivas</td>
      <td><span class="tval">${safe(certificate.conjuntivas,"______")}</span></td>
      <td class="lbl">Pupilas</td>
      <td><span class="tval">${safe(certificate.pupilas,"______")}</span></td>
    </tr>
    <tr>
      <td class="lbl">Aliento</td>
      <td><span class="tval">${safe(certificate.aliento,"______")}</span></td>
      <td class="lbl">Náuseas</td>
      <td>${cb(certificate.nauseas)}</td>
      <td class="lbl">Vómito</td>
      <td><span class="tval">${safe(certificate.vomito,"______")}</span></td>
      <td class="lbl">Signo de Romberg</td>
      <td><span class="tval">${safe(certificate.signo_romberg,"______")}</span></td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea3)}&nbsp;<span class="lbl">Cae</span>&nbsp;${cb(certificate.cae3)}</td>
    </tr>
    <tr>
      <td class="lbl">Hipo</td>
      <td>${cb(certificate.hipo)}</td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea)}</td>
      <td class="lbl">Cae</td>
      <td>${cb(certificate.cae)}</td>
      <td class="lbl">Prueba de tándem</td>
      <td><span class="tval">${safe(certificate.prueba_tandem,"______")}</span></td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea4)}&nbsp;<span class="lbl">Cae</span>&nbsp;${cb(certificate.cae4)}</td>
    </tr>
    <tr>
      <td class="lbl">Equilibrio a la marcha</td>
      <td><span class="tval">${safe(certificate.equilibrio_marcha,"______")}</span></td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea1)}</td>
      <td class="lbl">Cae</td>
      <td>${cb(certificate.cae1)}</td>
      <td class="lbl">Gira sobre su eje</td>
      <td>${cb(certificate.gira_sobre_eje)}</td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea5)}&nbsp;<span class="lbl">Cae</span>&nbsp;${cb(certificate.cae5)}</td>
    </tr>
    <tr>
      <td class="lbl">Equilibrio vertical de reposo</td>
      <td><span class="tval">${safe(certificate.equilibrio_vertical,"______")}</span></td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea2)}</td>
      <td class="lbl">Cae</td>
      <td>${cb(certificate.cae2)}</td>
      <td class="lbl">Prueba talón rodilla</td>
      <td>${cb(certificate.prueba_talon_rodilla)}</td>
      <td class="lbl">Trastabillea</td>
      <td>${cb(certificate.trastabillea6)}&nbsp;<span class="lbl">Cae</span>&nbsp;${cb(certificate.cae6)}</td>
    </tr>
    <tr>
      <td class="lbl">Levantar objetos del piso</td>
      <td colspan="9"><span class="tval">${safe(certificate.levantar_objetos,"______")}</span></td>
    </tr>
  </table>

  <!-- ══ COORDINACIÓN DIGITAL ══ -->
  <div class="sec">Prueba de Coordinación Digital con Ambas Manos</div>

  <table class="coord-table">
    <tr>
      <td>
        DEDO-DEDO: Mano derecha: mov. Controlado&nbsp;${cb(certificate.mano_derecha)}&nbsp;falla&nbsp;${cb(certificate.falla)}
      </td>
      <td>
        dedo-nariz: mano derecha: mov. controlado&nbsp;${cb(certificate.dedo_nariz_mano_derecha)}&nbsp;falla&nbsp;${cb(certificate.falla2)}
      </td>
    </tr>
    <tr>
      <td>
        Mano izquierda: mov. controlado&nbsp;${cb(certificate.mano_izquierda)}&nbsp;falla&nbsp;${cb(certificate.falla1)}
      </td>
      <td>
        dedo-nariz: mano izquierda: mov. controlado&nbsp;${cb(certificate.dedo_nariz_mano_izquierda)}&nbsp;falla&nbsp;${cb(certificate.falla3)}
      </td>
    </tr>
  </table>

  <div class="prow">
    Características del habla:&nbsp;Normal&nbsp;${cb(certificate.normal)}
    &nbsp;&nbsp;Disartria&nbsp;${cb(certificate.disartria)}
    &nbsp;&nbsp;ininteligible&nbsp;${cb(certificate.ininteligible)}
    &nbsp;&nbsp;Verborrea&nbsp;${cb(certificate.verborrea)}
  </div>

  <div class="sv">
    Signos vitales: pulso&nbsp;${val(certificate.signos_vitales)}&nbsp;/min.
    &nbsp;Frecuencia respiratoria&nbsp;${val(certificate.frecuencia_respiratoria)}&nbsp;resp/min,
    &nbsp;Tensión Arterial&nbsp;${val(certificate.tension_arterial)}&nbsp;/&nbsp;${val(certificate.tension_arterial1)}&nbsp;mm de hg
    &nbsp;Temperatura&nbsp;${val(certificate.temperatura)}
  </div>
  <div class="prow">
    Determinación de alcoholemia (en analizador de aire espirado)&nbsp;${val(certificate.determinacion_alcohol)}&nbsp;&nbsp;Br. AC
  </div>

  <!-- ══ OBSERVACIONES ══ -->
  <div class="sec">Observaciones</div>

  <div class="prow">
    Al ciudadano se le interrogó si padecía alguna enfermedad y si estaba bajo tratamiento médico
    a lo que respondió&nbsp;&nbsp;SI&nbsp;${cb(certificate.si)}&nbsp;&nbsp;&nbsp;NO&nbsp;${cb(certificate.no)}
  </div>
  ${safe(certificate.observacion)
          ? `<div class="prow">Observación:&nbsp;${val(certificate.observacion)}</div>`
          : `<div class="prow"><u style="min-width:160mm;display:inline-block">&nbsp;</u></div>`
      }

  <!-- ══ DIAGNÓSTICO Y CONCLUSIONES ══ -->
  <div class="sec">Diagnóstico y Conclusiones</div>

  <div class="prow">
    En base a lo anteriormente expuesto el ciudadano presenta un cuadro clínico de
    &nbsp;${val(certificate.cuadro_clinico,"________________________________")}
  </div>
  <div class="prow">
    ${val(certificate.el_cual,"__________________")}
    &nbsp;el cual&nbsp;<u style="min-width:42mm;display:inline-block">&nbsp;</u>
    &nbsp;perturba o impide su habilidad para conducir un vehículo de motor.
  </div>

  <!-- ══ DATOS SOLICITANTE ══ -->
  <div class="sec">Datos de Identificación del Solicitante</div>

  <div class="prow">
    Nombre del solicitante:&nbsp;${val(certificate.nombre_solicitante,"__________________________________")}
    &nbsp;&nbsp;Identificación o núm. De placa&nbsp;${val(certificate.no_placa)}
  </div>
  <div class="prow">
    Departamento y sección a la que pertenece:&nbsp;${val(certificate.departamento,"______________________________________________________________")}
  </div>
  <div class="prow">
    Dependencia que requiere la certificación:&nbsp;${val(certificate.dependencia,"____________________________")}
    &nbsp;&nbsp;No. De boleta de infracción&nbsp;${val(certificate.no_boleta)}
  </div>
  <div class="prow">
    Nombre del Juez municipal que autorizó la certificación Lic.&nbsp;${val(certificate.nombre_juez,"______________________________________________")}
  </div>

  <!-- ══ DATOS COMPLEMENTARIOS ══ -->
  <div class="sec">Datos Complementarios</div>

  <div class="prow">
    El ciudadano en cuestión era conductor de un vehículo&nbsp;${val(certificate.vehiculo,"____________________")}
    &nbsp;&nbsp;Marca&nbsp;${val(certificate.marca,"________________")}
    &nbsp;&nbsp;Modelo&nbsp;${val(certificate.modelo,"________________")}
  </div>
  <div class="prow">
    Placas&nbsp;${val(certificate.placas,"____________________")}
    &nbsp;&nbsp;Nacionales o de frontera&nbsp;${val(certificate.nacionales_o_frontera,"____________________")}
    &nbsp;&nbsp;Extranjeras&nbsp;${cb(certificate.extranjeras)}
  </div>

  <!-- ══ FIRMAS ══ -->
  <table class="sig-table">
    <tr>
      <td><span class="sig-line"></span>JUEZ MUNICIPAL</td>
      <td><span class="sig-line"></span>ATENTAMENTE</td>
      <td><span class="sig-line"></span>SOLICITANTE</td>
    </tr>
  </table>

  ${qrImg ? `<div class="qr-wrap">${qrImg}</div>` : ""}

</div>
</body>
</html>`;

      // ── Renderizar en iframe oculto ───────────────────────────────────────────
      const iframe = document.createElement("iframe");
      iframe.style.cssText =
          "position:fixed;left:-9999px;top:0;width:816px;height:1200px;border:none;visibility:hidden;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument!;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Esperar fonts + layout
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        setTimeout(resolve, 1000);
      });

      const pageEl = iframeDoc.querySelector(".page") as HTMLElement;

      // Ajustar iframe al alto real del contenido renderizado
      const realHeight = pageEl.scrollHeight;
      iframe.style.height = `${realHeight + 20}px`;

      // ── html2canvas → jsPDF ──────────────────────────────────────────────────
      const canvas = await html2canvas(pageEl, {
        // @ts-ignore
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 816,
        windowHeight: realHeight + 20,
        width: pageEl.scrollWidth,
        height: pageEl.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL("image/jpeg", 0.97);
      const doc     = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
      const pw      = doc.internal.pageSize.getWidth();
      const ph      = doc.internal.pageSize.getHeight();

      // Escalar para que quepa en una sola página manteniendo proporciones
      const canvasAspect = canvas.height / canvas.width;
      const imgW = pw;
      const imgH = Math.min(ph, pw * canvasAspect);

      doc.addImage(imgData, "JPEG", 0, 0, imgW, imgH);

      const fileName = safe(certificate.folio || certificate.id, "sin-folio");
      doc.save(`certificado-${fileName}.pdf`);

      // Registrar reporte
      try {
        await request("/sics/reports/createCountReport", "POST", {
          total: 1,
          nombre_reporte: "Certificado de Alcoholimetría",
        });
      } catch { /* no bloquea */ }

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
              paginatedCertificates.map((certificate) => {
                const isEbrio = Boolean((certificate as any).estado_ebriedad);
                const patientName = getPatientName(certificate);
                const patientGender = getPatientGender(certificate);
                const patientAge = getPatientAge(certificate);
                return (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {certificate.folio || certificate.id?.slice(0, 8) || "Sin folio"}
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
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Mostrando {showingStart}-{showingEnd} de {certificates.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0 || certificates.length === 0}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium">
              Página {certificates.length === 0 ? 0 : page + 1} de{" "}
              {certificates.length === 0 ? 0 : totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, (totalPages || 1) - 1))
              }
              disabled={certificates.length === 0 || page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setSelected(null);
            setExpandedImage(null);
          }
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
              {selected?.folio ? ` • Folio: ${selected.folio}` : selected?.id ? ` • ID: ${selected.id}` : null}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-6">
                {Array.isArray((selected as any).Galeria_Alcoholimetria) &&
                  (selected as any).Galeria_Alcoholimetria.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-primary">
                        Evidencias fotográficas
                      </p>
                      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {(selected as any).Galeria_Alcoholimetria.map(
                          (image: GalleryEvidence, idx: number) => (
                            <button
                              type="button"
                              key={image.id || `${selected.id}-img-${idx}`}
                              onClick={() => setExpandedImage(image)}
                              className="rounded-lg border bg-muted/40 p-2 hover:bg-muted/70 transition-colors"
                            >
                              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                                {image.imageUrl ? (
                                  <img
                                    src={image.imageUrl}
                                    alt={
                                      image.descripcion ||
                                      `Evidencia ${idx + 1} del certificado`
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground px-2 text-center">
                                    Imagen no disponible
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground truncate">
                                {image.descripcion || `Evidencia ${idx + 1}`}
                              </p>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
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

      <Dialog
        open={Boolean(expandedImage)}
        onOpenChange={(value) => {
          if (!value) setExpandedImage(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Imagen ampliada</DialogTitle>
            <DialogDescription>
              {expandedImage?.descripcion || "Evidencia fotográfica"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/20 p-2">
            {expandedImage?.imageUrl ? (
              <img
                src={expandedImage.imageUrl}
                alt={expandedImage.descripcion || "Evidencia ampliada"}
                className="w-full max-h-[75vh] object-contain rounded-md"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center text-sm text-muted-foreground">
                Imagen no disponible
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
