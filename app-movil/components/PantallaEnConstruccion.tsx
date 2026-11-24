import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

type Props = {
  historia: string;
  titulo: string;
  descripcion: string;
};

/**
 * Placeholder de UI para las pantallas que todavía no tienen historia de usuario.
 * No contiene lógica de negocio ni datos remotos (alcance de SETUP-01).
 */
export function PantallaEnConstruccion({ historia, titulo, descripcion }: Props) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>{historia}</Text>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
        <Text style={styles.nota}>
          Pantalla base de SETUP-01. Los datos y la lógica llegan con su historia de usuario.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
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
    fontSize: 20,
    fontWeight: '700',
    marginTop: espaciados.md,
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
