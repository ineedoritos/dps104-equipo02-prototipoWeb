import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

export default function GrupoScreen() {
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'Grupo' }} />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Pila interna</Text>
          <Text style={styles.titulo}>Vista del grupo</Text>
          <Text style={styles.identificador}>grupoId: {grupoId}</Text>
          <Text style={styles.descripcion}>
            Esta ruta demuestra la navegación en pila dentro de un grupo. Las pantallas de detalle,
            integrantes y jornadas llegan en sus historias de usuario.
          </Text>
          <Text style={styles.nota}>
            Usa la flecha del encabezado para regresar a las pestañas.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: colores.fondo,
    flexGrow: 1,
    padding: espaciados.md,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    backgroundColor: colores.primarioSuave,
    borderRadius: radios.sm,
    color: colores.primario,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    overflow: 'hidden',
    paddingHorizontal: espaciados.sm,
    paddingVertical: espaciados.xs,
  },
  titulo: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '800',
    marginTop: espaciados.md,
  },
  identificador: {
    color: colores.primario,
    fontFamily: 'monospace',
    fontSize: 14,
    marginTop: espaciados.sm,
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    marginTop: espaciados.md,
  },
  nota: {
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    color: colores.textoSuave,
    fontSize: 13,
    lineHeight: 19,
    marginTop: espaciados.lg,
    paddingTop: espaciados.md,
  },
});
