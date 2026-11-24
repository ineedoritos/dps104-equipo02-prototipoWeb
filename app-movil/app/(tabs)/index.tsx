import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radios } from '@/lib/tema';

type GrupoDemo = {
  id: string;
  nombre: string;
  detalle: string;
  rol: string;
};

const GRUPOS_DEMO: GrupoDemo[] = [
  {
    id: 'iglesia-demo',
    nombre: 'Iglesia',
    detalle: 'Pase de lista manual · control de horas',
    rol: 'Responsable',
  },
  {
    id: 'banco-alimentos-demo',
    nombre: 'Banco de alimentos',
    detalle: 'Registro por QR · control de horas',
    rol: 'Participante',
  },
];

export default function MisGruposScreen() {
  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <View style={styles.bienvenida}>
        <Text style={styles.saludo}>Hola, Mariana</Text>
        <Text style={styles.descripcion}>
          Estos son tus grupos. Toca uno para abrir su pantalla interna.
        </Text>
      </View>

      <Text style={styles.seccion}>Mis grupos</Text>

      {GRUPOS_DEMO.map((grupo) => (
        <Link
          key={grupo.id}
          href={{ pathname: '/grupos/[grupoId]', params: { grupoId: grupo.id } }}
          asChild
        >
          <Pressable style={({ pressed }) => [styles.tarjeta, pressed && styles.tarjetaPresionada]}>
            <View style={styles.tarjetaTexto}>
              <Text style={styles.nombreGrupo}>{grupo.nombre}</Text>
              <Text style={styles.detalleGrupo}>{grupo.detalle}</Text>
              <Text style={styles.rolGrupo}>{grupo.rol}</Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
        </Link>
      ))}

      <Text style={styles.nota}>
        Datos de ejemplo de SETUP-01. La carga real de grupos llega con HU02.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    backgroundColor: colores.fondo,
    flexGrow: 1,
    padding: espaciados.md,
  },
  bienvenida: {
    backgroundColor: colores.primarioSuave,
    borderRadius: radios.lg,
    padding: espaciados.lg,
  },
  saludo: {
    color: colores.texto,
    fontSize: 22,
    fontWeight: '800',
  },
  descripcion: {
    color: colores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    marginTop: espaciados.xs,
  },
  seccion: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: espaciados.sm,
    marginTop: espaciados.lg,
  },
  tarjeta: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: espaciados.sm,
    padding: espaciados.md,
  },
  tarjetaPresionada: {
    opacity: 0.9,
  },
  tarjetaTexto: {
    flex: 1,
  },
  nombreGrupo: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '700',
  },
  detalleGrupo: {
    color: colores.textoSuave,
    fontSize: 14,
    marginTop: espaciados.xs,
  },
  rolGrupo: {
    alignSelf: 'flex-start',
    backgroundColor: colores.exitoSuave,
    borderRadius: radios.sm,
    color: colores.exito,
    fontSize: 12,
    fontWeight: '700',
    marginTop: espaciados.sm,
    overflow: 'hidden',
    paddingHorizontal: espaciados.sm,
    paddingVertical: 2,
  },
  flecha: {
    color: colores.primario,
    fontSize: 28,
    fontWeight: '700',
    marginLeft: espaciados.sm,
  },
  nota: {
    color: colores.textoSuave,
    fontSize: 12,
    lineHeight: 18,
    marginTop: espaciados.md,
    textAlign: 'center',
  },
});
