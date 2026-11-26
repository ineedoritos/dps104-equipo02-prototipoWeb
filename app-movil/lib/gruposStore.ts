import dayjs from 'dayjs';

import asistenciasJson from '@/data/asistenciasGrupo.json';
import gruposJson from '@/data/grupos.json';
import integrantesJson from '@/data/integrantes.json';
import jornadasJson from '@/data/jornadas.json';
import usuariosJson from '@/data/usuarios.json';
import { aISOConOffset, fechaEnZona, fechaHoraEnZona, horaEnZona } from '@/lib/fecha';
import {
  ErrorDominio,
  type Asistencia,
  type CodigoQR,
  type EstadoAsistencia,
  type EstadoJornada,
  type FilaReporteGrupo,
  type Grupo,
  type IntegranteConUsuario,
  type IntegranteGrupo,
  type Jornada,
  type ModalidadAsistencia,
  type RegistroHistorial,
  type ResultadoRegistroQR,
  type ResumenGrupoUsuario,
  type ResumenMiHistorial,
  type ResumenReporteGrupo,
  type RolGrupo,
  type UsuarioCuenta,
} from '@/types/dominio';

let usuarios: UsuarioCuenta[] = (usuariosJson as UsuarioCuenta[]).map((u) => ({ ...u }));
let grupos: Grupo[] = (gruposJson as Grupo[]).map((g) => ({ ...g }));
let integrantes: IntegranteGrupo[] = (integrantesJson as IntegranteGrupo[]).map((i) => ({ ...i }));
let jornadas: Jornada[] = (jornadasJson as Jornada[]).map((j) => ({ ...j }));
let asistencias: Asistencia[] = (asistenciasJson as Asistencia[]).map((a) => ({ ...a }));
let codigosQR: CodigoQR[] = [];

let sesionActual: UsuarioCuenta | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notificar(): void {
  listeners.forEach((listener) => listener());
}

export function suscribirStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function obtenerSesionActual(): UsuarioCuenta | null {
  return sesionActual;
}

export function iniciarSesion(correo: string, contrasena: string): UsuarioCuenta {
  const correoNormalizado = correo.trim().toLowerCase();
  if (contrasena.length < 6) {
    throw new ErrorDominio('ERR_CREDENCIALES', 'La contraseña debe tener al menos 6 caracteres.');
  }

  const encontrado = usuarios.find((u) => u.correo.toLowerCase() === correoNormalizado);
  if (!encontrado) {
    throw new ErrorDominio(
      'ERR_CREDENCIALES',
      'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
    );
  }

  sesionActual = encontrado;
  notificar();
  return encontrado;
}

export function crearCuenta(nombre: string, correo: string, contrasena: string): UsuarioCuenta {
  const nombreLimpio = nombre.trim();
  const correoNormalizado = correo.trim().toLowerCase();

  if (!nombreLimpio) {
    throw new ErrorDominio('ERR_CREDENCIALES', 'Ingresa tu nombre completo.');
  }
  if (contrasena.length < 6) {
    throw new ErrorDominio('ERR_CREDENCIALES', 'La contraseña debe tener al menos 6 caracteres.');
  }

  const yaExiste = usuarios.some((u) => u.correo.toLowerCase() === correoNormalizado);
  if (yaExiste) {
    throw new ErrorDominio('ERR_CORREO_DUPLICADO', 'Ya existe una cuenta registrada con ese correo.');
  }

  const nuevoUsuario: UsuarioCuenta = {
    id: `usr-${String(usuarios.length + 1).padStart(2, '0')}`,
    nombre: nombreLimpio,
    correo: correoNormalizado,
    creado_en: dayjs().toISOString(),
  };

  usuarios = [...usuarios, nuevoUsuario];
  sesionActual = nuevoUsuario;
  notificar();
  return nuevoUsuario;
}

export function cerrarSesion(): void {
  sesionActual = null;
  notificar();
}

export function derivarEstadoJornada(jornada: Jornada, ahora = dayjs()): EstadoJornada {
  if (jornada.cancelada) {
    return 'cancelada';
  }
  const inicio = dayjs(jornada.inicio_en);
  const fin = dayjs(jornada.fin_en);
  if (ahora.isBefore(inicio)) {
    return 'programada';
  }
  if (ahora.isAfter(fin)) {
    return 'finalizada';
  }
  return 'en_curso';
}

export function obtenerMisGrupos(): ResumenGrupoUsuario[] {
  if (!sesionActual) {
    return [];
  }

  const membresiasActivas = integrantes.filter(
    (i) => i.usuario_id === sesionActual?.id && i.retirado_en === null,
  );

  const resumenes: (ResumenGrupoUsuario | null)[] = membresiasActivas.map((membresia) => {
    const grupo = grupos.find((g) => g.id === membresia.grupo_id);
    if (!grupo) {
      return null;
    }
    const totalIntegrantes = integrantes.filter(
      (i) => i.grupo_id === grupo.id && i.retirado_en === null,
    ).length;
    const jornadasGrupo = jornadas.filter((j) => j.grupo_id === grupo.id);
    const enCurso = jornadasGrupo.find((j) => derivarEstadoJornada(j) === 'en_curso');
    const proxima = jornadasGrupo
      .filter((j) => derivarEstadoJornada(j) === 'programada')
      .sort((a, b) => a.inicio_en.localeCompare(b.inicio_en))[0];

    return {
      grupo,
      rol: membresia.rol,
      totalIntegrantes,
      tieneJornadaEnCurso: Boolean(enCurso),
      proximaJornadaTitulo: enCurso?.titulo ?? proxima?.titulo ?? null,
    };
  });

  return resumenes.filter((item): item is ResumenGrupoUsuario => item !== null);
}

