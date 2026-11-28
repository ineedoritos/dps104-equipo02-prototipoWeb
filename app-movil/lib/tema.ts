/**
 * Sistema visual unico de la app: Forma (tema claro).
 * Fuente: design system "Forma" en claude.ai (tokens.json).
 *
 * Reglas de diseño:
 * 1. Estructura monocromatica: `ink`, `muted`, `paper` y `canvas`. El color
 *    aparece solo cuando comunica algo (estado, progreso, logro).
 * 2. Superficies separadas por tono (`paper` sobre `canvas`), nunca por sombra.
 *    `line` solo divide filas.
 * 3. Un solo boton primario (`action`) por pantalla.
 * 4. Texto e iconos sobre un tinte usan su `*Ink`.
 * 5. Toda cifra (horas, duraciones, tasas, contadores) usa `cifrasTabulares`.
 * 6. Ningun color fuera de este archivo.
 */

/** Tokens de Forma con su nombre original (tema claro). */
export const forma = {
  paper: '#FFFFFF',
  canvas: '#F4F5F5',
  line: '#E7E9E9',
  lineStrong: '#858D93',
  fill: '#EFF1F1',
  fillHover: '#E5E8E8',
  ink: '#17191B',
  muted: '#60686E',
  action: '#17191B',
  actionHover: '#33383C',
  onAction: '#FFFFFF',
  focus: '#377AB8',
  scrim: 'rgba(32, 42, 50, 0.31)',

  // Tintes de acento y su texto/icono
  blue: '#E1EDF9',
  mint: '#E0EEE6',
  peach: '#F9EEDC',
  lilac: '#EBE6F6',
  rose: '#F7E5E9',
  blueInk: '#1F6AA3',
  mintInk: '#28704B',
  peachInk: '#86601B',
  lilacInk: '#7657A8',
  roseInk: '#9A4658',
} as const;

/**
 * Nombres en uso dentro de la app, mapeados a Forma.
 * Se mantienen para no romper referencias.
 */
export const colores = {
  // Superficies
  papel: forma.canvas,
  superficie: forma.paper,
  superficieAlt: forma.fill,

  // Texto
  tinta: forma.ink,
  tintaSuave: forma.muted,
  // Forma no tiene un tercer gris de texto: `muted` es el minimo con 4.5:1.
  tintaTenue: forma.muted,

  // Lineas
  borde: forma.line,
  bordeFuerte: forma.lineStrong,

  // Accion principal (monocromatica) y seleccion (tinte `blue`)
  acento: forma.action,
  acentoSuave: forma.blue,
  // Sin borde decorativo: el borde toma el mismo tono del relleno.
  acentoBorde: forma.blue,

  velo: forma.scrim,

  // Estados de asistencia
  presente: forma.mintInk,
  presenteSuave: forma.mint,
  ausente: forma.roseInk,
  ausenteSuave: forma.rose,
  justificada: forma.peachInk,
  justificadaSuave: forma.peach,
  sinRegistro: forma.muted,
  sinRegistroSuave: forma.fill,

  // Estado de jornada
  enCurso: forma.mintInk,
  enCursoSuave: forma.mint,
  programada: forma.blueInk,
  programadaSuave: forma.blue,
  completada: forma.lilacInk,
  completadaSuave: forma.lilac,
  cancelada: forma.roseInk,
  canceladaSuave: forma.rose,

  info: forma.blueInk,
  infoSuave: forma.blue,

  // Alias heredados: mantienen el mismo significado para no romper referencias.
  fondo: forma.canvas,
  texto: forma.ink,
  textoSuave: forma.muted,
  primario: forma.action,
  primarioSuave: forma.blue,
  exito: forma.mintInk,
  exitoSuave: forma.mint,
  exitoBorde: forma.mint,
  exitoPunto: forma.mintInk,
  azulBorde: forma.blue,
  azulPunto: forma.blueInk,
  grisSuave: forma.fill,
  grisPunto: forma.muted,
  grisTexto: forma.muted,
} as const;

/** Escala de Forma: space-4 ... space-40. */
export const espaciados = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  /** Padding de superficies tonales (Notice). */
  tonal: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/** El radio responde al tamano: exterior = interior + inset. */
export const radios = {
  /** Campos de texto (radius-field). */
  campo: 17,
  /** Tarjetas de lista y filas (radius-lg). */
  tarjeta: 24,
  /** Superficies tonales y tarjetas de pantalla (radius-surface). */
  superficie: 28,
  /** Modales y hojas (radius-modal). */
  modal: 32,
  pill: 999,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28,
} as const;

/**
 * Escala de tamanos y areas tactiles (Forma + minimo Android Material de 48 dp):
 * - toque: 48 dp (area tactil minima; si el dibujo es menor, agregar `hitSlop`)
 * - control: 48 dp (altura estandar de botones, campos y selectores)
 * - controlCompacto: 40 dp (controles en fila como P/A/J; combinar con `hitSlop={4}`)
 * - objetivo: 44 dp (dibujo de iconos circulares o `Boton tamano="sm"`; usar `hitSlop={4}`)
 * - fila: 64 dp (altura minima de filas en listas)
 * - indicador: 26 dp (pastillas e indicadores)
 * - iconoSm / icono / iconoLg: 16 / 20 / 24 dp
 * - barraSuperior / barraPestanas: 56 dp
 */
export const tamanos = {
  toque: 48,
  control: 48,
  controlCompacto: 40,
  objetivo: 44,
  fila: 64,
  indicador: 26,
  iconoSm: 16,
  icono: 20,
  iconoLg: 24,
  barraSuperior: 56,
  barraPestanas: 56,
} as const;

/**
 * Escala tipografica de Forma, con los nombres en uso:
 * micro = pill/eyebrow, cuerpoSm = body-sm, cuerpo = body,
 * tituloSm = subheading, titulo = heading, display = title.
 */
export const tipografia = {
  micro: 12,
  cuerpoSm: 14,
  cuerpo: 16,
  tituloSm: 17,
  titulo: 26,
  display: 32,
  /** Cifra principal de un indicador (metric). */
  metrica: 40,
  /** Valor dentro de un indicador integrado (metric-sm). */
  metricaSm: 19,
} as const;

export const interlineado = {
  micro: 16,
  error: 18,
  cuerpoSm: 20,
  cuerpo: 24,
  tituloSm: 22,
  titulo: 30,
  display: 36,
  metrica: 40,
  metricaSm: 22,
} as const;

/** Interletrado negativo de los titulos de Forma, en px. */
export const interletrado = {
  tituloSm: -0.4,
  titulo: -1.2,
  display: -1.6,
  metrica: -2.2,
  metricaSm: -0.95,
} as const;

/**
 * Instrument Sans (Forma), un archivo por peso. En Android `fontWeight` no
 * elige el peso de una fuente propia: cada estilo usa la familia de su peso.
 * Se cargan en `app/_layout.tsx`.
 */
export const fuentes = {
  normal: 'InstrumentSans_400Regular',
  medio: 'InstrumentSans_500Medium',
  fuerte: 'InstrumentSans_600SemiBold',
  negrita: 'InstrumentSans_700Bold',
} as const;

/** Usar `fuentes` en los estilos; `pesos` queda solo como referencia. */
export const pesos = {
  normal: '400',
  medio: '500',
  fuerte: '600',
} as const;

/** Cifras de ancho fijo: horas, duraciones, tasas y contadores. */
export const cifrasTabulares = { fontVariant: ['tabular-nums'] } as const;

/** Forma no usa sombras: la profundidad vive en el contraste tonal. */
export const sombras = {
  flotante: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
