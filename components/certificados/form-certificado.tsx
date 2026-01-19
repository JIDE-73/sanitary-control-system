"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Save, User } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/request";

type CertificadoFormState = {
  // Header fields
  ciudad: string;
  hora: string;
  minutos: string;
  dia: string;
  mes: string;
  ano: string;
  nombre_medico: string;
  registro_profesiones: string;
  // Patient identification
  fecha_expedicion: string;
  medico_id: string;
  persona_id: string;
  cedula_perito: string;
  nombre: string;
  identifica_con: string;
  edad: string;
  genero: string;
  nacionalidad: string;
  residencia_nacional: boolean;
  extranjera: boolean;
  direccion: string;
  // Physical examination
  estado_conciencia: string;
  excitado: boolean;
  facies: string;
  conjuntivas: string;
  pupilas: string;
  aliento: string;
  hipo: boolean;
  nauseas: boolean;
  vomito: string;
  signo_romberg: string;
  trastabillea: boolean;
  cae: boolean;
  equilibrio_marcha: string;
  trastabillea1: boolean;
  cae1: boolean;
  prueba_tandem: string;
  trastabillea2: boolean;
  cae2: boolean;
  equilibrio_vertical: string;
  trastabillea3: boolean;
  cae3: boolean;
  gira_sobre_eje: boolean;
  trastabillea4: boolean;
  cae4: boolean;
  levantar_objetos: string;
  trastabillea5: boolean;
  cae5: boolean;
  prueba_talon_rodilla: boolean;
  trastabillea6: boolean;
  cae6: boolean;
  // Digital coordination test
  mano_derecha: boolean;
  falla: boolean;
  mano_izquierda: boolean;
  falla1: boolean;
  dedo_nariz_mano_derecha: boolean;
  falla2: boolean;
  dedo_nariz_mano_izquierda: boolean;
  falla3: boolean;
  // Speech characteristics
  normal: boolean;
  disartria: boolean;
  ininteligible: boolean;
  verborrea: boolean;
  // Vital signs
  signos_vitales: string;
  frecuencia_respiratoria: string;
  tension_arterial: string;
  tension_arterial1: string;
  temperatura: string;
  determinacion_alcohol: string;
  // Observations
  si: boolean;
  no: boolean;
  observacion: string;
  // Breathalyzer results
  determinacion_alcohol1: string;
  BAC: boolean;
  BR_AC: boolean;
  auto_test: string;
  // Diagnosis
  estado_ebriedad: boolean;
  estupefacientes: boolean;
  estupefacientes_texto: string;
  cuadro_clinico: string;
  el_cual: string;
  // Applicant identification
  nombre_solicitante: string;
  no_placa: string;
  departamento: string;
  dependencia: string;
  no_boleta: string;
  nombre_juez: string;
  // Complementary data
  vehiculo: string;
  marca: string;
  modelo: string;
  placas: string;
  nacionales_o_frontera: string;
  extranjeras: boolean;
};

export interface CertificadoFormPayload {
  folio: string;
  // Header
  ciudad: string;
  hora: string;
  minutos: string;
  dia: string;
  mes: string;
  ano: string;
  nombre_medico: string;
  registro_profesiones: string;
  // Patient identification
  fecha_expedicion: string;
  medico_id: string;
  persona_id: string;
  cedula_perito: number | null;
  nombre: string;
  identifica_con: string;
  edad: number | null;
  genero: string;
  nacionalidad: string;
  residencia_nacional: boolean;
  extranjera: boolean;
  direccion: string;
  // Physical examination
  estado_conciencia: string;
  excitado: boolean;
  facies: string;
  conjuntivas: string;
  pupilas: string;
  aliento: string;
  hipo: boolean;
  nauseas: boolean;
  vomito: string;
  signo_romberg: string;
  trastabillea: boolean;
  cae: boolean;
  equilibrio_marcha: string;
  trastabillea1: boolean;
  cae1: boolean;
  prueba_tandem: string;
  trastabillea2: boolean;
  cae2: boolean;
  equilibrio_vertical: string;
  trastabillea3: boolean;
  cae3: boolean;
  gira_sobre_eje: boolean;
  trastabillea4: boolean;
  cae4: boolean;
  levantar_objetos: string;
  trastabillea5: boolean;
  cae5: boolean;
  prueba_talon_rodilla: boolean;
  trastabillea6: boolean;
  cae6: boolean;
  // Digital coordination test
  mano_derecha: boolean;
  falla: boolean;
  mano_izquierda: boolean;
  falla1: boolean;
  dedo_nariz_mano_derecha: boolean;
  falla2: boolean;
  dedo_nariz_mano_izquierda: boolean;
  falla3: boolean;
  // Speech characteristics
  normal: boolean;
  disartria: boolean;
  ininteligible: boolean;
  verborrea: boolean;
  // Vital signs
  signos_vitales: number | null;
  frecuencia_respiratoria: number | null;
  tension_arterial: number | null;
  tension_arterial1: number | null;
  temperatura: string;
  determinacion_alcohol: string;
  // Observations
  si: boolean;
  no: boolean;
  observacion: string;
  // Breathalyzer results
  determinacion_alcohol1: string;
  BAC: boolean;
  BR_AC: boolean;
  auto_test: number | null;
  // Diagnosis
  estado_ebriedad: boolean;
  estupefacientes: boolean;
  estupefacientes_texto: string;
  cuadro_clinico: string;
  el_cual: string;
  // Applicant identification
  nombre_solicitante: string;
  no_placa: string;
  departamento: string;
  dependencia: string;
  no_boleta: number | null;
  nombre_juez: string;
  // Complementary data
  vehiculo: string;
  marca: string;
  modelo: string;
  placas: string;
  nacionales_o_frontera: string;
  extranjeras: boolean;
}

