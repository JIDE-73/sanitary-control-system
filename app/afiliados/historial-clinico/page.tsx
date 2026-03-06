"use client";
import {
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { cn } from "@/lib/utils";

type SelectOption = {
  id: string;
  nombre: string;
};

type FormChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

const createStateUpdater = <T extends Record<string, string>>(
  setState: Dispatch<SetStateAction<T>>,
) => {
  return (key: keyof T) => (e: FormChangeEvent) => {
    setState((prev) => ({ ...prev, [key]: e.target.value }));
  };
};

const STEPS = [
  { id: 1, label: "Datos Personales", short: "Personal" },
  { id: 2, label: "Antecedentes Familiares", short: "AHF" },
  { id: 3, label: "No Patológicos", short: "APNP" },
  { id: 4, label: "Patológicos", short: "APP" },
  { id: 5, label: "Gineco-Obstétricos", short: "AGO" },
  { id: 6, label: "Interrogatorio y Expl.", short: "Sistemas" },
];

const CAT = {
  estadosCiviles: [
    { id: "Soltero/a", nombre: "Soltero/a" },
    { id: "Casado/a", nombre: "Casado/a" },
    { id: "Unión libre", nombre: "Unión libre" },
    { id: "Divorciado/a", nombre: "Divorciado/a" },
    { id: "Viudo/a", nombre: "Viudo/a" },
  ],
  ocupaciones: [
    { id: "Trabajadora sexual", nombre: "Trabajadora sexual" },
    { id: "Estilista", nombre: "Estilista" },
    { id: "Mesera / edecán", nombre: "Mesera / edecán" },
    { id: "Bailarina / animadora", nombre: "Bailarina / animadora" },
    { id: "Masajista", nombre: "Masajista" },
    { id: "Otra", nombre: "Otra" },
  ],
  religiones: [
    { id: "Católica", nombre: "Católica" },
    { id: "Cristiana", nombre: "Cristiana" },
    { id: "Ninguna", nombre: "Ninguna" },
    { id: "Otra", nombre: "Otra" },
  ],
  modalidadesTrabajo: [
    { id: "Establecimiento fijo", nombre: "Establecimiento fijo" },
    { id: "Zona de tolerancia", nombre: "Zona de tolerancia" },
    { id: "Trabajo en calle", nombre: "Trabajo en calle" },
    { id: "Servicio a domicilio", nombre: "Servicio a domicilio" },
  ],
  zonasTrabajo: [
    { id: "Zona Centro", nombre: "Zona Centro" },
    { id: "Zona Norte", nombre: "Zona Norte" },
    { id: "Zona Río", nombre: "Zona Río" },
    { id: "La Coahuila", nombre: "La Coahuila" },
    { id: "Zona Este", nombre: "Zona Este" },
  ],
  metodosAnticonceptivos: [
    { id: "Ninguno", nombre: "Ninguno" },
    { id: "Condón", nombre: "Condón" },
    { id: "Píldora", nombre: "Píldora anticonceptiva" },
    { id: "DIU", nombre: "DIU" },
    { id: "Inyectable", nombre: "Inyectable" },
    { id: "Implante", nombre: "Implante subdérmico" },
    { id: "Ligadura", nombre: "Ligadura de trompas" },
    { id: "Otro", nombre: "Otro" },
  ],
};

const USO_PRESERVATIVO = [
  { id: "Siempre", nombre: "Siempre" },
  { id: "Casi siempre", nombre: "Casi siempre" },
  { id: "A veces", nombre: "A veces" },
  { id: "Nunca", nombre: "Nunca" },
];

const RESULTADO_ITS = [
  { id: "Negativo", nombre: "Negativo" },
  { id: "Positivo en tto", nombre: "Positivo (en tratamiento)" },
  { id: "Pendiente", nombre: "Pendiente" },
  { id: "No realizada", nombre: "No realizada" },
];

interface FInputProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
}

function FInput({
  value,
  onChange,
  type = "text",
  placeholder = "",
}: FInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
    />
  );
}

interface FTextareaProps {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  rows?: number;
}

function FTextarea({
  value,
  onChange,
  placeholder = "",
  rows = 2,
}: FTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
    />
  );
}

interface FSelectProps {
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  placeholder?: string;
}

function FSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
}: FSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-9 w-full cursor-pointer rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nombre}
        </option>
      ))}
    </select>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  span?: number;
  children: ReactNode;
}

function Field({ label, hint, span = 1, children }: FieldProps) {
  const spanClass =
    span === 2
      ? "md:col-span-2"
      : span === 3
        ? "md:col-span-3"
        : "md:col-span-1";

  return (
    <div className={cn("col-span-1", spanClass)}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
          {hint}
        </p>
      )}
    </div>
  );
}

