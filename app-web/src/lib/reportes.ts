import {
  ASISTENCIAS_PORTAL,
  GRUPOS_PORTAL,
  INTEGRANTES_PORTAL,
  JORNADAS_PORTAL,
  USUARIOS_PORTAL,
  USUARIO_ACTUAL_ID,
} from "@/data/mock-portal";
import {
  type PeriodoPredefinido,
  fechaEnZona,
  formatearDia,
  obtenerRangoPeriodo,
} from "@/lib/fecha";
import type {
  Asistencia,
  EstadoJornadaDerivado,
  FilaReporteGrupo,
  Grupo,
  Jornada,
} from "@/types/dominio";

export type FiltroPeriodoTipo = PeriodoPredefinido | "personalizado";

export interface FiltroPeriodoValor {
  tipo: FiltroPeriodoTipo;
  desdeDia: string;
  hastaDia: string;
}

export function crearFiltroInicial(
  tipo: PeriodoPredefinido = "mes",
): FiltroPeriodoValor {
  const rango = obtenerRangoPeriodo(tipo);
  return {
    tipo,
    desdeDia: rango.desdeDia ?? "",
    hastaDia: rango.hastaDia ?? "",
  };
}

export function calcularTasaAsistencia(
  presentes: number,
  ausentesSinMotivo: number,
  justificadas: number,
): number | null {
  const total = presentes + ausentesSinMotivo + justificadas;
  if (total === 0) return null;
  return (presentes / total) * 100;
}

export function formatearTasa(tasa: number | null): string {
  if (tasa === null || Number.isNaN(tasa)) return "—";
  return `${tasa.toFixed(1)}%`;
}

export function derivarEstadoJornada(
  jornada: Jornada,
  ahora: Date = new Date(),
): EstadoJornadaDerivado {
  if (jornada.cancelada) return "cancelada";
  const instante = ahora.getTime();
  const inicio = new Date(jornada.inicio_en).getTime();
  const fin = new Date(jornada.fin_en).getTime();
  if (instante < inicio) return "programada";
  if (instante <= fin) return "en_curso";
  return "finalizada";
}

export function jornadaEnRango(
  jornada: Jornada,
  filtro: FiltroPeriodoValor,
): boolean {
  if (filtro.tipo === "todo") return true;
  const dia = fechaEnZona(jornada.inicio_en);
  if (filtro.desdeDia && dia < filtro.desdeDia) return false;
  if (filtro.hastaDia && dia > filtro.hastaDia) return false;
  return true;
}

export function obtenerGrupoPorId(grupoId: string): Grupo | null {
  return GRUPOS_PORTAL.find((g) => g.id === grupoId) ?? null;
}

export function obtenerNombreUsuario(usuarioId: string): string {
  return (
    USUARIOS_PORTAL.find((u) => u.id === usuarioId)?.nombre ??
    "Integrante"
  );
}

export interface ResumenDashboardGrupo {
  grupo: Grupo;
  totalPresentes: number;
  totalAusentesSinMotivo: number;
  totalJustificadas: number;
  totalAusencias: number;
  tasaAsistencia: number | null;
  jornadasContabilizadas: number;
  jornadasCanceladas: number;
  minutosRegistrados: number;
  minutosReconocidos: number;
  mostrarHoras: boolean;
  tendenciaPorJornada: Array<{
    jornadaId: string;
    titulo: string;
    fechaCorta: string;
    presentes: number;
    ausencias: number;
    tasa: number;
  }>;
}

