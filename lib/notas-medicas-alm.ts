"use client";

export type ServicioAtencionALM =
  | "Urgencias"
  | "Consulta externa"
  | "Hospitalización"
  | "Seguimiento";

export type ClasificacionTriageALM =
  | "Rojo"
  | "Naranja"
  | "Amarillo"
  | "Verde"
  | "Azul";

export type EstadoNotaALM =
  | "abierta"
  | "pendiente de estudios"
  | "cerrada"
  | "referida";

export interface SignosVitalesALM {
  tensionArterial: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  temperatura: string;
  saturacion?: string;
  glucemia?: string;
}

export interface PacienteALM {
  id: string;
  nombre: string;
  curp: string;
  edad: number;
}

export interface MedicoALM {
  id: string;
  nombre: string;
  especialidad: string;
  rol: string;
}

export interface NotaMedicaALM {
  id: string;
  folio: string;
  fecha: string;
  servicio: ServicioAtencionALM;
  clasificacion: ClasificacionTriageALM;
  estado: EstadoNotaALM;
  pacienteId: string;
  pacienteNombre: string;
  pacienteCurp: string;
  medicoId: string;
  medicoNombre: string;
  motivoConsulta: string;
  impresionDiagnostica: string;
  planManejo: string;
  seguimiento?: string;
  notasEnfermeria?: string;
  proximaCita?: string;
  signosVitales: SignosVitalesALM;
}

export const pacientesAlm: PacienteALM[] = [
  {
    id: "alm-pac-001",
    nombre: "Ana Lucía Morales",
    curp: "MOLA900520MBCRRR08",
    edad: 34,
  },
  {
    id: "alm-pac-002",
    nombre: "José Ramón Aguilar",
    curp: "AURJ840101HDFNSN06",
    edad: 41,
  },
  {
    id: "alm-pac-003",
    nombre: "María Elena Sánchez",
    curp: "SAEM920711MBCNRR03",
    edad: 32,
  },
];

export const medicosAlm: MedicoALM[] = [
  {
    id: "alm-med-001",
    nombre: "Dra. Gabriela Torres",
    especialidad: "Medicina del trabajo",
    rol: "Responsable sanitario",
  },
  {
    id: "alm-med-002",
    nombre: "Dr. Ricardo Mejía",
    especialidad: "Medicina interna",
    rol: "Médico tratante",
  },
  {
    id: "alm-med-003",
    nombre: "Dra. Alejandra Pérez",
    especialidad: "Urgencias",
    rol: "Coordinación ALM",
  },
];

export const notasAlmSeed: NotaMedicaALM[] = [
  {
    id: "alm-note-001",
    folio: "ALM-2025-0001",
    fecha: "2025-01-08",
    servicio: "Urgencias",
    clasificacion: "Naranja",
    estado: "pendiente de estudios",
    pacienteId: "alm-pac-001",
    pacienteNombre: "Ana Lucía Morales",
    pacienteCurp: "MOLA900520MBCRRR08",
    medicoId: "alm-med-003",
    medicoNombre: "Dra. Alejandra Pérez",
    motivoConsulta: "Dolor abdominal súbito con náusea en turno nocturno.",
    impresionDiagnostica:
      "Probable gastroenteritis. Se descarta abdomen agudo.",
    planManejo:
      "Reposo relativo, hidratación oral, dieta astringente, solicitar BH y EGO, vigilancia en 24 hrs.",
    seguimiento: "Revisión telefónica y cita presencial en 48 hrs.",
    proximaCita: "2025-01-10",
    signosVitales: {
      tensionArterial: "118/76",
      frecuenciaCardiaca: "86",
      frecuenciaRespiratoria: "18",
      temperatura: "37.6",
      saturacion: "97%",
    },
  },
  {
    id: "alm-note-002",
    folio: "ALM-2025-0002",
    fecha: "2025-01-05",
    servicio: "Consulta externa",
    clasificacion: "Verde",
    estado: "abierta",
    pacienteId: "alm-pac-002",
    pacienteNombre: "José Ramón Aguilar",
    pacienteCurp: "AURJ840101HDFNSN06",
    medicoId: "alm-med-001",
    medicoNombre: "Dra. Gabriela Torres",
    motivoConsulta: "Control de hipertensión arterial y ajuste de tratamiento.",
    impresionDiagnostica: "Hipertensión controlada, sin datos de alarma.",
    planManejo:
      "Mantener losartán 50 mg cada 24 hrs, control de TA semanal, reforzar dieta baja en sodio.",
    seguimiento: "Enviar lecturas de TA por app cada semana.",
    proximaCita: "2025-02-05",
    signosVitales: {
      tensionArterial: "124/78",
      frecuenciaCardiaca: "72",
      frecuenciaRespiratoria: "16",
      temperatura: "36.5",
      saturacion: "99%",
    },
  },
  {
    id: "alm-note-003",
    folio: "ALM-2024-0120",
    fecha: "2024-12-20",
    servicio: "Seguimiento",
    clasificacion: "Azul",
    estado: "cerrada",
    pacienteId: "alm-pac-003",
    pacienteNombre: "María Elena Sánchez",
    pacienteCurp: "SAEM920711MBCNRR03",
    medicoId: "alm-med-002",
    medicoNombre: "Dr. Ricardo Mejía",
    motivoConsulta: "Seguimiento post quirúrgico. Paciente asintomática.",
    impresionDiagnostica: "Evolución satisfactoria, sin complicaciones.",
    planManejo:
      "Retirar puntos de sutura, reincorporación laboral progresiva, analgesia a demanda.",
    seguimiento: "Alta definitiva y control en 3 meses.",
    proximaCita: "2025-03-20",
    signosVitales: {
      tensionArterial: "112/70",
      frecuenciaCardiaca: "70",
      frecuenciaRespiratoria: "17",
      temperatura: "36.7",
      saturacion: "98%",
    },
  },
];

const STORAGE_KEY = "sics_notas_medicas_alm";

export const loadNotasAlm = (): NotaMedicaALM[] => {
  if (typeof window === "undefined") return notasAlmSeed;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return notasAlmSeed;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : notasAlmSeed;
  } catch (error) {
    console.error("No se pudieron leer las notas ALM del storage", error);
    return notasAlmSeed;
  }
};

export const persistNotasAlm = (notas: NotaMedicaALM[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
};

export const generateAlmFolio = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `ALM-${year}-${month}${day}-${Math.floor(Math.random() * 900 + 100)}`;
};
