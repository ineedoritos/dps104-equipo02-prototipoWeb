export type RolGrupo = 'responsable' | 'participante';

export type ModalidadAsistencia = 'manual' | 'qr';

export type EstadoJornada = 'en_curso' | 'programada' | 'finalizada' | 'cancelada';

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
  | 'ERR_CREDENCIALES';

export class ErrorDominio extends Error {
  codigo: CodigoErrorDominio;

  constructor(codigo: CodigoErrorDominio, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}