export function obtenerResumenDashboard(
  grupoId: string,
  filtro: FiltroPeriodoValor,
): ResumenDashboardGrupo | null {
  const grupo = obtenerGrupoPorId(grupoId);
  if (!grupo) return null;

  const jornadasEnRango = JORNADAS_PORTAL.filter(
    (j) => j.grupo_id === grupoId && jornadaEnRango(j, filtro),
  );

  const jornadasActivas = jornadasEnRango
    .filter((j) => !j.cancelada)
    .sort((a, b) => a.inicio_en.localeCompare(b.inicio_en));

  const jornadasCanceladas = jornadasEnRango.filter((j) => j.cancelada).length;

  let totalPresentes = 0;
  let totalAusentesSinMotivo = 0;
  let totalJustificadas = 0;
  let minutosRegistrados = 0;
  let minutosReconocidos = 0;

  const tendenciaPorJornada = jornadasActivas.map((jornada) => {
    const registros = ASISTENCIAS_PORTAL.filter(
      (a) => a.jornada_id === jornada.id,
    );
    let presentes = 0;
    let ausentes = 0;
    let justificadas = 0;

    for (const reg of registros) {
      if (reg.estado === "presente") {
        presentes += 1;
        minutosRegistrados += reg.duracion_minutos ?? 0;
        minutosReconocidos += reg.minutos_reconocidos ?? 0;
      } else if (reg.estado === "ausente") {
        ausentes += 1;
      } else {
        justificadas += 1;
      }
    }

    totalPresentes += presentes;
    totalAusentesSinMotivo += ausentes;
    totalJustificadas += justificadas;

    const ausencias = ausentes + justificadas;
    const tasa = calcularTasaAsistencia(presentes, ausentes, justificadas) ?? 0;

    return {
      jornadaId: jornada.id,
      titulo: jornada.titulo,
      fechaCorta: formatearDia(fechaEnZona(jornada.inicio_en), {
        day: "2-digit",
        month: "short",
      }),
      presentes,
      ausencias,
      tasa: Number(tasa.toFixed(1)),
    };
  });

  const mostrarHoras =
    grupo.control_horas || minutosRegistrados > 0 || minutosReconocidos > 0;

  return {
    grupo,
    totalPresentes,
    totalAusentesSinMotivo,
    totalJustificadas,
    totalAusencias: totalAusentesSinMotivo + totalJustificadas,
    tasaAsistencia: calcularTasaAsistencia(
      totalPresentes,
      totalAusentesSinMotivo,
      totalJustificadas,
    ),
    jornadasContabilizadas: jornadasActivas.length,
    jornadasCanceladas,
    minutosRegistrados,
    minutosReconocidos,
    mostrarHoras,
    tendenciaPorJornada,
  };
}