export function obtenerGrupoPorId(grupoId: string): Grupo | undefined {
  return grupos.find((g) => g.id === grupoId);
}

export function obtenerMiRolEnGrupo(grupoId: string): RolGrupo | null {
  if (!sesionActual) {
    return null;
  }
  const membresia = integrantes.find(
    (i) => i.grupo_id === grupoId && i.usuario_id === sesionActual?.id && i.retirado_en === null,
  );
  return membresia?.rol ?? null;
}

export function crearGrupo(datos: { nombre: string; descripcion?: string }): Grupo {
  if (!sesionActual) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'Debes iniciar sesión para crear un grupo.');
  }

  const nombreLimpio = datos.nombre.trim();
  const descripcionLimpia = datos.descripcion?.trim() ?? '';
  const ahora = dayjs().toISOString();

  const nuevoGrupo: Grupo = {
    id: `grp-${String(grupos.length + 1).padStart(2, '0')}`,
    nombre: nombreLimpio,
    descripcion: descripcionLimpia ? descripcionLimpia : null,
    modalidad_asistencia: 'manual',
    control_horas: false,
    gps_habilitado: false,
    fotos_habilitadas: false,
    requiere_validacion: false,
    notificaciones_habilitadas: false,
    creado_por: sesionActual.id,
    creado_en: ahora,
  };

  const nuevaMembresia: IntegranteGrupo = {
    id: `int-${String(integrantes.length + 1).padStart(2, '0')}`,
    grupo_id: nuevoGrupo.id,
    usuario_id: sesionActual.id,
    rol: 'responsable',
    unido_en: ahora,
    retirado_en: null,
  };

  grupos = [nuevoGrupo, ...grupos];
  integrantes = [...integrantes, nuevaMembresia];
  notificar();
  return nuevoGrupo;
}

function exigirResponsable(grupoId: string): UsuarioCuenta {
  if (!sesionActual || obtenerMiRolEnGrupo(grupoId) !== 'responsable') {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'Solo un responsable activo puede realizar esta acción.',
    );
  }
  return sesionActual;
}

export function actualizarConfiguracionGrupo(
  grupoId: string,
  config: {
    modalidad_asistencia: ModalidadAsistencia;
    control_horas: boolean;
    gps_habilitado: boolean;
  },
): Grupo {
  exigirResponsable(grupoId);

  const gpsFinal = config.modalidad_asistencia === 'qr' ? config.gps_habilitado : false;
  let actualizado: Grupo | undefined;

  grupos = grupos.map((g) => {
    if (g.id !== grupoId) {
      return g;
    }
    actualizado = {
      ...g,
      modalidad_asistencia: config.modalidad_asistencia,
      control_horas: config.control_horas,
      gps_habilitado: gpsFinal,
    };
    return actualizado;
  });

  if (!actualizado) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró el grupo solicitado.');
  }

  notificar();
  return actualizado;
}

export function obtenerIntegrantesActivos(grupoId: string): IntegranteConUsuario[] {
  return integrantes
    .filter((i) => i.grupo_id === grupoId && i.retirado_en === null)
    .map((i) => {
      const usuario = usuarios.find((u) => u.id === i.usuario_id);
      if (!usuario) {
        return null;
      }
      return { ...i, usuario };
    })
    .filter((item): item is IntegranteConUsuario => item !== null)
    .sort((a, b) => {
      if (a.rol !== b.rol) {
        return a.rol === 'responsable' ? -1 : 1;
      }
      return a.usuario.nombre.localeCompare(b.usuario.nombre);
    });
}

export function agregarIntegrantePorCorreo(
  grupoId: string,
  correo: string,
  rol: RolGrupo,
): IntegranteConUsuario {
  exigirResponsable(grupoId);

  const correoNormalizado = correo.trim().toLowerCase();
  const usuario = usuarios.find((u) => u.correo.toLowerCase() === correoNormalizado);

  if (!usuario) {
    throw new ErrorDominio(
      'ERR_USUARIO_NO_ENCONTRADO',
      'No existe una cuenta registrada con ese correo.',
    );
  }

  const yaActivo = integrantes.some(
    (i) => i.grupo_id === grupoId && i.usuario_id === usuario.id && i.retirado_en === null,
  );

  if (yaActivo) {
    throw new ErrorDominio('ERR_YA_ES_INTEGRANTE', 'Esta persona ya pertenece al grupo.');
  }

  const nuevo: IntegranteGrupo = {
    id: `int-${String(integrantes.length + 1).padStart(2, '0')}`,
    grupo_id: grupoId,
    usuario_id: usuario.id,
    rol,
    unido_en: dayjs().toISOString(),
    retirado_en: null,
  };

  integrantes = [...integrantes, nuevo];
  notificar();
  return { ...nuevo, usuario };
}

function contarResponsablesActivos(grupoId: string): number {
  return integrantes.filter(
    (i) => i.grupo_id === grupoId && i.retirado_en === null && i.rol === 'responsable',
  ).length;
}

