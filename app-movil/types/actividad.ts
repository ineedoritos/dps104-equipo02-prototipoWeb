export type EstadoActividad = 'upcoming' | 'current' | 'completed';

export interface Actividad {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  location: string;
  participants: number;
  evidenceCount: number;
  status: EstadoActividad;
}

export interface Usuario {
  name: string;
}

export interface FiltrosActividades {
  status: EstadoActividad | 'all';
  dateFrom: string;
  dateTo: string;
}
