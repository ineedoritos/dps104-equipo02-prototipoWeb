import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

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

  return (
    <View style={[styles.contenedor, estilo]}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>

      <View
        style={[
          styles.campoContenedor,
          enfocado && styles.campoEnfocado,
          error ? styles.campoConError : null,
        ]}
      >
        <TextInput
          accessibilityLabel={etiqueta}
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
          placeholderTextColor={colores.tintaSuave}
          style={[styles.campo, multilinea && styles.campoMultilinea]}
          textAlignVertical={multilinea ? 'top' : 'center'}
          underlineColorAndroid="transparent"
        />
        {accesorio}
      </View>

      {error ? <Text accessibilityLiveRegion="polite" style={styles.textoError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.xs,
  },
  etiqueta: {
    color: colores.tintaSuave,
    fontSize: tipografia.micro,
    fontWeight: pesos.fuerte,
    letterSpacing: 0.2,
  },
  campoContenedor: {
    alignItems: 'center',
    backgroundColor: colores.superficieAlt,
    borderColor: colores.bordeFuerte,
    borderRadius: radios.campo,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  campoEnfocado: {
    backgroundColor: colores.superficie,
    borderColor: colores.acento,
  },
  campoConError: {
    borderColor: colores.ausente,
  },
  campo: {
    color: colores.tinta,
    flex: 1,
    fontSize: tipografia.cuerpo,
    minHeight: 46,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  campoMultilinea: {
    minHeight: 96,
    paddingTop: espaciados.md,
  },
  textoError: {
    color: colores.ausente,
    fontSize: tipografia.micro,
    lineHeight: 15,
  },
});
