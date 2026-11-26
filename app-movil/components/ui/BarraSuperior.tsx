import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/components/ui/Icono';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

interface BarraSuperiorProps {
  titulo: string;
  onVolver?: () => void;
  accessibilityLabelVolver?: string;
  derecha?: ReactNode;
}

/**
 * Encabezado blanco unificado con `SafeAreaView` superior blanco para que la
 * barra de estado y el header mantengan consistencia visual en todas las vistas.
 */
export function BarraSuperior({
  titulo,
  onVolver,
  accessibilityLabelVolver = 'Volver',
  derecha,
}: BarraSuperiorProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.fondo}>
      <View style={styles.barra}>
        <Pressable
          accessibilityLabel={accessibilityLabelVolver}
          accessibilityRole="button"
          onPress={onVolver ?? (() => router.back())}
          style={({ pressed }) => [styles.botonIcono, pressed && styles.presionado]}
        >
          <Icono color={colores.tinta} nombre="volver" tamano={22} />
        </Pressable>

        <Text accessibilityRole="header" numberOfLines={1} style={styles.titulo}>
          {titulo}
        </Text>

        {derecha ? (
          <View style={styles.derecha}>{derecha}</View>
        ) : (
          <View style={styles.espacioDerecha} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fondo: {
    backgroundColor: colores.superficie,
  },
  barra: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderBottomColor: colores.borde,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.xs,
  },
  botonIcono: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  presionado: {
    opacity: 0.7,
  },
  titulo: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  derecha: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
  espacioDerecha: {
    width: 44,
  },
});