export function cambiarRolIntegrante(
  grupoId: string,
  integranteId: string,
  nuevoRol: RolGrupo,
): void {
  const actual = exigirResponsable(grupoId);

  const objetivo = integrantes.find(
    (i) => i.id === integranteId && i.grupo_id === grupoId && i.retirado_en === null,
  );

  if (!objetivo || objetivo.rol === nuevoRol) {
    return;
  }

  if (objetivo.usuario_id === actual.id) {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'No puedes cambiar tu propio rol en el grupo.',
    );
  }

  if (objetivo.rol === 'responsable' && nuevoRol === 'participante') {
    if (contarResponsablesActivos(grupoId) <= 1) {
      throw new ErrorDominio(
        'ERR_ULTIMO_RESPONSABLE',
        'Debe quedar al menos un responsable en el grupo.',
      );
    }
  }

  integrantes = integrantes.map((i) => (i.id === integranteId ? { ...i, rol: nuevoRol } : i));
  notificar();
}

export function retirarIntegrante(grupoId: string, integranteId: string): void {
  const actual = exigirResponsable(grupoId);

  const objetivo = integrantes.find(
    (i) => i.id === integranteId && i.grupo_id === grupoId && i.retirado_en === null,
  );

  if (!objetivo) {
    return;
  }

  if (objetivo.rol === 'responsable' && contarResponsablesActivos(grupoId) <= 1) {
    throw new ErrorDominio(
      'ERR_ULTIMO_RESPONSABLE',
      'Debe quedar al menos un responsable en el grupo.',
    );
  }

  const ahora = dayjs().toISOString();
  integrantes = integrantes.map((i) =>
    i.id === integranteId ? { ...i, retirado_en: ahora } : i,
  );

  // Si se retiró a sí mismo, no rompe la lista: la UI detecta pérdida de rol.
  void actual;
  notificar();
}

export function transferirResponsableYSalir(grupoId: string, sucesorIntegranteId: string): void {
  const actual = exigirResponsable(grupoId);

  const sucesor = integrantes.find(
    (i) => i.id === sucesorIntegranteId && i.grupo_id === grupoId && i.retirado_en === null,
  );
  if (!sucesor || sucesor.usuario_id === actual.id) {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Selecciona a otro integrante activo del grupo como nuevo responsable.',
    );
  }

  const ahora = dayjs().toISOString();
  integrantes = integrantes.map((i) => {
    if (i.id === sucesorIntegranteId) {
      return { ...i, rol: 'responsable' };
    }
    if (i.grupo_id === grupoId && i.usuario_id === actual.id && i.retirado_en === null) {
      return { ...i, retirado_en: ahora };
    }
    return i;
  });

  notificar();
}

export function obtenerJornadasDeGrupo(grupoId: string): Jornada[] {
  return jornadas
    .filter((j) => j.grupo_id === grupoId)
    .sort((a, b) => a.inicio_en.localeCompare(b.inicio_en));
}

export function agruparJornadas(lista: Jornada[]): {
  hoy: Jornada[];
  proximas: Jornada[];
  anteriores: Jornada[];
} {
  const hoyFecha = fechaEnZona();
  const hoy: Jornada[] = [];
  const proximas: Jornada[] = [];
  const anteriores: Jornada[] = [];

  for (const jornada of lista) {
    const fechaJornada = fechaEnZona(jornada.inicio_en);
    if (jornada.cancelada || fechaJornada < hoyFecha) {
      anteriores.push(jornada);
    } else if (fechaJornada === hoyFecha) {
      hoy.push(jornada);
    } else {
      proximas.push(jornada);
    }
  }

  return { hoy, proximas, anteriores };
}

export function obtenerJornadaPorId(jornadaId: string): Jornada | undefined {
  return jornadas.find((j) => j.id === jornadaId);
}

export function jornadaTieneRegistros(jornadaId: string): boolean {
  return asistencias.some((a) => a.jornada_id === jornadaId);
}

function validarRangoHorarioJornada(fecha: string, horaInicio: string, horaFin: string): {
  inicioISO: string;
  finISO: string;
} {
  let inicio: Date;
  let fin: Date;

  try {
    inicio = fechaHoraEnZona(fecha, horaInicio);
    fin = fechaHoraEnZona(fecha, horaFin);
  } catch {
    throw new ErrorDominio(
      'ERR_HORA_INVALIDA',
      'Ingresa una fecha (AAAA-MM-DD) y horas válidas (HH:mm).',
    );
  }

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new ErrorDominio(
      'ERR_HORA_INVALIDA',
      'La fecha o las horas ingresadas no tienen un formato válido.',
    );
  }

  if (fechaEnZona(inicio) !== fechaEnZona(fin)) {
    throw new ErrorDominio(
      'ERR_HORA_INVALIDA',
      'La jornada debe iniciar y finalizar el mismo día calendario.',
    );
  }

  if (fin.getTime() <= inicio.getTime()) {
    throw new ErrorDominio(
      'ERR_HORA_INVALIDA',
      'La hora de fin debe ser posterior a la hora de inicio.',
    );
  }

  return {
    inicioISO: aISOConOffset(inicio),
    finISO: aISOConOffset(fin),
  };
}

