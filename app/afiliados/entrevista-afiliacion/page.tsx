"use client";

import { useRef, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/request";
import { useAuth } from "@/components/auth/auth-context";
import { toast } from "sonner";

type YesNoValue = "" | "si" | "no";

type AffiliateOption = {
  personaId: string;
  label: string;
};

type YesNoFieldProps = {
  label: string;
  value: YesNoValue;
  onChange: (value: YesNoValue) => void;
};

function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <div className="space-y-2 text-sm">
      <p>{label}</p>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "si"}
            onChange={() => onChange(value === "si" ? "" : "si")}
            className="h-4 w-4"
          />
          Sí
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "no"}
            onChange={() => onChange(value === "no" ? "" : "no")}
            className="h-4 w-4"
          />
          No
        </label>
      </div>
      <input required value={value} onChange={() => {}} className="sr-only" />
    </div>
  );
}

const toBoolean = (value: YesNoValue) => value === "si";
const checked = (formData: FormData, name: string) =>
  formData.get(name) === "on";
const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();
const siNoText = (formData: FormData, name: string) =>
  checked(formData, name) ? "Si" : "No";

export default function EntrevistaAfiliacionPage() {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [affiliateQuery, setAffiliateQuery] = useState("");
  const [affiliateOptions, setAffiliateOptions] = useState<AffiliateOption[]>(
    [],
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState("");

  const [siNo, setSiNo] = useState<Record<string, YesNoValue>>({
    quedarteTijuana: "",
    fumas: "",
    ingieresAlcohol: "",
    utilizasDrogas: "",
    atencionPsiquiatrica: "",
    parejaActual: "",
    primeraRelacionVoluntaria: "",
    facilDecidirTsc: "",
    sabeTuFamilia: "",
    preferenciaCliente: "",
    condonClientes: "",
    experienciaDesagradable: "",
    sinCondonUltimosSeisMeses: "",
    riesgosExpones: "",
    positivaHiv: "",
  });

  const formRef = useRef<HTMLFormElement>(null);
  const step1Ref = useRef<HTMLFieldSetElement>(null);
  const step2Ref = useRef<HTMLFieldSetElement>(null);
  const step3Ref = useRef<HTMLFieldSetElement>(null);

  const setSiNoValue = (key: string, value: YesNoValue) => {
    setSiNo((prev) => ({ ...prev, [key]: value }));
  };

  const resolveMedicoId = () => {
    const fromSession = user?.persona?.Medico?.id;
    if (fromSession) return fromSession;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("sics-auth-user");
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed?.persona?.Medico?.id || "";
        }
      } catch {
        // Ignore storage read errors and fallback to empty id
      }
    }

    return "";
  };

  const extractAffiliateArray = (response: any) => {
    const candidate = Array.isArray(response?.data)
      ? response.data
      : (response?.data ?? response);

    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const numericKeys = Object.keys(candidate).filter((k) => /^\d+$/.test(k));
      if (numericKeys.length) {
        return numericKeys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => candidate[k])
          .filter(Boolean);
      }

      if ("persona_id" in candidate || "persona" in candidate)
        return [candidate];
    }

    return [];
  };

  const searchAffiliates = async () => {
    const term = affiliateQuery.trim();
    if (!term) {
      toast.error("Captura un parámetro de búsqueda", {
        description: "Puede ser número de afiliación, CURP o id.",
      });
      return;
    }

    try {
      const response = await request(
        `/sics/affiliates/getAffiliateById/${encodeURIComponent(term)}`,
        "GET",
      );

      if (response.status < 200 || response.status >= 300) {
        toast.error("No se pudieron consultar afiliados", {
          description: response?.message || "Respuesta inválida del servidor.",
        });
        return;
      }

      const rows = extractAffiliateArray(response);
      const options: AffiliateOption[] = rows
        .map((item: any) => {
          const personaId = String(
            item?.persona_id ?? item?.persona?.id ?? "",
          ).trim();
          if (!personaId) return null;

          const noAfiliacion = String(
            item?.no_Afiliacion ?? item?.no_afiliacion ?? "",
          ).trim();
          const nombre = [
            item?.persona?.nombre,
            item?.persona?.apellido_paterno,
            item?.persona?.apellido_materno,
          ]
            .filter(Boolean)
            .join(" ")
            .trim();
          const curp = String(item?.persona?.curp ?? "").trim();

          return {
            personaId,
            label: `${noAfiliacion || "SIN_AFILIACION"} - ${nombre || "SIN_NOMBRE"}${
              curp ? ` (${curp})` : ""
            }`,
          };
        })
        .filter(Boolean) as AffiliateOption[];

      setAffiliateOptions(options);
      setSelectedPersonaId(options[0]?.personaId ?? "");

      if (!options.length) {
        toast.error("No se encontraron afiliados con ese parámetro");
        return;
      }

      toast.success("Afiliado(s) encontrado(s)", {
        description: `Resultados: ${options.length}`,
      });
    } catch (error) {
      console.error("Error buscando afiliado", error);
      toast.error("Error de red", {
        description: "No se pudo consultar el endpoint de afiliados.",
      });
    }
  };

  const validateCurrentStep = () => {
    const map = [step1Ref, step2Ref, step3Ref];
    const current = map[step - 1]?.current;
    if (!current) return false;

    const firstInvalid = current.querySelector(":invalid") as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.reportValidity();
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (!selectedPersonaId) {
      toast.error("Debes seleccionar persona_id", {
        description: "Busca y selecciona un afiliado antes de continuar.",
      });
      return;
    }

    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const finishForm = async () => {
    if (!selectedPersonaId) {
      toast.error("Debes seleccionar persona_id", {
        description: "Busca y selecciona un afiliado antes de finalizar.",
      });
      return;
    }

    const medicoId = resolveMedicoId();
    if (!medicoId) {
      toast.error("No se encontró medico_id del usuario actual", {
        description: "Inicia sesión nuevamente para cargar el médico asociado.",
      });
      return;
    }

    if (!validateCurrentStep()) return;
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const payload = {
      persona_id: selectedPersonaId,
      medico_id: medicoId,
      escolaridad: text(formData, "escolaridad"),
      otra: text(formData, "otra"),
      nombre_artistico: text(formData, "nombre_artistico"),

      tiempo_tijuana: text(formData, "tiempo_tijuana"),
      anos: text(formData, "anos"),
      meses: text(formData, "meses"),
      dias: text(formData, "dias"),
      piensas_quedarte_tijuana: toBoolean(siNo.quedarteTijuana),
      cuanto_tiempo: text(formData, "cuanto_tiempo"),
      por_que: text(formData, "por_que"),
      por_que_decidiste_trabajar_tijuana: text(
        formData,
        "por_que_decidiste_trabajar_tijuana",
      ),
      mejor_paga: checked(formData, "mejor_paga"),
      mayor_trabajo: checked(formData, "mayor_trabajo"),
      otro: text(formData, "otro"),
      cual: text(formData, "cual"),

      fumas: toBoolean(siNo.fumas),
      edad_empezo: text(formData, "edad_empezo"),
      ingieres_alcohol: toBoolean(siNo.ingieresAlcohol),
      edad_empezo2: text(formData, "edad_empezo2"),
      utiliza_drogas: toBoolean(siNo.utilizasDrogas),
      cuales: text(formData, "cuales"),
      cuanto_tiempo2: text(formData, "cuanto_tiempo2"),

      como_disfrutas_tiempo_libre: text(
        formData,
        "como_disfrutas_tiempo_libre",
      ),
      cualidades: text(formData, "cualidades"),
      que_es_lo_importante_para_tu_vida: text(
        formData,
        "que_es_lo_importante_para_tu_vida",
      ),
      que_te_causa_alegria: text(formData, "que_te_causa_alegria"),

      nunca: siNoText(formData, "nunca"),
      alguna_veces: siNoText(formData, "alguna_veces"),
      muy_a_menudo: siNoText(formData, "muy_a_menudo"),
      edad: text(formData, "edad"),
      metodo: text(formData, "metodo"),
      recibio_atencion_psiquiatrica: toBoolean(siNo.atencionPsiquiatrica),
      motivo: text(formData, "motivo"),

      satisfecha_con_mi_vida: checked(formData, "satisfecha_con_mi_vida"),
      moderadamenteo_satisfecha_con_mi_vida: checked(
        formData,
        "moderadamenteo_satisfecha_con_mi_vida",
      ),
      insatisfecha_con_mi_vida: checked(formData, "insatisfecha_con_mi_vida"),
      cuales_son_tus_metas: text(formData, "cuales_son_tus_metas"),

      tiene_pareja: toBoolean(siNo.parejaActual),
      cuanto_tiempo_tiene_la_relacion: text(
        formData,
        "cuanto_tiempo_tiene_la_relacion",
      ),
      muy_buena: checked(formData, "muy_buena"),
      buena: checked(formData, "buena"),
      regular: checked(formData, "regular"),
      conflictiva: checked(formData, "conflictiva"),
      muy_conflictiva: checked(formData, "muy_conflictiva"),

      tu_primera_relacion_sexual_fue_voluntaria: toBoolean(
        siNo.primeraRelacionVoluntaria,
      ),
      a_que_edad_tuviste_sexo: text(formData, "a_que_edad_tuviste_sexo"),
      que_tipo_relacion_tenias_con_esa_persona: text(
        formData,
        "que_tipo_relacion_tenias_con_esa_persona",
      ),

      por_que_decidiste_trabajar_como_TSC: text(
        formData,
        "por_que_decidiste_trabajar_como_TSC",
      ),
      alguna_persona_te_informo_o_influyo: text(
        formData,
        "alguna_persona_te_informo_o_influyo",
      ),
      consideras_que_fue_facil_trabajar_TSC: toBoolean(siNo.facilDecidirTsc),
      por_que1: text(formData, "por_que1"),
      si_te_ofrecieran_empleo_fuera_de_TSC: text(
        formData,
        "si_te_ofrecieran_empleo_fuera_de_TSC",
      ),

      anos1: text(formData, "anos1"),
      meses1: text(formData, "meses1"),
      semanas1: text(formData, "semanas1"),
      dias1: text(formData, "dias1"),
      sabe_tu_familia: toBoolean(siNo.sabeTuFamilia),
      quienes: text(formData, "quienes"),

      bailarina: checked(formData, "bailarina"),
      edecan: checked(formData, "edecan"),
      cuartos: checked(formData, "cuartos"),
      fichas: checked(formData, "fichas"),
      mesera: checked(formData, "mesera"),

      vaginal: checked(formData, "vaginal"),
      anal: checked(formData, "anal"),
      oral: checked(formData, "oral"),
      clientes_por_dia: text(formData, "clientes_por_dia"),
      cuantas_fichas_realizas_por_dia: text(
        formData,
        "cuantas_fichas_realizas_por_dia",
      ),

      bailarina1: text(formData, "bailarina1"),
      edecan1: text(formData, "edecan1"),
      cuartos1: text(formData, "cuartos1"),
      fichas1: text(formData, "fichas1"),
      mesera1: text(formData, "mesera1"),

      cuantos_dias_semana_trabajas: text(
        formData,
        "cuantos_dias_semana_trabajas",
      ),
      tienes_preferencia_por_algun_cliente: toBoolean(siNo.preferenciaCliente),
      que_tipo: text(formData, "que_tipo"),

      utilizas_condon_con_todos_los_clientes: toBoolean(siNo.condonClientes),
      alguna_veces1: text(formData, "alguna_veces1"),
      has_tenido_experiencia_desagradable_cliente: toBoolean(
        siNo.experienciaDesagradable,
      ),
      que_tipo2: text(formData, "que_tipo2"),

      has_tenido_relaciones_sin_condon_ultimos_seis_meses: toBoolean(
        siNo.sinCondonUltimosSeisMeses,
      ),
      con_quien: text(formData, "con_quien"),

      tienes_informacion_acerca_ITS: text(
        formData,
        "tienes_informacion_acerca_ITS",
      ),
      tienes_informacion_acerca_VIHSIDA: text(
        formData,
        "tienes_informacion_acerca_VIHSIDA",
      ),
      has_pensado_riesgos_expones: toBoolean(siNo.riesgosExpones),
      has_pensado_podrias_salir_positiva_HIV: toBoolean(siNo.positivaHiv),
      tomarias_tratamiento_atirretrovital: text(
        formData,
        "tomarias_tratamiento_atirretrovital",
      ),

      en_caso_emergencia_mecionar_persona: text(
        formData,
        "en_caso_emergencia_mecionar_persona",
      ),
      senas_particulares: text(formData, "senas_particulares"),
      estatura: text(formData, "estatura"),
      cabello: text(formData, "cabello"),
      ojos: text(formData, "ojos"),
      tez: text(formData, "tez"),
      complexion: text(formData, "complexion"),
      notas: text(formData, "notas"),
    };

    try {
      setSaving(true);
      const response = await request(
        "/sics/interview/createAffiliationInterview",
        "POST",
        payload,
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Entrevista guardada correctamente");
        return;
      }

      toast.error("No se pudo guardar la entrevista", {
        description:
          response?.message ||
          "El backend respondió con error. Verifica los datos e intenta nuevamente.",
      });
    } catch (error) {
      console.error("Error al guardar entrevista", error);
      toast.error("Error de red", {
        description: "No se pudo comunicar con el backend.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            CONTROL SANITARIO
          </h1>
          <p className="text-sm font-semibold">ENTREVISTA DE AFILIACION</p>
        </div>

        <section className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Selección de afiliado</h2>
          <p className="text-sm text-muted-foreground">
            Busca en `/sics/affiliates/getAffiliateById/${"{parametro}"}` para
            obtener `persona_id`.
          </p>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className="h-10 w-full rounded-md border px-3"
              placeholder="Número de afiliación, CURP o id"
              value={affiliateQuery}
              onChange={(e) => setAffiliateQuery(e.target.value)}
            />
            <Button type="button" onClick={searchAffiliates}>
              Buscar afiliado
            </Button>
          </div>

          <label className="block text-sm">
            persona_id
            <select
              className="mt-1 h-10 w-full rounded-md border px-3"
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              required
            >
              <option value="">Selecciona un afiliado</option>
              {affiliateOptions.map((option) => (
                <option key={option.personaId} value={option.personaId}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="flex items-center gap-2 text-sm">
          <span
            className={step === 1 ? "font-semibold" : "text-muted-foreground"}
          >
            Sección 1
          </span>
          <span>/</span>
          <span
            className={step === 2 ? "font-semibold" : "text-muted-foreground"}
          >
            Sección 2
          </span>
          <span>/</span>
          <span
            className={step === 3 ? "font-semibold" : "text-muted-foreground"}
          >
            Sección 3
          </span>
        </div>

        <form ref={formRef} className="space-y-6">
          <fieldset
            ref={step1Ref}
            className={`rounded-lg border bg-card p-6 shadow-sm space-y-4 ${
              step === 1 ? "block" : "hidden"
            }`}
          >
            <h2 className="text-lg font-semibold">DATOS PERSONALES</h2>

            <label className="block text-sm">
              Escolaridad PR___ S___ P___ U___ Otra____________________
              <input
                name="escolaridad"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Otra
              <input
                name="otra"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Nombre artistico
              <input
                name="nombre_artistico"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-sm font-semibold underline">
              Residencia en la Ciudad de Tijuana (Omitir en caso de ser
              residente)
            </h3>

            <label className="block text-sm">
              ¿Cuánto tiempo tienes en Tijuana?
              <input
                name="tiempo_tijuana"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm">
                Años___
                <input
                  name="anos"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Meses___
                <input
                  name="meses"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Días___
                <input
                  name="dias"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <YesNoField
              label="¿Piensas quedarte en Tijuana?"
              value={siNo.quedarteTijuana}
              onChange={(value) => setSiNoValue("quedarteTijuana", value)}
            />

            <label className="block text-sm">
              ¿Cuánto tiempo?
              <input
                name="cuanto_tiempo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Por qué?
              <input
                name="por_que"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Por qué decidiste trabajar en Tijuana?
              <input
                name="por_que_decidiste_trabajar_tijuana"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <div className="space-y-2 text-sm">
              <p>____Mejor paga ___Mayor trabajo ___Otro</p>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    name="mejor_paga"
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  Mejor paga
                </label>
                <label className="flex items-center gap-2">
                  <input
                    name="mayor_trabajo"
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  Mayor trabajo
                </label>
              </div>
            </div>

            <label className="block text-sm">
              Otro
              <input
                name="otro"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuál?
              <input
                name="cual"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">2. Toxicologia</h3>

            <YesNoField
              label="¿Fumas?"
              value={siNo.fumas}
              onChange={(value) => setSiNoValue("fumas", value)}
            />
            <label className="block text-sm">
              ¿A qué edad empezaste?
              <input
                name="edad_empezo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Ingieres alcohol?"
              value={siNo.ingieresAlcohol}
              onChange={(value) => setSiNoValue("ingieresAlcohol", value)}
            />
            <label className="block text-sm">
              ¿A qué edad empezaste?
              <input
                name="edad_empezo2"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Utilizas drogas?"
              value={siNo.utilizasDrogas}
              onChange={(value) => setSiNoValue("utilizasDrogas", value)}
            />

            <label className="block text-sm">
              ¿Cuáles?
              <input
                name="cuales"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuánto tiempo?
              <input
                name="cuanto_tiempo2"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">3.-Personalidad</h3>

            <label className="block text-sm">
              ¿Cómo disfrutas tu tiempo libre?
              <input
                name="como_disfrutas_tiempo_libre"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Cualidades:
              <input
                name="cualidades"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Qué es lo más importante para ti en la vida?
              <input
                name="que_es_lo_importante_para_tu_vida"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Qué te causa alegría?
              <input
                name="que_te_causa_alegria"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <p className="text-sm">¿Has pensado o intentado suicidarte?</p>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <input name="nunca" type="checkbox" className="h-4 w-4" />
                Nunca____
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="alguna_veces"
                  type="checkbox"
                  className="h-4 w-4"
                />
                Algunas veces____
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="muy_a_menudo"
                  type="checkbox"
                  className="h-4 w-4"
                />
                Muy a Menudo____
              </label>
            </div>

            <label className="block text-sm">
              Edad __
              <input
                name="edad"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Método
              <input
                name="metodo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="Recibió atención psicológica o psiquiátrica"
              value={siNo.atencionPsiquiatrica}
              onChange={(value) => setSiNoValue("atencionPsiquiatrica", value)}
            />

            <label className="block text-sm">
              Motivo:
              <input
                name="motivo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <p className="text-sm">
              Tomando todo en consideración, actualmente estoy:
            </p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  name="satisfecha_con_mi_vida"
                  type="checkbox"
                  className="h-4 w-4"
                />
                ___Satisfecha con mi vida
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="moderadamenteo_satisfecha_con_mi_vida"
                  type="checkbox"
                  className="h-4 w-4"
                />
                ___Moderadamente satisfecha con mi vida
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="insatisfecha_con_mi_vida"
                  type="checkbox"
                  className="h-4 w-4"
                />
                ___Insatisfecha con mi vida
              </label>
            </div>

            <label className="block text-sm">
              ¿Cuáles son tus metas?
              <textarea
                name="cuales_son_tus_metas"
                required
                className="mt-1 min-h-20 w-full rounded-md border px-3 py-2"
              />
            </label>
          </fieldset>

          <fieldset
            ref={step2Ref}
            className={`rounded-lg border bg-card p-6 shadow-sm space-y-4 ${
              step === 2 ? "block" : "hidden"
            }`}
          >
            <h3 className="text-base font-semibold">
              4. Pareja (Omitir en caso de ser soltera) A partir de los 6 meses
            </h3>

            <YesNoField
              label="¿Tienes pareja sentimental actualmente?"
              value={siNo.parejaActual}
              onChange={(value) => setSiNoValue("parejaActual", value)}
            />

            <label className="block text-sm">
              ¿Cuánto tiempo tienen de relación?
              <input
                name="cuanto_tiempo_tiene_la_relacion"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <div className="space-y-2 text-sm">
              <p>
                ¿Tu relación con tu pareja es? Muy Buena ___ Buena ___
                Regular___ Conflictiva ___ Muy conflictiva ___
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input name="muy_buena" type="checkbox" className="h-4 w-4" />
                  Muy Buena
                </label>
                <label className="flex items-center gap-2">
                  <input name="buena" type="checkbox" className="h-4 w-4" />
                  Buena
                </label>
                <label className="flex items-center gap-2">
                  <input name="regular" type="checkbox" className="h-4 w-4" />
                  Regular
                </label>
                <label className="flex items-center gap-2">
                  <input
                    name="conflictiva"
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  Conflictiva
                </label>
                <label className="flex items-center gap-2">
                  <input
                    name="muy_conflictiva"
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  Muy conflictiva
                </label>
              </div>
            </div>

            <h3 className="text-base font-semibold">5. Vida sexual</h3>

            <YesNoField
              label="¿Tu primera relación sexual fue voluntaria?"
              value={siNo.primeraRelacionVoluntaria}
              onChange={(value) =>
                setSiNoValue("primeraRelacionVoluntaria", value)
              }
            />

            <label className="block text-sm">
              ¿A qué edad tuviste tu primera relación sexual? ________ Años
              <input
                name="a_que_edad_tuviste_sexo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Qué tipo de relación tenías con esta persona?
              <input
                name="que_tipo_relacion_tenias_con_esa_persona"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <h3 className="text-base font-semibold">
              6. Trabajo sexo comercial (TSC)
            </h3>

            <label className="block text-sm">
              ¿Por qué decidiste trabajar como TSC?
              <textarea
                name="por_que_decidiste_trabajar_como_TSC"
                required
                className="mt-1 min-h-20 w-full rounded-md border px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              ¿Alguna persona te informo o te influyo para que trabajaras en
              TSC?
              <input
                name="alguna_persona_te_informo_o_influyo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Consideras que fue fácil decidirte a trabajar en TSC?"
              value={siNo.facilDecidirTsc}
              onChange={(value) => setSiNoValue("facilDecidirTsc", value)}
            />

            <label className="block text-sm">
              ¿Por qué?
              <input
                name="por_que1"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              Si te ofrecieran un empleo fuera de TSC, ¿lo tomarías?
              <input
                name="si_te_ofrecieran_empleo_fuera_de_TSC"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-sm">
                Años
                <input
                  name="anos1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Meses
                <input
                  name="meses1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Semanas
                <input
                  name="semanas1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Días
                <input
                  name="dias1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <YesNoField
              label="¿Sabe tu familia?"
              value={siNo.sabeTuFamilia}
              onChange={(value) => setSiNoValue("sabeTuFamilia", value)}
            />

            <label className="block text-sm">
              ¿Quiénes?
              <input
                name="quienes"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <p className="text-sm">En tu trabajo ¿qué actividad desarrollas?</p>
            <div className="grid gap-3 md:grid-cols-5 text-sm">
              <label className="flex items-center gap-2">
                <input name="bailarina" type="checkbox" className="h-4 w-4" />{" "}
                Bailarina
              </label>
              <label className="flex items-center gap-2">
                <input name="edecan" type="checkbox" className="h-4 w-4" />{" "}
                Edecán
              </label>
              <label className="flex items-center gap-2">
                <input name="cuartos" type="checkbox" className="h-4 w-4" />{" "}
                Cuartos
              </label>
              <label className="flex items-center gap-2">
                <input name="fichas" type="checkbox" className="h-4 w-4" />{" "}
                Fichas
              </label>
              <label className="flex items-center gap-2">
                <input name="mesera" type="checkbox" className="h-4 w-4" />{" "}
                Mesera
              </label>
            </div>

            <p className="text-sm">¿A qué actividades sexuales accedes?</p>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <label className="flex items-center gap-2">
                <input name="vaginal" type="checkbox" className="h-4 w-4" />{" "}
                Vaginal
              </label>
              <label className="flex items-center gap-2">
                <input name="anal" type="checkbox" className="h-4 w-4" /> Anal
              </label>
              <label className="flex items-center gap-2">
                <input name="oral" type="checkbox" className="h-4 w-4" /> Oral
              </label>
            </div>

            <label className="block text-sm">
              ¿Cuántos clientes tienes por día?
              <input
                name="clientes_por_dia"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Cuántas fichas realizas por día?
              <input
                name="cuantas_fichas_realizas_por_dia"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-5">
              <label className="text-sm">
                Bailarina
                <input
                  name="bailarina1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Edecán
                <input
                  name="edecan1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Cuartos
                <input
                  name="cuartos1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Fichas
                <input
                  name="fichas1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Mesera
                <input
                  name="mesera1"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <label className="block text-sm">
              ¿Cuántos días a la semana trabajas?
              <input
                name="cuantos_dias_semana_trabajas"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Tienes alguna preferencia por algún tipo de cliente?"
              value={siNo.preferenciaCliente}
              onChange={(value) => setSiNoValue("preferenciaCliente", value)}
            />

            <label className="block text-sm">
              ¿Qué tipo?
              <input
                name="que_tipo"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Utilizas condón con todos los clientes?"
              value={siNo.condonClientes}
              onChange={(value) => setSiNoValue("condonClientes", value)}
            />

            <label className="block text-sm">
              Alguna veces____
              <input
                name="alguna_veces1"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>
          </fieldset>

          <fieldset
            ref={step3Ref}
            className={`rounded-lg border bg-card p-6 shadow-sm space-y-4 ${
              step === 3 ? "block" : "hidden"
            }`}
          >
            <YesNoField
              label="¿Has tenido alguna experiencia desagradable con algún cliente?"
              value={siNo.experienciaDesagradable}
              onChange={(value) =>
                setSiNoValue("experienciaDesagradable", value)
              }
            />

            <label className="block text-sm">
              ¿Qué tipo?
              <input
                name="que_tipo2"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Has tenido relaciones sexuales sin condón en los ultimos seis meses?"
              value={siNo.sinCondonUltimosSeisMeses}
              onChange={(value) =>
                setSiNoValue("sinCondonUltimosSeisMeses", value)
              }
            />

            <label className="block text-sm">
              ¿Con quién?
              <input
                name="con_quien"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Tienes información acerca de las ITS? Bastante___ Regular___
              Poca___ Nada___
              <input
                name="tienes_informacion_acerca_ITS"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              ¿Tienes información acerca del VIH-SIDA? Bastante___ Regular___
              Poca___ Nada___
              <input
                name="tienes_informacion_acerca_VIHSIDA"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <YesNoField
              label="¿Has pensado en los riesgos a los que te expones?"
              value={siNo.riesgosExpones}
              onChange={(value) => setSiNoValue("riesgosExpones", value)}
            />

            <YesNoField
              label="¿Has pensado que podrías salir positiva en la prueba de HIV?"
              value={siNo.positivaHiv}
              onChange={(value) => setSiNoValue("positivaHiv", value)}
            />

            <label className="block text-sm">
              ¿Tomarías el tratamiento antirretroviral en caso de un resultado
              positivo? Sí ___ No ___ Tal vez ___
              <input
                name="tomarias_tratamiento_atirretrovital"
                required
                className="mt-1 h-10 w-full rounded-md border px-3"
                type="text"
              />
            </label>

            <label className="block text-sm">
              En caso de emergencia me puedes mencionar alguna persona de tu
              confianza (nombre, parentesco y teléfono)
              <textarea
                name="en_caso_emergencia_mecionar_persona"
                required
                className="mt-1 min-h-24 w-full rounded-md border px-3 py-2"
              />
            </label>

            <label className="block text-sm">
              Senales Particulares
              <textarea
                name="senas_particulares"
                required
                className="mt-1 min-h-24 w-full rounded-md border px-3 py-2"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm">
                Estatura
                <input
                  name="estatura"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Cabello
                <input
                  name="cabello"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Ojos
                <input
                  name="ojos"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm">
                Tez
                <input
                  name="tez"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
              <label className="text-sm md:col-span-2">
                Complexión
                <input
                  name="complexion"
                  required
                  className="mt-1 h-10 w-full rounded-md border px-3"
                  type="text"
                />
              </label>
            </div>

            <label className="block text-sm">
              Notas:
              <textarea
                name="notas"
                required
                className="mt-1 min-h-24 w-full rounded-md border px-3 py-2"
              />
            </label>
          </fieldset>
        </form>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || saving}
          >
            Anterior
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={nextStep} disabled={saving}>
              Siguiente sección
            </Button>
          ) : (
            <Button type="button" onClick={finishForm} disabled={saving}>
              {saving ? "Guardando..." : "Finalizar entrevista"}
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
