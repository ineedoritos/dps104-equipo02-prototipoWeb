import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

type Props = {
  nombre: string;
  rol?: string;
};

export function PerfilCuentaCard({ nombre, rol = 'Miembro de la comunidad' }: Props) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{nombre.charAt(0)}</Text>
        </View>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.rol}>{rol}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Información personal</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <Text style={styles.valor}>{nombre}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.md,
  },
  perfil: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.xl,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colores.primarioSuave,
    borderRadius: 999,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  avatarTexto: {
    color: colores.primario,
    fontSize: 30,
    fontWeight: '800',
  },
  nombre: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '800',
    marginTop: espaciados.md,
  },
  rol: {
    color: colores.textoSuave,
    fontSize: 14,
    marginTop: espaciados.xs,
  },
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
  fila: {
    alignItems: 'center',
    borderTopColor: colores.grisSuave,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espaciados.md,
    paddingTop: espaciados.md,
  },
  etiqueta: {
    color: colores.textoSuave,
    fontSize: 14,
  },
  valor: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '600',
  },
});
