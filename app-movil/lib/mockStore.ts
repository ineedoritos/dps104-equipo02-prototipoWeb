import dayjs from 'dayjs';

import actividadesJson from '@/data/actividades.json';
import asistenciasJson from '@/data/asistencias.json';
import participantesJson from '@/data/participantes.json';
import type {
  Actividad,
  EstadoActividad,
  Participante,
  RegistroAsistencia,
} from '@/types/actividad';

let actividades: Actividad[] = (actividadesJson as Actividad[]).map((item) => ({ ...item }));
const participantes: Participante[] = participantesJson as Participante[];
let asistencias: RegistroAsistencia[] = (asistenciasJson as RegistroAsistencia[]).map((item) => ({
  ...item,
}));

export function obtenerActividades(): Actividad[] {
  return [...actividades];
}

export function obtenerActividadPorId(id: number): Actividad | undefined {
  return actividades.find((actividad) => actividad.id === id);
}

export function obtenerParticipantes(): Participante[] {
  return participantes;
}

export function obtenerAsistenciasActividad(actividadId: number): RegistroAsistencia[] {
  return asistencias.filter((registro) => registro.actividadId === actividadId);
}

export function obtenerTodasLasAsistencias(): RegistroAsistencia[] {
  return [...asistencias];
}

export function guardarAsistenciasActividad(
  actividadId: number,
  nuevosRegistros: RegistroAsistencia[],
): void {
  const restantes = asistencias.filter((registro) => registro.actividadId !== actividadId);
  asistencias = [...restantes, ...nuevosRegistros];

  const presentes = nuevosRegistros.filter((registro) => registro.estado === 'presente').length;
  actividades = actividades.map((actividad) =>
    actividad.id === actividadId ? { ...actividad, participants: presentes } : actividad,
  );
}

interface NuevaActividadInput {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

function derivarEstadoPorFecha(fechaISO: string): EstadoActividad {
  const hoy = dayjs().format('YYYY-MM-DD');
  if (fechaISO > hoy) {
    return 'upcoming';
  }
  if (fechaISO < hoy) {
    return 'completed';
  }
  return 'current';
}

export function agregarActividad(datos: NuevaActividadInput): Actividad {
  const nuevoId = actividades.reduce((max, item) => Math.max(max, item.id), 0) + 1;

  const nueva: Actividad = {
    id: nuevoId,
    title: datos.title.trim(),
    description: datos.description.trim(),
    date: datos.date,
    startTime: datos.startTime.trim(),
    endTime: datos.endTime.trim(),
    location: datos.location.trim(),
    participants: 0,
    evidenceCount: 0,
    status: derivarEstadoPorFecha(datos.date),
  };

  actividades = [nueva, ...actividades];
  return nueva;
}
