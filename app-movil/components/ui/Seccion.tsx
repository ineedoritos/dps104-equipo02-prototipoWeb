import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colores, espaciados, pesos, tipografia } from '@/lib/tema';

export interface SeccionProps {
  titulo: string;
  detalle?: string;
  accion?: ReactNode;
  children?: ReactNode;
  estilo?: StyleProp<ViewStyle>;
}

export function Seccion({ titulo, detalle, accion, children, estilo }: SeccionProps) {
  return (
    <View style={[styles.contenedor, estilo]}>
      <View style={styles.encabezado}>
        <View style={styles.titulos}>
          <Text accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </Text>
          {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
        </View>
        {accion}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.md,
  },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.md,
    justifyContent: 'space-between',
  },
  titulos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  detalle: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    lineHeight: 15,
  },
});