interface SectionCardProps {
  title: string;
  children: ReactNode;
  accent?: boolean;
  badge?: string;
}

function SectionCard({
  title,
  children,
  accent = false,
  badge,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "mb-4 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        accent ? "border-rose-300/60 dark:border-rose-800/60" : "border-border",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b px-5 py-3",
          accent
            ? "border-rose-200/60 bg-rose-50/70 dark:border-rose-800/60 dark:bg-rose-950/20"
            : "border-border bg-muted/30",
        )}
      >
        <span
          className={cn(
            "text-sm font-bold",
            accent ? "text-rose-800 dark:text-rose-300" : "text-primary",
          )}
        >
          {title}
        </span>
        {badge && (
          <span className="ml-auto rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface GridProps {
  cols?: number;
  gap?: number;
  children: ReactNode;
}

function Grid({ cols = 2, gap = 14, children }: GridProps) {
  const colsClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 3
        ? "grid-cols-1 md:grid-cols-3"
        : cols === 5
          ? "grid-cols-2 md:grid-cols-5"
          : "grid-cols-1 md:grid-cols-2";

  const gapClass = gap >= 14 ? "gap-3.5" : gap >= 12 ? "gap-3" : "gap-2";

  return <div className={cn("grid", colsClass, gapClass)}>{children}</div>;
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="mb-2.5 mt-4 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {text}
    </p>
  );
}

interface SystemRowProps {
  label: string;
  hint?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

function SystemRow({ label, hint, value, onChange }: SystemRowProps) {
  return (
    <div className="mb-3.5 border-b border-border/60 pb-3.5">
      <label className="mb-1 block text-sm font-bold text-foreground">
        {label}
      </label>
      {hint && (
        <p className="mb-1.5 text-xs leading-relaxed text-muted-foreground/90">
          {hint}
        </p>
      )}
      <FTextarea
        value={value}
        onChange={onChange}
        placeholder="Hallazgos / negado..."
        rows={2}
      />
    </div>
  );
}

export default function HistoriaClinica() {
  const [step, setStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));

  // Step 1
  const [nombre, setNombre] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [lugarNac, setLugarNac] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [religion, setReligion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaElab, setFechaElab] = useState(
    new Date().toISOString().split("T")[0],
  );
  // Control sanitario
  const [modalidad, setModalidad] = useState("");
  const [zona, setZona] = useState("");
  const [antiguedad, setAntiguedad] = useState("");
  const [clientes, setClientes] = useState("");
  const [preservativo, setPreservativo] = useState("");
  const [resITS, setResITS] = useState("");
  const [fechaITS, setFechaITS] = useState("");

  // Step 2 - AHF
  const [ahf, setAhf] = useState({
    neoplasticos: "",
    diabetes: "",
    inmunologicos: "",
    hipertension: "",
    neurologicos: "",
    farmacoDep: "",
    psiquiatricos: "",
    cardiologicos: "",
  });
  const updAhf = createStateUpdater(setAhf);

  // Step 3 - APNP
  const [apnp, setApnp] = useState({
    alimentacion: "",
    casaTipo: "",
    propia: "",
    cuartos: "",
    habitantes: "",
    servicios: "",
    electricidad: "",
    gas: "",
    drenaje: "",
    agua: "",
    zoonosis: "",
    inmunizaciones: "",
    tabaquismo: "",
    alcoholismo: "",
    taxicomanias: "",
  });
  const updApnp = createStateUpdater(setApnp);

  // Step 4 - APP
  const [app, setApp] = useState({
    infancia: "",
    quirurgicos: "",
    medicos: "",
    hospitalizaciones: "",
    transfusionales: "",
    alergicos: "",
  });
  const updApp = createStateUpdater(setApp);

  // Step 5 - AGO
  const [ago, setAgo] = useState({
    menarca: "",
    ritmo: "",
    tipo: "",
    telarca: "",
    pubarca: "",
    ivsa: "",
    parejas: "",
    g: "",
    p: "",
    a: "",
    c: "",
    hijosVivos: "",
    partosPre: "",
    macrosomias: "",
    embarMultiples: "",
    fum: "",
    fpp: "",
    lactorrea: "",
    dispareunia: "",
    metodoAnticoncep: "",
    muertesPerinatal: "",
    ultimoPap: "",
    grupoP: "",
    grupoPar: "",
  });
  const updAgo = createStateUpdater(setAgo);

