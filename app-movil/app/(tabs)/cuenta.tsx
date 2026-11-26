import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui/Boton';
import usuarioJson from '@/data/usuario.json';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';
import type { Usuario } from '@/types/actividad';

const usuario = usuarioJson as Usuario;

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function CuentaScreen() {
  const router = useRouter();
  const nombre = capitalizar(usuario.name);

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{nombre.charAt(0)}</Text>
        </View>
        <View style={styles.perfilInfo}>
          <Text accessibilityRole="header" style={styles.nombre}>
            {nombre}
          </Text>
          <Text style={styles.rol}>Participante</Text>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Información personal</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <Text style={styles.valor}>{nombre}</Text>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Sesión</Text>
        <Text style={styles.descripcion}>
          Administra el acceso a tu cuenta en este dispositivo.
        </Text>

        <Boton
          estilo={styles.boton}
          onPress={() => router.replace('/(auth)/login')}
          titulo="Cerrar sesión"
          variante="secundario"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: colores.papel,
    flexGrow: 1,
    gap: espaciados.lg,
    padding: espaciados.lg,
    paddingBottom: espaciados.xxl,
  },
  perfil: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: espaciados.md,
    paddingVertical: espaciados.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colores.acentoSuave,
    borderColor: colores.acentoBorde,
    borderRadius: radios.pill,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarTexto: {
    color: colores.acento,
    fontSize: tipografia.display,
    fontWeight: pesos.fuerte,
  },
  perfilInfo: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontWeight: pesos.fuerte,
    letterSpacing: -0.2,
  },
  rol: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    borderWidth: 1,
    padding: espaciados.lg,
  },
  tituloTarjeta: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    fontWeight: pesos.fuerte,
  },
  fila: {
    alignItems: 'center',
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: espaciados.md,
    paddingTop: espaciados.md,
  },
  etiqueta: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
  },
  valor: {
    color: colores.tinta,
    fontSize: tipografia.cuerpoSm,
    fontWeight: pesos.medio,
  },
  descripcion: {
    color: colores.tintaSuave,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 19,
    marginTop: espaciados.xs,
  },
  boton: {
    marginTop: espaciados.lg,
  },
});
