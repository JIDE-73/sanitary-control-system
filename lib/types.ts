// Tipos base del sistema SICS

export type Genero = "masculino" | "femenino" | "lgbt+";

// Nuevo esquema de afiliados (backend)
export type GeneroBackend = "masculino" | "femenino" | "LGBTQ+";
export type EstadoCivil =
  | "SOLTERO"
  | "CASADO"
  | "DIVORCIADO"
  | "VIUDO"
  | "UNION_LIBRE";

export interface AffiliatePayload {
  curp: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: GeneroBackend;
  direccion: string;
  telefono: string;
  email?: string;
  lugar_procedencia: string;
  estado_civil: EstadoCivil;
  lugar_trabajo: string;
  fecha_inicio: string;
  fecha_inicio_tijuana: string;
  acta_nacimiento: boolean;
}

export type EstatusAfiliado =
  | "activo"
  | "inactivo"
  | "suspendido"
  | "pendiente";

export type ResultadoVDRL = "positivo" | "negativo" | "pendiente";

export type EstatusMedico = "activo" | "inactivo" | "suspendido";

export interface Afiliado {
  id: string;
  curp: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  genero: Genero;
  estatus: EstatusAfiliado;
  // Dirección y contacto
  calle: string;
  colonia: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  telefono: string;
  email?: string;
  // Información laboral
  lugarTrabajoId?: string;
  ocupacion?: string;
  // Lugar de procedencia
  lugarProcedencia?: string;
  // Fechas del sistema
  fechaRegistro: string;
  fechaActualizacion: string;
}

export interface Medico {
  id: string;
  cedulaProfesional: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  especialidad: string;
  telefono: string;
  email: string;
  estatus: EstatusMedico;
  // Datos personales opcionales para edición
  curp?: string;
  genero?: "masculino" | "femenino" | "LGBTQ+";
  fechaNacimiento?: string;
  direccion?: string;
  habilitado_para_firmar?: boolean;
  firmaDigitalUrl?: string;
  fechaRegistro: string;
}

// Payload esperado por /sics/doctors/createDoctor
export interface DoctorPayload {
  curp: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: "masculino" | "femenino" | "LGBTQ+";
  direccion: string;
  telefono: string;
  email?: string;
  cedula_profesional: string;
  especialidad: string;
  habilitado_para_firmar: boolean;
}

export interface LugarTrabajo {
  id: string;
  codigo: string; // A-00
  nombre: string;
  // Campos opcionales porque el endpoint sólo garantiza código y nombre
  zonaTrabajo?: string;
  calle?: string;
  colonia?: string;
  codigo_postal?: string;
  codigoPostal?: string;
  telefono?: string;
  ciudad?: string;
  estado?: string;
  estatus?: "activo" | "inactivo";
}

export interface ConsultaClinica {
  id: string;
  afiliadoId: string;
  medicoId: string;
  fecha: string;
  tensionArterial: string;
  diagnostico: string;
  tratamiento: string;
  comentarios?: string;
  examenes: ExamenClinico[];
}

export interface ExamenClinico {
  id: string;
  afiliadoId: string;
  consultaId?: string;
  tipoExamen: string; // papiloma, vih, vdrl, etc.
  fechaOrden: string;
  fechaResultado?: string;
  fechaProximoExamen?: string;
  resultadoVDRL?: ResultadoVDRL;
  dilucionVDRL?: string;
  resultado?: string;
  observaciones?: string;
  laboratorioId?: string;
}

export interface CertificadoSanitario {
  id: string;
  folio: string;
  afiliadoId: string;
  medicoId: string;
  fechaEmision: string;
  fechaVigencia: string;
  estatus: "vigente" | "vencido" | "cancelado";
  qrCode: string;
  pdfUrl?: string;
}

// Catálogos
export interface TipoExamen {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  frecuenciaRenovacionDias: number;
  obligatorio: boolean;
}

export interface Laboratorio {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  estatus: "activo" | "inactivo";
  examenesAutorizados: string[];
}

// Laboratorios (nuevo endpoint /sics/laboratories)
export interface LaboratorioPayload {
  nombre_comercial: string;
  rfc: string;
  certificado_organismo: boolean;
  email_contacto: string;
}

export interface LaboratorioListado {
  id: string;
  nombre_comercial: string;
  rfc: string;
  certificado_organismo: boolean;
  email_contacto: string;
}
