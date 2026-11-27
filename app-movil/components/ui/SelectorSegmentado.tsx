import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, fuentes, radios, tipografia } from '@/lib/tema';

export interface OpcionSelector<T extends string> {
  valor: T;
  etiqueta: string;
  descripcion?: string;
}

interface SelectorSegmentadoProps<T extends string> {
  opciones: readonly OpcionSelector<T>[];
  valor: T;
  onChange: (nuevoValor: T) => void;
  deshabilitado?: boolean;
  accessibilityLabel?: string;
}

export function SelectorSegmentado<T extends string>({
  opciones,
  valor,
  onChange,
  deshabilitado = false,
  accessibilityLabel,
}: SelectorSegmentadoProps<T>) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      style={styles.lista}
    >
      {opciones.map((opcion) => {
        const seleccionado = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            accessibilityLabel={
              opcion.descripcion ? `${opcion.etiqueta}. ${opcion.descripcion}` : opcion.etiqueta
            }
            accessibilityRole="radio"
            accessibilityState={{ checked: seleccionado, disabled: deshabilitado }}
            disabled={deshabilitado}
            onPress={() => onChange(opcion.valor)}
            style={({ pressed }) => [
              styles.opcion,
              seleccionado && styles.opcionActiva,
              pressed && !deshabilitado && styles.opcionPresionada,
              deshabilitado && styles.opcionDeshabilitada,
            ]}
          >
            <View style={styles.radio}>
              {seleccionado ? <View style={styles.radioCentro} /> : null}
            </View>
            <View style={styles.opcionTexto}>
              <Text style={styles.tituloOpcion}>{opcion.etiqueta}</Text>
              {opcion.descripcion ? (
                <Text style={styles.descOpcion}>{opcion.descripcion}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: espaciados.md,
  },
  opcion: {
    alignItems: 'flex-start',
    // Forma: superficie tonal, sin borde decorativo.
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.campo,
    flexDirection: 'row',
    gap: espaciados.md,
    padding: espaciados.md,
  },
  opcionActiva: {
    backgroundColor: colores.acentoSuave,
  },
  opcionPresionada: {
    transform: [{ scale: 0.98 }],
  },
  opcionDeshabilitada: {
    opacity: 0.6,
  },
  radio: {
    alignItems: 'center',
    borderColor: colores.acento,
    borderRadius: radios.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    width: 20,
  },
  radioCentro: {
    backgroundColor: colores.acento,
    borderRadius: radios.pill,
    height: 10,
    width: 10,
  },
  opcionTexto: {
    flex: 1,
    gap: 2,
  },
  tituloOpcion: {
    color: colores.tinta,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpo,
  },
  descOpcion: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
  },
});
