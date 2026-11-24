export type EstadoActividad = 'upcoming' | 'current' | 'completed';

export type EstadoAsistencia = 'presente' | 'ausente' | 'justificada';

export interface Actividad {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  location: string;
  participants: number;
  evidenceCount: number;
  status: EstadoActividad;
}

export interface Participante {
  id: number;
  nombre: string;
  correo: string;
}

export interface RegistroAsistencia {
  actividadId: number;
  participanteId: number;
  estado: EstadoAsistencia;
  motivo?: string;
}

export interface Usuario {
  name: string;
}

export interface FiltrosActividades {
  status: EstadoActividad | 'all';
  dateFrom: string;
  dateTo: string;
}
