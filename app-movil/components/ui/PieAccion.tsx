import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colores, espaciados } from '@/lib/tema';

export interface PieAccionProps {
  children: ReactNode;
  /**
   * Activar cuando la pantalla no envuelve el pie en `<SafeAreaView edges={['bottom']}>`,
   * para respetar el area segura inferior del dispositivo.
   */
  incluirAreaSegura?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

/**
 * Pie fijo en la zona del pulgar para formularios y pantallas con accion principal.
 * Mantiene el boton primario visible al fondo incluso cuando el teclado se abre.
 */
export function PieAccion({ children, incluirAreaSegura = false, estilo }: PieAccionProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.pie,
        incluirAreaSegura ? { paddingBottom: Math.max(insets.bottom, espaciados.lg) } : null,
        estilo,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pie: {
    backgroundColor: colores.superficie,
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    gap: espaciados.sm,
    padding: espaciados.lg,
  },
});
