import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { espaciados, forma, fuentes, radios, tamanos, tipografia } from '@/lib/tema';

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
  primario: { fondo: forma.action, texto: forma.onAction, borde: forma.action },
  secundario: { fondo: forma.fill, texto: forma.ink, borde: forma.fill },
  fantasma: { fondo: 'transparent', texto: forma.ink, borde: 'transparent' },
  peligro: { fondo: forma.rose, texto: forma.roseInk, borde: forma.rose },
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
          {icono ? <Icono color={paleta.texto} nombre={icono} tamano={tamano === 'sm' ? 17 : 19} /> : null}
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
    paddingHorizontal: espaciados.xl,
  },
  tamanoMd: {
    minHeight: tamanos.control,
  },
  tamanoSm: {
    minHeight: tamanos.objetivo,
    paddingHorizontal: espaciados.lg,
  },
  contenido: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.sm,
    justifyContent: 'center',
  },
  texto: {
    fontFamily: fuentes.fuerte,
  },
  textoMd: {
    fontSize: tipografia.cuerpoSm,
    lineHeight: 18,
  },
  textoSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  presionado: {
    transform: [{ scale: 0.98 }],
  },
  inactivo: {
    opacity: 0.42,
  },
});
