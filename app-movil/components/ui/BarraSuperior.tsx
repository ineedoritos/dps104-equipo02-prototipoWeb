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
  mostrarVolver?: boolean;
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
  mostrarVolver = true,
}: BarraSuperiorProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.fondo}>
      <View style={styles.barra}>
        {mostrarVolver ? (
          <Pressable
            accessibilityLabel={accessibilityLabelVolver}
            accessibilityRole="button"
            onPress={onVolver ?? (() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)');
            })}
            style={({ pressed }) => [styles.botonIcono, pressed && styles.presionado]}
          >
            <Icono color={colores.tinta} nombre="volver" tamano={22} />
          </Pressable>
        ) : null}

        <Text
          accessibilityRole="header"
          numberOfLines={2}
          style={[styles.titulo, !mostrarVolver && styles.tituloRaiz]}
        >
          {titulo}
        </Text>

        {derecha ? <View style={styles.derecha}>{derecha}</View> : null}
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
    minHeight: 56,
    gap: espaciados.sm,
    paddingHorizontal: espaciados.lg,
    paddingVertical: espaciados.xs,
  },
  botonIcono: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 48,
    marginLeft: -espaciados.sm,
    justifyContent: 'center',
    width: 48,
  },
  presionado: {
    opacity: 0.7,
  },
  titulo: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
    paddingVertical: espaciados.xs,
  },
  tituloRaiz: {
    fontSize: tipografia.display,
    fontWeight: pesos.encabezado,
    letterSpacing: -0.6,
  },
  derecha: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
});
