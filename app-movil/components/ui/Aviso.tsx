import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { colores, espaciados, fuentes, radios, tipografia } from '@/lib/tema';

export type TipoAviso = 'error' | 'exito' | 'info';

export interface AvisoProps {
  tipo: TipoAviso;
  texto: string;
  accion?: ReactNode;
}

const CONFIGURACION: Record<TipoAviso, { fondo: string; texto: string; borde: string; icono: NombreIcono }> = {
  error: {
    fondo: colores.ausenteSuave,
    texto: colores.ausente,
    borde: colores.ausenteSuave,
    icono: 'alerta',
  },
  exito: {
    fondo: colores.presenteSuave,
    texto: colores.presente,
    borde: colores.presenteSuave,
    icono: 'hecho',
  },
  info: {
    fondo: colores.infoSuave,
    texto: colores.info,
    borde: colores.infoSuave,
    icono: 'info',
  },
};

export function Aviso({ tipo, texto, accion }: AvisoProps) {
  const configuracion = CONFIGURACION[tipo];

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.contenedor,
        { backgroundColor: configuracion.fondo, borderColor: configuracion.borde },
      ]}
    >
      <Icono color={configuracion.texto} nombre={configuracion.icono} tamano={21} />
      <View style={styles.cuerpo}>
        <Text style={[styles.texto, { color: configuracion.texto }]}>{texto}</Text>
        {accion}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'flex-start',
    // Superficie tonal de Forma: el borde toma el tono del fondo, sin sombra.
    borderRadius: radios.superficie,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espaciados.md,
    padding: espaciados.tonal,
  },
  cuerpo: {
    flex: 1,
    gap: espaciados.xs,
  },
  texto: {
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.medio,
    lineHeight: 20,
  },
});
