export type RolGrupo = 'responsable' | 'participante';

export type ModalidadAsistencia = 'manual' | 'qr';

export type EstadoJornada = 'en_curso' | 'programada' | 'finalizada' | 'cancelada';

export type EstadoAsistencia = 'presente' | 'ausente' | 'justificada';

export type OrigenAsistencia = 'manual' | 'qr';

export type EstadoValidacion = 'aprobado' | 'pendiente';

export interface UsuarioCuenta {
  id: string;
  nombre: string;
  correo: string;
  creado_en: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad_asistencia: ModalidadAsistencia;
  control_horas: boolean;
  gps_habilitado: boolean;
  fotos_habilitadas: boolean;
  requiere_validacion: boolean;
  notificaciones_habilitadas: boolean;
  creado_por: string;
  creado_en: string;
}

export interface IntegranteGrupo {
  id: string;
  grupo_id: string;
  usuario_id: string;
  rol: RolGrupo;
  unido_en: string;
  retirado_en: string | null;
}

export interface IntegranteConUsuario extends IntegranteGrupo {
  usuario: UsuarioCuenta;
}

export interface Jornada {
  id: string;
  grupo_id: string;
  titulo: string;
  descripcion: string;
  inicio_en: string;
  fin_en: string;
  cancelada: boolean;
  modalidad_asistencia: ModalidadAsistencia;
  control_horas: boolean;
  gps_habilitado: boolean;
  fotos_habilitadas: boolean;
  requiere_validacion: boolean;
  notificaciones_habilitadas: boolean;
  creado_por: string;
  creado_en: string;
}

export interface Asistencia {
  id: string;
  jornada_id: string;
  participante_id: string;
  estado: EstadoAsistencia;
  motivo_ausencia: string | null;
  origen: OrigenAsistencia;
  hora_entrada: string | null;
  hora_salida: string | null;
  duracion_minutos: number | null;
  minutos_reconocidos: number | null;
  motivo_ajuste: string | null;
  estado_validacion: EstadoValidacion;
  validado_por: string | null;
  actualizado_por: string;
  actualizado_en: string;
}

export interface CodigoQR {
  id: string;
  jornada_id: string;
  codigo_hash: string;
  expira_en: string;
  revocado_en: string | null;
  generado_por: string;
  creado_en: string;
}

export interface FilaReporteGrupo {
  participante: UsuarioCuenta;
  presentes: number;
  ausentesSinMotivo: number;
  justificadas: number;
  motivosJustificadas: string[];
  tasaAsistencia: number | null;
  minutosRegistrados: number;
  minutosReconocidos: number;
}

export interface ResumenReporteGrupo {
  totalPresentes: number;
  totalJustificadas: number;
  totalAusentesSinMotivo: number;
  filas: FilaReporteGrupo[];
}

export interface ResumenGrupoUsuario {
  grupo: Grupo;
  rol: RolGrupo;
  totalIntegrantes: number;
  tieneJornadaEnCurso: boolean;
  proximaJornadaTitulo: string | null;
}

export type CodigoErrorDominio =
  | 'ERR_USUARIO_NO_ENCONTRADO'
  | 'ERR_YA_ES_INTEGRANTE'
  | 'ERR_ULTIMO_RESPONSABLE'
  | 'ERR_NO_AUTORIZADO'
  | 'ERR_CORREO_DUPLICADO'
  | 'ERR_CREDENCIALES'
  | 'ERR_HORARIO_BLOQUEADO'
  | 'ERR_HORA_INVALIDA'
  | 'ERR_SOLAPAMIENTO_HORAS'
  | 'ERR_MOTIVO_OBLIGATORIO'
  | 'ERR_JORNADA_CANCELADA'
  | 'ERR_QR_INVALIDO'
  | 'ERR_VALIDACION';

export type TipoConfirmacionQR = 'presencia' | 'entrada' | 'salida' | 'ya_completa';

export interface ResultadoRegistroQR {
  tipo: TipoConfirmacionQR;
  horaTexto: string;
  duracionMinutos: number | null;
  asistencia: Asistencia;
}

export interface RegistroHistorial {
  asistencia: Asistencia;
  jornada: Jornada;
  grupo: Grupo;
  retiradoDelGrupo: boolean;
}

export interface ResumenMiHistorial {
  registros: RegistroHistorial[];
  presentes: number;
  justificadas: number;
  ausentes: number;
  tasaAsistencia: number | null;
  aplicaControlHoras: boolean;
  minutosRegistrados: number;
  minutosReconocidos: number;
  minutosPendientes: number;
}

export class ErrorDominio extends Error {
  codigo: CodigoErrorDominio;

  constructor(codigo: CodigoErrorDominio, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}
