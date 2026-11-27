import type { ImageSourcePropType } from 'react-native';

import fotosJson from '@/data/fotosJornada.json';
import usuariosJson from '@/data/usuarios.json';
import { aISOConOffset } from '@/lib/fecha';
import {
  derivarEstadoJornada,
  obtenerJornadaPorId,
  obtenerMiRolEnGrupo,
  obtenerSesionActual,
} from '@/lib/gruposStore';
import { ErrorDominio, type FotoJornada, type UsuarioCuenta } from '@/types/dominio';

let fotos: FotoJornada[] = (fotosJson as FotoJornada[]).map((f) => ({ ...f }));
const usuarios = usuariosJson as UsuarioCuenta[];

const IMAGENES_EVIDENCIA: Record<string, ImageSourcePropType> = {
  'evidencias/foto-1.jpg': require('@/assets/images/evidencias/foto-1.jpg') as ImageSourcePropType,
  'evidencias/foto-2.jpg': require('@/assets/images/evidencias/foto-2.jpg') as ImageSourcePropType,
  'evidencias/foto-3.jpg': require('@/assets/images/evidencias/foto-3.jpg') as ImageSourcePropType,
  'evidencias/foto-4.jpg': require('@/assets/images/evidencias/foto-4.jpg') as ImageSourcePropType,
};

const CLAVES_IMAGENES = Object.keys(IMAGENES_EVIDENCIA);

type Listener = () => void;
const listeners = new Set<Listener>();

function notificar(): void {
  listeners.forEach((listener) => listener());
}

export function suscribirFotos(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resolverImagenEvidencia(rutaStorage: string): ImageSourcePropType {
  return IMAGENES_EVIDENCIA[rutaStorage] ?? IMAGENES_EVIDENCIA['evidencias/foto-1.jpg'];
}

export function obtenerNombreAutorFoto(autorId: string): string {
  return usuarios.find((u) => u.id === autorId)?.nombre ?? 'Integrante';
}

export function obtenerFotosDeJornada(jornadaId: string): FotoJornada[] {
  return fotos
    .filter((f) => f.jornada_id === jornadaId && f.retirada_en === null)
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

export function agregarFotoSimulada(jornadaId: string): FotoJornada {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'Debes iniciar sesión para agregar fotos.');
  }

  const jornada = obtenerJornadaPorId(jornadaId);
  if (!jornada || obtenerMiRolEnGrupo(jornada.grupo_id) !== 'participante') {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'Solo los participantes activos del grupo pueden agregar fotos.',
    );
  }

  if (jornada.cancelada) {
    throw new ErrorDominio(
      'ERR_JORNADA_CANCELADA',
      'No puedes agregar fotos a una jornada cancelada.',
    );
  }

  if (derivarEstadoJornada(jornada) === 'programada') {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Podrás agregar fotos cuando la jornada haya iniciado.',
    );
  }

  if (jornada.modo_fotos === 'no_permitidas') {
    throw new ErrorDominio(
      'ERR_VALIDACION',
      'Esta jornada no admite fotografías de evidencia.',
    );
  }

  const indice = Math.floor(Math.random() * CLAVES_IMAGENES.length);
  const clave = CLAVES_IMAGENES[indice] ?? 'evidencias/foto-1.jpg';

  const nueva: FotoJornada = {
    id: `fot-${Date.now()}-${fotos.length + 1}`,
    jornada_id: jornadaId,
    autor_id: sesion.id,
    ruta_storage: clave,
    retirada_en: null,
    retirada_por: null,
    creado_en: aISOConOffset(),
  };

  fotos = [nueva, ...fotos];
  notificar();
  return nueva;
}

export function retirarFoto(id: string): void {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    throw new ErrorDominio('ERR_NO_AUTORIZADO', 'Debes iniciar sesión para retirar fotos.');
  }

  const foto = fotos.find((f) => f.id === id);
  if (!foto) {
    throw new ErrorDominio('ERR_VALIDACION', 'No se encontró la fotografía seleccionada.');
  }

  const jornada = obtenerJornadaPorId(foto.jornada_id);
  if (!jornada || obtenerMiRolEnGrupo(jornada.grupo_id) !== 'responsable') {
    throw new ErrorDominio(
      'ERR_NO_AUTORIZADO',
      'Solo un responsable activo puede retirar fotografías.',
    );
  }

  if (foto.retirada_en !== null) {
    return;
  }

  const ahora = aISOConOffset();
  fotos = fotos.map((f) =>
    f.id === id ? { ...f, retirada_en: ahora, retirada_por: sesion.id } : f,
  );
  notificar();
}

export function tengoFotoEnJornada(jornadaId: string): boolean {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return false;
  }

  return fotos.some(
    (f) => f.jornada_id === jornadaId && f.autor_id === sesion.id && f.retirada_en === null,
  );
}
