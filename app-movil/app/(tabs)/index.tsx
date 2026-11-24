import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { BackHandler, Platform, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyActivityDashboard } from '@/components/actividades/MyActivityDashboard';
import usuarioJson from '@/data/usuario.json';
import { obtenerActividades } from '@/lib/mockStore';
import { colores, espaciados } from '@/lib/tema';
import type { Actividad, Usuario } from '@/types/actividad';

const usuario = usuarioJson as Usuario;

export default function InicioScreen() {
  const router = useRouter();
  const [actividades, setActividades] = useState<Actividad[]>(() => obtenerActividades());
  const ultimaAtras = useRef(0);

  useFocusEffect(
    useCallback(() => {
      setActividades(obtenerActividades());

      if (Platform.OS !== 'android') {
        return;
      }

      const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
        const ahora = Date.now();

        if (ahora - ultimaAtras.current < 2000) {
          return false;
        }

        ultimaAtras.current = ahora;
        ToastAndroid.show('Presiona atrás de nuevo para salir', ToastAndroid.SHORT);
        return true;
      });

      return () => suscripcion.remove();
    }, []),
  );

  return (
    <SafeAreaView edges={['top']} style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MyActivityDashboard
          activities={actividades}
          onCreateActivity={() => router.push('/actividades/crear')}
          onSelectActivity={(actividad) => router.push(`/actividades/${actividad.id}`)}
          user={usuario}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.fondo,
    flex: 1,
  },
  contenido: {
    padding: espaciados.md,
    paddingBottom: espaciados.xl,
  },
});
