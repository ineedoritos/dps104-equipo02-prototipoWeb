/**
 * Helper único de fechas de la app (ADR-006).
 *
 * Todas las fechas se construyen y se muestran en `America/El_Salvador`
 * (UTC-6, sin horario de verano), sin depender de la zona del teléfono.
 */

export const ZONA_HORARIA = 'America/El_Salvador' as const;

/** Zona oficial como offset ISO 8601 fijo (El Salvador no usa DST). */
export const OFFSET_EL_SALVADOR = '-06:00' as const;

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

/** Formatea un instante en español de El Salvador con las opciones indicadas. */
export function formatearFecha(
  fecha: Date | string,
  opciones: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat('es-SV', {
    ...opciones,
    timeZone: ZONA_HORARIA,
  }).format(aFecha(fecha));
}

/** Indica si dos instantes caen en el mismo día calendario de El Salvador. */
export function esMismoDia(a: Date | string, b: Date | string = new Date()): boolean {
  return fechaEnZona(a) === fechaEnZona(b);
}

/**
 * Formatea una fecha de calendario (`YYYY-MM-DD`) sin desfase de zona.
 *
 * Se ancla al mediodía de El Salvador: `new Date('2026-11-25')` se
 * interpretaría como medianoche UTC y mostraría el día anterior.
 */
export function formatearDia(fechaISO: string, opciones: Intl.DateTimeFormatOptions = {}): string {
  return formatearFecha(`${fechaISO}T12:00:00${OFFSET_EL_SALVADOR}`, opciones);
}

/** Convierte un instante a ISO 8601 con el offset fijo de El Salvador. */
export function aISOConOffset(fecha: Date | string = new Date()): string {
  const { anio, mes, dia, hora, minuto, segundo } = obtenerPartes(aFecha(fecha));
  return `${anio}-${mes}-${dia}T${hora}:${minuto}:${segundo}${OFFSET_EL_SALVADOR}`;
}

/**
 * Construye un `Date` a partir de fecha (`YYYY-MM-DD`) y hora (`HH:mm`)
 * interpretadas en zona El Salvador.
 */
export function fechaHoraEnZona(fecha: string, hora: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas, minutos] = hora.split(':').map(Number);

  if (!anio || !mes || !dia || Number.isNaN(horas) || Number.isNaN(minutos)) {
    throw new Error('Fecha u hora con formato inválido. Usa YYYY-MM-DD y HH:mm.');
  }

  return new Date(
    `${String(anio).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(
      2,
      '0',
    )}T${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00${OFFSET_EL_SALVADOR}`,
  );
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

/** Formatea un instante como tiempo relativo legible en zona El Salvador. */
export function formatearFechaRelativa(
  fecha: Date | string,
  ahora: Date = new Date(),
): string {
  const destino = aFecha(fecha);
  const diffMin = Math.floor((ahora.getTime() - destino.getTime()) / 60000);

  if (diffMin >= 0 && diffMin < 1) {
    return 'Hace un momento';
  }
  if (diffMin >= 1 && diffMin < 60) {
    return `Hace ${diffMin} min`;
  }

  const hoy = fechaEnZona(ahora);
  const diaDestino = fechaEnZona(destino);
  const horaCorta = horaEnZona(destino).slice(0, 5);

  if (diaDestino === hoy && diffMin >= 0) {
    const diffHoras = Math.floor(diffMin / 60);
    return `Hace ${diffHoras} h`;
  }

  const ayer = fechaEnZona(new Date(ahora.getTime() - 86400000));
  if (diaDestino === ayer) {
    return `Ayer · ${horaCorta}`;
  }

  const fechaCorta = formatearDia(diaDestino, { day: 'numeric', month: 'short' });
  return `${fechaCorta} · ${horaCorta}`;
}
