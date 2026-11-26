/**
 * Helper unico de fechas y rangos de app-web.
 *
 * Todas las fechas, filtros de periodo y sellos de exportacion se construyen
 * y muestran en `America/El_Salvador` (UTC-6, sin horario de verano).
 */

export const ZONA_HORARIA = 'America/El_Salvador' as const;

/** Zona oficial como offset ISO 8601 fijo (El Salvador no usa horario de verano). */
export const OFFSET_EL_SALVADOR = '-06:00' as const;

export type PeriodoPredefinido = '7d' | 'mes' | 'todo';

export interface RangoFechasISO {
  desde: string | null;
  hasta: string | null;
  desdeDia: string | null;
  hastaDia: string | null;
}

type PartesFechaHora = {
  anio: string;
  mes: string;
  dia: string;
  hora: string;
  minuto: string;
  segundo: string;
};

function obtenerPartes(fecha: Date): PartesFechaHora {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);

  const valor = (tipo: Intl.DateTimeFormatPartTypes): string =>
    partes.find((parte) => parte.type === tipo)?.value ?? '';

  return {
    anio: valor('year'),
    mes: valor('month'),
    dia: valor('day'),
    hora: valor('hour'),
    minuto: valor('minute'),
    segundo: valor('second'),
  };
}

function aFecha(valor: Date | string): Date {
  return typeof valor === 'string' ? new Date(valor) : valor;
}

/** Devuelve la fecha `YYYY-MM-DD` del instante dado en zona El Salvador. */
export function fechaEnZona(fecha: Date | string = new Date()): string {
  const { anio, mes, dia } = obtenerPartes(aFecha(fecha));
  return `${anio}-${mes}-${dia}`;
}

/** Devuelve la hora `HH:mm:ss` del instante dado en zona El Salvador. */
export function horaEnZona(fecha: Date | string = new Date()): string {
  const { hora, minuto, segundo } = obtenerPartes(aFecha(fecha));
  return `${hora}:${minuto}:${segundo}`;
}

/** Formatea un instante en espanol de El Salvador con las opciones indicadas. */
export function formatearFecha(
  fecha: Date | string,
  opciones: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat('es-SV', {
    ...opciones,
    timeZone: ZONA_HORARIA,
  }).format(aFecha(fecha));
}

/**
 * Formatea una fecha de calendario (`YYYY-MM-DD`) sin desfase de zona.
 * Se ancla al mediodia de El Salvador para evitar retroceder un dia en UTC.
 */
export function formatearDia(
  fechaISO: string,
  opciones: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
): string {
  return formatearFecha(`${fechaISO}T12:00:00${OFFSET_EL_SALVADOR}`, opciones);
}

/** Indica si dos instantes caen en el mismo dia calendario de El Salvador. */
export function esMismoDia(a: Date | string, b: Date | string = new Date()): boolean {
  return fechaEnZona(a) === fechaEnZona(b);
}

/** Convierte un instante a ISO 8601 con el offset fijo de El Salvador. */
export function aISOConOffset(fecha: Date | string = new Date()): string {
  const { anio, mes, dia, hora, minuto, segundo } = obtenerPartes(aFecha(fecha));
  return `${anio}-${mes}-${dia}T${hora}:${minuto}:${segundo}${OFFSET_EL_SALVADOR}`;
}

/** Devuelve el inicio y fin ISO 8601 en El Salvador para un dia `YYYY-MM-DD`. */
export function limitesDia(fechaISO: string): { inicio: string; fin: string } {
  return {
    inicio: `${fechaISO}T00:00:00${OFFSET_EL_SALVADOR}`,
    fin: `${fechaISO}T23:59:59${OFFSET_EL_SALVADOR}`,
  };
}

/** Desplaza una fecha calendario `YYYY-MM-DD` en una cantidad de dias. */
export function sumarDias(fechaISO: string, dias: number): string {
  const base = new Date(`${fechaISO}T12:00:00${OFFSET_EL_SALVADOR}`);
  base.setUTCDate(base.getUTCDate() + dias);
  return fechaEnZona(base);
}

/** Calcula el rango de fechas ISO en El Salvador para filtros de reporteria. */
export function obtenerRangoPeriodo(
  periodo: PeriodoPredefinido,
  referencia: Date = new Date(),
): RangoFechasISO {
  if (periodo === 'todo') {
    return { desde: null, hasta: null, desdeDia: null, hastaDia: null };
  }

  const hoy = fechaEnZona(referencia);
  const hasta = limitesDia(hoy).fin;

  if (periodo === '7d') {
    const desdeDia = sumarDias(hoy, -6);
    return {
      desde: limitesDia(desdeDia).inicio,
      hasta,
      desdeDia,
      hastaDia: hoy,
    };
  }

  const [anio, mes] = hoy.split('-');
  const primerDiaMes = `${anio}-${mes}-01`;
  return {
    desde: limitesDia(primerDiaMes).inicio,
    hasta,
    desdeDia: primerDiaMes,
    hastaDia: hoy,
  };
}

/** Formatea una cantidad de minutos en texto legible (ej. "2 h 15 min"). */
export function formatearDuracion(minutos: number | null | undefined): string {
  if (minutos === null || minutos === undefined || Number.isNaN(minutos)) {
    return '—';
  }
  const seguro = Math.max(0, Math.round(minutos));
  const horas = Math.floor(seguro / 60);
  const resto = seguro % 60;
  if (horas === 0) {
    return `${resto} min`;
  }
  if (resto === 0) {
    return `${horas} h`;
  }
  return `${horas} h ${String(resto).padStart(2, '0')} min`;
}
