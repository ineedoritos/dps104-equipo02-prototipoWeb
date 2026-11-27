/**
 * Sistema visual único de la app.
 *
 * Reglas (ver docs/design/sistema-visual.md):
 * 1. Un solo acento: `acento` = presencia y acción principal.
 * 2. Cero gradientes. Borde de 1 px en lugar de sombra; la sombra solo flota.
 * 3. Un radio dominante por tipo de superficie: campo, tarjeta o pill.
 * 4. La jerarquía se construye con tamaño y peso, no con más colores.
 * 5. Toda cifra (horas, duraciones, tasas, contadores) usa `cifrasTabulares`.
 * 6. Ningún color fuera de este archivo.
 */

export const colores = {
  // Superficies
  papel: '#F7F4EE',
  superficie: '#FFFFFF',
  superficieAlt: '#FBF9F4',

  // Texto
  tinta: '#1C1B1F',
  tintaSuave: '#5B5862',
  tintaTenue: '#8B8794',

  // Líneas
  borde: '#E6E1D7',
  bordeFuerte: '#CFC8B8',

  // Acento único (acción principal y presencia)
  acento: '#0B6B58',
  acentoSuave: '#E3F1ED',
  acentoBorde: '#BCD9D1',

  // Velo de modales: tinta al 45 %, nunca gris azulado.
  velo: 'rgba(28, 27, 31, 0.45)',

  // Estados de asistencia
  presente: '#0B6B58',
  presenteSuave: '#E3F1ED',
  ausente: '#A82A20',
  ausenteSuave: '#FBEAE7',
  justificada: '#8A4E0C',
  justificadaSuave: '#F6EEDF',
  sinRegistro: '#6B6772',
  sinRegistroSuave: '#EFEEF1',

  // Estado de jornada
  enCurso: '#0B6B58',
  enCursoSuave: '#E3F1ED',
  programada: '#2F5D8A',
  programadaSuave: '#E8F0F7',
  completada: '#5B5862',
  completadaSuave: '#F1EEE8',
  cancelada: '#A82A20',
  canceladaSuave: '#FBEAE7',

  info: '#2F5D8A',
  infoSuave: '#E8F0F7',

  // Alias heredados: mantienen el mismo significado para no romper referencias.
  fondo: '#F7F4EE',
  texto: '#1C1B1F',
  textoSuave: '#5B5862',
  primario: '#0B6B58',
  primarioSuave: '#E3F1ED',
  exito: '#0B6B58',
  exitoSuave: '#E3F1ED',
  exitoBorde: '#BCD9D1',
  exitoPunto: '#0B6B58',
  azulBorde: '#C3D4E4',
  azulPunto: '#2F5D8A',
  grisSuave: '#F1EEE8',
  grisPunto: '#8B8794',
  grisTexto: '#4A4750',
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

/** Dos pesos. `fuerte` es el máximo de la app. */
export const pesos = {
  normal: '400',
  medio: '500',
  fuerte: '600',
} as const;

/** Cifras de ancho fijo: horas, duraciones, tasas y contadores. */
export const cifrasTabulares = { fontVariant: ['tabular-nums'] } as const;

/** Único caso de elevación: el botón flotante y el panel del QR. */
export const sombras = {
  flotante: {
    shadowColor: '#1C1B1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