export function crearJornada(
  grupoId: string,
  datos: {
    titulo: string;
    descripcion: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  },
): Jornada {
  const actual = exigirResponsable(grupoId);
  const grupo = obtenerGrupoPorId(grupoId);
  if (!grupo) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró el grupo solicitado.');
  }

  const tituloLimpio = datos.titulo.trim();
  const descripcionLimpia = datos.descripcion.trim();
  if (!tituloLimpio || !descripcionLimpia) {
    throw new ErrorDominio('ERR_VALIDACION', 'El título y la descripción son obligatorios.');
  }

  const { inicioISO, finISO } = validarRangoHorarioJornada(
    datos.fecha,
    datos.horaInicio,
    datos.horaFin,
  );

  const nueva: Jornada = {
    id: `jor-${String(jornadas.length + 1).padStart(2, '0')}`,
    grupo_id: grupoId,
    titulo: tituloLimpio,
    descripcion: descripcionLimpia,
    inicio_en: inicioISO,
    fin_en: finISO,
    cancelada: false,
    modalidad_asistencia: grupo.modalidad_asistencia,
    control_horas: grupo.control_horas,
    gps_habilitado: grupo.gps_habilitado,
    fotos_habilitadas: grupo.fotos_habilitadas,
    requiere_validacion: grupo.requiere_validacion,
    notificaciones_habilitadas: grupo.notificaciones_habilitadas,
    creado_por: actual.id,
    creado_en: aISOConOffset(),
  };

  jornadas = [nueva, ...jornadas];
  notificar();
  return nueva;
}

export function editarJornada(
  jornadaId: string,
  datos: {
    titulo: string;
    descripcion: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  },
): Jornada {
  const existente = obtenerJornadaPorId(jornadaId);
  if (!existente) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  exigirResponsable(existente.grupo_id);

  if (existente.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No se puede editar una jornada que ya fue cancelada.',
    );
  }

  const tituloLimpio = datos.titulo.trim();
  const descripcionLimpia = datos.descripcion.trim();
  if (!tituloLimpio || !descripcionLimpia) {
    throw new ErrorDominio('ERR_VALIDACION', 'El título y la descripción son obligatorios.');
  }

  const { inicioISO, finISO } = validarRangoHorarioJornada(
    datos.fecha,
    datos.horaInicio,
    datos.horaFin,
  );

  const cambioHorario = inicioISO !== existente.inicio_en || finISO !== existente.fin_en;
  if (cambioHorario && jornadaTieneRegistros(jornadaId)) {
    throw new ErrorDominio(
      'ERR_HORARIO_BLOQUEADO',
      'Ya existen registros de asistencia en esta jornada; el horario quedó fijo.',
    );
  }

  const actualizada: Jornada = {
    ...existente,
    titulo: tituloLimpio,
    descripcion: descripcionLimpia,
    inicio_en: inicioISO,
    fin_en: finISO,
  };

  jornadas = jornadas.map((j) => (j.id === jornadaId ? actualizada : j));
  notificar();
  return actualizada;
}

export function cancelarJornada(jornadaId: string): Jornada {
  const existente = obtenerJornadaPorId(jornadaId);
  if (!existente) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  exigirResponsable(existente.grupo_id);

  const actualizada: Jornada = { ...existente, cancelada: true };
  jornadas = jornadas.map((j) => (j.id === jornadaId ? actualizada : j));
  notificar();
  return actualizada;
}

export function obtenerParticipantesActivos(grupoId: string): IntegranteConUsuario[] {
  return obtenerIntegrantesActivos(grupoId).filter((i) => i.rol === 'participante');
}

export function obtenerAsistenciasDeJornada(jornadaId: string): Asistencia[] {
  return asistencias.filter((a) => a.jornada_id === jornadaId);
}

export function obtenerResumenAsistenciaJornada(jornadaId: string): {
  presentes: number;
  ausentesJustificadas: number;
  sinRegistrar: number;
  totalParticipantes: number;
} {
  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada) {
    return { presentes: 0, ausentesJustificadas: 0, sinRegistrar: 0, totalParticipantes: 0 };
  }

  const participantes = obtenerParticipantesActivos(jornada.grupo_id);
  const mapaAsistencias = new Map(
    obtenerAsistenciasDeJornada(jornadaId).map((a) => [a.participante_id, a]),
  );

  let presentes = 0;
  let ausentesJustificadas = 0;

  for (const participante of participantes) {
    const registro = mapaAsistencias.get(participante.usuario_id);
    if (registro?.estado === 'presente') {
      presentes += 1;
    } else if (registro?.estado === 'ausente' || registro?.estado === 'justificada') {
      ausentesJustificadas += 1;
    }
  }

  const totalParticipantes = participantes.length;
  const sinRegistrar = Math.max(0, totalParticipantes - presentes - ausentesJustificadas);

  return { presentes, ausentesJustificadas, sinRegistrar, totalParticipantes };
}

