import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/ui/Boton';
import { cerrarSesion, obtenerSesionActual } from '@/lib/gruposStore';
import { colores, espaciados, fuentes, interletrado, radios, tipografia } from '@/lib/tema';
import type { UsuarioCuenta } from '@/types/dominio';

export default function CuentaScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioCuenta | null>(() => obtenerSesionActual());

  useFocusEffect(
    useCallback(() => {
      const sesion = obtenerSesionActual();
      if (!sesion) {
        router.replace('/(auth)/login');
        return;
      }
      setUsuario(sesion);
    }, [router]),
  );

  if (!usuario) {
    return null;
  }

  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || 'U';

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <View style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <View style={styles.perfilInfo}>
          <Text accessibilityRole="header" style={styles.nombre}>
            {usuario.nombre}
          </Text>
          <Text style={styles.correo}>{usuario.correo}</Text>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Información personal</Text>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <Text style={styles.valor}>{usuario.nombre}</Text>
        </View>

        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Correo</Text>
          <Text style={styles.valor}>{usuario.correo}</Text>
        </View>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloTarjeta}>Sesión</Text>
        <Text style={styles.descripcion}>
          Hay un solo tipo de cuenta. Tu rol se define dentro de cada grupo.
        </Text>

        <Boton
          estilo={styles.boton}
          onPress={() => {
            cerrarSesion();
            router.replace('/(auth)/login');
          }}
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
    letterSpacing: interletrado.display,
    fontFamily: fuentes.fuerte,
  },
  perfilInfo: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    color: colores.tinta,
    fontSize: tipografia.titulo,
    fontFamily: fuentes.fuerte,
    letterSpacing: -0.2,
  },
  correo: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.tarjeta,
    padding: espaciados.lg,
  },
  tituloTarjeta: {
    color: colores.tinta,
    fontSize: tipografia.tituloSm,
    letterSpacing: interletrado.tituloSm,
    fontFamily: fuentes.fuerte,
  },
  fila: {
    alignItems: 'center',
    borderTopColor: colores.borde,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: espaciados.md,
    justifyContent: 'space-between',
    marginTop: espaciados.md,
    paddingTop: espaciados.md,
  },
  etiqueta: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
  },
  valor: {
    color: colores.tinta,
    flexShrink: 1,
    fontSize: tipografia.cuerpo,
    fontFamily: fuentes.medio,
    textAlign: 'right',
  },
  descripcion: {
    color: colores.tintaSuave,
    fontFamily: fuentes.normal,
    fontSize: tipografia.cuerpoSm,
    lineHeight: 20,
    marginTop: espaciados.xs,
  },
  boton: {
    marginTop: espaciados.lg,
  },
});
