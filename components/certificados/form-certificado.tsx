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
  estado_conciencia: string;
  aliento: string;
  hipo: boolean;
  equilibrio_marcha: string;
  equilibrio_vertical: string;
  levantar_objetos: string;
  excitado: boolean;
  nauseas: boolean;
  trastabillea: boolean;
  trastabillea1: boolean;
  trastabillea2: boolean;
  facies: string;
  vomito: string;
  cae: boolean;
  cae1: boolean;
  cae2: boolean;
  conjuntivas: string;
  signo_romberg: string;
  prueba_tandem: string;
  gira_sobre_eje: boolean;
  prueba_talon_rodilla: boolean;
  pupilas: string;
  trastabillea3: boolean;
  trastabillea4: boolean;
  trastabillea5: boolean;
  trastabillea6: boolean;
  cae3: boolean;
  cae4: boolean;
  cae5: boolean;
  cae6: boolean;
  mano_derecha: boolean;
  falla: boolean;
  mano_izquierda: boolean;
  falla1: boolean;
  dedo_nariz_mano_izquierda: boolean;
  falla2: boolean;
  dedo_nariz_mano_derecha: boolean;
  falla3: boolean;
  normal: boolean;
  disartria: boolean;
  ininteligible: boolean;
  verborrea: boolean;
  signos_vitales: string;
  frecuencia_respiratoria: string;
  tension_arterial: string;
  tension_arterial1: string;
  temperatura: string;
  determinacion_alcohol: string;
  si: boolean;
  no: boolean;
  observacion: string;
  determinacion_alcohol1: string;
  BAC: boolean;
  BR_AC: boolean;
  auto_test: string;
  estado_ebriedad: boolean;
  estupefacientes: boolean;
  estupefacientes_texto: string;
  cuadro_clinico: string;
  el_cual: string;
  nombre_solicitante: string;
  no_placa: string;
  departamento: string;
  dependencia: string;
  no_boleta: string;
  nombre_juez: string;
  vehiculo: string;
  marca: string;
  modelo: string;
  placas: string;
  nacionales_o_frontera: string;
  extranjeras: boolean;
};

export interface CertificadoFormPayload {
  folio: string;
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
  estado_conciencia: string;
  aliento: string;
  hipo: boolean;
  equilibrio_marcha: string;
  equilibrio_vertical: string;
  levantar_objetos: string;
  excitado: boolean;
  nauseas: boolean;
  trastabillea: boolean;
  trastabillea1: boolean;
  trastabillea2: boolean;
  facies: string;
  vomito: string;
  cae: boolean;
  cae1: boolean;
  cae2: boolean;
  conjuntivas: string;
  signo_romberg: string;
  prueba_tandem: string;
  gira_sobre_eje: boolean;
  prueba_talon_rodilla: boolean;
  pupilas: string;
  trastabillea3: boolean;
  trastabillea4: boolean;
  trastabillea5: boolean;
  trastabillea6: boolean;
  cae3: boolean;
  cae4: boolean;
  cae5: boolean;
  cae6: boolean;
  mano_derecha: boolean;
  falla: boolean;
  mano_izquierda: boolean;
  falla1: boolean;
  dedo_nariz_mano_izquierda: boolean;
  falla2: boolean;
  dedo_nariz_mano_derecha: boolean;
  falla3: boolean;
  normal: boolean;
  disartria: boolean;
  ininteligible: boolean;
  verborrea: boolean;
  signos_vitales: number | null;
  frecuencia_respiratoria: number | null;
  tension_arterial: number | null;
  tension_arterial1: number | null;
  temperatura: string;
  determinacion_alcohol: string;
  si: boolean;
  no: boolean;
  observacion: string;
  determinacion_alcohol1: string;
  BAC: boolean;
  BR_AC: boolean;
  auto_test: number | null;
  estado_ebriedad: boolean;
  estupefacientes: boolean;
  estupefacientes_texto: string;
  cuadro_clinico: string;
  el_cual: string;
  nombre_solicitante: string;
  no_placa: string;
  departamento: string;
  dependencia: string;
  no_boleta: number | null;
  nombre_juez: string;
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
  estado_conciencia: "",
  aliento: "",
  hipo: false,
  equilibrio_marcha: "",
  equilibrio_vertical: "",
  levantar_objetos: "",
  excitado: false,
  nauseas: false,
  trastabillea: false,
  trastabillea1: false,
  trastabillea2: false,
  facies: "",
  vomito: "",
  cae: false,
  cae1: false,
  cae2: false,
  conjuntivas: "",
  signo_romberg: "",
  prueba_tandem: "",
  gira_sobre_eje: false,
  prueba_talon_rodilla: false,
  pupilas: "",
  trastabillea3: false,
  trastabillea4: false,
  trastabillea5: false,
  trastabillea6: false,
  cae3: false,
  cae4: false,
  cae5: false,
  cae6: false,
  mano_derecha: false,
  falla: false,
  mano_izquierda: false,
  falla1: false,
  dedo_nariz_mano_izquierda: false,
  falla2: false,
  dedo_nariz_mano_derecha: false,
  falla3: false,
  normal: false,
  disartria: false,
  ininteligible: false,
  verborrea: false,
  signos_vitales: "",
  frecuencia_respiratoria: "",
  tension_arterial: "",
  tension_arterial1: "",
  temperatura: "",
  determinacion_alcohol: "",
  si: false,
  no: false,
  observacion: "",
  determinacion_alcohol1: "",
  BAC: false,
  BR_AC: false,
  auto_test: "",
  estado_ebriedad: false,
  estupefacientes: false,
  estupefacientes_texto: "",
  cuadro_clinico: "",
  el_cual: "",
  nombre_solicitante: "",
  no_placa: "",
  departamento: "",
  dependencia: "",
  no_boleta: "",
  nombre_juez: "",
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