export function guardarAsistenciasManual(
  jornadaId: string,
  cambios: Array<{
    participanteId: string;
    estado: EstadoAsistencia | null;
    motivoAusencia?: string | null;
  }>,
): void {
  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  const actual = exigirResponsable(jornada.grupo_id);

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No es posible registrar asistencia en una jornada cancelada.',
    );
  }

  for (const cambio of cambios) {
    if (cambio.estado === 'justificada' && !cambio.motivoAusencia?.trim()) {
      throw new ErrorDominio(
        'ERR_MOTIVO_OBLIGATORIO',
        'Toda ausencia justificada debe incluir un motivo.',
      );
    }
  }

  const ahoraISO = aISOConOffset();
  const siguientes = new Map(
    asistencias
      .filter((a) => a.jornada_id === jornadaId)
      .map((a) => [a.participante_id, a]),
  );

  for (const cambio of cambios) {
    if (cambio.estado === null) {
      siguientes.delete(cambio.participanteId);
      continue;
    }

    const previa = siguientes.get(cambio.participanteId);
    const esPresente = cambio.estado === 'presente';

    siguientes.set(cambio.participanteId, {
      id: previa?.id ?? `asi-${Date.now()}-${cambio.participanteId}`,
      jornada_id: jornadaId,
      participante_id: cambio.participanteId,
      estado: cambio.estado,
      motivo_ausencia:
        cambio.estado === 'justificada' ? (cambio.motivoAusencia?.trim() ?? null) : null,
      origen: previa?.origen ?? 'manual',
      hora_entrada: esPresente && jornada.control_horas ? (previa?.hora_entrada ?? null) : null,
      hora_salida: esPresente && jornada.control_horas ? (previa?.hora_salida ?? null) : null,
      duracion_minutos:
        esPresente && jornada.control_horas ? (previa?.duracion_minutos ?? null) : null,
      minutos_reconocidos:
        esPresente && jornada.control_horas ? (previa?.minutos_reconocidos ?? null) : null,
      motivo_ajuste:
        esPresente && jornada.control_horas ? (previa?.motivo_ajuste ?? null) : null,
      estado_validacion: previa?.estado_validacion ?? 'aprobado',
      validado_por: actual.id,
      actualizado_por: actual.id,
      actualizado_en: ahoraISO,
    });
  }

  asistencias = [
    ...asistencias.filter((a) => a.jornada_id !== jornadaId),
    ...Array.from(siguientes.values()),
  ];
  notificar();
}

export function ajustarHorasAsistencia(
  jornadaId: string,
  participanteId: string,
  datos: {
    horaEntrada: string;
    horaSalida: string;
    minutosReconocidos: number;
    motivoAjuste?: string;
  },
): Asistencia {
  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  const actual = exigirResponsable(jornada.grupo_id);

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No se pueden ajustar horas en una jornada cancelada.',
    );
  }
  if (!jornada.control_horas) {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Esta jornada no tiene habilitado el control de horas.',
    );
  }

  const fechaJornada = fechaEnZona(jornada.inicio_en);
  let entrada: Date;
  let salida: Date;

  try {
    entrada = fechaHoraEnZona(fechaJornada, datos.horaEntrada);
    salida = fechaHoraEnZona(fechaJornada, datos.horaSalida);
  } catch {
    throw new ErrorDominio('ERR_HORA_INVALIDA', 'Ingresa horas válidas en formato HH:mm.');
  }

  const inicioJornada = new Date(jornada.inicio_en).getTime();
  const finJornada = new Date(jornada.fin_en).getTime();
  const ahoraMs = Date.now();

  if (salida.getTime() <= entrada.getTime()) {
    throw new ErrorDominio(
      'ERR_HORA_INVALIDA',
      'La hora de salida debe ser posterior a la hora de entrada.',
    );
  }

  if (entrada.getTime() < inicioJornada || salida.getTime() > finJornada) {
    throw new ErrorDominio(
      'ERR_HORA_INVALIDA',
      'Las horas deben estar dentro del intervalo de la jornada.',
    );
  }

  if (entrada.getTime() > ahoraMs || salida.getTime() > ahoraMs) {
    throw new ErrorDominio('ERR_HORA_INVALIDA', 'No puedes registrar horas futuras.');
  }

  const solapa = asistencias.some((otra) => {
    if (
      otra.jornada_id === jornadaId ||
      otra.participante_id !== participanteId ||
      otra.estado !== 'presente' ||
      !otra.hora_entrada ||
      !otra.hora_salida
    ) {
      return false;
    }
    const otraJornada = obtenerJornadaPorId(otra.jornada_id);
    if (!otraJornada || otraJornada.cancelada) {
      return false;
    }
    const oIni = new Date(otra.hora_entrada).getTime();
    const oFin = new Date(otra.hora_salida).getTime();
    return entrada.getTime() < oFin && salida.getTime() > oIni;
  });

  if (solapa) {
    throw new ErrorDominio(
      'ERR_SOLAPAMIENTO_HORAS',
      'El horario ingresado se solapa con otra jornada del mismo participante.',
    );
  }

  const duracionMinutos = Math.floor((salida.getTime() - entrada.getTime()) / 60000);
  if (
    Number.isNaN(datos.minutosReconocidos) ||
    datos.minutosReconocidos < 0 ||
    datos.minutosReconocidos > duracionMinutos
  ) {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      `El tiempo reconocido debe estar entre 0 y ${duracionMinutos} minutos.`,
    );
  }

  const motivoLimpio = datos.motivoAjuste?.trim() ?? '';
  if (datos.minutosReconocidos < duracionMinutos && !motivoLimpio) {
    throw new ErrorDominio(
      'ERR_MOTIVO_OBLIGATORIO',
      'Debes indicar el motivo cuando el tiempo reconocido sea menor a la duración calculada.',
    );
  }

  const previa = asistencias.find(
    (a) => a.jornada_id === jornadaId && a.participante_id === participanteId,
  );
  const ahoraISO = aISOConOffset();

  const actualizada: Asistencia = {
    id: previa?.id ?? `asi-${Date.now()}-${participanteId}`,
    jornada_id: jornadaId,
    participante_id: participanteId,
    estado: 'presente',
    motivo_ausencia: null,
    origen: previa?.origen ?? 'manual',
    hora_entrada: aISOConOffset(entrada),
    hora_salida: aISOConOffset(salida),
    duracion_minutos: duracionMinutos,
    minutos_reconocidos: datos.minutosReconocidos,
    motivo_ajuste: datos.minutosReconocidos < duracionMinutos ? motivoLimpio : null,
    estado_validacion: previa?.estado_validacion ?? 'aprobado',
    validado_por: actual.id,
    actualizado_por: actual.id,
    actualizado_en: ahoraISO,
  };

  if (previa) {
    asistencias = asistencias.map((a) => (a.id === previa.id ? actualizada : a));
  } else {
    asistencias = [...asistencias, actualizada];
  }

  notificar();
  return actualizada;
}

