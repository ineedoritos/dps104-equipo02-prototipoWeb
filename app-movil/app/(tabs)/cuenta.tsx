import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import usuarioJson from '@/data/usuario.json';
import { useAuth } from '@/lib/auth';
import { colores, espaciados, radios } from '@/lib/tema';
import type { Usuario } from '@/types/actividad';

const usuarioDemo = usuarioJson as Usuario;

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function CuentaScreen() {
  const router = useRouter();
  const { usuario, cerrarSesion } = useAuth();
  const nombre = capitalizar(usuario?.name ?? usuarioDemo.name);

  const manejarCerrarSesion = () => {
    cerrarSesion();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{nombre.charAt(0)}</Text>
        </View>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.rol}>Miembro de la comunidad</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Información personal</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <Text style={styles.valor}>{nombre}</Text>
        </View>

        {usuario?.email ? (
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Correo</Text>
            <Text style={styles.valor}>{usuario.email}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Sesión</Text>
        <Text style={styles.descripcion}>
          Administra el acceso a tu cuenta en este dispositivo.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={manejarCerrarSesion}
          style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
        >
          <Text style={styles.botonTexto}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: colores.fondo,
    flexGrow: 1,
    gap: espaciados.md,
    padding: espaciados.md,
    paddingBottom: espaciados.xl,
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
