/**
 * Sistema visual único de la app.
 *
 * Reglas (ver docs/design/sistema-visual.md):
 * 1. Acciones neutras: `acento` identifica la acción principal. El color se reserva para estados y datos.
 * 2. Cero gradientes. Borde de 1 px en lugar de sombra; la sombra solo flota.
 * 3. Un radio dominante por tipo de superficie: campo, tarjeta o pill.
 * 4. La jerarquía se construye con tamaño y peso, no con más colores.
 * 5. Toda cifra (horas, duraciones, tasas, contadores) usa `cifrasTabulares`.
 * 6. Ningún color fuera de este archivo.
 */

export const colores = {
  // Superficies
  papel: '#FFFFFF',
  superficie: '#FFFFFF',
  superficieAlt: '#F5F5F5',

  // Texto
  tinta: '#181818',
  tintaSuave: '#525252',
  tintaTenue: '#666666',

  // Líneas
  borde: '#E4E4E4',
  bordeFuerte: '#858585',

  // Acciones y selecciones (neutras)
  acento: '#181818',
  acentoSuave: '#F1F1F1',
  acentoBorde: '#CFCFCF',

  // Velo neutro de modales.
  velo: 'rgba(24, 24, 24, 0.45)',

  // Estados de asistencia
  presente: '#186246',
  presenteSuave: '#E7F4EC',
  ausente: '#A02E32',
  ausenteSuave: '#FBECEE',
  justificada: '#785014',
  justificadaSuave: '#FAF0DC',
  sinRegistro: '#595959',
  sinRegistroSuave: '#F1F1F1',

  // Estado de jornada
  enCurso: '#186246',
  enCursoSuave: '#E7F4EC',
  programada: '#504280',
  programadaSuave: '#F0EDF9',
  completada: '#525252',
  completadaSuave: '#F5F5F5',
  cancelada: '#A02E32',
  canceladaSuave: '#FBECEE',

  info: '#384D6A',
  infoSuave: '#EDF2F8',

  // Alias heredados: mantienen el mismo significado para no romper referencias.
  fondo: '#FFFFFF',
  texto: '#181818',
  textoSuave: '#525252',
  primario: '#181818',
  primarioSuave: '#F1F1F1',
  exito: '#186246',
  exitoSuave: '#E7F4EC',
  exitoBorde: '#C0DCCB',
  exitoPunto: '#186246',
  azulBorde: '#CDD8E6',
  azulPunto: '#384D6A',
  grisSuave: '#F5F5F5',
  grisPunto: '#666666',
  grisTexto: '#484848',
} as const;

/** Base 4. Sin valores intermedios: si falta uno, se elige el vecino. */
export const espaciados = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radios = {
  campo: 12,
  tarjeta: 16,
  pill: 999,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/** Seis pasos. Ningún tamaño fuera de esta escala. */
export const tipografia = {
  micro: 11,
  cuerpoSm: 13,
  cuerpo: 15,
  tituloSm: 17,
  titulo: 20,
  display: 28,
} as const;

export const interlineado = {
  micro: 16,
  cuerpoSm: 19,
  cuerpo: 22,
  tituloSm: 24,
  titulo: 26,
  display: 34,
} as const;

/** El peso de encabezado se reserva para títulos y cifras principales. */
export const pesos = {
  normal: '400',
  medio: '500',
  fuerte: '600',
  encabezado: '700',
} as const;

/** Cifras de ancho fijo: horas, duraciones, tasas y contadores. */
export const cifrasTabulares = { fontVariant: ['tabular-nums'] } as const;

/** Único caso de elevación: el botón flotante y el panel del QR. */
export const sombras = {
  flotante: {
    shadowColor: '#181818',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
