import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro';

export interface BotonProps {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBoton;
  icono?: NombreIcono;
  tamano?: 'md' | 'sm';
  deshabilitado?: boolean;
  cargando?: boolean;
  estilo?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const COLORES_VARIANTE: Record<VarianteBoton, { fondo: string; texto: string; borde: string }> = {
  primario: { fondo: colores.acento, texto: colores.superficie, borde: colores.acento },
  secundario: { fondo: colores.superficie, texto: colores.tinta, borde: colores.bordeFuerte },
  fantasma: { fondo: 'transparent', texto: colores.acento, borde: 'transparent' },
  peligro: { fondo: colores.ausenteSuave, texto: colores.ausente, borde: colores.ausenteSuave },
};

export function Boton({
  titulo,
  onPress,
  variante = 'primario',
  icono,
  tamano = 'md',
  deshabilitado = false,
  cargando = false,
  estilo,
  accessibilityLabel,
}: BotonProps) {
  const paleta = COLORES_VARIANTE[variante];
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityRole="button"
      accessibilityState={{ busy: cargando, disabled: inactivo }}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        tamano === 'sm' ? styles.tamanoSm : styles.tamanoMd,
        { backgroundColor: paleta.fondo, borderColor: paleta.borde },
        pressed && styles.presionado,
        inactivo && styles.inactivo,
        estilo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={paleta.texto} size="small" />
      ) : (
        <View style={styles.contenido}>
          {icono ? <Icono color={paleta.texto} nombre={icono} tamano={tamano === 'sm' ? 16 : 18} /> : null}
          <Text
            style={[
              styles.texto,
              tamano === 'sm' ? styles.textoSm : styles.textoMd,
              { color: paleta.texto },
            ]}
          >
            {titulo}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radios.pill,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  tamanoMd: {
    minHeight: 48,
  },
  tamanoSm: {
    minHeight: 48,
    paddingHorizontal: espaciados.md,
  },
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  texto: {
    flexShrink: 1,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  textoMd: {
    fontSize: tipografia.cuerpo,
  },
  textoSm: {
    fontSize: tipografia.cuerpoSm,
  },
  presionado: {
    opacity: 0.82,
  },
  inactivo: {
    opacity: 0.45,
  },
});
