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
  estatus: EstatusAfiliadoBackend;
  avatar?: File | string;
}

export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO";

export interface CitizenPayload {
  curp: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: GeneroBackend;
  email?: string;
  telefono: string;
  direccion: string;
  lugar_procedencia: string;
  ocupacion?: string;
  nivel_riesgo: NivelRiesgo;
}

export interface UserPayload {
  curp: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string;
  genero: GeneroBackend;
  direccion: string;
  telefono: string;
  email: string;
  nombre_usuario: string;
  password: string;
  activo: boolean;
  rol_id: string;
  ultimo_login?: string;
}

export interface UserRole {
  id: string;
  nombre: string;
}

export type EstatusAfiliado =
  | "activo"
  | "inactivo"
  | "suspendido"
  | "pendiente";

export type EstatusAfiliadoBackend =
  | "VIGENTE"
  | "PENDIENTE_RENOVACION"
  | "SUSPENSION_TEMPORAL"
  | "CANCELACION_TEMPORAL"
  | "CANCELACION_DEFINITIVA";

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
  direccion?: string;
  estadoCivil?: EstadoCivil;
  fechaInicio?: string;
  fechaInicioTijuana?: string;
  actaNacimiento?: boolean;
  avatar?: string;
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

export interface CertificatePerson {
  id?: string;
  curp?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  genero?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  foto?: string | null;
  created_at?: string;
}

export interface CertificateDoctor {
  persona_id?: string;
  cedula_profesional?: string;
  firma_digital_path?: string;
  especialidad?: string;
  habilitado_para_firmar?: boolean;
  persona?: CertificatePerson;
}

export interface AlcoholCertificate {
  id: string;
  folio?: string;
  fecha_expedicion?: string;
  persona_id?: string;
  medico_id?: string;
  cedula_perito?: number;
  nombre?: string;
  medico_nombre?: string;
  identifica_con?: string;
  edad?: number;
  genero?: string;
  nacionalidad?: string;
  residencia_nacional?: boolean;
  extranjera?: boolean;
  direccion?: string;
  estado_conciencia?: string;
  facies?: string;
  conjuntivas?: string;
  aliento?: string;
  nauseas?: boolean;
  signo_romberg?: string;
  hipo?: boolean;
  vomito?: string;
  prueba_tandem?: string;
  equilibrio_marcha?: string;
  trastabillea?: boolean;
  gira_sobre_eje?: boolean;
  equilibrio_vertical?: string;
  cae?: boolean;
  prueba_talon_rodilla?: boolean;
  levantar_objetos?: string;
  pupilas?: string;
  mano_derecha?: boolean;
  falla?: boolean;
  mano_izquierda?: boolean;
  falla1?: boolean;
  dedo_nariz_mano_derecha?: boolean;
  falla2?: boolean;
  dedo_nariz_mano_izquierda?: boolean;
  falla3?: boolean;
  normal?: boolean;
  disartria?: boolean;
  ininteligible?: boolean;
  verborrea?: boolean;
  signos_vitales?: number;
  frecuencia_respiratoria?: number;
  tension_arterial?: number;
  tension_arterial1?: number;
  temperatura?: string;
  determinacion_alcohol?: string;
  determinacion_alcohol1?: string;
  BAC?: boolean;
  BR_AC?: boolean;
  auto_test?: number | string;
  observacion?: string;
  estado_ebriedad?: boolean;
  cuadro_clinico?: string;
  el_cual?: string;
  estupefacientes?: boolean;
  estupefacientes_texto?: string;
  nombre_solicitante?: string;
  no_placa?: string;
  departamento?: string;
  dependencia?: string;
  no_boleta?: number;
  nombre_juez?: string;
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  placas?: string;
  nacionales_o_frontera?: string;
  extranjeras?: boolean;
  si?: boolean;
  no?: boolean;
  Persona?: CertificatePerson;
  Medico?: CertificateDoctor;
  [key: string]: any;
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

// Autenticación y permisos

export type PermissionAction = "create" | "read" | "update" | "delete";

export type ModulePermissionMap = {
  [module: string]: PermissionAction[];
};

export interface RolePermissions {
  modulos: ModulePermissionMap;
  sistema?: ModulePermissionMap;
}

export interface AuthUserPersona {
  Medico: any | null;
  nombre: string;
  apellido_materno: string;
  apellido_paterno: string;
  direccion: string;
  email: string;
}

export interface AuthUser {
  id: string;
  nombre_usuario: string;
  activo: boolean;
  rol: {
    id: string;
    nombre: string;
    permisos: RolePermissions;
  };
  persona: AuthUserPersona;
}
