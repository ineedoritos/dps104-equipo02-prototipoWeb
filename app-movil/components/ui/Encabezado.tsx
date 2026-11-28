import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icono } from '@/components/ui/Icono';
import { colores, espaciados, forma, fuentes, interletrado, tamanos, tipografia } from '@/lib/tema';

export interface EncabezadoProps {
  titulo: string;
  /** Si se pasa, muestra el boton de volver a la izquierda. */
  onVolver?: () => void;
  /** Accion opcional a la derecha (por ejemplo, Ajustes). */
  derecha?: ReactNode;
}

/**
 * Encabezado unico de la app: mismo fondo, titulo centrado y boton de volver.
 * Lo usan las pestañas principales, el marco del grupo y las pantallas de
 * formulario, para que todas se vean igual. Incluye el area segura superior.
 */
export function Encabezado({ titulo, onVolver, derecha }: EncabezadoProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barra, { paddingTop: insets.top + espaciados.xs }]}>
      {onVolver ? (
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onVolver}
          style={styles.lateral}
        >
          <Icono color={forma.ink} nombre="volver" tamano={22} />
        </Pressable>
      ) : (
        <View style={styles.lateral} />
      )}

      <View style={styles.centro}>
        <Text accessibilityRole="header" numberOfLines={1} style={styles.titulo}>
          {titulo}
        </Text>
      </View>

      <View style={styles.lateral}>{derecha}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    alignItems: 'center',
    backgroundColor: colores.papel,
    flexDirection: 'row',
    paddingBottom: espaciados.sm,
    paddingHorizontal: espaciados.md,
  },
  lateral: {
    alignItems: 'center',
    height: tamanos.objetivo,
    justifyContent: 'center',
    minWidth: tamanos.objetivo,
  },
  centro: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: espaciados.sm,
  },
  titulo: {
    color: forma.ink,
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
  },
});
