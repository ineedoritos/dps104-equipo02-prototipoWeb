import { BottomSheetModal, BottomSheetView } from '@expo/ui/community/bottom-sheet';
import type { BottomSheetMethods } from '@expo/ui/community/bottom-sheet';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/ui/Icono';
import type { NombreIcono } from '@/components/ui/Icono';
import { espaciados, forma, fuentes, radios, tipografia } from '@/lib/tema';

export interface AccionHoja {
  etiqueta: string;
  icono: NombreIcono;
  /** Acción destructiva: se pinta en rosa. */
  peligro?: boolean;
  onPress: () => void;
}

export interface HojaAccionesProps {
  visible: boolean;
  acciones: AccionHoja[];
  onCerrar: () => void;
}

/**
 * Hoja inferior de acciones (Sheet de Forma), sobre la hoja nativa de Expo UI.
 * La acción elegida se ejecuta cuando la hoja ya se cerró, para que no choque
 * con otros modales que se abran después.
 */
export function HojaAcciones({ visible, acciones, onCerrar }: HojaAccionesProps) {
  const hoja = useRef<BottomSheetMethods>(null);
  const pendiente = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (visible) {
      hoja.current?.present();
    } else {
      hoja.current?.dismiss();
    }
  }, [visible]);

  const elegir = (accion: AccionHoja) => {
    pendiente.current = accion.onPress;
    hoja.current?.dismiss();
  };

  return (
    <BottomSheetModal
      // Sin esto la hoja no se cierra al tocar afuera ni con el botón atrás (en Android).
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: forma.paper }}
      onDismiss={() => {
        onCerrar();
        const accion = pendiente.current;
        pendiente.current = null;
        accion?.();
      }}
      ref={hoja}
    >
      <BottomSheetView style={styles.contenedor}>
        {acciones.map((accion) => {
          const color = accion.peligro ? forma.roseInk : forma.ink;
          return (
            <Pressable
              accessibilityLabel={accion.etiqueta}
              accessibilityRole="button"
              key={accion.etiqueta}
              onPress={() => elegir(accion)}
              style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
            >
              <View
                style={[
                  styles.iconoFondo,
                  { backgroundColor: accion.peligro ? forma.rose : forma.fill },
                ]}
              >
                <Icono color={color} nombre={accion.icono} tamano={19} />
              </View>
              <Text style={[styles.texto, { color }]}>{accion.etiqueta}</Text>
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.xs,
    paddingBottom: espaciados.xxl,
    paddingHorizontal: espaciados.lg,
    paddingTop: espaciados.sm,
  },
  fila: {
    alignItems: 'center',
    borderRadius: radios.lg,
    flexDirection: 'row',
    gap: espaciados.md,
    minHeight: 56,
    paddingHorizontal: espaciados.sm,
  },
  presionada: {
    backgroundColor: forma.fillHover,
  },
  iconoFondo: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  texto: {
    fontFamily: fuentes.fuerte,
    fontSize: tipografia.cuerpo,
  },
});