interface FormCertificadoProps {
  onSubmit: (data: CertificadoFormPayload) => void | Promise<void>;
  submitting?: boolean;
}

const initialState: CertificadoFormState = {
  // Header
  ciudad: "Tijuana, B.C.",
  hora: "",
  minutos: "",
  dia: "",
  mes: "",
  ano: "",
  nombre_medico: "",
  registro_profesiones: "",
  // Patient identification
  fecha_expedicion: new Date().toISOString().split("T")[0],
  medico_id: "",
  persona_id: "",
  cedula_perito: "",
  nombre: "",
  identifica_con: "",
  edad: "",
  genero: "",
  nacionalidad: "",
  residencia_nacional: false,
  extranjera: false,
  direccion: "",
  // Physical examination
  estado_conciencia: "",
  excitado: false,
  facies: "",
  conjuntivas: "",
  pupilas: "",
  aliento: "",
  hipo: false,
  nauseas: false,
  vomito: "",
  signo_romberg: "",
  trastabillea: false,
  cae: false,
  equilibrio_marcha: "",
  trastabillea1: false,
  cae1: false,
  prueba_tandem: "",
  trastabillea2: false,
  cae2: false,
  equilibrio_vertical: "",
  trastabillea3: false,
  cae3: false,
  gira_sobre_eje: false,
  trastabillea4: false,
  cae4: false,
  levantar_objetos: "",
  trastabillea5: false,
  cae5: false,
  prueba_talon_rodilla: false,
  trastabillea6: false,
  cae6: false,
  // Digital coordination test
  mano_derecha: false,
  falla: false,
  mano_izquierda: false,
  falla1: false,
  dedo_nariz_mano_derecha: false,
  falla2: false,
  dedo_nariz_mano_izquierda: false,
  falla3: false,
  // Speech characteristics
  normal: false,
  disartria: false,
  ininteligible: false,
  verborrea: false,
  // Vital signs
  signos_vitales: "",
  frecuencia_respiratoria: "",
  tension_arterial: "",
  tension_arterial1: "",
  temperatura: "",
  determinacion_alcohol: "",
  // Observations
  si: false,
  no: false,
  observacion: "",
  // Breathalyzer results
  determinacion_alcohol1: "",
  BAC: false,
  BR_AC: false,
  auto_test: "",
  // Diagnosis
  estado_ebriedad: false,
  estupefacientes: false,
  estupefacientes_texto: "",
  cuadro_clinico: "",
  el_cual: "",
  // Applicant identification
  nombre_solicitante: "",
  no_placa: "",
  departamento: "",
  dependencia: "",
  no_boleta: "",
  nombre_juez: "",
  // Complementary data
  vehiculo: "",
  marca: "",
  modelo: "",
  placas: "",
  nacionales_o_frontera: "",
  extranjeras: false,
};

