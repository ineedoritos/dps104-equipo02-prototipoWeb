import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

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
        <Icono color={colores.acento} nombre={icono} tamano={26} />
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
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    gap: espaciados.sm,
    padding: espaciados.xl,
  },
  iconoFondo: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderRadius: radios.pill,
    height: 56,
    justifyContent: 'center',
    marginBottom: espaciados.xs,
    width: 56,
  },
  titulo: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.encabezado,
    textAlign: 'center',
  },
  descripcion: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpo,
    lineHeight: 22,
    maxWidth: 340,
    textAlign: 'center',
  },
  accion: {
    alignSelf: 'stretch',
    marginTop: espaciados.md,
  },
});
