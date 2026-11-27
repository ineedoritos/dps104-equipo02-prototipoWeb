import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ESTADO_JORNADA, Estado } from '@/components/ui/Estado';
import { Icono } from '@/components/ui/Icono';
import { formatearDia } from '@/lib/fecha';
import { cifrasTabulares, colores, espaciados, fuentes, radios, tipografia } from '@/lib/tema';
import type { Actividad } from '@/types/actividad';

export interface ActivityRowProps {
  activity: Actividad;
  onPress?: () => void;
}

/** Fila densa de la lista: mismo peso visual para todas las jornadas. */
export function ActivityRow({ activity, onPress }: ActivityRowProps) {
  const estado = ESTADO_JORNADA[activity.status];
  const fecha = formatearDia(activity.date, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  const contenido = (
    <View style={styles.fila}>
      <View style={styles.cuerpo}>
        <View style={styles.filaSuperior}>
          <Text style={styles.fecha}>{fecha}</Text>
          <Estado etiqueta={estado.etiqueta} tono={estado.tono} />
        </View>

        <Text numberOfLines={2} style={styles.titulo}>
          {activity.title}
        </Text>

        <View style={styles.meta}>
          <Icono color={colores.tintaSuave} nombre="reloj" tamano={14} />
          <Text style={styles.hora}>
            {activity.startTime}
            {activity.endTime ? ` – ${activity.endTime}` : ''}
          </Text>
          <Text style={styles.separador}>·</Text>
          <Icono color={colores.tintaSuave} nombre="lugar" tamano={14} />
          <Text numberOfLines={1} style={styles.ubicacion}>
            {activity.location}
          </Text>
        </View>

        <View style={styles.estadisticas}>
          <Text style={styles.estadistica}>
            <Text style={styles.estadisticaNumero}>{activity.participants}</Text> participantes
          </Text>
          <Text style={styles.separador}>·</Text>
          <Text style={styles.estadistica}>
            <Text style={styles.estadisticaNumero}>{activity.evidenceCount}</Text> evidencias
          </Text>
        </View>
      </View>

      <Icono color={colores.tintaTenue} nombre="avanzar" tamano={18} />
    </View>
  );

  if (!onPress) {
    return <View style={styles.tarjeta}>{contenido}</View>;
  }

  return (
    <Pressable
      accessibilityHint="Abre el detalle de la jornada"
      accessibilityLabel={`${activity.title}, ${estado.etiqueta}`}
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
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    padding: espaciados.lg,
  },
  presionado: {
    backgroundColor: colores.superficieAlt,
  },
  fila: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.md,
  },
  cuerpo: {
    flex: 1,
    gap: espaciados.xs,
  },
  filaSuperior: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fecha: {
    ...cifrasTabulares,
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontFamily: fuentes.fuerte,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.fuerte,
    lineHeight: 21,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
  },
  hora: {
    ...cifrasTabulares,
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  separador: {
    color: colores.tintaTenue,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  ubicacion: {
    color: colores.tintaSuave,
    flex: 1,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  estadisticas: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.xs,
    marginTop: 2,
  },
  estadistica: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.micro,
  },
  estadisticaNumero: {
    ...cifrasTabulares,
    color: colores.tinta,
    fontFamily: fuentes.fuerte,
  },
});
