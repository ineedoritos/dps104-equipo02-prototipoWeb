// expo-router no reexporta este tipo desde la raiz del paquete.
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono, TRAZO_ICONO } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { espaciados, forma, fuentes, radios } from '@/lib/tema';

/** Icono de cada destino, por nombre de ruta. */
const ICONO_RUTA: Record<string, NombreIcono> = {
  index: 'gente',
  historial: 'reloj',
  cuenta: 'cuenta',
};

/** Inset igual en los cuatro lados: radio exterior = interior + inset (34 = 28 + 6). */
const INSET = 6;

/**
 * TabBar de Forma: capsula `paper` flotante con hasta cuatro destinos.
 * El activo va sobre una capsula `canvas` concentrica, en `ink` y trazo 2.1;
 * el resto en `muted`. La etiqueta siempre se ve.
 */
export function BarraTabs({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      style={[styles.zona, { paddingBottom: Math.max(insets.bottom, espaciados.lg) }]}
    >
      <View accessibilityRole="tablist" style={styles.barra}>
        {state.routes.map((ruta, indice) => {
          const { options } = descriptors[ruta.key];
          const activo = state.index === indice;
          const etiqueta = typeof options.title === 'string' ? options.title : ruta.name;
          const color = activo ? forma.ink : forma.muted;

          return (
            <Pressable
              accessibilityLabel={etiqueta}
              accessibilityRole="tab"
              accessibilityState={{ selected: activo }}
              key={ruta.key}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: ruta.key })}
              onPress={() => {
                const evento = emitter.emit({
                  type: 'tabPress',
                  target: ruta.key,
                  canPreventDefault: true,
                });
                if (!activo && !evento.defaultPrevented) {
                  navigateToTab(ruta.key);
                }
              }}
              style={({ pressed }) => [
                styles.destino,
                activo && styles.destinoActivo,
                pressed && styles.presionado,
              ]}
            >
              <Icono
                color={color}
                nombre={ICONO_RUTA[ruta.name] ?? 'inicio'}
                tamano={20}
                trazo={activo ? TRAZO_ICONO.activo : TRAZO_ICONO.normal}
              />
              <Text
                numberOfLines={1}
                style={[styles.etiqueta, { color }, activo && styles.etiquetaActiva]}
              >
                {etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zona: {
    backgroundColor: forma.canvas,
    paddingTop: espaciados.sm,
  },
  barra: {
    backgroundColor: forma.paper,
    borderRadius: radios.pill,
    flexDirection: 'row',
    gap: INSET,
    marginBottom: espaciados.sm,
    marginHorizontal: espaciados.xl,
    padding: INSET,
  },
  destino: {
    alignItems: 'center',
    borderRadius: radios.pill,
    flex: 1,
    gap: 2,
    height: 56,
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: espaciados.sm,
  },
  destinoActivo: {
    backgroundColor: forma.canvas,
  },
  presionado: {
    transform: [{ scale: 0.98 }],
  },
  etiqueta: {
    fontFamily: fuentes.medio,
    fontSize: 12,
    lineHeight: 16,
  },
  etiquetaActiva: {
    fontFamily: fuentes.fuerte,
  },
});
