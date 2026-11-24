import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';
import type { Actividad, EstadoActividad } from '@/types/actividad';

type ConfiguracionEstado = {
  etiqueta: string;
  fondoInsignia: string;
  bordeInsignia: string;
  colorTexto: string;
  colorBorde: string;
  colorPunto: string;
};

const CONFIGURACION_ESTADO: Record<EstadoActividad, ConfiguracionEstado> = {
  current: {
    etiqueta: 'En curso',
    fondoInsignia: colores.exitoSuave,
    bordeInsignia: colores.exitoBorde,
    colorTexto: colores.exito,
    colorBorde: colores.exitoPunto,
    colorPunto: colores.exitoPunto,
  },
  upcoming: {
    etiqueta: 'Próxima',
    fondoInsignia: colores.primarioSuave,
    bordeInsignia: colores.azulBorde,
    colorTexto: colores.primario,
    colorBorde: colores.azulPunto,
    colorPunto: colores.azulPunto,
  },
  completed: {
    etiqueta: 'Completada',
    fondoInsignia: colores.grisSuave,
    bordeInsignia: colores.borde,
    colorTexto: colores.grisTexto,
    colorBorde: colores.grisPunto,
    colorPunto: colores.grisPunto,
  },
};

type Props = {
  actividad: Actividad;
};

export function ActivityCard({ actividad }: Props) {
  const configuracion = CONFIGURACION_ESTADO[actividad.status];

  return (
    <View style={[styles.tarjeta, { borderTopColor: configuracion.colorBorde }]}>
      <View style={styles.filaSuperior}>
        <View
          style={[
            styles.insignia,
            {
              backgroundColor: configuracion.fondoInsignia,
              borderColor: configuracion.bordeInsignia,
            },
          ]}
        >
          <View style={[styles.punto, { backgroundColor: configuracion.colorPunto }]} />
          <Text style={[styles.insigniaTexto, { color: configuracion.colorTexto }]}>
            {configuracion.etiqueta}
          </Text>
        </View>

        <Text style={styles.fecha}>
          {actividad.date} · {actividad.startTime}
        </Text>
      </View>

      <Text style={styles.titulo}>{actividad.title}</Text>
      <Text style={styles.descripcion}>{actividad.description}</Text>

      <View style={styles.divisor} />

      <View style={styles.ubicacion}>
        <Text style={styles.icono}>📍</Text>
        <Text style={styles.ubicacionTexto}>{actividad.location}</Text>
      </View>

      <View style={styles.estadisticas}>
        <Text style={styles.estadistica}>
          👥 <Text style={styles.estadisticaFuerte}>{actividad.participants}</Text> participantes
        </Text>
        <Text style={styles.estadistica}>
          📸 <Text style={styles.estadisticaFuerte}>{actividad.evidenceCount}</Text> evidencias
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderTopWidth: 4,
    borderWidth: 1,
    elevation: 2,
    padding: espaciados.lg,
    shadowColor: colores.texto,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  filaSuperior: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
    justifyContent: 'space-between',
    marginBottom: espaciados.md,
  },
  insignia: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  punto: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  insigniaTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  fecha: {
    color: colores.textoSuave,
    fontSize: 12,
    fontWeight: '500',
  },
  titulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  descripcion: {
    color: colores.grisTexto,
    fontSize: 14,
    lineHeight: 21,
    marginTop: espaciados.sm,
  },
  divisor: {
    backgroundColor: colores.grisSuave,
    height: 1,
    marginVertical: espaciados.md,
  },
  ubicacion: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  icono: {
    fontSize: 13,
  },
  ubicacionTexto: {
    color: colores.grisTexto,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  estadisticas: {
    backgroundColor: colores.grisSuave,
    borderRadius: radios.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.sm,
    justifyContent: 'space-between',
    marginTop: espaciados.sm + 4,
    paddingHorizontal: 12,
    paddingVertical: espaciados.sm,
  },
  estadistica: {
    color: colores.textoSuave,
    fontSize: 12,
  },
  estadisticaFuerte: {
    color: colores.texto,
    fontWeight: '700',
  },
});
