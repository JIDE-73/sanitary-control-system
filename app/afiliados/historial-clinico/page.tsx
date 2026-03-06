"use client";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SelectOption = {
  id: string;
  nombre: string;
};

type CatalogResponse = {
  catalog?: SelectOption[];
};

type AfiliadoLookup = {
  persona_id: string;
  no_Afiliacion?: string;
  lugar_procedencia?: string;
  estado_civil?: string;
  persona?: {
    id?: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    fecha_nacimiento?: string;
    telefono?: string;
    direccion?: string;
  };
};

type HistoriaClinicaRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  fecha_elaboracion?: string;
  padecimiento_actual?: string | null;
  app_medicos?: string | null;
  app_alergicos?: string | null;
  imp_diagnostica?: string | null;
  pronostico?: string | null;
  tratamiento?: string | null;
  comentario?: string | null;
  sv_fc?: string | null;
  sv_ta?: string | null;
  sv_fr?: string | null;
  sv_peso?: string | null;
  sv_temperatura?: string | null;
  persona?: {
    id?: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    curp?: string;
    fecha_nacimiento?: string;
    telefono?: string;
    direccion?: string;
  };
  medico?: {
    especialidad?: string;
    cedula_profesional?: string;
  };
  estado_civil?: {
    nombre?: string;
  };
  religion?: {
    nombre?: string;
  };
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

const CATALOG_ENDPOINTS = {
  maritalStatus: "/sics/estado-civil/getAllMaritalStatusCatalog",
  religions: "/sics/religiones/getAllReligionCatalog",
  bloodGroups: "/sics/grupos-sanguineos/getAllbloodGroupCatalog",
  immunizations: "/sics/inmunizaciones/getAllInmmunizactionCatalog",
  childhoodIllnesses:
    "/sics/enfermedades-infancia/getAllChildhoodIllnessCatalog",
  constructionTypes: "/sics/tipos-construccion/getAllconstructionTypeCatalog",
  contraceptiveMethods:
    "/sics/metodos-anticonceptivos/getAllContraceptiveMethodCatalog",
} as const;

const normalizeText = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\s]+/g, "")
    .trim();

const findOptionIdByName = (catalog: SelectOption[], name?: string | null) => {
  const normalized = normalizeText(name);
  if (!normalized) return "";
  const match = catalog.find(
    (item) => normalizeText(item.nombre) === normalized,
  );
  return match?.id ?? "";
};

const toIsoDate = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toNullableNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseBooleanFromText = (value: string) => {
  const normalized = normalizeText(value);
  return ["si", "sí", "true", "1", "propia"].includes(normalized);
};

const extractRecordsArray = (response: unknown): HistoriaClinicaRecord[] => {
  if (!response || typeof response !== "object") {
    return [];
  }

  const record = response as Record<string, unknown>;
  if (Array.isArray(record.records)) {
    return record.records as HistoriaClinicaRecord[];
  }

  if (record.records && typeof record.records === "object") {
    const recordsObj = record.records as Record<string, unknown>;
    const numericKeys = Object.keys(recordsObj).filter((key) =>
      /^\d+$/.test(key),
    );
    if (numericKeys.length > 0) {
      return numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => recordsObj[key])
        .filter((item): item is HistoriaClinicaRecord =>
          Boolean(item && typeof item === "object"),
        );
    }
  }

  return [];
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatValue = (value?: string | null) => {
  const text = (value ?? "").toString().trim();
  return text || "No registrado";
};

const buildFullName = (record: HistoriaClinicaRecord) => {
  return (
    [
      record.persona?.nombre,
      record.persona?.apellido_paterno,
      record.persona?.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ") || "-"
  );
};

const toInputString = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
};

const extractAffiliateArray = (response: unknown): AfiliadoLookup[] => {
  if (Array.isArray(response)) {
    return response as AfiliadoLookup[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const record = response as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data as AfiliadoLookup[];
  }

  const numericKeys = Object.keys(record).filter((key) => /^\d+$/.test(key));
  if (numericKeys.length > 0) {
    return numericKeys
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => record[key])
      .filter((item): item is AfiliadoLookup =>
        Boolean(item && typeof item === "object"),
      );
  }

  if ("persona_id" in record) {
    return [record as AfiliadoLookup];
  }

  return [];
};

