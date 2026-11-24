import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

export default function GrupoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Tu grupo</Text>
        <Text style={styles.descripcion}>
          Aquí podrás consultar los detalles, integrantes y jornadas de tu grupo.
        </Text>
        <Text style={styles.nota}>
          Estamos preparando esta sección. Muy pronto tendrás toda la información a la mano.
        </Text>
      </View>
    </ScrollView>
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
  titulo: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '800',
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    marginTop: espaciados.sm,
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