export function obtenerCodigoQRVigente(jornadaId: string): CodigoQR | undefined {
  return codigosQR.find(
    (c) => c.jornada_id === jornadaId && c.revocado_en === null,
  );
}

export function generarCodigoQR(jornadaId: string, caducidadMinutos: 5 | 10 | 15 | 30): CodigoQR {
  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  const actual = exigirResponsable(jornada.grupo_id);

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No se puede generar un código QR para una jornada cancelada.',
    );
  }

  const estado = derivarEstadoJornada(jornada);
  if (estado !== 'en_curso') {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Solo puedes generar un código QR mientras la jornada está en curso.',
    );
  }

  const ahora = new Date();
  const ahoraISO = aISOConOffset(ahora);
  const expiraCandidato = new Date(ahora.getTime() + caducidadMinutos * 60000);
  const finJornada = new Date(jornada.fin_en);
  const expiraFinal = expiraCandidato.getTime() <= finJornada.getTime() ? expiraCandidato : finJornada;

  codigosQR = codigosQR.map((c) =>
    c.jornada_id === jornadaId && c.revocado_en === null ? { ...c, revocado_en: ahoraISO } : c,
  );

  const sufijo = Math.random().toString(16).slice(2, 10).toUpperCase();
  const nuevo: CodigoQR = {
    id: `qr-${Date.now()}`,
    jornada_id: jornadaId,
    codigo_hash: `RA-${jornadaId.toUpperCase()}-${sufijo}`,
    expira_en: aISOConOffset(expiraFinal),
    revocado_en: null,
    generado_por: actual.id,
    creado_en: ahoraISO,
  };

  codigosQR = [nuevo, ...codigosQR];
  notificar();
  return nuevo;
}

export type PeriodoReporte = '7d' | 'mes' | 'todo' | 'personalizado';

export function obtenerReporteGrupo(
  grupoId: string,
  filtro: {
    periodo: PeriodoReporte;
    desde?: string;
    hasta?: string;
  },
): ResumenReporteGrupo {
  exigirResponsable(grupoId);

  const hoy = fechaEnZona();
  let fechaDesde: string | null = null;
  let fechaHasta: string | null = null;

  if (filtro.periodo === '7d') {
    fechaDesde = dayjs(hoy).subtract(6, 'day').format('YYYY-MM-DD');
    fechaHasta = hoy;
  } else if (filtro.periodo === 'mes') {
    fechaDesde = `${hoy.slice(0, 7)}-01`;
    fechaHasta = hoy;
  } else if (filtro.periodo === 'personalizado') {
    fechaDesde = filtro.desde?.trim() || null;
    fechaHasta = filtro.hasta?.trim() || null;
  }

  const jornadasValidas = jornadas.filter((j) => {
    if (j.grupo_id !== grupoId || j.cancelada) {
      return false;
    }
    const fechaJ = fechaEnZona(j.inicio_en);
    if (fechaDesde && fechaJ < fechaDesde) {
      return false;
    }
    if (fechaHasta && fechaJ > fechaHasta) {
      return false;
    }
    return true;
  });

  const idsJornadas = new Set(jornadasValidas.map((j) => j.id));
  const participantes = obtenerParticipantesActivos(grupoId);

  let totalPresentes = 0;
  let totalJustificadas = 0;
  let totalAusentesSinMotivo = 0;

  const filas: FilaReporteGrupo[] = participantes.map((integrante) => {
    const registros = asistencias.filter(
      (a) => a.participante_id === integrante.usuario_id && idsJornadas.has(a.jornada_id),
    );

    let presentes = 0;
    let ausentesSinMotivo = 0;
    let justificadas = 0;
    const motivosJustificadas: string[] = [];
    let minutosRegistrados = 0;
    let minutosReconocidos = 0;

    for (const reg of registros) {
      if (reg.estado === 'presente') {
        presentes += 1;
        minutosRegistrados += reg.duracion_minutos ?? 0;
        minutosReconocidos += reg.minutos_reconocidos ?? reg.duracion_minutos ?? 0;
      } else if (reg.estado === 'justificada') {
        justificadas += 1;
        if (reg.motivo_ausencia?.trim()) {
          motivosJustificadas.push(reg.motivo_ausencia.trim());
        }
      } else if (reg.estado === 'ausente') {
        ausentesSinMotivo += 1;
      }
    }

    totalPresentes += presentes;
    totalJustificadas += justificadas;
    totalAusentesSinMotivo += ausentesSinMotivo;

    const totalEvaluadas = presentes + justificadas + ausentesSinMotivo;
    const tasaAsistencia =
      totalEvaluadas > 0 ? Math.round((presentes / totalEvaluadas) * 100) : null;

    return {
      participante: integrante.usuario,
      presentes,
      ausentesSinMotivo,
      justificadas,
      motivosJustificadas,
      tasaAsistencia,
      minutosRegistrados,
      minutosReconocidos,
    };
  });

  return {
    totalPresentes,
    totalJustificadas,
    totalAusentesSinMotivo,
    filas,
  };
}

