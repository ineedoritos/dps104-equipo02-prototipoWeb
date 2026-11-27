import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, forma, fuentes, radios, tipografia } from '@/lib/tema';
import type { EstadoActividad, EstadoAsistencia } from '@/types/actividad';

export type TonoEstado =
  | 'presente'
  | 'ausente'
  | 'justificada'
  | 'sinRegistro'
  | 'enCurso'
  | 'programada'
  | 'completada'
  | 'cancelada'
  | 'pendiente'
  | 'resuelta'
  | 'rechazada';

type ConfiguracionEstado = {
  fondo: string;
  texto: string;
  etiqueta: string;
};

const CONFIGURACION: Record<TonoEstado, ConfiguracionEstado> = {
  presente: { fondo: colores.presenteSuave, texto: colores.presente, etiqueta: 'Presente' },
  ausente: { fondo: colores.ausenteSuave, texto: colores.ausente, etiqueta: 'Ausente' },
  justificada: {
    fondo: colores.justificadaSuave,
    texto: colores.justificada,
    etiqueta: 'Justificada',
  },
  sinRegistro: {
    fondo: colores.sinRegistroSuave,
    texto: colores.sinRegistro,
    etiqueta: 'Sin registro',
  },
  enCurso: { fondo: colores.enCursoSuave, texto: colores.enCurso, etiqueta: 'En curso' },
  programada: { fondo: colores.programadaSuave, texto: colores.programada, etiqueta: 'Programada' },
  completada: { fondo: colores.completadaSuave, texto: colores.completada, etiqueta: 'Finalizada' },
  cancelada: { fondo: colores.canceladaSuave, texto: colores.cancelada, etiqueta: 'Cancelada' },
  pendiente: { fondo: forma.peach, texto: forma.peachInk, etiqueta: 'Pendiente' },
  resuelta: { fondo: forma.mint, texto: forma.mintInk, etiqueta: 'Resuelta' },
  rechazada: { fondo: forma.rose, texto: forma.roseInk, etiqueta: 'Rechazada' },
};

/** Semántica única del estado de una jornada. */
export const ESTADO_JORNADA: Record<EstadoActividad, { tono: TonoEstado; etiqueta: string }> = {
  current: { tono: 'enCurso', etiqueta: 'En curso' },
  upcoming: { tono: 'programada', etiqueta: 'Programada' },
  completed: { tono: 'completada', etiqueta: 'Finalizada' },
};

/** Semántica única del estado de asistencia. */
export const ESTADO_ASISTENCIA: Record<EstadoAsistencia, { tono: TonoEstado; etiqueta: string }> = {
  presente: { tono: 'presente', etiqueta: 'Presente' },
  ausente: { tono: 'ausente', etiqueta: 'Ausente' },
  justificada: { tono: 'justificada', etiqueta: 'Justificada' },
};

/** Par fondo/texto de un tono, para controles que no son la etiqueta. */
export function coloresDeEstado(tono: TonoEstado): { fondo: string; texto: string } {
  const configuracion = CONFIGURACION[tono];
  return { fondo: configuracion.fondo, texto: configuracion.texto };
}

export interface EstadoProps {
  tono: TonoEstado;
  etiqueta?: string;
}

/**
 * Etiqueta de estado. El color nunca es la única señal: siempre hay texto.
 */
export function Estado({ tono, etiqueta }: EstadoProps) {
  const configuracion = CONFIGURACION[tono];

  return (
    <View style={[styles.chip, { backgroundColor: configuracion.fondo }]}>
      <View style={[styles.punto, { backgroundColor: configuracion.texto }]} />
      <Text style={[styles.texto, { color: configuracion.texto }]}>
        {etiqueta ?? configuracion.etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radios.pill,
    flexDirection: 'row',
    gap: espaciados.xs + 2,
    paddingHorizontal: espaciados.sm + 2,
    paddingVertical: espaciados.xs,
  },
  punto: {
    borderRadius: radios.pill,
    height: 6,
    width: 6,
  },
  texto: {
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
    lineHeight: 16,
  },
});
