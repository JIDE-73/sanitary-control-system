"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ClipboardSignature,
  HeartPulse,
  LayoutGrid,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";

export type NotaMedicaALMFormValues = {
  fecha_expedicion: string;
  idPersona: string;
  idMedico: string;
  cedula: string;
  edad: string;
  se_identifica: string;
  adicciones_referidas: string;
  descripcion_lesiones_hallazgos: string;
  recomendacion_medico: string;
  nombre_oficial: string;
  dependencia: string;
  noOficial: string;
  noUnidad: string;
  conciente: boolean;
  orientacion_alopsiquica: boolean;
  control_esfinteres: boolean;
  aliento_alcoholico: boolean;
  lesiones_visibles: boolean;
};

interface FormNotaMedicaALMProps {
  onSubmit: (data: NotaMedicaALMFormValues) => Promise<void> | void;
  submitting?: boolean;
}

type DoctorOption = {
  id: string;
  nombre: string;
  cedula: string;
  especialidad?: string;
};

type CitizenOption = {
  id: string;
  nombre: string;
  curp: string;
  edad?: number;
};

const formatDate = (value: string) => (value ? value.split("T")[0] : "");

const calculateAge = (birthday?: string) => {
  if (!birthday) return undefined;
  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const isBirthdayPassed =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() >= birthDate.getDate());
  return isBirthdayPassed ? age : age - 1;
};