export function obtenerMiAsistenciaEnJornada(jornadaId: string): Asistencia | undefined {
  if (!sesionActual) {
    return undefined;
  }
  return asistencias.find(
    (a) => a.jornada_id === jornadaId && a.participante_id === sesionActual?.id,
  );
}

export function obtenerResponsableDeGrupo(grupoId: string): UsuarioCuenta | undefined {
  const integrante = integrantes.find(
    (i) => i.grupo_id === grupoId && i.rol === 'responsable' && i.retirado_en === null,
  );
  if (!integrante) {
    return undefined;
  }
  return usuarios.find((u) => u.id === integrante.usuario_id);
}

export function obtenerMisGruposParaHistorial(): Array<{ grupo: Grupo; retirado: boolean }> {
  if (!sesionActual) {
    return [];
  }

  const porGrupo = new Map<string, { grupo: Grupo; retirado: boolean }>();
  for (const membresia of integrantes) {
    if (membresia.usuario_id !== sesionActual.id || membresia.rol !== 'participante') {
      continue;
    }
    const grupo = grupos.find((g) => g.id === membresia.grupo_id);
    if (!grupo) {
      continue;
    }
    const previo = porGrupo.get(grupo.id);
    const retirado = membresia.retirado_en !== null;
    if (!previo || (previo.retirado && !retirado)) {
      porGrupo.set(grupo.id, { grupo, retirado });
    }
  }

  return Array.from(porGrupo.values());
}

export function obtenerMiHistorial(grupoId?: string): ResumenMiHistorial {
  if (!sesionActual) {
    return {
      registros: [],
      presentes: 0,
      justificadas: 0,
      ausentes: 0,
      tasaAsistencia: null,
      aplicaControlHoras: false,
      minutosRegistrados: 0,
      minutosReconocidos: 0,
      minutosPendientes: 0,
    };
  }

  const misMembresias = integrantes.filter(
    (i) => i.usuario_id === sesionActual?.id && i.rol === 'participante',
  );
  const retiradosPorGrupo = new Map<string, boolean>();
  for (const m of misMembresias) {
    const activo = m.retirado_en === null;
    const previo = retiradosPorGrupo.get(m.grupo_id);
    if (previo === undefined) {
      retiradosPorGrupo.set(m.grupo_id, !activo);
    } else if (activo) {
      retiradosPorGrupo.set(m.grupo_id, false);
    }
  }

  const registros: RegistroHistorial[] = asistencias
    .filter((a) => a.participante_id === sesionActual?.id)
    .map((asistencia) => {
      const jornada = jornadas.find((j) => j.id === asistencia.jornada_id);
      if (!jornada) {
        return null;
      }
      if (!retiradosPorGrupo.has(jornada.grupo_id)) {
        return null;
      }
      if (grupoId && jornada.grupo_id !== grupoId) {
        return null;
      }
      const grupo = grupos.find((g) => g.id === jornada.grupo_id);
      if (!grupo) {
        return null;
      }
      return {
        asistencia,
        jornada,
        grupo,
        retiradoDelGrupo: retiradosPorGrupo.get(grupo.id) ?? false,
      };
    })
    .filter((item): item is RegistroHistorial => item !== null)
    .sort((a, b) => b.jornada.inicio_en.localeCompare(a.jornada.inicio_en));

  let presentes = 0;
  let justificadas = 0;
  let ausentes = 0;
  let minutosRegistrados = 0;
  let minutosReconocidos = 0;
  let minutosPendientes = 0;
  let aplicaControlHoras = false;

  if (grupoId) {
    const grupoSeleccionado = obtenerGrupoPorId(grupoId);
    aplicaControlHoras = Boolean(grupoSeleccionado?.control_horas);
  }

  for (const item of registros) {
    if (item.jornada.cancelada) {
      continue;
    }
    if (item.jornada.control_horas) {
      aplicaControlHoras = true;
    }

    const reg = item.asistencia;
    if (reg.estado === 'presente') {
      presentes += 1;
      const registrados = reg.duracion_minutos ?? 0;
      const reconocidos = reg.minutos_reconocidos ?? registrados;
      minutosRegistrados += registrados;
      if (reg.estado_validacion === 'pendiente') {
        minutosPendientes += reconocidos;
      } else {
        minutosReconocidos += reconocidos;
      }
    } else if (reg.estado === 'justificada') {
      justificadas += 1;
    } else if (reg.estado === 'ausente') {
      ausentes += 1;
    }
  }

  const totalEvaluadas = presentes + justificadas + ausentes;
  const tasaAsistencia =
    totalEvaluadas > 0 ? Math.round((presentes / totalEvaluadas) * 100) : null;

  return {
    registros,
    presentes,
    justificadas,
    ausentes,
    tasaAsistencia,
    aplicaControlHoras,
    minutosRegistrados,
    minutosReconocidos,
    minutosPendientes,
  };
}

