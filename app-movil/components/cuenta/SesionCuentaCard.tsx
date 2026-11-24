import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

type Props = {
  onCerrarSesion: () => void;
};

export function SesionCuentaCard({ onCerrarSesion }: Props) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.tituloTarjeta}>Sesión</Text>
      <Text style={styles.descripcion}>
        Administra el acceso a tu cuenta en este dispositivo.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onCerrarSesion}
        style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
      >
        <Text style={styles.botonTexto}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  tituloTarjeta: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '700',
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
    marginTop: espaciados.xs,
  },
  boton: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.bordeFuerte,
    borderRadius: radios.md,
    borderWidth: 1,
    marginTop: espaciados.md,
    paddingVertical: 12,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  botonTexto: {
    color: colores.grisTexto,
    fontSize: 14,
    fontWeight: '600',
  },
});
