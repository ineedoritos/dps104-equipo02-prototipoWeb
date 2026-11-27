import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { espaciados, forma, fuentes, radios, tipografia } from '@/lib/tema';

export interface OpcionTarjeta<T extends string> {
  valor: T;
  titulo: string;
  icono: NombreIcono;
}

export interface SelectorTarjetaProps<T extends string> {
  opciones: OpcionTarjeta<T>[];
  valor: T;
  onCambiar: (valor: T) => void;
  accessibilityLabel: string;
}

/**
 * Opciones excluyentes en tarjetas de igual ancho (grid de flex 1).
 * La seleccionada va en tinte `blue` con texto e icono `blueInk`; las demas
 * en gris `fill`. La seleccion se ve por color y por el texto.
 */
export function SelectorTarjeta<T extends string>({
  opciones,
  valor,
  onCambiar,
  accessibilityLabel,
}: SelectorTarjetaProps<T>) {
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" style={styles.fila}>
      {opciones.map((opcion) => {
        const activo = opcion.valor === valor;
        const color = activo ? forma.blueInk : forma.muted;
        return (
          <Pressable
            key={opcion.valor}
            accessibilityRole="radio"
            accessibilityState={{ checked: activo }}
            onPress={() => onCambiar(opcion.valor)}
            style={({ pressed }) => [
              styles.tarjeta,
              { backgroundColor: activo ? forma.blue : forma.fill },
              pressed && styles.presionada,
            ]}
          >
            <View style={[styles.iconoFondo, { backgroundColor: forma.paper }]}>
              <Icono color={color} nombre={opcion.icono} tamano={20} />
            </View>
            <Text style={[styles.titulo, { color: activo ? forma.blueInk : forma.ink }]}>
              {opcion.titulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: espaciados.sm,
  },
  tarjeta: {
    alignItems: 'center',
    borderRadius: radios.lg,
    flex: 1,
    gap: espaciados.sm,
    minHeight: 76,
    justifyContent: 'center',
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.md,
  },
  presionada: {
    transform: [{ scale: 0.98 }],
  },
  iconoFondo: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  titulo: {
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpoSm,
    textAlign: 'center',
  },
});