export function FormNotaMedicaALM({
  onSubmit,
  submitting = false,
}: FormNotaMedicaALMProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [citizens, setCitizens] = useState<CitizenOption[]>([]);
  const [loadingDoctorSearch, setLoadingDoctorSearch] = useState(false);
  const [loadingCitizenSearch, setLoadingCitizenSearch] = useState(false);
  const [citizenQuery, setCitizenQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");

  const [formData, setFormData] = useState<NotaMedicaALMFormValues>({
    fecha_expedicion: formatDate(new Date().toISOString()),
    idPersona: "",
    idMedico: "",
    cedula: "",
    edad: "",
    se_identifica: "",
    adicciones_referidas: "",
    descripcion_lesiones_hallazgos: "",
    recomendacion_medico: "",
    nombre_oficial: "",
    dependencia: "",
    noOficial: "",
    noUnidad: "",
    conciente: false,
    orientacion_alopsiquica: false,
    control_esfinteres: false,
    aliento_alcoholico: false,
    lesiones_visibles: false,
  });

  const doctorSeleccionado = useMemo(
    () => doctors.find((doctor) => doctor.id === formData.idMedico),
    [doctors, formData.idMedico]
  );

  const ciudadanoSeleccionado = useMemo(
    () => citizens.find((citizen) => citizen.id === formData.idPersona),
    [citizens, formData.idPersona]
  );

  const mapDoctor = (doctor: any): DoctorOption | null => {
    const id =
      doctor?.persona_id ??
      doctor?.persona?.id ??
      doctor?.id ??
      doctor?.personaId ??
      "";
    if (!id) return null;
    return {
      id,
      nombre: [
        doctor?.persona?.nombre,
        doctor?.persona?.apellido_paterno ?? doctor?.persona?.apellidoPaterno,
        doctor?.persona?.apellido_materno ?? doctor?.persona?.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
      cedula: doctor?.cedula_profesional ?? doctor?.cedula ?? "",
      especialidad: doctor?.especialidad ?? "",
    };
  };

  const handleSearchDoctor = async () => {
    const trimmed = doctorQuery.trim();
    if (!trimmed) {
      toast({
        title: "Captura un identificador",
        description: "Ingresa ID o dato del médico para buscar.",
        variant: "destructive",
      });
      return;
    }

    setLoadingDoctorSearch(true);
    try {
      const response = await request(
        `/sics/doctors/getDoctor/${trimmed}`,
        "GET"
      );

      const candidate =
        (response as any)?.doctor ??
        (response as any)?.data ??
        response ??
        null;

      const mapped = candidate ? mapDoctor(candidate) : null;

      if (!mapped) {
        setDoctors([]);
        setFormData((prev) => ({
          ...prev,
          idMedico: "",
          cedula: "",
          nombre_oficial: "",
        }));
        toast({
          title: "No se encontró médico",
          description: "Verifica el dato e intenta nuevamente.",
          variant: "destructive",
        });
        return;
      }

      setDoctors([mapped]);
      setFormData((prev) => ({
        ...prev,
        idMedico: mapped.id,
        cedula: mapped.cedula || prev.cedula,
        nombre_oficial: mapped.nombre || prev.nombre_oficial,
      }));
    } catch (error) {
      console.error("No se pudo buscar médico", error);
      toast({
        title: "Error al buscar",
        description: "No se pudo consultar el médico en el backend.",
        variant: "destructive",
      });
    } finally {
      setLoadingDoctorSearch(false);
    }
  };

  const mapCitizen = (citizen: any): CitizenOption | null => {
    const persona = citizen?.persona ?? citizen;
    const id =
      citizen?.persona_id ??
      persona?.id ??
      citizen?.id ??
      citizen?.personaId ??
      "";
    if (!id) return null;
    return {
      id,
      nombre: [
        persona?.nombre,
        persona?.apellido_paterno ?? persona?.apellidoPaterno,
        persona?.apellido_materno ?? persona?.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
        .trim(),
      curp: persona?.curp ?? "",
      edad: calculateAge(persona?.fecha_nacimiento),
    };
  };

  const handleSearchCitizen = async () => {
    const trimmed = citizenQuery.trim();
    if (!trimmed) {
      toast({
        title: "Captura un identificador",
        description: "Ingresa CURP o ID de persona para buscar.",
        variant: "destructive",
      });
      return;
    }

    setLoadingCitizenSearch(true);
    try {
      const response = await request(
        `/alcoholimetria/citizens/getCitizenById/${trimmed}`,
        "GET"
      );

      const personaArray = Array.isArray((response as any)?.persona)
        ? (response as any)?.persona
        : null;

      const candidate =
        personaArray?.[0] ??
        (response as any)?.persona ??
        (response as any)?.citizen ??
        (response as any)?.data ??
        response ??
        null;

      const mapped = candidate ? mapCitizen(candidate) : null;

      if (!mapped) {
        setCitizens([]);
        setFormData((prev) => ({ ...prev, idPersona: "", edad: "" }));
        toast({
          title: "No se encontró ciudadano",
          description: "Verifica el dato e intenta nuevamente.",
          variant: "destructive",
        });
        return;
      }

      setCitizens([mapped]);
      setFormData((prev) => ({
        ...prev,
        idPersona: mapped.id,
        edad: mapped.edad !== undefined ? String(mapped.edad) : prev.edad,
      }));
    } catch (error) {
      console.error("No se pudo buscar ciudadano", error);
      toast({
        title: "Error al buscar",
        description: "No se pudo consultar el ciudadano en el backend.",
        variant: "destructive",
      });
    } finally {
      setLoadingCitizenSearch(false);
    }
  };

  useEffect(() => {
    if (!formData.idMedico) return;
    const doctor = doctors.find((d) => d.id === formData.idMedico);
    if (!doctor) return;
    setFormData((prev) => ({
      ...prev,
      cedula: doctor.cedula || prev.cedula,
      nombre_oficial: doctor.nombre || prev.nombre_oficial,
    }));
  }, [doctors, formData.idMedico]);

  useEffect(() => {
    if (!formData.idPersona) return;
    const citizen = citizens.find((c) => c.id === formData.idPersona);
    if (!citizen) return;
    setFormData((prev) => ({
      ...prev,
      edad: citizen.edad !== undefined ? String(citizen.edad) : prev.edad ?? "",
    }));
  }, [citizens, formData.idPersona]);

  const handleChange = <K extends keyof NotaMedicaALMFormValues>(
    field: K,
    value: NotaMedicaALMFormValues[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (!formData.idPersona || !formData.idMedico) {
      toast({
        title: "Faltan datos obligatorios",
        description: "Selecciona un ciudadano y un médico.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fecha_expedicion) {
      toast({
        title: "Fecha requerida",
        description: "Captura la fecha de expedición.",
        variant: "destructive",
      });
      return;
    }

    await onSubmit({
      ...formData,
      fecha_expedicion: formatDate(formData.fecha_expedicion),
      cedula: formData.cedula.trim(),
      se_identifica: formData.se_identifica.trim(),
      adicciones_referidas: formData.adicciones_referidas.trim(),
      descripcion_lesiones_hallazgos:
        formData.descripcion_lesiones_hallazgos.trim(),
      recomendacion_medico: formData.recomendacion_medico.trim(),
      nombre_oficial: formData.nombre_oficial.trim(),
      dependencia: formData.dependencia.trim(),
      noOficial: formData.noOficial.trim(),
      noUnidad: formData.noUnidad.trim(),
      edad: formData.edad ? String(formData.edad) : "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Datos generales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fecha_expedicion">Fecha de expedición *</Label>
            <Input
              id="fecha_expedicion"
              type="date"
              value={formatDate(formData.fecha_expedicion)}
              onChange={(e) => handleChange("fecha_expedicion", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Ciudadano *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="CURP o ID de ciudadano"
                value={citizenQuery}
                onChange={(e) => setCitizenQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSearchCitizen();
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => void handleSearchCitizen()}
                disabled={loadingCitizenSearch}
              >
                {loadingCitizenSearch ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {citizens.length > 0 ? (
              <Select
                value={formData.idPersona}
                onValueChange={(value) => handleChange("idPersona", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona al ciudadano" />
                </SelectTrigger>
                <SelectContent>
                  {citizens.map((citizen) => (
                    <SelectItem key={citizen.id} value={citizen.id}>
                      {citizen.nombre} ({citizen.curp})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {ciudadanoSeleccionado ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  {ciudadanoSeleccionado.nombre}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {ciudadanoSeleccionado.curp}
                </p>
                {ciudadanoSeleccionado.edad !== undefined ? (
                  <Badge variant="secondary" className="mt-2">
                    {ciudadanoSeleccionado.edad} años
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edad">Edad</Label>
            <Input
              id="edad"
              type="number"
              min={0}
              value={formData.edad}
              onChange={(e) => handleChange("edad", e.target.value)}
              placeholder="Ej. 32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="se_identifica">
              Se identifica con documento oficial
            </Label>
            <Input
              id="se_identifica"
              value={formData.se_identifica}
              onChange={(e) => handleChange("se_identifica", e.target.value)}
              placeholder="INE, pasaporte, licencia..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Datos del médico
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Médico *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="ID o referencia del médico"
                value={doctorQuery}
                onChange={(e) => setDoctorQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSearchDoctor();
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => void handleSearchDoctor()}
                disabled={loadingDoctorSearch}
              >
                {loadingDoctorSearch ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {doctors.length > 0 ? (
              <Select
                value={formData.idMedico}
                onValueChange={(value) => handleChange("idMedico", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.nombre}
                      {doctor.especialidad ? ` — ${doctor.especialidad}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {doctorSeleccionado ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  {doctorSeleccionado.nombre}
                </p>
                {doctorSeleccionado.especialidad ? (
                  <p className="text-xs text-muted-foreground">
                    {doctorSeleccionado.especialidad}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula profesional</Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={(e) => handleChange("cedula", e.target.value)}
              placeholder="Número de cédula"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre_oficial">Nombre del médico oficial</Label>
            <Input
              id="nombre_oficial"
              value={formData.nombre_oficial}
              onChange={(e) => handleChange("nombre_oficial", e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dependencia">Dependencia</Label>
            <Input
              id="dependencia"
              value={formData.dependencia}
              onChange={(e) => handleChange("dependencia", e.target.value)}
              placeholder="Ej. Otay, Centro..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noOficial">Número de oficial</Label>
            <Input
              id="noOficial"
              value={formData.noOficial}
              onChange={(e) => handleChange("noOficial", e.target.value)}
              placeholder="Número de oficial"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noUnidad">Número de unidad</Label>
            <Input
              id="noUnidad"
              value={formData.noUnidad}
              onChange={(e) => handleChange("noUnidad", e.target.value)}
              placeholder="Número de unidad"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="h-5 w-5 text-primary" />
            Valoración rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            { key: "conciente", label: "Consciente" },
            {
              key: "orientacion_alopsiquica",
              label: "Orientación alopsíquica",
            },
            { key: "control_esfinteres", label: "Control de esfínteres" },
            { key: "aliento_alcoholico", label: "Aliento alcohólico" },
            { key: "lesiones_visibles", label: "Lesiones visibles" },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
            >
              <Checkbox
                checked={
                  formData[item.key as keyof NotaMedicaALMFormValues] as boolean
                }
                onCheckedChange={(checked) =>
                  handleChange(
                    item.key as keyof NotaMedicaALMFormValues,
                    Boolean(
                      checked
                    ) as NotaMedicaALMFormValues[keyof NotaMedicaALMFormValues]
                  )
                }
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardSignature className="h-5 w-5 text-primary" />
            Observaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recomendacion_medico">Recomendación médica</Label>
              <Textarea
                id="recomendacion_medico"
                rows={3}
                value={formData.recomendacion_medico}
                onChange={(e) =>
                  handleChange("recomendacion_medico", e.target.value)
                }
                placeholder="Tratamiento, seguimiento o indicaciones"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion_lesiones_hallazgos">
                Lesiones o hallazgos
              </Label>
              <Textarea
                id="descripcion_lesiones_hallazgos"
                rows={3}
                value={formData.descripcion_lesiones_hallazgos}
                onChange={(e) =>
                  handleChange("descripcion_lesiones_hallazgos", e.target.value)
                }
                placeholder="Observaciones clínicas relevantes"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adicciones_referidas">Adicciones referidas</Label>
            <Textarea
              id="adicciones_referidas"
              rows={3}
              value={formData.adicciones_referidas}
              onChange={(e) =>
                handleChange("adicciones_referidas", e.target.value)
              }
              placeholder="Sustancias o hábitos mencionados por la persona"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          <Thermometer className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Guardar nota ALM"}
        </Button>
      </div>
    </form>
  );
}
