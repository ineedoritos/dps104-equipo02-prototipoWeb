import notificacionesJson from '@/data/notificaciones.json';
import { aISOConOffset } from '@/lib/fecha';
import { obtenerSesionActual } from '@/lib/gruposStore';
import type { Notificacion } from '@/types/dominio';

let notificaciones: Notificacion[] = (notificacionesJson as Notificacion[]).map((n) => ({ ...n }));
let permisoPushConcedido = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function notificar(): void {
  listeners.forEach((listener) => listener());
}

export function suscribirNotificaciones(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function obtenerPermisoPushSimulado(): boolean {
  return permisoPushConcedido;
}

export function establecerPermisoPushSimulado(concedido: boolean): void {
  if (permisoPushConcedido === concedido) {
    return;
  }
  permisoPushConcedido = concedido;
  notificar();
}

export function obtenerMisNotificaciones(): Notificacion[] {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return [];
  }

  return notificaciones
    .filter((n) => n.usuario_id === sesion.id)
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

export function contarNoLeidas(): number {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return 0;
  }

  return notificaciones.filter((n) => n.usuario_id === sesion.id && !n.leida).length;
}

export function marcarLeida(id: string): void {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return;
  }

  let cambio = false;
  notificaciones = notificaciones.map((n) => {
    if (n.id === id && n.usuario_id === sesion.id && !n.leida) {
      cambio = true;
      return { ...n, leida: true };
    }
    return n;
  });

  if (cambio) {
    notificar();
  }
}

export function marcarTodasLeidas(): void {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return;
  }

  let cambio = false;
  notificaciones = notificaciones.map((n) => {
    if (n.usuario_id === sesion.id && !n.leida) {
      cambio = true;
      return { ...n, leida: true };
    }
    return n;
  });

  if (cambio) {
    notificar();
  }
}

export function crearNotificacion(
  datos: Omit<Notificacion, 'id' | 'leida' | 'creado_en'>,
): Notificacion {
  const existente = notificaciones.find((n) => n.clave_unica === datos.clave_unica);
  if (existente) {
    return existente;
  }

  const nueva: Notificacion = {
    ...datos,
    id: `not-${Date.now()}-${notificaciones.length + 1}`,
    leida: false,
    creado_en: aISOConOffset(),
  };

  notificaciones = [nueva, ...notificaciones];
  notificar();
  return nueva;
}