  // Step 6 - Sistemas + Exploración
  const [padActual, setPadActual] = useState("");
  const [sis, setSis] = useState({
    digestivo: "",
    cardiovascular: "",
    respiratorio: "",
    urinario: "",
    genital: "",
    hematologico: "",
    endocrino: "",
    osteomuscular: "",
    nervioso: "",
    sensorial: "",
    psicosomatico: "",
  });
  const updSis = createStateUpdater(setSis);
  const [diagAnt, setDiagAnt] = useState("");
  const [terapeutica, setTerapeutica] = useState("");
  const [sv, setSv] = useState({ fc: "", ta: "", fr: "", peso: "", temp: "" });
  const updSv = createStateUpdater(setSv);
  const [expl, setExpl] = useState({
    general: "",
    cabeza: "",
    cuello: "",
    torax: "",
    abdomen: "",
    miembros: "",
    genitales: "",
  });
  const updExpl = createStateUpdater(setExpl);
  const [comentario, setComentario] = useState("");
  const [impDx, setImpDx] = useState("");
  const [pronostico, setPronostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [medico, setMedico] = useState("");

  const pct = Math.round((visited.size / STEPS.length) * 100);
  const goTo = (n: number) => {
    setVisited((v) => new Set([...v, n]));
    setStep(n);
  };

  return (
    <MainLayout>
      <div className="rounded-xl bg-muted/35 p-2.5">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-4">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Historia Clínica
              </h1>
              <p className="mb-2 text-sm text-muted-foreground">
                SICM — Sistema Integral de Control Médico · H. Ayuntamiento de
                Tijuana
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-foreground">
                  {nombre || "Nombre del paciente"}
                </span>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Femenino
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="mb-0.5 text-xs text-muted-foreground">
                Paso {step} / {STEPS.length}
              </div>
              <div className="text-3xl font-extrabold leading-none text-primary">
                {pct}%
              </div>
              <div className="text-xs text-muted-foreground">completado</div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4.5 h-1.5 overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-linear-to-r from-primary to-primary/70 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Steps */}
          <div className="mb-5.5 flex items-center overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-card p-2.5 shadow-sm [scrollbar-width:thin]">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex min-w-30 flex-1 items-center">
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg bg-transparent px-1.5 py-1"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      s.id === step &&
                        "border-primary bg-primary text-primary-foreground",
                      s.id !== step &&
                        visited.has(s.id) &&
                        "border-emerald-700 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400",
                      s.id !== step &&
                        !visited.has(s.id) &&
                        "border-transparent bg-muted text-muted-foreground",
                    )}
                  >
                    {visited.has(s.id) && s.id !== step ? "✓" : s.id}
                  </div>
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs",
                      s.id === step && "font-bold text-primary",
                      s.id !== step &&
                        visited.has(s.id) &&
                        "text-emerald-700 dark:text-emerald-400",
                      s.id !== step &&
                        !visited.has(s.id) &&
                        "text-muted-foreground",
                    )}
                  >
                    {s.short}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mb-4.5 h-px flex-1 transition-colors",
                      visited.has(s.id + 1)
                        ? "bg-emerald-700 dark:bg-emerald-500"
                        : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ═══ STEP 1 ═══ */}
          {step === 1 && (
            <>
              <SectionCard title="Datos Personales">
                <Grid cols={1} gap={12}>
                  <Field label="Nombre">
                    <FInput
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre completo"
                    />
                  </Field>
                  <Field label="Domicilio">
                    <FInput
                      value={domicilio}
                      onChange={(e) => setDomicilio(e.target.value)}
                      placeholder="Calle, número, colonia, ciudad"
                    />
                  </Field>
                </Grid>
                <div className="h-3" />
                <Grid cols={2} gap={12}>
                  <Field label="Fecha de Nacimiento">
                    <FInput
                      type="date"
                      value={fechaNac}
                      onChange={(e) => setFechaNac(e.target.value)}
                    />
                  </Field>
                  <Field label="Lugar de Nacimiento">
                    <FInput
                      value={lugarNac}
                      onChange={(e) => setLugarNac(e.target.value)}
                      placeholder="Ciudad, Estado"
                    />
                  </Field>
                  <Field label="Estado Civil">
                    <FSelect
                      value={estadoCivil}
                      onChange={(e) => setEstadoCivil(e.target.value)}
                      options={CAT.estadosCiviles}
                    />
                  </Field>
                  <Field label="Ocupación">
                    <FSelect
                      value={ocupacion}
                      onChange={(e) => setOcupacion(e.target.value)}
                      options={CAT.ocupaciones}
                    />
                  </Field>
                  <Field label="Religión">
                    <FSelect
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      options={CAT.religiones}
                    />
                  </Field>
                  <Field label="Teléfono">
                    <FInput
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="664-000-0000"
                    />
                  </Field>
                  <Field label="Fecha de Elaboración">
                    <FInput
                      type="date"
                      value={fechaElab}
                      onChange={(e) => setFechaElab(e.target.value)}
                    />
                  </Field>
                </Grid>
              </SectionCard>

              <SectionCard
                title="Control Sanitario"
                accent
                badge="Control Sanitario"
              >
                <Grid cols={2} gap={12}>
                  <Field label="Modalidad de trabajo">
                    <FSelect
                      value={modalidad}
                      onChange={(e) => setModalidad(e.target.value)}
                      options={CAT.modalidadesTrabajo}
                    />
                  </Field>
                  <Field label="Zona de trabajo">
                    <FSelect
                      value={zona}
                      onChange={(e) => setZona(e.target.value)}
                      options={CAT.zonasTrabajo}
                    />
                  </Field>
                  <Field
                    label="Antigüedad en el trabajo"
                    hint="Ej: 2 años, 6 meses"
                  >
                    <FInput
                      value={antiguedad}
                      onChange={(e) => setAntiguedad(e.target.value)}
                      placeholder="Tiempo en el trabajo"
                    />
                  </Field>
                  <Field label="No. clientes por semana">
                    <FInput
                      type="number"
                      value={clientes}
                      onChange={(e) => setClientes(e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Uso de preservativo">
                    <FSelect
                      value={preservativo}
                      onChange={(e) => setPreservativo(e.target.value)}
                      options={USO_PRESERVATIVO}
                    />
                  </Field>
                  <Field label="Resultado última prueba ITS">
                    <FSelect
                      value={resITS}
                      onChange={(e) => setResITS(e.target.value)}
                      options={RESULTADO_ITS}
                    />
                  </Field>
                  <Field label="Fecha última prueba ITS">
                    <FInput
                      type="date"
                      value={fechaITS}
                      onChange={(e) => setFechaITS(e.target.value)}
                    />
                  </Field>
                </Grid>
                {(preservativo || resITS) && (
                  <div
                    className={cn(
                      "mt-3.5 flex items-center gap-2 rounded-lg border px-3.5 py-2.5",
                      preservativo === "Siempre" && resITS === "Negativo"
                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                        : "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30",
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        preservativo === "Siempre" && resITS === "Negativo"
                          ? "bg-emerald-600"
                          : "bg-amber-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        preservativo === "Siempre" && resITS === "Negativo"
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-amber-800 dark:text-amber-300",
                      )}
                    >
                      {preservativo === "Siempre" && resITS === "Negativo"
                        ? "Nivel de riesgo: Bajo"
                        : "Nivel de riesgo: Moderado — requiere seguimiento"}
                    </span>
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {/* ═══ STEP 2: AHF ═══ */}
          {step === 2 && (
            <SectionCard title="Antecedentes Heredo-Familiares (AHF)">
              <Grid cols={2} gap={12}>
                <Field label="Neoplásticos">
                  <FInput
                    value={ahf.neoplasticos}
                    onChange={updAhf("neoplasticos")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Diabetes">
                  <FInput
                    value={ahf.diabetes}
                    onChange={updAhf("diabetes")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Inmunológicos">
                  <FInput
                    value={ahf.inmunologicos}
                    onChange={updAhf("inmunologicos")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Hipertensión">
                  <FInput
                    value={ahf.hipertension}
                    onChange={updAhf("hipertension")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Neurológicos">
                  <FInput
                    value={ahf.neurologicos}
                    onChange={updAhf("neurologicos")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Fármaco-dependencia">
                  <FInput
                    value={ahf.farmacoDep}
                    onChange={updAhf("farmacoDep")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Psiquiátricos">
                  <FInput
                    value={ahf.psiquiatricos}
                    onChange={updAhf("psiquiatricos")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
                <Field label="Cardiológicos">
                  <FInput
                    value={ahf.cardiologicos}
                    onChange={updAhf("cardiologicos")}
                    placeholder="Especificar parentesco..."
                  />
                </Field>
              </Grid>
            </SectionCard>
          )}

          {/* ═══ STEP 3: APNP ═══ */}
          {step === 3 && (
            <SectionCard title="Antecedentes Personales No Patológicos (APNP)">
              <Grid cols={2} gap={12}>
                <Field label="Alimentación" span={2}>
                  <FInput
                    value={apnp.alimentacion}
                    onChange={updApnp("alimentacion")}
                    placeholder="Descripción de la dieta habitual"
                  />
                </Field>
                <Field label="Casa (tipo de construcción)" span={2}>
                  <FInput
                    value={apnp.casaTipo}
                    onChange={updApnp("casaTipo")}
                    placeholder="Material, madera, mixta, lámina..."
                  />
                </Field>
                <Field label="Propia">
                  <FInput
                    value={apnp.propia}
                    onChange={updApnp("propia")}
                    placeholder="Propia / Rentada / Prestada"
                  />
                </Field>
                <Field label="No. de cuartos">
                  <FInput
                    type="number"
                    value={apnp.cuartos}
                    onChange={updApnp("cuartos")}
                    placeholder="0"
                  />
                </Field>
                <Field label="No. de habitantes">
                  <FInput
                    type="number"
                    value={apnp.habitantes}
                    onChange={updApnp("habitantes")}
                    placeholder="0"
                  />
                </Field>
                <Field label="Servicios">
                  <FInput
                    value={apnp.servicios}
                    onChange={updApnp("servicios")}
                    placeholder="Servicios disponibles"
                  />
                </Field>
                <Field label="Electricidad">
                  <FInput
                    value={apnp.electricidad}
                    onChange={updApnp("electricidad")}
                    placeholder="Sí / No"
                  />
                </Field>
                <Field label="Gas">
                  <FInput
                    value={apnp.gas}
                    onChange={updApnp("gas")}
                    placeholder="Sí / No / Tipo"
                  />
                </Field>
                <Field label="Drenaje">
                  <FInput
                    value={apnp.drenaje}
                    onChange={updApnp("drenaje")}
                    placeholder="Sí / No"
                  />
                </Field>
                <Field label="Agua">
                  <FInput
                    value={apnp.agua}
                    onChange={updApnp("agua")}
                    placeholder="Potable / Pozo / Pipa"
                  />
                </Field>
                <Field label="Zoonosis">
                  <FInput
                    value={apnp.zoonosis}
                    onChange={updApnp("zoonosis")}
                    placeholder="Animales domésticos, fauna nociva..."
                  />
                </Field>
                <Field label="Inmunizaciones">
                  <FInput
                    value={apnp.inmunizaciones}
                    onChange={updApnp("inmunizaciones")}
                    placeholder="Esquema de vacunación"
                  />
                </Field>
                <Field label="Tabaquismo">
                  <FInput
                    value={apnp.tabaquismo}
                    onChange={updApnp("tabaquismo")}
                    placeholder="Sí / No / Cantidad / Años"
                  />
                </Field>
                <Field label="Alcoholismo">
                  <FInput
                    value={apnp.alcoholismo}
                    onChange={updApnp("alcoholismo")}
                    placeholder="Sí / No / Frecuencia"
                  />
                </Field>
                <Field label="Taxicomanías" span={2}>
                  <FInput
                    value={apnp.taxicomanias}
                    onChange={updApnp("taxicomanias")}
                    placeholder="Sustancias y frecuencia de consumo"
                  />
                </Field>
              </Grid>
            </SectionCard>
          )}

          {/* ═══ STEP 4: APP ═══ */}
          {step === 4 && (
            <SectionCard title="Antecedentes Personales Patológicos (APP)">
              <Grid cols={2} gap={12}>
                <Field label="Enfermedades de la infancia" span={2}>
                  <FInput
                    value={app.infancia}
                    onChange={updApp("infancia")}
                    placeholder="Sarampión, varicela, parotiditis, rubéola..."
                  />
                </Field>
                <Field label="Quirúrgicos">
                  <FInput
                    value={app.quirurgicos}
                    onChange={updApp("quirurgicos")}
                    placeholder="Cirugías previas y fecha..."
                  />
                </Field>
                <Field label="Médicos">
                  <FInput
                    value={app.medicos}
                    onChange={updApp("medicos")}
                    placeholder="Enfermedades crónicas o agudas..."
                  />
                </Field>
                <Field label="Hospitalizaciones">
                  <FInput
                    value={app.hospitalizaciones}
                    onChange={updApp("hospitalizaciones")}
                    placeholder="Motivo, lugar y fecha..."
                  />
                </Field>
                <Field label="Transfusionales">
                  <FInput
                    value={app.transfusionales}
                    onChange={updApp("transfusionales")}
                    placeholder="Sí / No / Cuándo / Motivo"
                  />
                </Field>
                <Field label="Alérgicos" span={2}>
                  <FInput
                    value={app.alergicos}
                    onChange={updApp("alergicos")}
                    placeholder="Medicamentos, alimentos, látex, otros..."
                  />
                </Field>
              </Grid>
            </SectionCard>
          )}

          {/* ═══ STEP 5: AGO ═══ */}
          {step === 5 && (
            <SectionCard title="Antecedentes Gineco-Obstétricos (AGO)">
              <SectionLabel text="Ginecológico" />
              <Grid cols={3} gap={12}>
                <Field label="Menarca">
                  <FInput
                    value={ago.menarca}
                    onChange={updAgo("menarca")}
                    placeholder="Edad (años)"
                  />
                </Field>
                <Field label="Ritmo">
                  <FInput
                    value={ago.ritmo}
                    onChange={updAgo("ritmo")}
                    placeholder="Ej: 28x5"
                  />
                </Field>
                <Field label="Tipo">
                  <FInput
                    value={ago.tipo}
                    onChange={updAgo("tipo")}
                    placeholder="Regular / Irregular"
                  />
                </Field>
                <Field label="Telarca">
                  <FInput
                    value={ago.telarca}
                    onChange={updAgo("telarca")}
                    placeholder="Edad (años)"
                  />
                </Field>
                <Field label="Pubarca">
                  <FInput
                    value={ago.pubarca}
                    onChange={updAgo("pubarca")}
                    placeholder="Edad (años)"
                  />
                </Field>
                <Field label="IVSA">
                  <FInput
                    value={ago.ivsa}
                    onChange={updAgo("ivsa")}
                    placeholder="Edad inicio vida sexual"
                  />
                </Field>
              </Grid>

              <SectionLabel text="Obstétrico" />
              <Grid cols={3} gap={12}>
                <Field label="No. parejas sexuales">
                  <FInput
                    type="number"
                    value={ago.parejas}
                    onChange={updAgo("parejas")}
                    placeholder="0"
                  />
                </Field>
                <Field label="G (Gestas)">
                  <FInput
                    type="number"
                    value={ago.g}
                    onChange={updAgo("g")}
                    placeholder="0"
                  />
                </Field>
                <Field label="P (Partos)">
                  <FInput
                    type="number"
                    value={ago.p}
                    onChange={updAgo("p")}
                    placeholder="0"
                  />
                </Field>
                <Field label="A (Abortos)">
                  <FInput
                    type="number"
                    value={ago.a}
                    onChange={updAgo("a")}
                    placeholder="0"
                  />
                </Field>
                <Field label="C (Cesáreas)">
                  <FInput
                    type="number"
                    value={ago.c}
                    onChange={updAgo("c")}
                    placeholder="0"
                  />
                </Field>
                <Field label="Hijos vivos">
                  <FInput
                    type="number"
                    value={ago.hijosVivos}
                    onChange={updAgo("hijosVivos")}
                    placeholder="0"
                  />
                </Field>
                <Field label="Partos pre-términos">
                  <FInput
                    type="number"
                    value={ago.partosPre}
                    onChange={updAgo("partosPre")}
                    placeholder="0"
                  />
                </Field>
                <Field label="Macrosomías">
                  <FInput
                    type="number"
                    value={ago.macrosomias}
                    onChange={updAgo("macrosomias")}
                    placeholder="0"
                  />
                </Field>
                <Field label="Embarazos múltiples">
                  <FInput
                    type="number"
                    value={ago.embarMultiples}
                    onChange={updAgo("embarMultiples")}
                    placeholder="0"
                  />
                </Field>
                <Field label="FUM">
                  <FInput
                    type="date"
                    value={ago.fum}
                    onChange={updAgo("fum")}
                  />
                </Field>
                <Field label="FPP">
                  <FInput
                    type="date"
                    value={ago.fpp}
                    onChange={updAgo("fpp")}
                  />
                </Field>
                <Field label="Lactorrea">
                  <FInput
                    value={ago.lactorrea}
                    onChange={updAgo("lactorrea")}
                    placeholder="Sí / No"
                  />
                </Field>
                <Field label="Dispareunia">
                  <FInput
                    value={ago.dispareunia}
                    onChange={updAgo("dispareunia")}
                    placeholder="Sí / No"
                  />
                </Field>
                <Field label="Método Anticonceptivo">
                  <FSelect
                    value={ago.metodoAnticoncep}
                    onChange={updAgo("metodoAnticoncep")}
                    options={CAT.metodosAnticonceptivos}
                  />
                </Field>
                <Field label="Muertes perinatales">
                  <FInput
                    type="number"
                    value={ago.muertesPerinatal}
                    onChange={updAgo("muertesPerinatal")}
                    placeholder="0"
                  />
                </Field>
              </Grid>

              <SectionLabel text="Exámenes" />
              <Grid cols={3} gap={12}>
                <Field label="Último Papanicolaou">
                  <FInput
                    type="date"
                    value={ago.ultimoPap}
                    onChange={updAgo("ultimoPap")}
                  />
                </Field>
                <Field label="Gpo ABO/Rh (paciente)">
                  <FInput
                    value={ago.grupoP}
                    onChange={updAgo("grupoP")}
                    placeholder="Ej: O+"
                  />
                </Field>
                <Field label="Gpo ABO/Rh (pareja)">
                  <FInput
                    value={ago.grupoPar}
                    onChange={updAgo("grupoPar")}
                    placeholder="Ej: A+"
                  />
                </Field>
              </Grid>
            </SectionCard>
          )}

          {/* ═══ STEP 6: INTERROGATORIO + EXPLORACIÓN ═══ */}
          {step === 6 && (
            <>
              <SectionCard title="Padecimiento Actual">
                <Field label="Descripción">
                  <FTextarea
                    value={padActual}
                    onChange={(e) => setPadActual(e.target.value)}
                    placeholder="Descripción cronológica del motivo de consulta..."
                    rows={3}
                  />
                </Field>
              </SectionCard>

              <SectionCard title="Interrogatorio por Aparatos y Sistemas">
                <SystemRow
                  label="Aparato Digestivo"
                  hint="Náusea, vómito, hematemesis, dolor abd., meteorismo, constipación, diarrea."
                  value={sis.digestivo}
                  onChange={updSis("digestivo")}
                />
                <SystemRow
                  label="Aparato Cardiovascular"
                  hint="Disnea, tos (seca/prod.), hemoptisis, dolor precordial, palpitaciones, cianosis, edema, acúfenos, fosfenos, síncope, lipotimia, cefalea, hipertensión/hipotensión arterial."
                  value={sis.cardiovascular}
                  onChange={updSis("cardiovascular")}
                />
                <SystemRow
                  label="Aparato Respiratorio"
                  hint="Tos, disnea, dolor torácico, hemoptisis, cianosis, vómica, alteraciones de la voz."
                  value={sis.respiratorio}
                  onChange={updSis("respiratorio")}
                />
                <SystemRow
                  label="Aparato Urinario"
                  hint="Poliuria, anuria, polaquiuria, oliguria, nicturia, opsiuria, disuria, tenesmo vesical, urgencia, incontinencia, características de la orina (volumen, olor, color, aspecto), dolor lumbar, edema renal."
                  value={sis.urinario}
                  onChange={updSis("urinario")}
                />
                <SystemRow
                  label="Aparato Genital"
                  hint="Sangrado genital, flujo o leucorrea, dolor ginecológico, prurito vulvar, función sexual."
                  value={sis.genital}
                  onChange={updSis("genital")}
                />
                <SystemRow
                  label="Aparato Hematológico"
                  hint="Datos clínicos de anemia (palidez, astenia, adinamia), hemorragias, adenopatías, esplenomegalia."
                  value={sis.hematologico}
                  onChange={updSis("hematologico")}
                />
                <SystemRow
                  label="Sistema Endocrino"
                  hint="Bocio, bradipsiquia, intolerancia al calor/frío, nerviosismo, hiperquinesis, galactorrea, amenorrea, ginecomastía, obesidad, ruborización."
                  value={sis.endocrino}
                  onChange={updSis("endocrino")}
                />
                <SystemRow
                  label="Sistema Osteomuscular"
                  hint="Ganglios, xeroftalmia, xerostomia, fotosensibilidad, artralgias/mialgias, Raynaud."
                  value={sis.osteomuscular}
                  onChange={updSis("osteomuscular")}
                />
                <SystemRow
                  label="Sistema Nervioso"
                  hint="Cefalea, síncope, convulsiones, déficit transitorio, vértigo, confusión y obnubilación, vigilia/sueño, parálisis, marcha y equilibrio, sensibilidad."
                  value={sis.nervioso}
                  onChange={updSis("nervioso")}
                />
                <SystemRow
                  label="Sistema Sensorial"
                  hint="Visión, agudeza, borrosa, diplopía, fosgenos, dolor ocular, fotofobia, xeroftalmia, amaurosis, otalgia, otorrea, hipoacusia, tinitus, olfacción, epistaxis, secreción."
                  value={sis.sensorial}
                  onChange={updSis("sensorial")}
                />
                <SystemRow
                  label="Psicosomático"
                  hint="Personalidad, ansiedad, depresión, afectividad, emotividad, amnesia, voluntad, pensamiento, atención, ideación suicida, delirios."
                  value={sis.psicosomatico}
                  onChange={updSis("psicosomatico")}
                />
              </SectionCard>

              <SectionCard title="Diagnósticos Anteriores">
                <Field label="Diagnósticos previos">
                  <FTextarea
                    value={diagAnt}
                    onChange={(e) => setDiagAnt(e.target.value)}
                    placeholder="Listar diagnósticos anteriores..."
                    rows={2}
                  />
                </Field>
              </SectionCard>

              <SectionCard title="Terapéutica Empleada Anteriormente">
                <Field label="Tratamientos previos">
                  <FTextarea
                    value={terapeutica}
                    onChange={(e) => setTerapeutica(e.target.value)}
                    placeholder="Medicamentos y tratamientos previos..."
                    rows={2}
                  />
                </Field>
              </SectionCard>

              <SectionCard title="Signos Vitales">
                <Grid cols={5} gap={12}>
                  <Field label="1. FC (lpm)">
                    <FInput
                      type="number"
                      value={sv.fc}
                      onChange={updSv("fc")}
                      placeholder="—"
                    />
                  </Field>
                  <Field label="2. TA (mmHg)">
                    <FInput
                      value={sv.ta}
                      onChange={updSv("ta")}
                      placeholder="120/80"
                    />
                  </Field>
                  <Field label="3. FR (rpm)">
                    <FInput
                      type="number"
                      value={sv.fr}
                      onChange={updSv("fr")}
                      placeholder="—"
                    />
                  </Field>
                  <Field label="4. Peso Actual (kg)">
                    <FInput
                      type="number"
                      value={sv.peso}
                      onChange={updSv("peso")}
                      placeholder="—"
                    />
                  </Field>
                  <Field label="5. Temperatura (°C)">
                    <FInput
                      type="number"
                      value={sv.temp}
                      onChange={updSv("temp")}
                      placeholder="36.5"
                    />
                  </Field>
                </Grid>
              </SectionCard>

              <SectionCard title="Exploración Física">
                <Field label="Exploración general">
                  <FTextarea
                    value={expl.general}
                    onChange={updExpl("general")}
                    placeholder="Hallazgos generales..."
                    rows={2}
                  />
                </Field>
                <SectionLabel text="Exploración Regional" />
                <Grid cols={2} gap={12}>
                  <Field label="1. Cabeza">
                    <FInput
                      value={expl.cabeza}
                      onChange={updExpl("cabeza")}
                      placeholder="Hallazgos..."
                    />
                  </Field>
                  <Field label="2. Cuello">
                    <FInput
                      value={expl.cuello}
                      onChange={updExpl("cuello")}
                      placeholder="Hallazgos..."
                    />
                  </Field>
                  <Field label="3. Tórax">
                    <FInput
                      value={expl.torax}
                      onChange={updExpl("torax")}
                      placeholder="Hallazgos..."
                    />
                  </Field>
                  <Field label="4. Abdomen">
                    <FInput
                      value={expl.abdomen}
                      onChange={updExpl("abdomen")}
                      placeholder="Hallazgos..."
                    />
                  </Field>
                  <Field label="5. Miembros">
                    <FInput
                      value={expl.miembros}
                      onChange={updExpl("miembros")}
                      placeholder="Hallazgos..."
                    />
                  </Field>
                  <Field label="6. Genitales">
                    <FInput
                      value={expl.genitales}
                      onChange={updExpl("genitales")}
                      placeholder="Hallazgos..."
                    />
                  </Field>
                </Grid>
              </SectionCard>

              <SectionCard title="Conclusión Clínica">
                <Grid cols={1} gap={12}>
                  <Field label="Comentario">
                    <FTextarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Comentarios generales..."
                      rows={2}
                    />
                  </Field>
                  <Field label="Imp. Diagnóstica">
                    <FTextarea
                      value={impDx}
                      onChange={(e) => setImpDx(e.target.value)}
                      placeholder="Impresión diagnóstica..."
                      rows={2}
                    />
                  </Field>
                  <Field label="Pronóstico">
                    <FInput
                      value={pronostico}
                      onChange={(e) => setPronostico(e.target.value)}
                      placeholder="Pronóstico..."
                    />
                  </Field>
                  <Field label="Tratamiento">
                    <FTextarea
                      value={tratamiento}
                      onChange={(e) => setTratamiento(e.target.value)}
                      placeholder="Plan de tratamiento, medicamentos, dosis..."
                      rows={3}
                    />
                  </Field>
                  <Field label="Médico">
                    <FInput
                      value={medico}
                      onChange={(e) => setMedico(e.target.value)}
                      placeholder="Dra. / Dr. ..."
                    />
                  </Field>
                </Grid>
              </SectionCard>
            </>
          )}

          {/* Footer nav */}
          <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
            <button
              type="button"
              onClick={() => step > 1 && goTo(step - 1)}
              disabled={step === 1}
              className={cn(
                "rounded-md border px-5 py-2 text-sm font-semibold transition-colors",
                step === 1
                  ? "cursor-not-allowed border-border text-muted-foreground"
                  : "border-primary text-primary hover:bg-primary/10",
              )}
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => goTo(s.id)}
                  className={cn(
                    "h-1.5 cursor-pointer rounded-sm p-0 transition-all",
                    s.id === step ? "w-5.5 bg-primary" : "w-2",
                    s.id !== step &&
                      visited.has(s.id) &&
                      "bg-emerald-300 dark:bg-emerald-600",
                    s.id !== step && !visited.has(s.id) && "bg-border",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => (step < STEPS.length ? goTo(step + 1) : null)}
              className={cn(
                "rounded-md px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors",
                step === STEPS.length
                  ? "bg-emerald-700 hover:bg-emerald-600"
                  : "bg-primary hover:bg-primary/90",
              )}
            >
              {step === STEPS.length
                ? "✓ Guardar Historia Clínica"
                : "Siguiente →"}
            </button>
          </div>

          <p className="mt-3.5 text-center text-xs text-muted-foreground">
            H. Ayuntamiento de Tijuana · Dirección de Salud Pública · SICM v2.0
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
