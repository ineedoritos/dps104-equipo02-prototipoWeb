import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { colores, espaciados, forma, fuentes, radios, tamanos, tipografia } from '@/lib/tema';

export interface CampoTextoProps extends Omit<TextInputProps, 'style'> {
  etiqueta: string;
  error?: string;
  accesorio?: ReactNode;
  multilinea?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

export function CampoTexto({
  etiqueta,
  error,
  accesorio,
  multilinea = false,
  estilo,
  onBlur,
  onFocus,
  ...propiedades
}: CampoTextoProps) {
  const [enfocado, setEnfocado] = useState(false);
  // Anillo de foco de Forma: 2 px, sólido, con transición de 180 ms (0 si el sistema pide menos movimiento).
  const [anillo] = useState(() => new Animated.Value(0));
  const [reducirMovimiento, setReducirMovimiento] = useState(false);

  useEffect(() => {
    let activo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (activo) setReducirMovimiento(valor);
    });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    Animated.timing(anillo, {
      duration: reducirMovimiento ? 0 : 180,
      toValue: enfocado ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [enfocado, anillo, reducirMovimiento]);

  return (
    <View style={[styles.contenedor, estilo]}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>

      <View style={[styles.campoContenedor, error ? styles.campoConError : null]}>
        <Animated.View pointerEvents="none" style={[styles.anillo, { opacity: anillo }]} />
        <TextInput
          {...propiedades}
          multiline={multilinea}
          onBlur={(evento) => {
            setEnfocado(false);
            onBlur?.(evento);
          }}
          onFocus={(evento) => {
            setEnfocado(true);
            onFocus?.(evento);
          }}
          placeholderTextColor={colores.tintaTenue}
          style={[styles.campo, multilinea && styles.campoMultilinea]}
          textAlignVertical={multilinea ? 'top' : 'center'}
          underlineColorAndroid="transparent"
        />
        {accesorio}
      </View>

      {error ? <Text style={styles.textoError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.xs,
  },
  etiqueta: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontFamily: fuentes.fuerte,
    lineHeight: 18,
  },
  // Relleno tonal sin borde; el foco solo agrega el anillo.
  campoContenedor: {
    alignItems: 'center',
    backgroundColor: forma.fill,
    borderColor: forma.fill,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: tamanos.control,
  },
  // Separado 3 px del campo (inset negativo); el radio suma la separación para quedar concéntrico.
  anillo: {
    borderColor: forma.lineStrong,
    borderRadius: radios.campo + 3,
    borderWidth: 2,
    bottom: -3,
    left: -3,
    position: 'absolute',
    right: -3,
    top: -3,
  },
  campoConError: {
    backgroundColor: forma.rose,
    borderColor: forma.roseInk,
  },
  campo: {
    color: colores.tinta,
    flex: 1,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpo,
    minHeight: 46,
    paddingHorizontal: espaciados.lg,
    paddingVertical: espaciados.sm,
  },
  campoMultilinea: {
    minHeight: 96,
    paddingTop: espaciados.md,
  },
  textoError: {
    color: forma.roseInk,
    fontFamily: fuentes.normal,
    fontSize: 13,
    lineHeight: 18,
  },
});
