import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { PerfilCuentaCard } from '@/components/cuenta/PerfilCuentaCard';
import { SesionCuentaCard } from '@/components/cuenta/SesionCuentaCard';
import usuarioJson from '@/data/usuario.json';
import { colores, espaciados } from '@/lib/tema';
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
      <PerfilCuentaCard nombre={nombre} />
      <SesionCuentaCard onCerrarSesion={() => router.replace('/(auth)/login')} />
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
});