interface FInputProps {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
}

function FInput({
  value,
  onChange,
  type = "text",
  placeholder = "",
  readOnly = false,
  disabled = false,
  className,
}: FInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
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
  disabled?: boolean;
  className?: string;
}

function FSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  disabled = false,
  className,
}: FSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "h-10 w-full cursor-pointer rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-1 rounded-md border border-border/70 bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground">{formatValue(value)}</p>
    </div>
  );
}

export default function HistoriaClinica() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [flowStep, setFlowStep] = useState<1 | 2>(1);
  const [records, setRecords] = useState<HistoriaClinicaRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<HistoriaClinicaRecord | null>(null);
  const [editingRecord, setEditingRecord] =
    useState<HistoriaClinicaRecord | null>(null);

  const [step, setStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [saving, setSaving] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [searchingAfiliado, setSearchingAfiliado] = useState(false);

  const [affiliateQuery, setAffiliateQuery] = useState("");
  const [affiliateResults, setAffiliateResults] = useState<AfiliadoLookup[]>(
    [],
  );
  const [selectedAffiliateId, setSelectedAffiliateId] = useState("");

  const [maritalStatusCatalog, setMaritalStatusCatalog] = useState<
    SelectOption[]
  >([]);
  const [religionCatalog, setReligionCatalog] = useState<SelectOption[]>([]);
  const [bloodGroupCatalog, setBloodGroupCatalog] = useState<SelectOption[]>(
    [],
  );
  const [immunizationCatalog, setImmunizationCatalog] = useState<
    SelectOption[]
  >([]);
  const [childhoodIllnessCatalog, setChildhoodIllnessCatalog] = useState<
    SelectOption[]
  >([]);
  const [constructionTypeCatalog, setConstructionTypeCatalog] = useState<
    SelectOption[]
  >([]);
  const [contraceptiveMethodCatalog, setContraceptiveMethodCatalog] = useState<
    SelectOption[]
  >([]);

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

  const selectedAffiliate = affiliateResults.find(
    (item) => item.persona_id === selectedAffiliateId,
  );

  const medicoId = (() => {
    const medico = user?.persona?.Medico;
    if (!medico) return "";
    if (Array.isArray(medico)) {
      const first = medico[0] as { id?: string } | undefined;
      return first?.id ?? "";
    }
    if (typeof medico === "object" && medico !== null) {
      return String((medico as { id?: string }).id ?? "");
    }
    return "";
  })();

  const loadHistoriaRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await request(
        "/sics/record/getAllHistoriaClinica",
        "GET",
      );
      const parsed = extractRecordsArray(response);
      setRecords(parsed);
    } catch (error) {
      console.error("Error cargando expedientes clínicos", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el listado de historias clínicas.",
        variant: "destructive",
      });
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadHistoriaRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        const [
          maritalRes,
          religionRes,
          bloodRes,
          immunizationRes,
          childhoodRes,
          constructionRes,
          contraceptiveRes,
        ] = await Promise.all([
          request(CATALOG_ENDPOINTS.maritalStatus, "GET"),
          request(CATALOG_ENDPOINTS.religions, "GET"),
          request(CATALOG_ENDPOINTS.bloodGroups, "GET"),
          request(CATALOG_ENDPOINTS.immunizations, "GET"),
          request(CATALOG_ENDPOINTS.childhoodIllnesses, "GET"),
          request(CATALOG_ENDPOINTS.constructionTypes, "GET"),
          request(CATALOG_ENDPOINTS.contraceptiveMethods, "GET"),
        ]);

        setMaritalStatusCatalog((maritalRes as CatalogResponse).catalog ?? []);
        setReligionCatalog((religionRes as CatalogResponse).catalog ?? []);
        setBloodGroupCatalog((bloodRes as CatalogResponse).catalog ?? []);
        setImmunizationCatalog(
          (immunizationRes as CatalogResponse).catalog ?? [],
        );
        setChildhoodIllnessCatalog(
          (childhoodRes as CatalogResponse).catalog ?? [],
        );
        setConstructionTypeCatalog(
          (constructionRes as CatalogResponse).catalog ?? [],
        );
        setContraceptiveMethodCatalog(
          (contraceptiveRes as CatalogResponse).catalog ?? [],
        );
      } catch (error) {
        console.error("Error cargando catálogos de historia clínica", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar todos los catálogos del formulario.",
          variant: "destructive",
        });
      } finally {
        setLoadingCatalogs(false);
      }
    };

    loadCatalogs();
  }, [toast]);

  useEffect(() => {
    if (!selectedAffiliate) return;

    const nombreCompleto = [
      selectedAffiliate.persona?.nombre,
      selectedAffiliate.persona?.apellido_paterno,
      selectedAffiliate.persona?.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ");

    setNombre(nombreCompleto);
    setDomicilio(selectedAffiliate.persona?.direccion ?? "");
    setTelefono(selectedAffiliate.persona?.telefono ?? "");
    setFechaNac(
      selectedAffiliate.persona?.fecha_nacimiento?.slice(0, 10) ?? "",
    );
    setLugarNac(selectedAffiliate.lugar_procedencia ?? "");

    const maritalId = findOptionIdByName(
      maritalStatusCatalog,
      selectedAffiliate.estado_civil,
    );
    if (maritalId) {
      setEstadoCivil(maritalId);
    }
  }, [selectedAffiliate, maritalStatusCatalog]);

  const pct = Math.round((visited.size / STEPS.length) * 100);
  const goTo = (n: number) => {
    setVisited((v) => new Set([...v, n]));
    setStep(n);
  };

  const handleSearchAffiliate = async () => {
    const query = affiliateQuery.trim();
    if (!query) {
      toast({
        title: "Dato faltante",
        description: "Captura un dato para buscar afiliado.",
        variant: "destructive",
      });
      return;
    }

    setSearchingAfiliado(true);
    try {
      const response = await request(
        `/sics/affiliates/getAffiliateById/${query}`,
        "GET",
      );

      const afiliados = extractAffiliateArray(response).filter(
        (item): item is AfiliadoLookup => Boolean(item?.persona_id),
      );

      setAffiliateResults(afiliados);
      if (afiliados.length === 1) {
        setSelectedAffiliateId(afiliados[0].persona_id);
      } else {
        setSelectedAffiliateId("");
      }

      if (!afiliados.length) {
        toast({
          title: "Sin resultados",
          description: "No se encontró afiliado con ese criterio.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error buscando afiliado", error);
      toast({
        title: "Error",
        description: "No se pudo consultar el afiliado.",
        variant: "destructive",
      });
    } finally {
      setSearchingAfiliado(false);
    }
  };

  const handleSubmitHistoria = async () => {
    const recordData = (editingRecord ?? {}) as Record<string, unknown>;
    const targetPersonaId =
      toInputString(recordData.persona_id) ||
      selectedAffiliate?.persona_id ||
      "";

    if (!targetPersonaId) {
      toast({
        title: "Falta afiliado",
        description: "Debes buscar y seleccionar un afiliado antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    const targetMedicoId = toInputString(recordData.medico_id) || medicoId;

    if (!targetMedicoId) {
      toast({
        title: "Falta médico",
        description: "No se encontró el médico asociado al usuario actual.",
        variant: "destructive",
      });
      return;
    }

    if (!estadoCivil || !religion) {
      toast({
        title: "Campos requeridos",
        description: "Selecciona Estado civil y Religión para continuar.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      persona_id: targetPersonaId,
      medico_id: targetMedicoId,
      estado_civil_id: estadoCivil,
      religion_id: religion,
      fecha_elaboracion: toIsoDate(fechaElab) ?? new Date().toISOString(),
      ahf_neoplasticos: ahf.neoplasticos,
      ahf_diabetes: ahf.diabetes,
      ahf_inmunologicos: ahf.inmunologicos,
      ahf_hipertension: ahf.hipertension,
      ahf_neurologicos: ahf.neurologicos,
      ahf_farmaco_depend: ahf.farmacoDep,
      ahf_psiquiatricos: ahf.psiquiatricos,
      ahf_cardiologicos: ahf.cardiologicos,
      apnp_alimentacion: apnp.alimentacion,
      apnp_tipo_construccion_id: apnp.casaTipo || null,
      apnp_propia: parseBooleanFromText(apnp.propia),
      apnp_no_cuartos: toNullableNumber(apnp.cuartos),
      apnp_no_habitantes: toNullableNumber(apnp.habitantes),
      apnp_servicios: apnp.servicios,
      apnp_electricidad: apnp.electricidad,
      apnp_gas: apnp.gas,
      apnp_drenaje: apnp.drenaje,
      apnp_agua: apnp.agua,
      apnp_zoonosis: apnp.zoonosis,
      apnp_inmunizacion_id: apnp.inmunizaciones || null,
      apnp_tabaquismo: apnp.tabaquismo,
      apnp_alcoholismo: apnp.alcoholismo,
      apnp_adiccion_id: null,
      app_enfermedad_infancia_id: app.infancia || null,
      app_quirurgicos: app.quirurgicos,
      app_medicos: app.medicos,
      app_hospitalizaciones: app.hospitalizaciones,
      app_transfusionales: app.transfusionales,
      app_alergicos: app.alergicos,
      ago_menarca: ago.menarca,
      ago_ritmo: ago.ritmo,
      ago_tipo: ago.tipo,
      ago_telarca: ago.telarca,
      ago_pubarca: ago.pubarca,
      ago_ivsa: ago.ivsa,
      ago_no_parejas: toNullableNumber(ago.parejas),
      ago_gestas: toNullableNumber(ago.g),
      ago_partos: toNullableNumber(ago.p),
      ago_abortos: toNullableNumber(ago.a),
      ago_cesareas: toNullableNumber(ago.c),
      ago_hijos_vivos: toNullableNumber(ago.hijosVivos),
      ago_partos_pretermino: toNullableNumber(ago.partosPre),
      ago_macrosomias: toNullableNumber(ago.macrosomias),
      ago_embarazos_multiples: toNullableNumber(ago.embarMultiples),
      ago_fum: ago.fum || null,
      ago_fpp: ago.fpp || null,
      ago_lactorrea: ago.lactorrea,
      ago_dispareunia: ago.dispareunia,
      ago_metodo_anticonceptivo_id: ago.metodoAnticoncep || null,
      ago_muertes_perinatales: toNullableNumber(ago.muertesPerinatal),
      ago_ultimo_papanicolau: toIsoDate(ago.ultimoPap),
      ...(ago.grupoP ? { ago_grupo_sanguineo_paciente_id: ago.grupoP } : {}),
      ...(ago.grupoPar ? { ago_grupo_sanguineo_pareja_id: ago.grupoPar } : {}),
      padecimiento_actual: padActual,
      ias_digestivo: sis.digestivo,
      ias_cardiovascular: sis.cardiovascular,
      ias_respiratorio: sis.respiratorio,
      ias_urinario: sis.urinario,
      ias_genital: sis.genital,
      ias_hematologico: sis.hematologico,
      ias_endocrino: sis.endocrino,
      ias_osteomuscular: sis.osteomuscular,
      ias_nervioso: sis.nervioso,
      ias_sensorial: sis.sensorial,
      ias_psicosomatico: sis.psicosomatico,
      diagnosticos_anteriores: diagAnt,
      terapeutica_anterior: terapeutica,
      sv_fc: sv.fc,
      sv_ta: sv.ta,
      sv_fr: sv.fr,
      sv_peso: sv.peso,
      sv_temperatura: sv.temp,
      exploracion_general: expl.general,
      exploracion_cabeza: expl.cabeza,
      exploracion_cuello: expl.cuello,
      exploracion_torax: expl.torax,
      exploracion_abdomen: expl.abdomen,
      exploracion_miembros: expl.miembros,
      exploracion_genitales: expl.genitales,
      imp_diagnostica: impDx,
      pronostico,
      tratamiento,
      comentario,
    };

    setSaving(true);
    try {
      const endpoint = editingRecord
        ? "/sics/record/updateHistoriaClinica"
        : "/sics/record/createHistoriaClinica";
      const method = editingRecord ? "PUT" : "POST";

      const response = await request(endpoint, method, payload);

      if (response?.status >= 200 && response?.status < 300) {
        toast({
          title: editingRecord
            ? "Historia clínica actualizada"
            : "Historia clínica guardada",
          description: editingRecord
            ? "La información se actualizó correctamente."
            : "La información se guardó correctamente.",
        });
        await loadHistoriaRecords();
        setFlowStep(1);
        setStep(1);
        setEditingRecord(null);
      } else {
        toast({
          title: "No se pudo guardar",
          description:
            response?.message ??
            "El servidor no aceptó la información enviada.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear historia clínica", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la historia clínica.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openRecordDetail = (record: HistoriaClinicaRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const startEditRecord = (record: HistoriaClinicaRecord) => {
    const data = record as Record<string, unknown>;

    setEditingRecord(record);
    setDetailOpen(false);
    setFlowStep(2);
    setStep(1);
    setVisited(new Set([1]));

    setNombre(buildFullName(record));
    setDomicilio(record.persona?.direccion ?? "");
    setFechaNac(toDateInputValue(record.persona?.fecha_nacimiento));
    setLugarNac(toInputString(data.lugar_procedencia));
    setEstadoCivil(toInputString(data.estado_civil_id));
    setReligion(toInputString(data.religion_id));
    setTelefono(record.persona?.telefono ?? "");
    setFechaElab(toDateInputValue(record.fecha_elaboracion));

    setAhf({
      neoplasticos: toInputString(data.ahf_neoplasticos),
      diabetes: toInputString(data.ahf_diabetes),
      inmunologicos: toInputString(data.ahf_inmunologicos),
      hipertension: toInputString(data.ahf_hipertension),
      neurologicos: toInputString(data.ahf_neurologicos),
      farmacoDep: toInputString(data.ahf_farmaco_depend),
      psiquiatricos: toInputString(data.ahf_psiquiatricos),
      cardiologicos: toInputString(data.ahf_cardiologicos),
    });

    setApnp({
      alimentacion: toInputString(data.apnp_alimentacion),
      casaTipo: toInputString(data.apnp_tipo_construccion_id),
      propia: toInputString(data.apnp_propia),
      cuartos: toInputString(data.apnp_no_cuartos),
      habitantes: toInputString(data.apnp_no_habitantes),
      servicios: toInputString(data.apnp_servicios),
      electricidad: toInputString(data.apnp_electricidad),
      gas: toInputString(data.apnp_gas),
      drenaje: toInputString(data.apnp_drenaje),
      agua: toInputString(data.apnp_agua),
      zoonosis: toInputString(data.apnp_zoonosis),
      inmunizaciones: toInputString(data.apnp_inmunizacion_id),
      tabaquismo: toInputString(data.apnp_tabaquismo),
      alcoholismo: toInputString(data.apnp_alcoholismo),
      taxicomanias: toInputString(data.apnp_adiccion_id),
    });

    setApp({
      infancia: toInputString(data.app_enfermedad_infancia_id),
      quirurgicos: toInputString(data.app_quirurgicos),
      medicos: toInputString(data.app_medicos),
      hospitalizaciones: toInputString(data.app_hospitalizaciones),
      transfusionales: toInputString(data.app_transfusionales),
      alergicos: toInputString(data.app_alergicos),
    });

    setAgo({
      menarca: toInputString(data.ago_menarca),
      ritmo: toInputString(data.ago_ritmo),
      tipo: toInputString(data.ago_tipo),
      telarca: toInputString(data.ago_telarca),
      pubarca: toInputString(data.ago_pubarca),
      ivsa: toInputString(data.ago_ivsa),
      parejas: toInputString(data.ago_no_parejas),
      g: toInputString(data.ago_gestas),
      p: toInputString(data.ago_partos),
      a: toInputString(data.ago_abortos),
      c: toInputString(data.ago_cesareas),
      hijosVivos: toInputString(data.ago_hijos_vivos),
      partosPre: toInputString(data.ago_partos_pretermino),
      macrosomias: toInputString(data.ago_macrosomias),
      embarMultiples: toInputString(data.ago_embarazos_multiples),
      fum: toDateInputValue(toInputString(data.ago_fum)),
      fpp: toDateInputValue(toInputString(data.ago_fpp)),
      lactorrea: toInputString(data.ago_lactorrea),
      dispareunia: toInputString(data.ago_dispareunia),
      metodoAnticoncep: toInputString(data.ago_metodo_anticonceptivo_id),
      muertesPerinatal: toInputString(data.ago_muertes_perinatales),
      ultimoPap: toDateInputValue(toInputString(data.ago_ultimo_papanicolau)),
      grupoP: toInputString(data.ago_grupo_sanguineo_paciente_id),
      grupoPar: toInputString(data.ago_grupo_sanguineo_pareja_id),
    });

    setPadActual(toInputString(data.padecimiento_actual));
    setSis({
      digestivo: toInputString(data.ias_digestivo),
      cardiovascular: toInputString(data.ias_cardiovascular),
      respiratorio: toInputString(data.ias_respiratorio),
      urinario: toInputString(data.ias_urinario),
      genital: toInputString(data.ias_genital),
      hematologico: toInputString(data.ias_hematologico),
      endocrino: toInputString(data.ias_endocrino),
      osteomuscular: toInputString(data.ias_osteomuscular),
      nervioso: toInputString(data.ias_nervioso),
      sensorial: toInputString(data.ias_sensorial),
      psicosomatico: toInputString(data.ias_psicosomatico),
    });

    setDiagAnt(toInputString(data.diagnosticos_anteriores));
    setTerapeutica(toInputString(data.terapeutica_anterior));
    setSv({
      fc: toInputString(data.sv_fc),
      ta: toInputString(data.sv_ta),
      fr: toInputString(data.sv_fr),
      peso: toInputString(data.sv_peso),
      temp: toInputString(data.sv_temperatura),
    });
    setExpl({
      general: toInputString(data.exploracion_general),
      cabeza: toInputString(data.exploracion_cabeza),
      cuello: toInputString(data.exploracion_cuello),
      torax: toInputString(data.exploracion_torax),
      abdomen: toInputString(data.exploracion_abdomen),
      miembros: toInputString(data.exploracion_miembros),
      genitales: toInputString(data.exploracion_genitales),
    });
    setImpDx(toInputString(data.imp_diagnostica));
    setPronostico(toInputString(data.pronostico));
    setTratamiento(toInputString(data.tratamiento));
    setComentario(toInputString(data.comentario));
  };

  if (flowStep === 1) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Historias Clínicas
              </h1>
              <p className="text-muted-foreground">
                Listado de expedientes clínicos registrados
                {records.length ? ` (${records.length})` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setFlowStep(2);
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Nueva Historia Clínica
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Afiliado</th>
                    <th className="px-4 py-3">CURP</th>
                    <th className="px-4 py-3">Estado Civil</th>
                    <th className="px-4 py-3">Religión</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRecords ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-muted-foreground"
                        colSpan={6}
                      >
                        Cargando expedientes...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-muted-foreground"
                        colSpan={6}
                      >
                        No hay historias clínicas registradas.
                      </td>
                    </tr>
                  ) : (
                    records.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          {formatDateTime(
                            item.fecha_elaboracion ?? item.createdAt,
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {buildFullName(item)}
                        </td>
                        <td className="px-4 py-3">
                          {item.persona?.curp ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.estado_civil?.nombre ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {item.religion?.nombre ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openRecordDetail(item)}
                              className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              Ver detalle
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditRecord(item)}
                              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Detalle de Historia Clínica</DialogTitle>
              </DialogHeader>

              {selectedRecord && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-lg font-semibold text-foreground">
                      {buildFullName(selectedRecord)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CURP: {selectedRecord.persona?.curp ?? "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fecha elaboración:{" "}
                      {formatDateTime(selectedRecord.fecha_elaboracion)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DetailItem
                      label="Estado civil"
                      value={selectedRecord.estado_civil?.nombre}
                    />
                    <DetailItem
                      label="Religión"
                      value={selectedRecord.religion?.nombre}
                    />
                    <DetailItem
                      label="Fecha de nacimiento"
                      value={formatDateTime(
                        selectedRecord.persona?.fecha_nacimiento,
                      )}
                    />
                    <DetailItem
                      label="Teléfono"
                      value={selectedRecord.persona?.telefono}
                    />
                    <DetailItem
                      label="Dirección"
                      value={selectedRecord.persona?.direccion}
                    />
                    <DetailItem
                      label="Especialidad médico"
                      value={selectedRecord.medico?.especialidad}
                    />
                    <DetailItem
                      label="Cédula profesional"
                      value={selectedRecord.medico?.cedula_profesional}
                    />
                    <DetailItem
                      label="Padecimiento actual"
                      value={selectedRecord.padecimiento_actual}
                    />
                    <DetailItem
                      label="Antecedentes médicos"
                      value={selectedRecord.app_medicos}
                    />
                    <DetailItem
                      label="Alergias"
                      value={selectedRecord.app_alergicos}
                    />
                    <DetailItem
                      label="Impresión diagnóstica"
                      value={selectedRecord.imp_diagnostica}
                    />
                    <DetailItem
                      label="Pronóstico"
                      value={selectedRecord.pronostico}
                    />
                    <DetailItem
                      label="Tratamiento"
                      value={selectedRecord.tratamiento}
                    />
                    <DetailItem
                      label="Comentario"
                      value={selectedRecord.comentario}
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">
                      Signos vitales
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      <DetailItem label="FC" value={selectedRecord.sv_fc} />
                      <DetailItem label="TA" value={selectedRecord.sv_ta} />
                      <DetailItem label="FR" value={selectedRecord.sv_fr} />
                      <DetailItem label="Peso" value={selectedRecord.sv_peso} />
                      <DetailItem
                        label="Temperatura"
                        value={selectedRecord.sv_temperatura}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>Creado: {formatDateTime(selectedRecord.createdAt)}</p>
                    <p>
                      Actualizado: {formatDateTime(selectedRecord.updatedAt)}
                    </p>
                    <button
                      type="button"
                      onClick={() => startEditRecord(selectedRecord)}
                      className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Editar este expediente
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="rounded-xl bg-muted/35 p-2.5">
        <div className="mx-auto w-full max-w-7xl px-3 py-3 md:px-4">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setFlowStep(1)}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              ← Volver al listado
            </button>
            {editingRecord && (
              <span className="ml-3 inline-flex rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Modo edicion activo
              </span>
            )}
          </div>

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
              <SectionCard title="Vincular Afiliado" badge="Requerido">
                <Grid cols={2} gap={12}>
                  <Field
                    label="Búsqueda de Afiliado"
                    hint="Usa número de afiliación, CURP o nombre para consultar."
                    span={2}
                  >
                    <div className="flex flex-col gap-2 md:flex-row">
                      <FInput
                        value={affiliateQuery}
                        onChange={(e) => setAffiliateQuery(e.target.value)}
                        placeholder="Ej. 26090002 o JIDL000712ZZZZZZZZ"
                      />
                      <button
                        type="button"
                        onClick={handleSearchAffiliate}
                        disabled={searchingAfiliado}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {searchingAfiliado ? "Buscando..." : "Buscar"}
                      </button>
                    </div>
                  </Field>

                  {!!affiliateResults.length && (
                    <Field label="Resultado de Afiliado" span={2}>
                      <FSelect
                        value={selectedAffiliateId}
                        onChange={(e) => setSelectedAffiliateId(e.target.value)}
                        options={affiliateResults.map((item) => ({
                          id: item.persona_id,
                          nombre: `${item.no_Afiliacion ?? "SIN-NUM"} - ${[
                            item.persona?.nombre,
                            item.persona?.apellido_paterno,
                            item.persona?.apellido_materno,
                          ]
                            .filter(Boolean)
                            .join(" ")}`,
                        }))}
                        placeholder="Selecciona un afiliado"
                      />
                    </Field>
                  )}
                </Grid>
              </SectionCard>

              <SectionCard title="Datos Personales">
                <Grid cols={1} gap={12}>
                  <Field label="Nombre">
                    <FInput
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre completo"
                      readOnly={Boolean(selectedAffiliate)}
                      className={selectedAffiliate ? "bg-muted/50" : undefined}
                    />
                  </Field>
                  <Field label="Domicilio">
                    <FInput
                      value={domicilio}
                      onChange={(e) => setDomicilio(e.target.value)}
                      placeholder="Calle, número, colonia, ciudad"
                      readOnly={Boolean(selectedAffiliate)}
                      className={selectedAffiliate ? "bg-muted/50" : undefined}
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
                      readOnly={Boolean(selectedAffiliate)}
                      className={selectedAffiliate ? "bg-muted/50" : undefined}
                    />
                  </Field>
                  <Field label="Lugar de Nacimiento">
                    <FInput
                      value={lugarNac}
                      onChange={(e) => setLugarNac(e.target.value)}
                      placeholder="Ciudad, Estado"
                      readOnly={Boolean(selectedAffiliate)}
                      className={selectedAffiliate ? "bg-muted/50" : undefined}
                    />
                  </Field>
                  <Field label="Estado Civil">
                    <FSelect
                      value={estadoCivil}
                      onChange={(e) => setEstadoCivil(e.target.value)}
                      options={maritalStatusCatalog}
                      disabled={loadingCatalogs || Boolean(selectedAffiliate)}
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
                      options={religionCatalog}
                      disabled={loadingCatalogs}
                    />
                  </Field>
                  <Field label="Teléfono">
                    <FInput
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="664-000-0000"
                      readOnly={Boolean(selectedAffiliate)}
                      className={selectedAffiliate ? "bg-muted/50" : undefined}
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
                  <FSelect
                    value={apnp.casaTipo}
                    onChange={updApnp("casaTipo")}
                    options={constructionTypeCatalog}
                    placeholder="Seleccionar tipo de construcción"
                    disabled={loadingCatalogs}
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
                  <FSelect
                    value={apnp.inmunizaciones}
                    onChange={updApnp("inmunizaciones")}
                    options={immunizationCatalog}
                    placeholder="Seleccionar inmunización"
                    disabled={loadingCatalogs}
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
                  <FSelect
                    value={app.infancia}
                    onChange={updApp("infancia")}
                    options={childhoodIllnessCatalog}
                    placeholder="Seleccionar enfermedad"
                    disabled={loadingCatalogs}
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
                    options={contraceptiveMethodCatalog}
                    disabled={loadingCatalogs}
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
                  <FSelect
                    value={ago.grupoP}
                    onChange={updAgo("grupoP")}
                    options={bloodGroupCatalog}
                    placeholder="Seleccionar grupo sanguíneo"
                    disabled={loadingCatalogs}
                  />
                </Field>
                <Field label="Gpo ABO/Rh (pareja)">
                  <FSelect
                    value={ago.grupoPar}
                    onChange={updAgo("grupoPar")}
                    options={bloodGroupCatalog}
                    placeholder="Seleccionar grupo sanguíneo"
                    disabled={loadingCatalogs}
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
              onClick={() =>
                step < STEPS.length ? goTo(step + 1) : handleSubmitHistoria()
              }
              disabled={saving}
              className={cn(
                "rounded-md px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                step === STEPS.length
                  ? "bg-emerald-700 hover:bg-emerald-600"
                  : "bg-primary hover:bg-primary/90",
              )}
            >
              {step === STEPS.length
                ? saving
                  ? "Guardando..."
                  : "✓ Guardar Historia Clínica"
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