export function FormCertificado({
  onSubmit,
  submitting = false,
}: FormCertificadoProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CertificadoFormState>(initialState);
  const [loadingCitizen, setLoadingCitizen] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  const toNumber = (value: string): number | null => {
    if (value === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleInputChange = (
    field: keyof CertificadoFormState,
    value: string
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCheckboxChange = (
    field: keyof CertificadoFormState,
    checked: boolean | "indeterminate"
  ) => setFormData((prev) => ({ ...prev, [field]: Boolean(checked) }));

  const computeAge = (isoDate?: string) => {
    if (!isoDate) return "";
    const birth = new Date(isoDate);
    if (Number.isNaN(birth.getTime())) return "";
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    const years = ageDate.getUTCFullYear() - 1970;
    return years >= 0 ? String(years) : "";
  };

  const fetchCitizen = async () => {
    const param = formData.persona_id.trim();
    if (!param) {
      toast.error(
        "Ingresa un parámetro para buscar ciudadano (id/curp/nombre)"
      );
      return;
    }

    try {
      setLoadingCitizen(true);
      const response = await request(
        `/alcoholimetria/citizens/getCitizenById/${param}`,
        "GET"
      );

      if (!response?.persona?.length) {
        toast.error("No se encontró al ciudadano");
        return;
      }

      const persona = response.persona[0];
      const nombreCompleto = [
        persona.nombre,
        persona.apellido_paterno,
        persona.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      setFormData((prev) => ({
        ...prev,
        persona_id: persona.id,
        nombre: nombreCompleto || prev.nombre,
        genero: persona.genero || prev.genero,
        direccion: persona.direccion || prev.direccion,
        edad: computeAge(persona.fecha_nacimiento),
      }));

      toast.success("Ciudadano cargado", {
        description: nombreCompleto || persona.id,
      });
    } catch (error) {
      console.error("Error al obtener ciudadano", error);
      toast.error("Error al obtener ciudadano");
    } finally {
      setLoadingCitizen(false);
    }
  };

  const fetchDoctor = async () => {
    const param = formData.medico_id.trim();
    if (!param) {
      toast.error("Ingresa un parámetro para buscar médico");
      return;
    }

    try {
      setLoadingDoctor(true);
      const response = await request(`/sics/doctors/getDoctor/${param}`, "GET");

      if (!response?.persona_id) {
        toast.error("No se encontró al médico");
        return;
      }

      const nombreMedico = response.persona
        ? `${response.persona.nombre ?? ""} ${
            response.persona.apellido_paterno ?? ""
          } ${response.persona.apellido_materno ?? ""}`.trim()
        : response.persona_id;

      setFormData((prev) => ({
        ...prev,
        medico_id: response.persona_id,
        cedula_perito: response.cedula_profesional || prev.cedula_perito,
        nombre_medico: nombreMedico || prev.nombre_medico,
        registro_profesiones: response.cedula_profesional || prev.registro_profesiones,
      }));

      toast.success("Médico cargado", {
        description: nombreMedico || response.persona_id,
      });
    } catch (error) {
      console.error("Error al obtener médico", error);
      toast.error("Error al obtener médico");
    } finally {
      setLoadingDoctor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const folio = `SICS-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 100000)
    ).padStart(5, "0")}`;

    const payload: CertificadoFormPayload = {
      folio,
      // Header
      ciudad: formData.ciudad,
      hora: formData.hora,
      minutos: formData.minutos,
      dia: formData.dia,
      mes: formData.mes,
      ano: formData.ano,
      nombre_medico: formData.nombre_medico,
      registro_profesiones: formData.registro_profesiones,
      // Patient identification
      fecha_expedicion: formData.fecha_expedicion,
      medico_id: formData.medico_id,
      persona_id: formData.persona_id,
      cedula_perito: toNumber(formData.cedula_perito),
      nombre: formData.nombre,
      identifica_con: formData.identifica_con,
      edad: toNumber(formData.edad),
      genero: formData.genero,
      nacionalidad: formData.nacionalidad,
      residencia_nacional: formData.residencia_nacional,
      extranjera: formData.extranjera,
      direccion: formData.direccion,
      // Physical examination
      estado_conciencia: formData.estado_conciencia,
      excitado: formData.excitado,
      facies: formData.facies,
      conjuntivas: formData.conjuntivas,
      pupilas: formData.pupilas,
      aliento: formData.aliento,
      hipo: formData.hipo,
      nauseas: formData.nauseas,
      vomito: formData.vomito,
      signo_romberg: formData.signo_romberg,
      trastabillea: formData.trastabillea,
      cae: formData.cae,
      equilibrio_marcha: formData.equilibrio_marcha,
      trastabillea1: formData.trastabillea1,
      cae1: formData.cae1,
      prueba_tandem: formData.prueba_tandem,
      trastabillea2: formData.trastabillea2,
      cae2: formData.cae2,
      equilibrio_vertical: formData.equilibrio_vertical,
      trastabillea3: formData.trastabillea3,
      cae3: formData.cae3,
      gira_sobre_eje: formData.gira_sobre_eje,
      trastabillea4: formData.trastabillea4,
      cae4: formData.cae4,
      levantar_objetos: formData.levantar_objetos,
      trastabillea5: formData.trastabillea5,
      cae5: formData.cae5,
      prueba_talon_rodilla: formData.prueba_talon_rodilla,
      trastabillea6: formData.trastabillea6,
      cae6: formData.cae6,
      // Digital coordination test
      mano_derecha: formData.mano_derecha,
      falla: formData.falla,
      mano_izquierda: formData.mano_izquierda,
      falla1: formData.falla1,
      dedo_nariz_mano_derecha: formData.dedo_nariz_mano_derecha,
      falla2: formData.falla2,
      dedo_nariz_mano_izquierda: formData.dedo_nariz_mano_izquierda,
      falla3: formData.falla3,
      // Speech characteristics
      normal: formData.normal,
      disartria: formData.disartria,
      ininteligible: formData.ininteligible,
      verborrea: formData.verborrea,
      // Vital signs
      signos_vitales: toNumber(formData.signos_vitales),
      frecuencia_respiratoria: toNumber(formData.frecuencia_respiratoria),
      tension_arterial: toNumber(formData.tension_arterial),
      tension_arterial1: toNumber(formData.tension_arterial1),
      temperatura: formData.temperatura,
      determinacion_alcohol: formData.determinacion_alcohol,
      // Observations
      si: formData.si,
      no: formData.no,
      observacion: formData.observacion,
      // Breathalyzer results
      determinacion_alcohol1: formData.determinacion_alcohol1,
      BAC: formData.BAC,
      BR_AC: formData.BR_AC,
      auto_test: toNumber(formData.auto_test),
      // Diagnosis
      estado_ebriedad: formData.estado_ebriedad,
      estupefacientes: formData.estupefacientes,
      estupefacientes_texto: formData.estupefacientes_texto,
      cuadro_clinico: formData.cuadro_clinico,
      el_cual: formData.el_cual,
      // Applicant identification
      nombre_solicitante: formData.nombre_solicitante,
      no_placa: formData.no_placa,
      departamento: formData.departamento,
      dependencia: formData.dependencia,
      no_boleta: toNumber(formData.no_boleta),
      nombre_juez: formData.nombre_juez,
      // Complementary data
      vehiculo: formData.vehiculo,
      marca: formData.marca,
      modelo: formData.modelo,
      placas: formData.placas,
      nacionales_o_frontera: formData.nacionales_o_frontera,
      extranjeras: formData.extranjeras,
    };

    await Promise.resolve(onSubmit(payload));
  };

  const isSubmitDisabled = useMemo(
    () =>
      !formData.fecha_expedicion ||
      !formData.medico_id ||
      !formData.persona_id ||
      !formData.nombre,
    [
      formData.fecha_expedicion,
      formData.medico_id,
      formData.persona_id,
      formData.nombre,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ENCABEZADO DEL CERTIFICADO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span>En la ciudad de</span>
              <Input
                className="w-40"
                value={formData.ciudad}
                onChange={(e) => handleInputChange("ciudad", e.target.value)}
                placeholder="Tijuana, B.C."
              />
              <span>, Siendo las</span>
              <Input
                className="w-16"
                type="number"
                value={formData.hora}
                onChange={(e) => handleInputChange("hora", e.target.value)}
                placeholder="00"
                min={0}
                max={23}
              />
              <span>hrs.</span>
              <Input
                className="w-16"
                type="number"
                value={formData.minutos}
                onChange={(e) => handleInputChange("minutos", e.target.value)}
                placeholder="00"
                min={0}
                max={59}
              />
              <span>min. del día</span>
              <Input
                className="w-16"
                type="number"
                value={formData.dia}
                onChange={(e) => handleInputChange("dia", e.target.value)}
                placeholder="DD"
                min={1}
                max={31}
              />
              <span>del mes de</span>
              <Input
                className="w-32"
                value={formData.mes}
                onChange={(e) => handleInputChange("mes", e.target.value)}
                placeholder="mes"
              />
              <span>del año</span>
              <Input
                className="w-20"
                type="number"
                value={formData.ano}
                onChange={(e) => handleInputChange("ano", e.target.value)}
                placeholder="YYYY"
                min={1900}
                max={2100}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>el suscrito médico</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.nombre_medico}
                onChange={(e) => handleInputChange("nombre_medico", e.target.value)}
                placeholder="Nombre del médico"
              />
              <span>adscrito a la Dirección Municipal de Prevención, Control y Sanidad legalmente autorizado (a) para el ejercicio de la profesión con registro de la Dirección General de Profesiones</span>
              <Input
                className="w-40"
                value={formData.registro_profesiones}
                onChange={(e) => handleInputChange("registro_profesiones", e.target.value)}
                placeholder="Registro"
              />
              <span>y bajo protesta de conducirse de decir verdad, certifico que:</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_expedicion">Fecha de expedición *</Label>
              <Input
                id="fecha_expedicion"
                type="date"
                value={formData.fecha_expedicion}
                onChange={(e) =>
                  handleInputChange("fecha_expedicion", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona_id">Persona ID *</Label>
              <div className="flex gap-2">
                <Input
                  id="persona_id"
                  value={formData.persona_id}
                  onChange={(e) =>
                    handleInputChange("persona_id", e.target.value)
                  }
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={fetchCitizen}
                  disabled={loadingCitizen || submitting}
                >
                  {loadingCitizen ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medico_id">Autoridad / Médico ID *</Label>
              <div className="flex gap-2">
                <Input
                  id="medico_id"
                  value={formData.medico_id}
                  onChange={(e) => handleInputChange("medico_id", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={fetchDoctor}
                  disabled={loadingDoctor || submitting}
                >
                  {loadingDoctor ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula_perito">Cédula del perito</Label>
              <Input
                id="cedula_perito"
                type="number"
                value={formData.cedula_perito}
                onChange={(e) =>
                  handleInputChange("cedula_perito", e.target.value)
                }
                min={0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DATOS DE IDENTIFICACIÓN DEL PACIENTE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DATOS DE IDENTIFICACIÓN DEL PACIENTE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Nombre</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
                placeholder="Nombre completo"
              />
              <span>se id. con</span>
              <Input
                className="w-32"
                value={formData.identifica_con}
                onChange={(e) =>
                  handleInputChange("identifica_con", e.target.value)
                }
                placeholder="Identificación"
              />
              <span>de</span>
              <Input
                className="w-20"
                type="number"
                value={formData.edad}
                onChange={(e) => handleInputChange("edad", e.target.value)}
                placeholder="Edad"
                min={0}
              />
              <span>años de edad</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>de sexo</span>
              <Select
                value={formData.genero}
                onValueChange={(value) => handleInputChange("genero", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="LGBTQ+">LGBTQ+</SelectItem>
                </SelectContent>
              </Select>
              <span>de nacionalidad</span>
              <Input
                className="w-40"
                value={formData.nacionalidad}
                onChange={(e) =>
                  handleInputChange("nacionalidad", e.target.value)
                }
                placeholder="Nacionalidad"
              />
              <span>con residencia nacional</span>
              <Checkbox
                id="residencia_nacional"
                checked={formData.residencia_nacional}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("residencia_nacional", checked)
                }
              />
              <span>o extranjera</span>
              <Checkbox
                id="extranjera"
                checked={formData.extranjera}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("extranjera", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>con domicilio</span>
              <Input
                className="flex-1 min-w-[400px]"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                placeholder="Domicilio completo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EXPLORACIÓN FÍSICA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">EXPLORACIÓN FÍSICA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Estado de conciencia</span>
              <Input
                className="w-32"
                value={formData.estado_conciencia}
                onChange={(e) =>
                  handleInputChange("estado_conciencia", e.target.value)
                }
              />
              <span>Excitado</span>
              <Checkbox
                id="excitado"
                checked={formData.excitado}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("excitado", checked)
                }
              />
              <span>Facies</span>
              <Input
                className="w-32"
                value={formData.facies}
                onChange={(e) => handleInputChange("facies", e.target.value)}
              />
              <span>Conjuntivas</span>
              <Input
                className="w-32"
                value={formData.conjuntivas}
                onChange={(e) => handleInputChange("conjuntivas", e.target.value)}
              />
              <span>Pupilas</span>
              <Input
                className="w-32"
                value={formData.pupilas}
                onChange={(e) => handleInputChange("pupilas", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Aliento</span>
              <Select
                value={formData.aliento}
                onValueChange={(value) => handleInputChange("aliento", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alcoholico">Alcohólico</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="acetona">Acetona</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <span>Hipo</span>
              <Checkbox
                id="hipo"
                checked={formData.hipo}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("hipo", checked)
                }
              />
              <span>Nauseas</span>
              <Checkbox
                id="nauseas"
                checked={formData.nauseas}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("nauseas", checked)
                }
              />
              <span>Vómito</span>
              <Input
                className="w-32"
                value={formData.vomito}
                onChange={(e) => handleInputChange("vomito", e.target.value)}
              />
              <span>Signo de romberg</span>
              <Input
                className="w-32"
                value={formData.signo_romberg}
                onChange={(e) =>
                  handleInputChange("signo_romberg", e.target.value)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea"
                checked={formData.trastabillea}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae"
                checked={formData.cae}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Equilibrio a la marcha</span>
              <Input
                className="w-32"
                value={formData.equilibrio_marcha}
                onChange={(e) =>
                  handleInputChange("equilibrio_marcha", e.target.value)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea1"
                checked={formData.trastabillea1}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea1", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae1"
                checked={formData.cae1}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae1", checked)
                }
              />
              <span>Prueba de tándem</span>
              <Input
                className="w-32"
                value={formData.prueba_tandem}
                onChange={(e) =>
                  handleInputChange("prueba_tandem", e.target.value)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea2"
                checked={formData.trastabillea2}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea2", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae2"
                checked={formData.cae2}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae2", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Equilibrio vertical de reposo</span>
              <Input
                className="w-32"
                value={formData.equilibrio_vertical}
                onChange={(e) =>
                  handleInputChange("equilibrio_vertical", e.target.value)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea3"
                checked={formData.trastabillea3}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea3", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae3"
                checked={formData.cae3}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae3", checked)
                }
              />
              <span>Gira sobre su eje</span>
              <Checkbox
                id="gira_sobre_eje"
                checked={formData.gira_sobre_eje}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("gira_sobre_eje", checked)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea4"
                checked={formData.trastabillea4}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea4", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae4"
                checked={formData.cae4}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae4", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Levantar objetos del piso</span>
              <Input
                className="w-32"
                value={formData.levantar_objetos}
                onChange={(e) =>
                  handleInputChange("levantar_objetos", e.target.value)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea5"
                checked={formData.trastabillea5}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea5", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae5"
                checked={formData.cae5}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae5", checked)
                }
              />
              <span>Prueba talón rodilla</span>
              <Checkbox
                id="prueba_talon_rodilla"
                checked={formData.prueba_talon_rodilla}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("prueba_talon_rodilla", checked)
                }
              />
              <span>Trastabillea</span>
              <Checkbox
                id="trastabillea6"
                checked={formData.trastabillea6}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("trastabillea6", checked)
                }
              />
              <span>Cae</span>
              <Checkbox
                id="cae6"
                checked={formData.cae6}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("cae6", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PRUEBA DE COORDINACIÓN DIGITAL CON AMBAS MANOS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            PRUEBA DE COORDINACIÓN DIGITAL CON AMBAS MANOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="font-semibold">DEDO - DEDO:</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Mano derecha: mov. controlado</span>
                <Checkbox
                  id="mano_derecha"
                  checked={formData.mano_derecha}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("mano_derecha", checked)
                  }
                />
                <span>falla</span>
                <Checkbox
                  id="falla"
                  checked={formData.falla}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("falla", checked)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Mano izquierda: mov. controlado</span>
                <Checkbox
                  id="mano_izquierda"
                  checked={formData.mano_izquierda}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("mano_izquierda", checked)
                  }
                />
                <span>falla</span>
                <Checkbox
                  id="falla1"
                  checked={formData.falla1}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("falla1", checked)
                  }
                />
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="font-semibold">dedo-nariz:</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>mano derecha: movimiento controlado</span>
                  <Checkbox
                    id="dedo_nariz_mano_derecha"
                    checked={formData.dedo_nariz_mano_derecha}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("dedo_nariz_mano_derecha", checked)
                    }
                  />
                  <span>falla</span>
                  <Checkbox
                    id="falla2"
                    checked={formData.falla2}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("falla2", checked)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>mano izquierda: movimiento controlado</span>
                  <Checkbox
                    id="dedo_nariz_mano_izquierda"
                    checked={formData.dedo_nariz_mano_izquierda}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("dedo_nariz_mano_izquierda", checked)
                    }
                  />
                  <span>falla</span>
                  <Checkbox
                    id="falla3"
                    checked={formData.falla3}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("falla3", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARACTERÍSTICAS DEL HABLA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CARACTERÍSTICAS DEL HABLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span>Normal</span>
              <Checkbox
                id="normal"
                checked={formData.normal}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("normal", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Disartria</span>
              <Checkbox
                id="disartria"
                checked={formData.disartria}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("disartria", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Inteligible</span>
              <Checkbox
                id="ininteligible"
                checked={formData.ininteligible}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("ininteligible", checked)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Verborrrea</span>
              <Checkbox
                id="verborrea"
                checked={formData.verborrea}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("verborrea", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signos vitales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signos vitales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Signos vitales: pulso</span>
              <Input
                className="w-20"
                type="number"
                value={formData.signos_vitales}
                onChange={(e) =>
                  handleInputChange("signos_vitales", e.target.value)
                }
              />
              <span>/min.</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Frecuencia respiratoria</span>
              <Input
                className="w-20"
                type="number"
                value={formData.frecuencia_respiratoria}
                onChange={(e) =>
                  handleInputChange("frecuencia_respiratoria", e.target.value)
                }
              />
              <span>resp/min.</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Tensión Arterial</span>
              <Input
                className="w-20"
                type="number"
                value={formData.tension_arterial}
                onChange={(e) =>
                  handleInputChange("tension_arterial", e.target.value)
                }
              />
              <span>/</span>
              <Input
                className="w-20"
                type="number"
                value={formData.tension_arterial1}
                onChange={(e) =>
                  handleInputChange("tension_arterial1", e.target.value)
                }
              />
              <span>mm de hg</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Temperatura</span>
              <Input
                className="w-20"
                value={formData.temperatura}
                onChange={(e) => handleInputChange("temperatura", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Determinación de alcoholemia (en analizador de aire espirado)</span>
              <Input
                className="w-32"
                value={formData.determinacion_alcohol}
                onChange={(e) =>
                  handleInputChange("determinacion_alcohol", e.target.value)
                }
              />
              <span>Br. AC</span>
              <Checkbox
                id="BR_AC"
                checked={formData.BR_AC}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("BR_AC", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OBSERVACIONES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OBSERVACIONES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            <p className="mb-4">
              Al ciudadano se le interrogó si padecía alguna enfermedad y si estaba bajo tratamiento médico a lo que respondió
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>SÍ</span>
                <Checkbox
                  id="si"
                  checked={formData.si}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("si", checked)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span>NO</span>
                <Checkbox
                  id="no"
                  checked={formData.no}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("no", checked)
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="observacion">Observación</Label>
              <Input
                id="observacion"
                value={formData.observacion}
                onChange={(e) =>
                  handleInputChange("observacion", e.target.value)
                }
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PRUEBAS DE RESULTADO DE ALCOHOLÍMETRO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            PRUEBAS DE RESULTADO DE ALCOHOLÍMETRO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Determinación de alcoholemia (analizador de aire de espirado) Resultado</span>
              <Input
                className="w-32"
                value={formData.determinacion_alcohol1}
                onChange={(e) =>
                  handleInputChange("determinacion_alcohol1", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span>BAC</span>
                <Checkbox
                  id="BAC"
                  checked={formData.BAC}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("BAC", checked)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Br. AC</span>
                <Checkbox
                  id="BR_AC"
                  checked={formData.BR_AC}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("BR_AC", checked)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Auto Test #</span>
                <Input
                  className="w-20"
                  type="number"
                  value={formData.auto_test}
                  onChange={(e) => handleInputChange("auto_test", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EN BASE A LO ANTERIORMENTE EXPUESTO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">EN BASE A LO ANTERIORMENTE EXPUESTO, EL CIUDADANO PRESENTA UN CUADRO CLÍNICO DE:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="estado_ebriedad"
              checked={formData.estado_ebriedad}
              onCheckedChange={(checked) =>
                handleCheckboxChange("estado_ebriedad", checked)
              }
            />
            <Label htmlFor="estado_ebriedad" className="text-sm font-normal">
              Estado de Ebriedad
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="estupefacientes"
              checked={formData.estupefacientes}
              onCheckedChange={(checked) =>
                handleCheckboxChange("estupefacientes", checked)
              }
            />
            <Label htmlFor="estupefacientes" className="text-sm font-normal">
              Estupefacientes, psicotrópicos u otras substancias tóxicas. Especifique:
            </Label>
            <Input
              className="flex-1 min-w-[200px]"
              id="estupefacientes_texto"
              value={formData.estupefacientes_texto}
              onChange={(e) =>
                handleInputChange("estupefacientes_texto", e.target.value)
              }
              placeholder="Especificar"
            />
          </div>
        </CardContent>
      </Card>

      {/* DIAGNÓSTICO Y CONCLUSIONES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DIAGNÓSTICO Y CONCLUSIONES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>En base a lo anteriormente expuesto el ciudadano presenta un cuadro clínico de</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.cuadro_clinico}
                onChange={(e) =>
                  handleInputChange("cuadro_clinico", e.target.value)
                }
                placeholder="Cuadro clínico"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>el cual</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.el_cual}
                onChange={(e) => handleInputChange("el_cual", e.target.value)}
                placeholder="Descripción"
              />
              <span>perturba o impide su habilidad para conducir un vehículo de motor.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DATOS DE IDENTIFICACIÓN DEL SOLICITANTE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DATOS DE IDENTIFICACIÓN DEL SOLICITANTE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Nombre del solicitante</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.nombre_solicitante}
                onChange={(e) =>
                  handleInputChange("nombre_solicitante", e.target.value)
                }
                placeholder="Nombre completo"
              />
              <span>Identificación o núm. de placa</span>
              <Input
                className="w-32"
                value={formData.no_placa}
                onChange={(e) => handleInputChange("no_placa", e.target.value)}
                placeholder="No. placa"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Departamento y sección a la que pertenece</span>
              <Input
                className="flex-1 min-w-[400px]"
                value={formData.departamento}
                onChange={(e) =>
                  handleInputChange("departamento", e.target.value)
                }
                placeholder="Departamento y sección"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Dependencia que requiere la certificación</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.dependencia}
                onChange={(e) => handleInputChange("dependencia", e.target.value)}
                placeholder="Dependencia"
              />
              <span>No. de boleta de infracción</span>
              <Input
                className="w-32"
                type="number"
                value={formData.no_boleta}
                onChange={(e) => handleInputChange("no_boleta", e.target.value)}
                placeholder="No. boleta"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Nombre del Juez municipal que autorizó la certificación Lic.</span>
              <Input
                className="flex-1 min-w-[300px]"
                value={formData.nombre_juez}
                onChange={(e) => handleInputChange("nombre_juez", e.target.value)}
                placeholder="Nombre del juez"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DATOS COMPLEMENTARIOS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DATOS COMPLEMENTARIOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>El ciudadano en cuestión era conductor de un vehículo</span>
              <Input
                className="flex-1 min-w-[200px]"
                value={formData.vehiculo}
                onChange={(e) => handleInputChange("vehiculo", e.target.value)}
                placeholder="Tipo de vehículo"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Marca</span>
              <Input
                className="w-40"
                value={formData.marca}
                onChange={(e) => handleInputChange("marca", e.target.value)}
                placeholder="Marca"
              />
              <span>Modelo</span>
              <Input
                className="w-40"
                value={formData.modelo}
                onChange={(e) => handleInputChange("modelo", e.target.value)}
                placeholder="Modelo"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Placas</span>
              <Input
                className="w-32"
                value={formData.placas}
                onChange={(e) => handleInputChange("placas", e.target.value)}
                placeholder="Placas"
              />
              <span>Nacionales o de frontera</span>
              <Input
                className="w-40"
                value={formData.nacionales_o_frontera}
                onChange={(e) =>
                  handleInputChange("nacionales_o_frontera", e.target.value)
                }
                placeholder="Nacionales o frontera"
              />
              <span>Extranjeras</span>
              <Checkbox
                id="extranjeras"
                checked={formData.extranjeras}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("extranjeras", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitDisabled || submitting}>
          <Save className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Guardar datos"}
        </Button>
      </div>
    </form>
  );
}