export function obtenerReporteGrupoMock(
  grupoId: string,
  filtro: FiltroPeriodoValor,
): { filas: FilaReporteGrupo[]; mostrarHoras: boolean } {
  const grupo = obtenerGrupoPorId(grupoId);
  if (!grupo) return { filas: [], mostrarHoras: false };

  const jornadasValidas = JORNADAS_PORTAL.filter(
    (j) =>
      j.grupo_id === grupoId && !j.cancelada && jornadaEnRango(j, filtro),
  );
  const mapaJornadas = new Map(jornadasValidas.map((j) => [j.id, j]));

  const integrantes = INTEGRANTES_PORTAL.filter(
    (i) => i.grupo_id === grupoId && i.rol === "participante",
  );

  const filas: FilaReporteGrupo[] = [];
  let hayHoras = grupo.control_horas;

  for (const integrante of integrantes) {
    const registros = ASISTENCIAS_PORTAL.filter(
      (a) =>
        a.participante_id === integrante.usuario_id &&
        mapaJornadas.has(a.jornada_id),
    );

    // Excluir ex-integrantes sin registros en el periodo filtrado
    if (integrante.retirado_en !== null && registros.length === 0) {
      continue;
    }
    if (registros.length === 0 && jornadasValidas.length === 0) {
      continue;
    }

    let presentes = 0;
    let ausentesSinMotivo = 0;
    let justificadas = 0;
    let minutosRegistrados = 0;
    let minutosReconocidos = 0;
    const motivosJustificadas: FilaReporteGrupo["motivos_justificadas"] = [];
    const ajustesHoras: FilaReporteGrupo["ajustes_horas"] = [];

    for (const reg of registros) {
      const jornada = mapaJornadas.get(reg.jornada_id);
      if (!jornada) continue;
      const fecha = fechaEnZona(jornada.inicio_en);

      if (reg.estado === "presente") {
        presentes += 1;
        const dur = reg.duracion_minutos ?? 0;
        const rec = reg.minutos_reconocidos ?? 0;
        minutosRegistrados += dur;
        minutosReconocidos += rec;
        if (dur > 0 || rec > 0) hayHoras = true;
        if (reg.motivo_ajuste && rec < dur) {
          ajustesHoras.push({
            fecha,
            jornada_titulo: jornada.titulo,
            duracion_minutos: dur,
            minutos_reconocidos: rec,
            motivo_ajuste: reg.motivo_ajuste,
          });
        }
      } else if (reg.estado === "ausente") {
        ausentesSinMotivo += 1;
      } else {
        justificadas += 1;
        if (reg.motivo_ausencia) {
          motivosJustificadas.push({
            fecha,
            jornada_titulo: jornada.titulo,
            motivo: reg.motivo_ausencia,
          });
        }
      }
    }

    filas.push({
      usuario_id: integrante.usuario_id,
      nombre: obtenerNombreUsuario(integrante.usuario_id),
      presentes,
      ausentes_sin_motivo: ausentesSinMotivo,
      justificadas,
      ausencias_total: ausentesSinMotivo + justificadas,
      tasa_asistencia: calcularTasaAsistencia(
        presentes,
        ausentesSinMotivo,
        justificadas,
      ),
      minutos_registrados: minutosRegistrados,
      minutos_reconocidos: minutosReconocidos,
      motivos_justificadas: motivosJustificadas.sort((a, b) =>
        b.fecha.localeCompare(a.fecha),
      ),
      ajustes_horas: ajustesHoras.sort((a, b) =>
        b.fecha.localeCompare(a.fecha),
      ),
      activo_en_grupo: integrante.retirado_en === null,
    });
  }

  return { filas, mostrarHoras: hayHoras };
}

export interface JornadaConResumen {
  jornada: Jornada;
  estadoDerivado: EstadoJornadaDerivado;
  presentes: number;
  ausentes: number;
  justificadas: number;
  totalRegistros: number;
  minutosReconocidos: number;
}

export function obtenerJornadasGrupo(grupoId: string): JornadaConResumen[] {
  return JORNADAS_PORTAL.filter((j) => j.grupo_id === grupoId)
    .sort((a, b) => b.inicio_en.localeCompare(a.inicio_en))
    .map((jornada) => {
      const regs = ASISTENCIAS_PORTAL.filter(
        (a) => a.jornada_id === jornada.id,
      );
      const presentes = regs.filter((r) => r.estado === "presente").length;
      const ausentes = regs.filter((r) => r.estado === "ausente").length;
      const justificadas = regs.filter((r) => r.estado === "justificada").length;
      const minutosReconocidos = regs.reduce(
        (acc, r) => acc + (r.minutos_reconocidos ?? 0),
        0,
      );

      return {
        jornada,
        estadoDerivado: derivarEstadoJornada(jornada),
        presentes,
        ausentes,
        justificadas,
        totalRegistros: regs.length,
        minutosReconocidos,
      };
    });
}

export function obtenerDetalleJornada(jornadaId: string): {
  jornada: Jornada;
  grupo: Grupo;
  estadoDerivado: EstadoJornadaDerivado;
  asistencias: Array<Asistencia & { participante_nombre: string }>;
} | null {
  const jornada = JORNADAS_PORTAL.find((j) => j.id === jornadaId);
  if (!jornada) return null;
  const grupo = obtenerGrupoPorId(jornada.grupo_id);
  if (!grupo) return null;

  const asistencias = ASISTENCIAS_PORTAL.filter(
    (a) => a.jornada_id === jornada.id,
  )
    .map((a) => ({
      ...a,
      participante_nombre: obtenerNombreUsuario(a.participante_id),
    }))
    .sort((a, b) =>
      a.participante_nombre.localeCompare(b.participante_nombre, "es"),
    );

  return {
    jornada,
    grupo,
    estadoDerivado: derivarEstadoJornada(jornada),
    asistencias,
  };
}

