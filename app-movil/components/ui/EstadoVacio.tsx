import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { colores, espaciados, forma, fuentes, interletrado, interlineado, radios, tipografia } from '@/lib/tema';

export interface EstadoVacioProps {
  icono: NombreIcono;
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

export function EstadoVacio({ icono, titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.iconoFondo}>
        <Icono color={forma.blueInk} nombre={icono} tamano={28} />
      </View>
      <Text accessibilityRole="header" style={styles.titulo}>
        {titulo}
      </Text>
      <Text style={styles.descripcion}>{descripcion}</Text>
      {accion ? <View style={styles.accion}>{accion}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    // Centrado sobre `paper`, sin borde; aire vertical `space-32`.
    backgroundColor: forma.paper,
    borderRadius: radios.superficie,
    gap: espaciados.sm,
    paddingHorizontal: espaciados.xl,
    paddingVertical: espaciados.xxl,
  },
  iconoFondo: {
    alignItems: 'center',
    backgroundColor: forma.blue,
    borderRadius: radios.pill,
    height: 66,
    justifyContent: 'center',
    marginBottom: espaciados.xs,
    width: 66,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontFamily: fuentes.fuerte,
    letterSpacing: interletrado.tituloSm,
    lineHeight: interlineado.tituloSm,
    textAlign: 'center',
  },
  descripcion: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: interlineado.cuerpoSm,
    textAlign: 'center',
  },
  accion: {
    alignSelf: 'stretch',
    marginTop: espaciados.sm,
  },
});
