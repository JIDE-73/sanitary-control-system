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
          { label: "Nombre completo", value: getDoctorName(selected) },
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
      
      const safe = (value: any, fallback = "") => {
        if (value === null || value === undefined || value === "") return fallback;
        return `${value}`.trim();
      };
      
      const checkboxMark = (checked: boolean | undefined) => 
        checked ? "X" : " ";
      
      const boolLabel = (value?: boolean) =>
        value === undefined || value === null ? "" : value ? "Sí" : "No";

      const patientName = getPatientName(certificate);
      const patientGender = getPatientGender(certificate);
      const patientAge = getPatientAge(certificate);
      
      // Obtener datos del médico
      const medicoNombreCompleto = getDoctorName(certificate);
      const registroProfesiones = safe(
        certificate.Medico?.cedula_profesional || certificate.cedula_perito
      );
      
      // Parsear fecha y hora
      const date = certificate.fecha_expedicion
        ? new Date(certificate.fecha_expedicion)
        : new Date();
      const horas = date.getHours().toString().padStart(2, "0");
      const minutos = date.getMinutes().toString().padStart(2, "0");
      const dia = date.getDate().toString();
      const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
      ];
      const mes = meses[date.getMonth()];
      const ano = date.getFullYear().toString();

      let y = marginY;
      
      const ensureSpace = (height = 10) => {
        if (y + height > contentBottom) {
          doc.addPage();
          y = marginY;
          doc.setFont(baseFont, "normal");
          doc.setFontSize(9);
        }
      };

      // Función simplificada para escribir texto mixto (normal + negrita)
      const writeMixedText = (
        parts: Array<{ text: string; bold?: boolean }>,
        x: number = marginX,
        currentY: number = y,
        maxWidth: number = pageWidth - marginX * 2
      ): number => {
        let currentX = x;
        let lineY = currentY;
        const lineHeight = 4.5;
        
        parts.forEach((part, index) => {
          const isBold = part.bold === true;
          doc.setFont(baseFont, isBold ? "bold" : "normal");
          doc.setFontSize(9);
          
          const textLines = doc.splitTextToSize(part.text, maxWidth - (currentX - x));
          
          textLines.forEach((line: string, lineIndex: number) => {
            if (lineIndex > 0 || (index > 0 && currentX > x && currentX + doc.getTextWidth(line) > x + maxWidth)) {
              currentX = x;
              lineY += lineHeight;
              ensureSpace(lineHeight);
            }
            
            doc.text(line, currentX, lineY);
            currentX += doc.getTextWidth(line);
            
            // Agregar espacio entre partes si no es la última
            if (index < parts.length - 1 && lineIndex === textLines.length - 1) {
              const spaceWidth = doc.getTextWidth(" ");
              if (currentX + spaceWidth <= x + maxWidth) {
                doc.text(" ", currentX, lineY);
                currentX += spaceWidth;
              }
            }
          });
        });
        
        return lineY + lineHeight - currentY;
      };

      // Logo
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, y, 50, 12);
      }
      y += 18;

      // Encabezado del certificado
      ensureSpace(12);
      
      // Texto del encabezado con valores en negrita
      const ciudadValor = safe((certificate as any).ciudad, "Tijuana, B.C.");
      const medicoNombreValor = medicoNombreCompleto || "__________________________";
      const registroValor = registroProfesiones || "______________________";
      
      const headerHeight = writeMixedText([
        { text: "En la ciudad de " },
        { text: ciudadValor, bold: true },
        { text: `, Siendo las ` },
        { text: horas, bold: true },
        { text: ` hrs. ` },
        { text: minutos, bold: true },
        { text: ` min. del día ` },
        { text: dia, bold: true },
        { text: ` del mes de ` },
        { text: mes, bold: true },
        { text: ` del año ` },
        { text: ano, bold: true },
        { text: ` el suscrito médico ` },
        { text: medicoNombreValor, bold: true },
        { text: ` adscrito a la Dirección Municipal de Prevención, Control y Sanidad legalmente autorizado (a) para el ejercicio de la profesión con registro de la Dirección General de Profesiones ` },
        { text: registroValor, bold: true },
        { text: ` y bajo protesta de conducirse de decir verdad, certifico que:` }
      ], marginX, y);
      y += headerHeight + 5;

      // DATOS DE IDENTIFICACIÓN DEL PACIENTE
      ensureSpace(15);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("DATOS DE IDENTIFICACIÓN DEL PACIENTE", marginX, y);
      y += 6;
      
      // Nombre se id. con de años de edad
      const identificaCon = safe(certificate.identifica_con);
      const edadText = patientAge ? `${patientAge}` : "";
      const nombreValor = patientName || "__________________________";
      const identificaValor = identificaCon || "__________________";
      const edadValor = edadText || "____";
      
      y += writeMixedText([
        { text: "Nombre " },
        { text: nombreValor, bold: true },
        { text: " se id. con " },
        { text: identificaValor, bold: true },
        { text: " de " },
        { text: edadValor, bold: true },
        { text: " años de edad" }
      ], marginX, y) + 3;
      
      // de sexo de nacionalidad con residencia nacional o extranjera
      const generoText = safe(patientGender, "");
      const nacionalidadText = safe(certificate.nacionalidad, "");
      const residenciaNacional = certificate.residencia_nacional ? "X" : " ";
      const extranjera = certificate.extranjera ? "X" : " ";
      const generoValor = generoText || "__________________";
      const nacionalidadValor = nacionalidadText || "__________________";
      
      y += writeMixedText([
        { text: "de sexo " },
        { text: generoValor, bold: true },
        { text: " de nacionalidad " },
        { text: nacionalidadValor, bold: true },
        { text: " con residencia nacional " },
        { text: residenciaNacional, bold: true },
        { text: " o extranjera " },
        { text: extranjera, bold: true }
      ], marginX, y) + 3;
      
      // con domicilio
      const direccionText = safe(certificate.direccion || certificate.Persona?.direccion, "");
      const direccionValor = direccionText || "_____________________________________________________________________________________________";
      
      y += writeMixedText([
        { text: "con domicilio " },
        { text: direccionValor, bold: true }
      ], marginX, y) + 5;

      // EXPLORACIÓN FÍSICA
      ensureSpace(25);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("EXPLORACIÓN FÍSICA", marginX, y);
      y += 6;
      
      doc.setFont(baseFont, "normal");
      doc.setFontSize(9);
      
      // Helper para escribir línea de exploración física con valores en negrita
      const writeExploracionLine = (parts: Array<{label: string, value: string | boolean | undefined, isCheckbox?: boolean}>) => {
        const mixedParts: Array<{text: string, bold?: boolean}> = [];
        parts.forEach((part, idx) => {
          if (idx > 0) mixedParts.push({ text: "  " });
          mixedParts.push({ text: part.label });
          if (part.isCheckbox) {
            const boolValue = typeof part.value === "boolean" ? part.value : !!part.value;
            mixedParts.push({ text: ` ${checkboxMark(boolValue)}`, bold: true });
          } else {
            const value = typeof part.value === "string" ? safe(part.value, "____________") : "____________";
            mixedParts.push({ text: ` ${value}`, bold: true });
          }
        });
        writeMixedText(mixedParts, marginX, y);
        y += 5;
      };
      
      // Primera línea
      writeExploracionLine([
        { label: "Estado de conciencia", value: certificate.estado_conciencia },
        { label: "Excitado", value: certificate.excitado, isCheckbox: true },
        { label: "Facies", value: certificate.facies },
        { label: "Conjuntivas", value: certificate.conjuntivas },
        { label: "Pupilas", value: certificate.pupilas }
      ]);
      
      // Segunda línea
      writeExploracionLine([
        { label: "Aliento", value: certificate.aliento },
        { label: "Hipo", value: certificate.hipo, isCheckbox: true },
        { label: "Nauseas", value: certificate.nauseas, isCheckbox: true },
        { label: "Vómito", value: certificate.vomito === "sí" || certificate.vomito === "Sí" || certificate.vomito === "SI", isCheckbox: true },
        { label: "Signo de romberg", value: certificate.signo_romberg },
        { label: "Trastabillea", value: certificate.trastabillea, isCheckbox: true },
        { label: "Cae", value: certificate.cae, isCheckbox: true }
      ]);
      
      // Tercera línea
      writeExploracionLine([
        { label: "Equilibrio a la marcha", value: certificate.equilibrio_marcha },
        { label: "Trastabillea", value: certificate.trastabillea1, isCheckbox: true },
        { label: "Cae", value: certificate.cae1, isCheckbox: true },
        { label: "Prueba de tándem", value: certificate.prueba_tandem },
        { label: "Trastabillea", value: certificate.trastabillea2, isCheckbox: true },
        { label: "Cae", value: certificate.cae2, isCheckbox: true }
      ]);
      
      // Cuarta línea
      writeExploracionLine([
        { label: "Equilibrio vertical de reposo", value: certificate.equilibrio_vertical },
        { label: "Trastabillea", value: certificate.trastabillea3, isCheckbox: true },
        { label: "Cae", value: certificate.cae3, isCheckbox: true },
        { label: "Gira sobre su eje", value: certificate.gira_sobre_eje, isCheckbox: true },
        { label: "Trastabillea", value: certificate.trastabillea4, isCheckbox: true },
        { label: "Cae", value: certificate.cae4, isCheckbox: true }
      ]);
      
      // Quinta línea
      writeExploracionLine([
        { label: "Levantar objetos del piso", value: certificate.levantar_objetos },
        { label: "Trastabillea", value: certificate.trastabillea5, isCheckbox: true },
        { label: "Cae", value: certificate.cae5, isCheckbox: true },
        { label: "Prueba talón rodilla", value: certificate.prueba_talon_rodilla, isCheckbox: true },
        { label: "Trastabillea", value: certificate.trastabillea6, isCheckbox: true },
        { label: "Cae", value: certificate.cae6, isCheckbox: true }
      ]);
      y += 3;

      // PRUEBA DE COORDINACIÓN DIGITAL CON AMBAS MANOS
      ensureSpace(20);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("PRUEBA DE COORDINACIÓN DIGITAL CON AMBAS MANOS", marginX, y);
      y += 6;

      doc.setFont(baseFont, "normal");
      doc.setFontSize(9);
      
      // DEDO - DEDO
      doc.setFont(baseFont, "bold");
      doc.text("DEDO - DEDO:", marginX, y);
      y += 5;
      
      y += writeMixedText([
        { text: "Mano derecha: mov. controlado " },
        { text: checkboxMark(certificate.mano_derecha), bold: true },
        { text: " falla " },
        { text: checkboxMark(certificate.falla), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Mano izquierda: mov. controlado " },
        { text: checkboxMark(certificate.mano_izquierda), bold: true },
        { text: " falla " },
        { text: checkboxMark(certificate.falla1), bold: true }
      ], marginX, y) + 4;
      
      // dedo-nariz
      doc.setFont(baseFont, "bold");
      doc.text("dedo-nariz:", marginX, y);
      y += 5;
      
      y += writeMixedText([
        { text: "mano derecha: movimiento controlado " },
        { text: checkboxMark(certificate.dedo_nariz_mano_derecha), bold: true },
        { text: " falla " },
        { text: checkboxMark(certificate.falla2), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "mano izquierda: movimiento controlado " },
        { text: checkboxMark(certificate.dedo_nariz_mano_izquierda), bold: true },
        { text: " falla " },
        { text: checkboxMark(certificate.falla3), bold: true }
      ], marginX, y) + 5;
      
      // CARACTERÍSTICAS DEL HABLA
      ensureSpace(15);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("CARACTERÍSTICAS DEL HABLA", marginX, y);
      y += 6;
      
      y += writeMixedText([
        { text: "Normal " },
        { text: checkboxMark(certificate.normal), bold: true },
        { text: "  Disartria " },
        { text: checkboxMark(certificate.disartria), bold: true },
        { text: "  Inteligible " },
        { text: checkboxMark(certificate.ininteligible), bold: true },
        { text: "  Verborrrea " },
        { text: checkboxMark(certificate.verborrea), bold: true }
      ], marginX, y) + 5;
      
      // Signos vitales
      ensureSpace(20);
      y += writeMixedText([
        { text: "Signos vitales: pulso " },
        { text: safe(certificate.signos_vitales, "_____"), bold: true },
        { text: " /min." }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Frecuencia respiratoria " },
        { text: safe(certificate.frecuencia_respiratoria, "_____"), bold: true },
        { text: " resp/min." }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Tensión Arterial " },
        { text: safe(certificate.tension_arterial, "_____"), bold: true },
        { text: " / " },
        { text: safe(certificate.tension_arterial1, "_____"), bold: true },
        { text: " mm de hg" }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Temperatura " },
        { text: safe(certificate.temperatura, "_____"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Determinación de alcoholemia (en analizador de aire espirado) " },
        { text: safe(certificate.determinacion_alcohol, "____________"), bold: true },
        { text: " Br. AC " },
        { text: checkboxMark(certificate.BR_AC), bold: true }
      ], marginX, y) + 5;

      // OBSERVACIONES
      ensureSpace(20);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("OBSERVACIONES", marginX, y);
      y += 6;
      
      doc.setFont(baseFont, "normal");
      doc.setFontSize(9);
      doc.text(
        "Al ciudadano se le interrogó si padecía alguna enfermedad y si estaba bajo tratamiento médico a lo que respondió",
        marginX,
        y,
        { maxWidth: pageWidth - marginX * 2 }
      );
      y += 5;
      y += writeMixedText([
        { text: "SÍ " },
        { text: checkboxMark(certificate.si), bold: true },
        { text: "  NO " },
        { text: checkboxMark(certificate.no), bold: true }
      ], marginX, y) + 3;
      if (safe(certificate.observacion)) {
        y += writeMixedText([
          { text: "Observación: " },
          { text: safe(certificate.observacion), bold: true }
        ], marginX, y) + 3;
      }
      y += 5;

      // PRUEBAS DE RESULTADO DE ALCOHOLÍMETRO
      ensureSpace(15);
        doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("PRUEBAS DE RESULTADO DE ALCOHOLÍMETRO", marginX, y);
      y += 6;
      
      y += writeMixedText([
        { text: "Determinación de alcoholemia (analizador de aire de espirado) Resultado " },
        { text: safe(certificate.determinacion_alcohol1, "____________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "BAC " },
        { text: checkboxMark(certificate.BAC), bold: true },
        { text: "  Br. AC " },
        { text: checkboxMark(certificate.BR_AC), bold: true },
        { text: "  Auto Test # " },
        { text: safe(certificate.auto_test, "____________"), bold: true }
      ], marginX, y) + 5;

      // EN BASE A LO ANTERIORMENTE EXPUESTO
      ensureSpace(15);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text(
        "EN BASE A LO ANTERIORMENTE EXPUESTO, EL CIUDADANO PRESENTA UN CUADRO CLÍNICO DE:",
        marginX,
        y,
        { maxWidth: pageWidth - marginX * 2 }
      );
        y += 6;
      
      y += writeMixedText([
        { text: checkboxMark(certificate.estado_ebriedad), bold: true },
        { text: " Estado de Ebriedad" }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: checkboxMark(certificate.estupefacientes), bold: true },
        { text: " Estupefacientes, psicotrópicos u otras substancias tóxicas. Especifique: " },
        { text: safe(certificate.estupefacientes_texto, "_________________________________"), bold: true }
      ], marginX, y) + 5;

      // DIAGNÓSTICO Y CONCLUSIONES
      ensureSpace(15);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("DIAGNÓSTICO Y CONCLUSIONES", marginX, y);
      y += 6;

      y += writeMixedText([
        { text: "En base a lo anteriormente expuesto el ciudadano presenta un cuadro clínico de " },
        { text: safe(certificate.cuadro_clinico, "______________________________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "el cual " },
        { text: safe(certificate.el_cual, "______________________________"), bold: true },
        { text: " perturba o impide su habilidad para conducir un vehículo de motor." }
      ], marginX, y) + 5;

      // DATOS DE IDENTIFICACIÓN DEL SOLICITANTE
      ensureSpace(20);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("DATOS DE IDENTIFICACIÓN DEL SOLICITANTE", marginX, y);
      y += 6;

      y += writeMixedText([
        { text: "Nombre del solicitante " },
        { text: safe(certificate.nombre_solicitante, "______________________________________________"), bold: true },
        { text: " Identificación o núm. de placa " },
        { text: safe(certificate.no_placa, "____________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Departamento y sección a la que pertenece " },
        { text: safe(certificate.departamento, "_________________________________________________________________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Dependencia que requiere la certificación " },
        { text: safe(certificate.dependencia, "___________________________________"), bold: true },
        { text: " No. de boleta de infracción " },
        { text: safe(certificate.no_boleta, "____________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Nombre del Juez municipal que autorizó la certificación Lic. " },
        { text: safe(certificate.nombre_juez, "________________________________________________"), bold: true }
      ], marginX, y) + 5;

      // DATOS COMPLEMENTARIOS
      ensureSpace(20);
      doc.setFont(baseFont, "bold");
      doc.setFontSize(10);
      doc.text("DATOS COMPLEMENTARIOS", marginX, y);
      y += 6;
      
      y += writeMixedText([
        { text: "El ciudadano en cuestión era conductor de un vehículo " },
        { text: safe(certificate.vehiculo, "______________________________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Marca " },
        { text: safe(certificate.marca, "____________________"), bold: true },
        { text: "  Modelo " },
        { text: safe(certificate.modelo, "____________________"), bold: true }
      ], marginX, y) + 3;
      
      y += writeMixedText([
        { text: "Placas " },
        { text: safe(certificate.placas, "____________________"), bold: true },
        { text: "  Nacionales o de frontera " },
        { text: safe(certificate.nacionales_o_frontera, "____________________"), bold: true },
        { text: "  Extranjeras " },
        { text: checkboxMark(certificate.extranjeras), bold: true }
      ], marginX, y);

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