export function registrarAsistenciaQR(
  jornadaId: string,
  codigoSimulado?: 'VALIDO' | 'EXPIRADO' | 'REVOCADO' | 'INVALIDO',
): ResultadoRegistroQR {
  if (!sesionActual) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'Debes iniciar sesión para registrar asistencia.');
  }

  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'No se encontró la jornada solicitada.');
  }

  const membresia = integrantes.find(
    (i) =>
      i.grupo_id === jornada.grupo_id &&
      i.usuario_id === sesionActual?.id &&
      i.retirado_en === null,
  );
  if (!membresia) {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'Ya no eres integrante activo de este grupo.',
    );
  }

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'Esta jornada fue cancelada y no admite registros.',
    );
  }

  if (jornada.modalidad_asistencia !== 'qr') {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Esta jornada usa asistencia manual; pide al responsable que te registre.',
    );
  }

  if (derivarEstadoJornada(jornada) !== 'en_curso') {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Solo puedes escanear el código mientras la jornada está en curso.',
    );
  }

  if (codigoSimulado === 'EXPIRADO') {
    throw new ErrorDominio(
      'ERR_QR_INVALIDO',
      'El código QR ha vencido. Pide al responsable que genere uno nuevo.',
    );
  }
  if (codigoSimulado === 'REVOCADO') {
    throw new ErrorDominio(
      'ERR_QR_INVALIDO',
      'Este código QR fue reemplazado por uno más reciente. Escanea el código vigente.',
    );
  }
  if (codigoSimulado === 'INVALIDO') {
    throw new ErrorDominio(
      'ERR_QR_INVALIDO',
      'El código leído no corresponde a esta jornada.',
    );
  }

  const ahora = new Date();
  const ahoraISO = aISOConOffset(ahora);
  const horaTexto = horaEnZona(ahora).slice(0, 5);
  const previa = asistencias.find(
    (a) => a.jornada_id === jornadaId && a.participante_id === sesionActual?.id,
  );

  if (!jornada.control_horas) {
    if (previa?.estado === 'presente') {
      return {
        tipo: 'ya_completa',
        horaTexto,
        duracionMinutos: null,
        asistencia: previa,
      };
    }

    const nueva: Asistencia = {
      id: previa?.id ?? `asi-${Date.now()}-${sesionActual.id}`,
      jornada_id: jornadaId,
      participante_id: sesionActual.id,
      estado: 'presente',
      motivo_ausencia: null,
      origen: 'qr',
      hora_entrada: null,
      hora_salida: null,
      duracion_minutos: null,
      minutos_reconocidos: null,
      motivo_ajuste: null,
      estado_validacion: jornada.requiere_validacion ? 'pendiente' : 'aprobado',
      validado_por: null,
      actualizado_por: sesionActual.id,
      actualizado_en: ahoraISO,
    };

    asistencias = previa
      ? asistencias.map((a) => (a.id === previa.id ? nueva : a))
      : [...asistencias, nueva];
    notificar();

    return {
      tipo: 'presencia',
      horaTexto,
      duracionMinutos: null,
      asistencia: nueva,
    };
  }

  // Con control de horas
  if (previa?.estado === 'presente' && previa.hora_entrada && previa.hora_salida) {
    return {
      tipo: 'ya_completa',
      horaTexto,
      duracionMinutos: previa.duracion_minutos,
      asistencia: previa,
    };
  }

  if (previa?.estado === 'presente' && previa.hora_entrada && !previa.hora_salida) {
    const entradaMs = new Date(previa.hora_entrada).getTime();
    const diffMin = Math.max(1, Math.floor((ahora.getTime() - entradaMs) / 60000));
    const actualizada: Asistencia = {
      ...previa,
      hora_salida: ahoraISO,
      duracion_minutos: diffMin,
      minutos_reconocidos: diffMin,
      actualizado_por: sesionActual.id,
      actualizado_en: ahoraISO,
    };

    asistencias = asistencias.map((a) => (a.id === previa.id ? actualizada : a));
    notificar();

    return {
      tipo: 'salida',
      horaTexto,
      duracionMinutos: diffMin,
      asistencia: actualizada,
    };
  }

  const entrada: Asistencia = {
    id: previa?.id ?? `asi-${Date.now()}-${sesionActual.id}`,
    jornada_id: jornadaId,
    participante_id: sesionActual.id,
    estado: 'presente',
    motivo_ausencia: null,
    origen: 'qr',
    hora_entrada: ahoraISO,
    hora_salida: null,
    duracion_minutos: null,
    minutos_reconocidos: null,
    motivo_ajuste: null,
    estado_validacion: jornada.requiere_validacion ? 'pendiente' : 'aprobado',
    validado_por: null,
    actualizado_por: sesionActual.id,
    actualizado_en: ahoraISO,
  };

  asistencias = previa
    ? asistencias.map((a) => (a.id === previa.id ? entrada : a))
    : [...asistencias, entrada];
  notificar();

  return {
    tipo: 'entrada',
    horaTexto,
    duracionMinutos: null,
    asistencia: entrada,
  };
}
