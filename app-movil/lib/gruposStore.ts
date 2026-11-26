import dayjs from 'dayjs';

import gruposJson from '@/data/grupos.json';
import integrantesJson from '@/data/integrantes.json';
import jornadasJson from '@/data/jornadas.json';
import usuariosJson from '@/data/usuarios.json';
import { fechaEnZona } from '@/lib/fecha';
import {
  ErrorDominio,
  type EstadoJornada,
  type Grupo,
  type IntegranteConUsuario,
  type IntegranteGrupo,
  type Jornada,
  type ModalidadAsistencia,
  type ResumenGrupoUsuario,
  type RolGrupo,
  type UsuarioCuenta,
} from '@/types/dominio';

let usuarios: UsuarioCuenta[] = (usuariosJson as UsuarioCuenta[]).map((u) => ({ ...u }));
let grupos: Grupo[] = (gruposJson as Grupo[]).map((g) => ({ ...g }));
let integrantes: IntegranteGrupo[] = (integrantesJson as IntegranteGrupo[]).map((i) => ({ ...i }));
const jornadas: Jornada[] = (jornadasJson as Jornada[]).map((j) => ({ ...j }));

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
  exigirResponsable(grupoId);

  const objetivo = integrantes.find(
    (i) => i.id === integranteId && i.grupo_id === grupoId && i.retirado_en === null,
  );

  if (!objetivo || objetivo.rol === nuevoRol) {
    return;
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
