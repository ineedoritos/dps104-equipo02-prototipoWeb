import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { alturaInteriorCampo, estilosCampo } from '@/components/ui/estilosCampo';
import { colores, espaciados, tipografia } from '@/lib/tema';

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
    <View style={[estilosCampo.contenedor, estilo]}>
      <Text style={estilosCampo.etiqueta}>{etiqueta}</Text>

      <View
        style={[
          estilosCampo.marco,
          enfocado && estilosCampo.enfocado,
          error ? estilosCampo.conError : null,
          propiedades.editable === false && estilosCampo.deshabilitado,
        ]}
      >
        <TextInput
          accessibilityLabel={etiqueta}
          selectionColor={colores.acentoBorde}
          cursorColor={colores.acento}
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

      {error ? <Text accessibilityLiveRegion="polite" style={estilosCampo.textoError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    color: colores.tinta,
    flex: 1,
    minWidth: 0,
    fontSize: tipografia.cuerpo,
    minHeight: alturaInteriorCampo,
    paddingHorizontal: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  campoMultilinea: {
    minHeight: 96,
    paddingTop: espaciados.md,
  },
});