export interface GrupoPersonalItem {
  grupo: Grupo;
  esAnterior: boolean;
}

export function obtenerGruposPersonales(
  usuarioId: string = USUARIO_ACTUAL_ID,
): GrupoPersonalItem[] {
  const membresias = INTEGRANTES_PORTAL.filter(
    (i) => i.usuario_id === usuarioId,
  );
  const items: GrupoPersonalItem[] = [];
  for (const m of membresias) {
    const grupo = obtenerGrupoPorId(m.grupo_id);
    if (!grupo) continue;
    items.push({
      grupo,
      esAnterior: m.retirado_en !== null,
    });
  }
  return items;
}

export interface RegistroPersonalItem {
  asistencia: Asistencia;
  jornada: Jornada;
  grupo: Grupo;
  esGrupoAnterior: boolean;
}

export function obtenerMiReportePersonal(
  grupoFiltroId: string,
  filtro: FiltroPeriodoValor,
  usuarioId: string = USUARIO_ACTUAL_ID,
): {
  registros: RegistroPersonalItem[];
  presentes: number;
  ausentesSinMotivo: number;
  justificadas: number;
  tasa: number | null;
  duracionRegistrada: number;
  tiempoReconocido: number;
  tiempoPendiente: number;
  mostrarHoras: boolean;
} {
  const membresias = new Map(
    INTEGRANTES_PORTAL.filter((i) => i.usuario_id === usuarioId).map((i) => [
      i.grupo_id,
      i.retirado_en !== null,
    ]),
  );

  const registros: RegistroPersonalItem[] = [];

  for (const asi of ASISTENCIAS_PORTAL) {
    if (asi.participante_id !== usuarioId) continue;
    const jornada = JORNADAS_PORTAL.find((j) => j.id === asi.jornada_id);
    if (!jornada) continue;
    if (grupoFiltroId !== "todos" && jornada.grupo_id !== grupoFiltroId) {
      continue;
    }
    if (!jornadaEnRango(jornada, filtro)) continue;
    const grupo = obtenerGrupoPorId(jornada.grupo_id);
    if (!grupo) continue;

    registros.push({
      asistencia: asi,
      jornada,
      grupo,
      esGrupoAnterior: membresias.get(grupo.id) ?? false,
    });
  }

  registros.sort((a, b) =>
    b.jornada.inicio_en.localeCompare(a.jornada.inicio_en),
  );

  let presentes = 0;
  let ausentesSinMotivo = 0;
  let justificadas = 0;
  let duracionRegistrada = 0;
  let tiempoReconocido = 0;
  let tiempoPendiente = 0;
  let mostrarHoras = false;

  for (const item of registros) {
    if (item.jornada.cancelada) continue;
    if (item.jornada.control_horas) mostrarHoras = true;

    const { asistencia } = item;
    if (asistencia.estado === "presente") {
      presentes += 1;
      const dur = asistencia.duracion_minutos ?? 0;
      const rec = asistencia.minutos_reconocidos ?? 0;
      duracionRegistrada += dur;
      if (asistencia.estado_validacion === "pendiente") {
        tiempoPendiente += rec;
      } else {
        tiempoReconocido += rec;
      }
      if (dur > 0 || rec > 0) mostrarHoras = true;
    } else if (asistencia.estado === "ausente") {
      ausentesSinMotivo += 1;
    } else {
      justificadas += 1;
    }
  }

  return {
    registros,
    presentes,
    ausentesSinMotivo,
    justificadas,
    tasa: calcularTasaAsistencia(presentes, ausentesSinMotivo, justificadas),
    duracionRegistrada,
    tiempoReconocido,
    tiempoPendiente,
    mostrarHoras,
  };
}
