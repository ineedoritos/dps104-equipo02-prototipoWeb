import solicitudesJson from '@/data/solicitudesRevision.json';
import usuariosJson from '@/data/usuarios.json';
import { aISOConOffset } from '@/lib/fecha';
import {
  obtenerAsistenciasDeJornada,
  obtenerIntegrantesActivos,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
} from '@/lib/gruposStore';
import { crearNotificacion } from '@/lib/notificacionesStore';
import {
  ErrorDominio,
  type SolicitudRevision,
  type UsuarioCuenta,
} from '@/types/dominio';

let solicitudes: SolicitudRevision[] = (solicitudesJson as SolicitudRevision[]).map((s) => ({
  ...s,
}));
const usuarios = usuariosJson as UsuarioCuenta[];

function valoresRegistro(solicitud: SolicitudRevision): string {
  const registro = obtenerAsistenciasDeJornada(solicitud.jornada_id).find(
    (item) => item.participante_id === solicitud.participante_id,
  );
  return JSON.stringify(registro && [registro.estado, registro.motivo_ausencia,
    registro.hora_entrada, registro.hora_salida, registro.minutos_reconocidos]) ?? '';
}

const originales = new Map(solicitudes.map((s) => [s.id, valoresRegistro(s)]));

export function hayCorreccion(solicitud: SolicitudRevision): boolean {
  return originales.get(solicitud.id) !== valoresRegistro(solicitud);
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notificar(): void {
  listeners.forEach((listener) => listener());
}

export function suscribirRevisiones(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function obtenerNombreUsuarioSolicitud(usuarioId: string): string {
  return usuarios.find((u) => u.id === usuarioId)?.nombre ?? 'Integrante';
}

export function obtenerMiSolicitud(jornadaId: string): SolicitudRevision | undefined {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return undefined;
  }

  return solicitudes
    .filter((s) => s.jornada_id === jornadaId && s.participante_id === sesion.id)
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en))[0];
}

export function crearSolicitudRevision(jornadaId: string, motivo: string): SolicitudRevision {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'Debes iniciar sesión para solicitar una revisión.');
  }

  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  const rol = obtenerMiRolEnGrupo(jornada.grupo_id);
  if (rol !== 'participante') {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'Solo un participante activo de este grupo puede solicitar revisión.',
    );
  }

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No puedes solicitar revisión en una jornada cancelada.',
    );
  }

  const motivoLimpio = motivo.trim();
  if (!motivoLimpio) {
    throw new ErrorDominio('ERR_MOTIVO_OBLIGATORIO', 'Escribe qué hay que revisar.');
  }
  if (motivoLimpio.length < 10) {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Describe qué hay que revisar con al menos 10 caracteres.',
    );
  }
  if (motivoLimpio.length > 500) {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'El motivo no puede superar los 500 caracteres.',
    );
  }

  const yaPendiente = solicitudes.some(
    (s) =>
      s.jornada_id === jornadaId &&
      s.participante_id === sesion.id &&
      s.estado === 'pendiente',
  );
  if (yaPendiente) {
    throw new ErrorDominio(
      'ERR_SOLICITUD_PENDIENTE',
      'Ya tienes una solicitud pendiente para esta jornada.',
    );
  }

  const nueva: SolicitudRevision = {
    id: `sol-${Date.now()}-${solicitudes.length + 1}`,
    jornada_id: jornadaId,
    participante_id: sesion.id,
    motivo_solicitud: motivoLimpio,
    estado: 'pendiente',
    motivo_resolucion: null,
    resuelta_por: null,
    creado_en: aISOConOffset(),
    resuelta_en: null,
  };

  originales.set(nueva.id, valoresRegistro(nueva));
  solicitudes = [nueva, ...solicitudes];

  const responsables = obtenerIntegrantesActivos(jornada.grupo_id).filter(
    (i) => i.rol === 'responsable',
  );
  for (const r of responsables) {
    crearNotificacion({
      usuario_id: r.usuario_id,
      jornada_id: jornadaId,
      tipo_evento: 'solicitud_revision',
      clave_unica: `solicitud_revision:${nueva.id}:${r.usuario_id}`,
      titulo: 'Nueva solicitud de revisión',
      mensaje: `${sesion.nombre} pidió revisar su registro en ${jornada.titulo}.`,
    });
  }

  notificar();
  return nueva;
}

export function obtenerSolicitudesDeJornada(jornadaId: string): SolicitudRevision[] {
  return solicitudes
    .filter((s) => s.jornada_id === jornadaId)
    .sort((a, b) => {
      if (a.estado === 'pendiente' && b.estado !== 'pendiente') {
        return -1;
      }
      if (a.estado !== 'pendiente' && b.estado === 'pendiente') {
        return 1;
      }
      return b.creado_en.localeCompare(a.creado_en);
    });
}

export function contarPendientes(jornadaId: string): number {
  return solicitudes.filter(
    (s) => s.jornada_id === jornadaId && s.estado === 'pendiente',
  ).length;
}

export function resolverSolicitud(
  id: string,
  estado: 'resuelta' | 'rechazada',
  motivo: string,
): SolicitudRevision {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'Debes iniciar sesión para resolver solicitudes.');
  }

  const existente = solicitudes.find((s) => s.id === id);
  if (!existente) {
    throw new ErrorDominio('ERR_VALIDACION', 'No se encontró la solicitud de revisión.');
  }

  const jornada = obtenerJornadaPorId(existente.jornada_id);
  if (!jornada || obtenerMiRolEnGrupo(jornada.grupo_id) !== 'responsable') {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'Solo un responsable activo puede resolver solicitudes.',
    );
  }

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No puedes resolver solicitudes de una jornada cancelada.',
    );
  }

  if (existente.estado !== 'pendiente') {
    throw new ErrorDominio('ERR_VALIDACION', 'Esta solicitud ya fue atendida.');
  }

  const motivoLimpio = motivo.trim();
  if (!motivoLimpio) {
    throw new ErrorDominio('ERR_MOTIVO_OBLIGATORIO', 'Escribe el motivo de la resolución.');
  }
  if (motivoLimpio.length > 500) {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'El motivo de la resolución no puede superar los 500 caracteres.',
    );
  }

  if (estado === 'resuelta' && !hayCorreccion(existente)) {
    throw new ErrorDominio('ERR_VALIDACION', 'Corrige la asistencia o las horas antes de resolver la solicitud.');
  }

  const actualizada: SolicitudRevision = {
    ...existente,
    estado,
    motivo_resolucion: motivoLimpio,
    resuelta_por: sesion.id,
    resuelta_en: aISOConOffset(),
  };

  solicitudes = solicitudes.map((s) => (s.id === id ? actualizada : s));
  notificar();
  return actualizada;
}
