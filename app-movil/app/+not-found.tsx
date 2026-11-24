import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>No encontramos esta pantalla</Text>
        <Text style={styles.descripcion}>Verifica la ruta o vuelve al inicio de la app.</Text>
        <Link href="/" asChild>
          <Pressable style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}>
            <Text style={styles.textoBoton}>Volver al inicio</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciados.lg,
    backgroundColor: colores.fondo,
  },
  titulo: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    marginTop: espaciados.sm,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: colores.primario,
    borderRadius: radios.md,
    marginTop: espaciados.lg,
    paddingHorizontal: espaciados.lg,
    paddingVertical: espaciados.sm + 4,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  textoBoton: {
    color: colores.superficie,
    fontSize: 16,
    fontWeight: '600',
  },
});
