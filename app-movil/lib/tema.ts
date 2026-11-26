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
  papel: '#F7F7F5',
  superficie: '#FFFFFF',
  superficieAlt: '#F1F1EE',

  // Texto
  tinta: '#191A19',
  tintaSuave: '#535550',
  tintaTenue: '#62645F',

  // Líneas
  borde: '#E2E3DE',
  bordeFuerte: '#82847C',

  // Acciones y selecciones (neutras)
  acento: '#191A19',
  acentoSuave: '#EEEFEA',
  acentoBorde: '#D3D5CE',

  // Velo neutro de modales.
  velo: 'rgba(25, 26, 25, 0.42)',

  // Estados de asistencia
  presente: '#186246',
  presenteSuave: '#E7F4EC',
  ausente: '#A02E32',
  ausenteSuave: '#FBECEE',
  justificada: '#785014',
  justificadaSuave: '#FAF0DC',
  sinRegistro: '#595959',
  sinRegistroSuave: '#EEEFEA',

  // Estado de jornada
  enCurso: '#186246',
  enCursoSuave: '#E7F4EC',
  programada: '#504280',
  programadaSuave: '#F0EDF9',
  completada: '#535550',
  completadaSuave: '#F1F1EE',
  cancelada: '#A02E32',
  canceladaSuave: '#FBECEE',

  info: '#384D6A',
  infoSuave: '#EDF2F8',

  // Alias heredados: mantienen el mismo significado para no romper referencias.
  fondo: '#F7F7F5',
  texto: '#191A19',
  textoSuave: '#535550',
  primario: '#191A19',
  primarioSuave: '#EEEFEA',
  exito: '#186246',
  exitoSuave: '#E7F4EC',
  exitoBorde: '#C0DCCB',
  exitoPunto: '#186246',
  azulBorde: '#CDD8E6',
  azulPunto: '#384D6A',
  grisSuave: '#F1F1EE',
  grisPunto: '#62645F',
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
  campo: 16,
  tarjeta: 20,
  modal: 24,
  pill: 999,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/** Seis pasos. Ningún tamaño fuera de esta escala. */
export const tipografia = {
  micro: 12,
  cuerpoSm: 14,
  cuerpo: 16,
  tituloSm: 18,
  titulo: 22,
  display: 32,
} as const;

export const interlineado = {
  micro: 16,
  cuerpoSm: 19,
  cuerpo: 22,
  tituloSm: 24,
  titulo: 26,
  display: 38,
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
    shadowColor: '#191A19',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