      setFormData((prev) => ({
        ...prev,
        medico_id: response.persona_id,
        cedula_perito: response.cedula_profesional || prev.cedula_perito,
      }));

      const nombreMedico = response.persona
        ? `${response.persona.nombre ?? ""} ${
            response.persona.apellido_paterno ?? ""
          } ${response.persona.apellido_materno ?? ""}`.trim()
        : response.persona_id;

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
      estado_conciencia: formData.estado_conciencia,
      aliento: formData.aliento,
      hipo: formData.hipo,
      equilibrio_marcha: formData.equilibrio_marcha,
      equilibrio_vertical: formData.equilibrio_vertical,
      levantar_objetos: formData.levantar_objetos,
      excitado: formData.excitado,
      nauseas: formData.nauseas,
      trastabillea: formData.trastabillea,
      trastabillea1: formData.trastabillea1,
      trastabillea2: formData.trastabillea2,
      facies: formData.facies,
      vomito: formData.vomito,
      cae: formData.cae,
      cae1: formData.cae1,
      cae2: formData.cae2,
      conjuntivas: formData.conjuntivas,
      signo_romberg: formData.signo_romberg,
      prueba_tandem: formData.prueba_tandem,
      gira_sobre_eje: formData.gira_sobre_eje,
      prueba_talon_rodilla: formData.prueba_talon_rodilla,
      pupilas: formData.pupilas,
      trastabillea3: formData.trastabillea3,
      trastabillea4: formData.trastabillea4,
      trastabillea5: formData.trastabillea5,
      trastabillea6: formData.trastabillea6,
      cae3: formData.cae3,
      cae4: formData.cae4,
      cae5: formData.cae5,
      cae6: formData.cae6,
      mano_derecha: formData.mano_derecha,
      falla: formData.falla,
      mano_izquierda: formData.mano_izquierda,
      falla1: formData.falla1,
      dedo_nariz_mano_izquierda: formData.dedo_nariz_mano_izquierda,
      falla2: formData.falla2,
      dedo_nariz_mano_derecha: formData.dedo_nariz_mano_derecha,
      falla3: formData.falla3,
      normal: formData.normal,
      disartria: formData.disartria,
      ininteligible: formData.ininteligible,
      verborrea: formData.verborrea,
      signos_vitales: toNumber(formData.signos_vitales),
      frecuencia_respiratoria: toNumber(formData.frecuencia_respiratoria),
      tension_arterial: toNumber(formData.tension_arterial),
      tension_arterial1: toNumber(formData.tension_arterial1),
      temperatura: formData.temperatura,
      determinacion_alcohol: formData.determinacion_alcohol,
      si: formData.si,
      no: formData.no,
      observacion: formData.observacion,
      determinacion_alcohol1: formData.determinacion_alcohol1,
      BAC: formData.BAC,
      BR_AC: formData.BR_AC,
      auto_test: toNumber(formData.auto_test),
      estado_ebriedad: formData.estado_ebriedad,
      estupefacientes: formData.estupefacientes,
      estupefacientes_texto: formData.estupefacientes_texto,
      cuadro_clinico: formData.cuadro_clinico,
      el_cual: formData.el_cual,
      nombre_solicitante: formData.nombre_solicitante,
      no_placa: formData.no_placa,
      departamento: formData.departamento,
      dependencia: formData.dependencia,
      no_boleta: toNumber(formData.no_boleta),
      nombre_juez: formData.nombre_juez,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            1. Metadatos / Identificación general
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                placeholder="ID, CURP o nombre completo"
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
                placeholder="ID, cédula o nombre del médico"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Datos del paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              placeholder="Nombre de la persona"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identifica_con">Se identifica con</Label>
            <Input
              id="identifica_con"
              placeholder="Documento presentado"
              value={formData.identifica_con}
              onChange={(e) =>
                handleInputChange("identifica_con", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edad">Edad</Label>
            <Input
              id="edad"
              type="number"
              value={formData.edad}
              onChange={(e) => handleInputChange("edad", e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genero">Género</Label>
            <Select
              value={formData.genero}
              onValueChange={(value) => handleInputChange("genero", value)}
            >
              <SelectTrigger id="genero">
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="LGBTQ+">LGBTQ+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nacionalidad">Nacionalidad</Label>
            <Input
              id="nacionalidad"
              placeholder="Nacionalidad"
              value={formData.nacionalidad}
              onChange={(e) =>
                handleInputChange("nacionalidad", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Residencia</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="residencia_nacional"
                  checked={formData.residencia_nacional}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("residencia_nacional", checked)
                  }
                />
                <Label
                  htmlFor="residencia_nacional"
                  className="text-sm font-normal"
                >
                  Nacional
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="extranjera"
                  checked={formData.extranjera}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("extranjera", checked)
                  }
                />
                <Label htmlFor="extranjera" className="text-sm font-normal">
                  Extranjera
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-2 lg:col-span-3">
            <Label htmlFor="direccion">Domicilio</Label>
            <Input
              id="direccion"
              placeholder="Dirección de residencia"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            3. Exploración física – Estado general
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Estado de conciencia"
              value={formData.estado_conciencia}
              onChange={(e) =>
                handleInputChange("estado_conciencia", e.target.value)
              }
            />
            <div className="space-y-2">
              <Label htmlFor="aliento">Aliento</Label>
              <Select
                value={formData.aliento}
                onValueChange={(value) => handleInputChange("aliento", value)}
              >
                <SelectTrigger id="aliento">
                  <SelectValue placeholder="Selecciona el tipo de aliento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alcoholico">Alcohólico</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="acetona">Acetona</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Equilibrio a la marcha"
              value={formData.equilibrio_marcha}
              onChange={(e) =>
                handleInputChange("equilibrio_marcha", e.target.value)
              }
            />
            <Input
              placeholder="Equilibrio vertical de reposo"
              value={formData.equilibrio_vertical}
              onChange={(e) =>
                handleInputChange("equilibrio_vertical", e.target.value)
              }
            />
            <Input
              placeholder="Levantar objetos del piso"
              value={formData.levantar_objetos}
              onChange={(e) =>
                handleInputChange("levantar_objetos", e.target.value)
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="nauseas"
                checked={formData.nauseas}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("nauseas", checked)
                }
              />
              <Label htmlFor="nauseas" className="text-sm font-normal">
                Náuseas
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hipo"
                checked={formData.hipo}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("hipo", checked)
                }
              />
              <Label htmlFor="hipo" className="text-sm font-normal">
                Hipo
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="excitado"
                checked={formData.excitado}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("excitado", checked)
                }
              />
              <Label htmlFor="excitado" className="text-sm font-normal">
                Excitado
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            4. Exploración física – Coordinación / Caídas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-4">
            {[
              {
                id: "trastabillea",
                key: "trastabillea",
                label: "Trastabillea",
              },
              {
                id: "trastabillea1",
                key: "trastabillea1",
                label: "Trastabillea 1",
              },
              {
                id: "trastabillea2",
                key: "trastabillea2",
                label: "Trastabillea 2",
              },
              {
                id: "trastabillea3",
                key: "trastabillea3",
                label: "Trastabillea 3",
              },
              {
                id: "trastabillea4",
                key: "trastabillea4",
                label: "Trastabillea 4",
              },
              {
                id: "trastabillea5",
                key: "trastabillea5",
                label: "Trastabillea 5",
              },
              {
                id: "trastabillea6",
                key: "trastabillea6",
                label: "Trastabillea 6",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  id={item.id}
                  checked={
                    formData[item.key as keyof CertificadoFormState] as boolean
                  }
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      item.key as keyof CertificadoFormState,
                      checked
                    )
                  }
                />
                <Label htmlFor={item.id} className="text-sm font-normal">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { id: "cae", key: "cae", label: "Cae" },
              { id: "cae1", key: "cae1", label: "Cae 1" },
              { id: "cae2", key: "cae2", label: "Cae 2" },
              { id: "cae3", key: "cae3", label: "Cae 3" },
              { id: "cae4", key: "cae4", label: "Cae 4" },
              { id: "cae5", key: "cae5", label: "Cae 5" },
              { id: "cae6", key: "cae6", label: "Cae 6" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  id={item.id}
                  checked={
                    formData[item.key as keyof CertificadoFormState] as boolean
                  }
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      item.key as keyof CertificadoFormState,
                      checked
                    )
                  }
                />
                <Label htmlFor={item.id} className="text-sm font-normal">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            5. Exploración física – Signos neurológicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Facies"
              value={formData.facies}
              onChange={(e) => handleInputChange("facies", e.target.value)}
            />
            <Input
              placeholder="Vómito"
              value={formData.vomito}
              onChange={(e) => handleInputChange("vomito", e.target.value)}
            />
            <Input
              placeholder="Conjuntivas"
              value={formData.conjuntivas}
              onChange={(e) => handleInputChange("conjuntivas", e.target.value)}
            />
            <Input
              placeholder="Signo de Romberg"
              value={formData.signo_romberg}
              onChange={(e) =>
                handleInputChange("signo_romberg", e.target.value)
              }
            />
            <Input
              placeholder="Prueba de tándem"
              value={formData.prueba_tandem}
              onChange={(e) =>
                handleInputChange("prueba_tandem", e.target.value)
              }
            />
            <Input
              placeholder="Pupilas"
              value={formData.pupilas}
              onChange={(e) => handleInputChange("pupilas", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="gira_sobre_eje"
                checked={formData.gira_sobre_eje}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("gira_sobre_eje", checked)
                }
              />
              <Label htmlFor="gira_sobre_eje" className="text-sm font-normal">
                Gira sobre su eje
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="prueba_talon_rodilla"
                checked={formData.prueba_talon_rodilla}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("prueba_talon_rodilla", checked)
                }
              />
              <Label
                htmlFor="prueba_talon_rodilla"
                className="text-sm font-normal"
              >
                Prueba talón rodilla
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            6. Coordinación digital (dedo–dedo / dedo–nariz)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "mano_derecha", label: "Mano derecha" },
            { key: "falla", label: "Falla (mano derecha)" },
            { key: "mano_izquierda", label: "Mano izquierda" },
            { key: "falla1", label: "Falla (mano izquierda)" },
            {
              key: "dedo_nariz_mano_derecha",
              label: "Dedo–nariz mano derecha",
            },
            { key: "falla2", label: "Falla dedo–nariz derecha" },
            {
              key: "dedo_nariz_mano_izquierda",
              label: "Dedo–nariz mano izquierda",
            },
            { key: "falla3", label: "Falla dedo–nariz izquierda" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Checkbox
                id={item.key}
                checked={
                  formData[item.key as keyof CertificadoFormState] as boolean
                }
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    item.key as keyof CertificadoFormState,
                    checked
                  )
                }
              />
              <Label htmlFor={item.key} className="text-sm font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">7. Habla</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {[
            { key: "normal", label: "Normal" },
            { key: "disartria", label: "Disartria" },
            { key: "ininteligible", label: "Ininteligible" },
            { key: "verborrea", label: "Verborrea" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Checkbox
                id={item.key}
                checked={
                  formData[item.key as keyof CertificadoFormState] as boolean
                }
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    item.key as keyof CertificadoFormState,
                    checked
                  )
                }
              />
              <Label htmlFor={item.key} className="text-sm font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">8. Signos vitales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="signos_vitales">Pulso / Signos vitales</Label>
            <Input
              id="signos_vitales"
              type="number"
              value={formData.signos_vitales}
              onChange={(e) =>
                handleInputChange("signos_vitales", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frecuencia_respiratoria">
              Frecuencia respiratoria
            </Label>
            <Input
              id="frecuencia_respiratoria"
              type="number"
              value={formData.frecuencia_respiratoria}
              onChange={(e) =>
                handleInputChange("frecuencia_respiratoria", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tension_arterial">Tensión arterial</Label>
            <Input
              id="tension_arterial"
              type="number"
              value={formData.tension_arterial}
              onChange={(e) =>
                handleInputChange("tension_arterial", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tension_arterial1">
              Tensión arterial (diastólica)
            </Label>
            <Input
              id="tension_arterial1"
              type="number"
              value={formData.tension_arterial1}
              onChange={(e) =>
                handleInputChange("tension_arterial1", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperatura">Temperatura</Label>
            <Input
              id="temperatura"
              placeholder="Temperatura"
              value={formData.temperatura}
              onChange={(e) => handleInputChange("temperatura", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            9. Alcoholemia y observaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="determinacion_alcohol">
                Determinación de alcoholemia
              </Label>
              <Input
                id="determinacion_alcohol"
                placeholder="Ej. 0.85 Br AC"
                value={formData.determinacion_alcohol}
                onChange={(e) =>
                  handleInputChange("determinacion_alcohol", e.target.value)
                }
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="observacion">Observación</Label>
              <Input
                id="observacion"
                placeholder="Impacto en la capacidad para conducir"
                value={formData.observacion}
                onChange={(e) =>
                  handleInputChange("observacion", e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="si"
                checked={formData.si}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("si", checked)
                }
              />
              <Label htmlFor="si" className="text-sm font-normal">
                Sí
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="no"
                checked={formData.no}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("no", checked)
                }
              />
              <Label htmlFor="no" className="text-sm font-normal">
                No
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            10. Resultado de alcoholímetro
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="determinacion_alcohol1">
              Resultado de alcoholímetro
            </Label>
            <Input
              id="determinacion_alcohol1"
              placeholder="Determinación de alcohol"
              value={formData.determinacion_alcohol1}
              onChange={(e) =>
                handleInputChange("determinacion_alcohol1", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auto_test">Auto test</Label>
            <Input
              id="auto_test"
              type="number"
              value={formData.auto_test}
              onChange={(e) => handleInputChange("auto_test", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="BAC"
                checked={formData.BAC}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("BAC", checked)
                }
              />
              <Label htmlFor="BAC" className="text-sm font-normal">
                BAC
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="BR_AC"
                checked={formData.BR_AC}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("BR_AC", checked)
                }
              />
              <Label htmlFor="BR_AC" className="text-sm font-normal">
                BR/AC
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">11. Cuadro clínico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="estado_ebriedad"
              checked={formData.estado_ebriedad}
              onCheckedChange={(checked) =>
                handleCheckboxChange("estado_ebriedad", checked)
              }
            />
            <Label htmlFor="estado_ebriedad" className="text-sm font-normal">
              Estado de ebriedad
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
              Bajo estupefacientes
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estupefacientes_texto">
              Estupefacientes (texto)
            </Label>
            <Input
              id="estupefacientes_texto"
              value={formData.estupefacientes_texto}
              onChange={(e) =>
                handleInputChange("estupefacientes_texto", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuadro_clinico">Cuadro clínico</Label>
            <Input
              id="cuadro_clinico"
              value={formData.cuadro_clinico}
              onChange={(e) =>
                handleInputChange("cuadro_clinico", e.target.value)
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="el_cual">El cual</Label>
            <Input
              id="el_cual"
              value={formData.el_cual}
              onChange={(e) => handleInputChange("el_cual", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">12. Solicitante</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="nombre_solicitante">Nombre del solicitante</Label>
            <Input
              id="nombre_solicitante"
              value={formData.nombre_solicitante}
              onChange={(e) =>
                handleInputChange("nombre_solicitante", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="no_placa">No. placa</Label>
            <Input
              id="no_placa"
              value={formData.no_placa}
              onChange={(e) => handleInputChange("no_placa", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departamento">Departamento</Label>
            <Input
              id="departamento"
              value={formData.departamento}
              onChange={(e) =>
                handleInputChange("departamento", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dependencia">Dependencia</Label>
            <Input
              id="dependencia"
              value={formData.dependencia}
              onChange={(e) => handleInputChange("dependencia", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="no_boleta">No. boleta</Label>
            <Input
              id="no_boleta"
              type="number"
              value={formData.no_boleta}
              onChange={(e) => handleInputChange("no_boleta", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre_juez">Nombre del juez</Label>
            <Input
              id="nombre_juez"
              value={formData.nombre_juez}
              onChange={(e) => handleInputChange("nombre_juez", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">13. Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="vehiculo">Vehículo</Label>
            <Input
              id="vehiculo"
              value={formData.vehiculo}
              onChange={(e) => handleInputChange("vehiculo", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => handleInputChange("modelo", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placas">Placas</Label>
            <Input
              id="placas"
              value={formData.placas}
              onChange={(e) => handleInputChange("placas", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nacionales_o_frontera">Nacionales o frontera</Label>
            <Input
              id="nacionales_o_frontera"
              value={formData.nacionales_o_frontera}
              onChange={(e) =>
                handleInputChange("nacionales_o_frontera", e.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="extranjeras"
              checked={formData.extranjeras}
              onCheckedChange={(checked) =>
                handleCheckboxChange("extranjeras", checked)
              }
            />
            <Label htmlFor="extranjeras" className="text-sm font-normal">
              Extranjeras
            </Label>
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
