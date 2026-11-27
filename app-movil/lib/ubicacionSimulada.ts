export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface LecturaUbicacion extends Coordenadas {
  precision_metros: number;
}

export type CasoUbicacionSimulada =
  | 'dentro_radio'
  | 'fuera_radio'
  | 'poca_precision'
  | 'sin_permiso';

const RADIO_TIERRA_METROS = 6371000;
const PUNTO_BASE_SAN_SALVADOR: Coordenadas = {
  latitud: 13.7013,
  longitud: -89.2244,
};

/** Calcula la distancia en metros entre dos coordenadas mediante Haversine. */
export function distanciaMetros(a: Coordenadas, b: Coordenadas): number {
  const aRad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRad(b.latitud - a.latitud);
  const dLon = aRad(b.longitud - a.longitud);
  const lat1 = aRad(a.latitud);
  const lat2 = aRad(b.latitud);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return RADIO_TIERRA_METROS * c;
}

/**
 * Simula la obtencion puntual de ubicacion en desarrollo sin instalar
 * dependencias nativas hasta integrar Supabase y permisos reales.
 */
export async function obtenerUbicacionActual(
  caso: CasoUbicacionSimulada = 'dentro_radio',
  referencia?: Coordenadas | null,
): Promise<LecturaUbicacion | 'sin_permiso'> {
  if (caso === 'sin_permiso') {
    return 'sin_permiso';
  }

  const base = referencia ?? PUNTO_BASE_SAN_SALVADOR;

  if (caso === 'fuera_radio') {
    // +0.00315 grados de latitud equivale aproximadamente a 350 metros.
    return {
      latitud: base.latitud + 0.00315,
      longitud: base.longitud,
      precision_metros: 15,
    };
  }

  if (caso === 'poca_precision') {
    return {
      latitud: base.latitud + 0.0001,
      longitud: base.longitud,
      precision_metros: 120,
    };
  }

  return {
    latitud: base.latitud + 0.0001,
    longitud: base.longitud,
    precision_metros: 12,
  };
}
