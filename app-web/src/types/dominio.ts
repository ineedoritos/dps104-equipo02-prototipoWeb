export type RolGrupo = "responsable" | "participante";

export type ModalidadAsistencia = "manual" | "qr";

export type EstadoAsistencia = "presente" | "ausente" | "justificada";

export type EstadoValidacion = "aprobado" | "pendiente";

export type EstadoJornadaDerivado =
  | "programada"
  | "en_curso"
  | "finalizada"
  | "cancelada";

export interface Usuario {
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
  origen: ModalidadAsistencia;
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

export interface MotivoJustificadaItem {
  fecha: string;
  jornada_titulo: string;
  motivo: string;
}

export interface AjusteHorasItem {
  fecha: string;
  jornada_titulo: string;
  duracion_minutos: number;
  minutos_reconocidos: number;
  motivo_ajuste: string;
}

export interface FilaReporteGrupo {
  usuario_id: string;
  nombre: string;
  presentes: number;
  ausentes_sin_motivo: number;
  justificadas: number;
  ausencias_total: number;
  tasa_asistencia: number | null;
  minutos_registrados: number;
  minutos_reconocidos: number;
  motivos_justificadas: MotivoJustificadaItem[];
  ajustes_horas: AjusteHorasItem[];
  activo_en_grupo: boolean;
}
