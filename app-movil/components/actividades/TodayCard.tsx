import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ESTADO_JORNADA, Estado } from '@/components/ui/Estado';
import { Icono } from '@/components/ui/Icono';
import { cifrasTabulares, colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { Actividad } from '@/types/actividad';

export interface TodayCardProps {
  activity: Actividad;
  onPress?: () => void;
}

/** Jornada de hoy: la única superficie con acento pleno de la pantalla. */
export function TodayCard({ activity, onPress }: TodayCardProps) {
  const estado = ESTADO_JORNADA[activity.status];

  const contenido = (
    <>
      <View style={styles.filaSuperior}>
        <View style={styles.etiquetaHoy}>
          <View style={styles.punto} />
          <Text style={styles.textoHoy}>HOY</Text>
        </View>
        <Estado etiqueta={estado.etiqueta} tono={estado.tono} />
      </View>

      <Text style={styles.horario}>
        {activity.startTime}
        {activity.endTime ? ` – ${activity.endTime}` : ''}
      </Text>

      <Text style={styles.titulo}>{activity.title}</Text>

      <View style={styles.meta}>
        <Icono color={colores.tintaSuave} nombre="lugar" tamano={16} />
        <Text style={styles.metaTexto}>{activity.location}</Text>
      </View>

      <View style={styles.pie}>
        <View style={styles.estadisticas}>
          <View style={styles.estadistica}>
            <Icono color={colores.tintaSuave} nombre="gente" tamano={14} />
            <Text style={styles.estadisticaNumero}>{activity.participants}</Text>
            <Text style={styles.estadisticaTexto}>participantes</Text>
          </View>
          <View style={styles.estadistica}>
            <Icono color={colores.tintaSuave} nombre="camara" tamano={14} />
            <Text style={styles.estadisticaNumero}>{activity.evidenceCount}</Text>
            <Text style={styles.estadisticaTexto}>evidencias</Text>
          </View>
        </View>
        <Icono color={colores.acento} nombre="avanzar" tamano={18} />
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.tarjeta}>{contenido}</View>;
  }

  return (
    <Pressable
      accessibilityHint="Abre el detalle de la jornada"
      accessibilityLabel={activity.title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionado]}
    >
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
  presionado: {
    opacity: 0.9,
  },
  filaSuperior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  etiquetaHoy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs + 2,
  },
  punto: {
    backgroundColor: colores.acento,
    borderRadius: radios.pill,
    height: 6,
    width: 6,
  },
  textoHoy: {
    color: colores.acento,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
    letterSpacing: 1.2,
  },
  horario: {
    ...cifrasTabulares,
    color: colores.tinta,
    fontSize: tipografia.display,
    fontWeight: pesos.fuerte,
    letterSpacing: -0.4,
    lineHeight: tipografia.display + 8,
    marginTop: espaciados.xs,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
    lineHeight: 23,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs + 2,
  },
  metaTexto: {
    color: colores.tintaSuave,
    flex: 1,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 18,
  },
  pie: {
    alignItems: 'center',
    borderTopColor: colores.acentoBorde,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espaciados.xs,
    paddingTop: espaciados.md,
  },
  estadisticas: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.lg,
  },
  estadistica: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  estadisticaNumero: {
    ...cifrasTabulares,
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.fuerte,
  },
  estadisticaTexto: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
  },
});
